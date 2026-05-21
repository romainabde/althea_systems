const prisma = require('../config/prisma');
const { sendOrderConfirmation } = require('../utils/emailService');
const { getProductCatalogEntry } = require('../utils/productCatalog');
const { getOrCreateStripeCustomer, stripe } = require('../utils/stripeCustomer');

/** Liste des commandes du client connecté (JWT obligatoire). */
exports.listMyOrders = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Non authentifié." });
        }

        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: { items: true },
        });

        res.status(200).json({ orders });
    } catch (error) {
        console.error("🚨 ERREUR LISTE COMMANDES :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des commandes." });
    }
};

/** Détail d'une commande (propriétaire connecté). */
exports.getOrderById = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Non authentifié." });
        }

        const id = parseInt(req.params.id, 10);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "Identifiant de commande invalide." });
        }

        const order = await prisma.order.findFirst({
            where: { id, userId },
            include: { items: true, address: true },
        });

        if (!order) {
            return res.status(404).json({ message: "Commande introuvable." });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error("🚨 ERREUR DETAIL COMMANDE :", error);
        res.status(500).json({ message: "Erreur lors de la récupération de la commande." });
    }
};

// --- 1. CRÉATION DE LA COMMANDE (EN ATTENTE) ---
exports.checkout = async (req, res) => {
    try {
        // On récupère soit l'ID de l'user (si connecté), soit le Session ID (si invité)
        const userId = req.user ? req.user.userId : null;
        const sessionId = req.headers['x-session-id'];
        
        // <-- AJOUT : On récupère "email" en plus de "addressId" depuis le Body
        const { addressId, email } = req.body; 

        if (!userId && !sessionId) {
            return res.status(400).json({ message: "Identification manquante (Token ou Session ID)." });
        }

        if (!addressId) {
            return res.status(400).json({ message: "Une adresse de livraison est requise." });
        }

        // <-- AJOUT : Si c'est un invité (!userId), on le force à fournir un e-mail
        if (!userId && !email) {
            return res.status(400).json({ message: "Une adresse e-mail est requise pour les commandes invitées." });
        }

        // 1. Récupérer le panier (selon si c'est un user ou un invité)
        const cart = await prisma.cart.findUnique({
            where: userId ? { userId: userId } : { sessionId: sessionId },
            include: { items: true }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Votre panier est vide." });
        }

        // 2. Calculer le total + vérifier le stock (même source que GET /api/cart)
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of cart.items) {
            const productData = await getProductCatalogEntry(String(item.productId));
            if (productData.stock < item.quantity) {
                return res.status(400).json({
                    message:
                        productData.stock <= 0
                            ? `${productData.name} n'est plus disponible.`
                            : `Stock insuffisant pour ${productData.name} (${productData.stock} restant(s)).`,
                });
            }
            const unitPrice = productData.price;
            totalAmount += unitPrice * item.quantity;
            orderItemsData.push({
                productId: item.productId,
                name: productData.name,
                price: unitPrice,
                quantity: item.quantity,
            });
        }

        // 3. Créer la commande en "PENDING"
        const newOrder = await prisma.order.create({
            data: {
                userId: userId || undefined, // undefined si null pour que Prisma l'ignore
                
                // <-- AJOUT : On enregistre l'e-mail SEULEMENT si c'est un invité
                guestEmail: !userId ? email : undefined, 
                
                sessionId: !userId ? sessionId : null,
                addressId: parseInt(addressId),
                totalAmount: totalAmount,
                status: "PENDING", 
                items: {
                    create: orderItemsData
                }
            },
            include: { items: true }
        });

        res.status(201).json({
            message: "Commande créée (mode " + (userId ? "Client" : "Invité") + "). En attente de paiement.",
            order: newOrder
        });

    } catch (error) {
        console.error("🚨 ERREUR CHECKOUT :", error);
        res.status(500).json({ message: "Erreur lors de la création de la commande." });
    }
};
// --- 2. PAIEMENT RÉEL VIA STRIPE ET VALIDATION ---
// --- 2. PAIEMENT RÉEL VIA STRIPE ET VALIDATION ---
exports.confirmPayment = async (req, res) => {
    try {
        const { orderId, paymentMethodId } = req.body;
        const userId = req.user ? req.user.userId : null;
        const sessionId = req.headers['x-session-id'];

        // 1. Trouver la commande AVEC ses items ET son utilisateur (pour l'e-mail)
        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) },
            include: { 
                items: true, // <-- Pour que l'e-mail puisse lister les produits
                user: true   // <-- Pour récupérer l'e-mail si c'est un client connecté
            }
        });

        if (!order) {
            return res.status(404).json({ message: "Commande introuvable." });
        }

        // 2. Vérification de sécurité : Est-ce bien la commande de cet user ou de cet invité ?
        const isOwner = userId ? (order.userId === userId) : (order.sessionId === sessionId);
        if (!isOwner) {
            return res.status(403).json({ message: "Vous n'avez pas l'autorisation de payer cette commande." });
        }

        if (order.status !== 'PENDING') {
            return res.status(400).json({ message: "Cette commande ne peut plus être payée." });
        }

        for (const item of order.items) {
            const productData = await getProductCatalogEntry(String(item.productId));
            if (productData.stock < item.quantity) {
                return res.status(400).json({
                    message:
                        productData.stock <= 0
                            ? `${productData.name} n'est plus disponible.`
                            : `Stock insuffisant pour ${productData.name} (${productData.stock} restant(s)).`,
                });
            }
        }

        // 3. Paiement Stripe — avec client Stripe si la carte est enregistrée sur le compte
        const pmId = String(paymentMethodId || "").trim();
        if (!pmId) {
            return res.status(400).json({ message: "Moyen de paiement invalide." });
        }

        let customerId = null;
        if (userId) {
            const savedPm = await prisma.paymentMethod.findFirst({
                where: { userId, stripePaymentMethodId: pmId },
            });
            if (savedPm) {
                const { customerId: cid } = await getOrCreateStripeCustomer(userId);
                customerId = cid;
            }
        }

        const intentParams = {
            amount: Math.round(order.totalAmount * 100),
            currency: 'eur',
            payment_method: pmId,
            confirm: true,
            automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        };
        if (customerId) {
            intentParams.customer = customerId;
        }

        const paymentIntent = await stripe.paymentIntents.create(intentParams);

        if (paymentIntent.status === 'succeeded') {
            // PAIEMENT OK : On valide et on vide le panier correspondant
            await prisma.$transaction([
                prisma.order.update({
                    where: { id: order.id },
                    data: { status: "PAID" }
                }),
                prisma.cartItem.deleteMany({
                    where: { 
                        cart: userId ? { userId: userId } : { sessionId: sessionId } 
                    }
                })
            ]);

            // --- ENVOI DE L'E-MAIL ---
            // On cherche l'e-mail : Soit dans le profil User, soit dans guestEmail
            const targetEmail = userId ? order.user.email : order.guestEmail;

            if (targetEmail) {
                sendOrderConfirmation(targetEmail, order);
            }

            // Une seule réponse de succès envoyée au client
            return res.status(200).json({ 
                message: "Paiement réussi ! Panier vidé et e-mail de confirmation envoyé.",
                transactionId: paymentIntent.id 
            });
            
        } else {
            return res.status(400).json({ message: "Le paiement a été refusé par Stripe." });
        }

    } catch (error) {
        console.error("🚨 ERREUR STRIPE :", error.message);
        const msg =
            error.type === "StripeInvalidRequestError"
                ? error.message
                : "Erreur lors du traitement bancaire.";
        res.status(500).json({ message: msg });
    }
};