const prisma = require('../config/prisma');
const { getProductCatalogEntry } = require('../utils/productCatalog');

const findCart = async (userId, sessionId) => {
    if (userId) {
        return await prisma.cart.findUnique({ where: { userId: userId }, include: { items: true } });
    } else if (sessionId) {
        return await prisma.cart.findUnique({ where: { sessionId: sessionId }, include: { items: true } });
    }
    return null;
};

function stockErrorMessage(stock) {
    if (stock <= 0) {
        return 'Produit indisponible.';
    }
    return `Stock insuffisant. Il ne reste que ${stock} article(s).`;
}

// --- 1. AFFICHER LE PANIER ---
exports.getCart = async (req, res) => {
    try {
        const userId = req.user ? req.user.userId : null;
        const sessionId = req.headers['x-session-id'];

        if (!userId && !sessionId) {
            return res.status(400).json({ message: "Non identifié. Connectez-vous ou fournissez un Session ID." });
        }

        const cart = await findCart(userId, sessionId);

        if (!cart || cart.items.length === 0) {
            return res.status(200).json({ items: [], cartTotal: 0 });
        }

        const itemsWithDetails = await Promise.all(
            cart.items.map(async (item) => {
                const productData = await getProductCatalogEntry(item.productId.toString());
                const unitPrice = productData.price;
                const totalPrice = unitPrice * item.quantity;

                return {
                    productId: item.productId,
                    name: productData.name,
                    quantity: item.quantity,
                    unitPrice: unitPrice,
                    totalPrice: totalPrice,
                    availableStock: productData.stock,
                };
            })
        );

        const cartTotal = itemsWithDetails.reduce(
            (sum, item) => sum + (item.totalPrice || 0),
            0
        );

        res.status(200).json({
            cartId: cart.id,
            items: itemsWithDetails,
            cartTotal: cartTotal,
        });
    } catch (error) {
        console.error("🚨 ERREUR RECUPERATION PANIER :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération du panier." });
    }
};

// --- 4. AJOUTER UN PRODUIT AU PANIER ---
exports.addItem = async (req, res) => {
    try {
        const userId = req.user ? req.user.userId : null;
        const sessionId = req.headers['x-session-id'];
        const { productId, quantity } = req.body;

        if (!userId && !sessionId) {
            return res.status(400).json({ message: "Non identifié. Connectez-vous ou fournissez un Session ID." });
        }

        const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);

        let cart = await findCart(userId, sessionId);

        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    userId: userId ? userId : undefined,
                    sessionId: !userId ? sessionId : undefined,
                },
            });
        }

        const productData = await getProductCatalogEntry(productId.toString());

        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId: parseInt(productId) },
        });

        const currentQty = existingItem ? existingItem.quantity : 0;
        const newTotalQty = currentQty + qtyToAdd;

        if (productData.stock < newTotalQty) {
            return res.status(400).json({ message: stockErrorMessage(productData.stock) });
        }

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newTotalQty },
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: parseInt(productId),
                    quantity: qtyToAdd,
                },
            });
        }

        res.status(201).json({ message: "Article ajouté avec succès !" });
    } catch (error) {
        console.error("🚨 ERREUR AJOUT ARTICLE :", error);
        res.status(500).json({ message: "Erreur lors de l'ajout au panier." });
    }
};

// --- 2. MODIFIER LA QUANTITÉ ---
exports.updateQuantity = async (req, res) => {
    try {
        const userId = req.user ? req.user.userId : null;
        const sessionId = req.headers['x-session-id'];

        const { productId } = req.params;
        const { quantity } = req.body;

        if (!userId && !sessionId) {
            return res.status(400).json({ message: "Non identifié. Connectez-vous ou fournissez un Session ID." });
        }

        const newQty = parseInt(quantity, 10);

        if (!Number.isFinite(newQty) || newQty < 1) {
            return res.status(400).json({ message: "La quantité doit être au minimum de 1." });
        }

        const cart = await findCart(userId, sessionId);
        if (!cart) return res.status(404).json({ message: "Panier introuvable." });

        const productData = await getProductCatalogEntry(productId.toString());
        if (productData.stock < newQty) {
            return res.status(400).json({ message: stockErrorMessage(productData.stock) });
        }

        await prisma.cartItem.update({
            where: {
                cartId_productId: { cartId: cart.id, productId: parseInt(productId) },
            },
            data: { quantity: newQty },
        });

        res.status(200).json({ message: "Quantité mise à jour avec succès." });
    } catch (error) {
        console.error("🚨 ERREUR MISE À JOUR QUANTITÉ :", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de la quantité." });
    }
};

// --- 3. SUPPRIMER UN PRODUIT ---
exports.removeItem = async (req, res) => {
    try {
        const userId = req.user ? req.user.userId : null;
        const sessionId = req.headers['x-session-id'];
        const { productId } = req.params;

        if (!userId && !sessionId) {
            return res.status(400).json({ message: "Non identifié. Connectez-vous ou fournissez un Session ID." });
        }

        const cart = await findCart(userId, sessionId);
        if (!cart) return res.status(404).json({ message: "Panier introuvable." });

        await prisma.cartItem.delete({
            where: {
                cartId_productId: { cartId: cart.id, productId: parseInt(productId) },
            },
        });

        res.status(200).json({ message: "Produit supprimé du panier." });
    } catch (error) {
        console.error("🚨 ERREUR SUPPRESSION ARTICLE :", error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'article." });
    }
};
