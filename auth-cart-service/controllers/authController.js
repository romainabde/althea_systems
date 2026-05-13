const prisma = require('../config/prisma'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const MSG_PASSWORD_WEAK =
    "Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.";

const MSG_INSCRIPTION_REUSSIE =
    "Inscription réussie ! Veuillez vérifier votre boîte e-mail pour confirmer votre compte.";

function isPasswordStrongEnough(password) {
    if (typeof password !== 'string' || password.length < 8) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/\d/.test(password)) return false;
    if (!/[^A-Za-z0-9]/.test(password)) return false;
    return true;
}

function isFullNamePlausible(fullName) {
    const t = String(fullName || '').trim();
    if (t.length < 3) return false;
    const parts = t.split(/\s+/).filter(Boolean);
    if (parts.length < 2) return false;
    return true;
}

function frontendBaseUrl() {
    return (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
}

// --- 1. L'INSCRIPTION ---
exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        const fullNameTrim = fullName != null ? String(fullName).trim() : '';
        const emailClean = email != null ? String(email).toLowerCase().trim() : '';
        const passwordRaw = password != null ? String(password) : '';

        if (!fullNameTrim || !emailClean || !passwordRaw.trim()) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires." });
        }

        if (!isFullNamePlausible(fullNameTrim)) {
            return res.status(400).json({
                message: "Indiquez votre prénom et votre nom (deux mots minimum, ex. : Jean Dupont).",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailClean)) {
            return res.status(400).json({ message: "Le format de l'adresse e-mail est invalide." });
        }

        if (!isPasswordStrongEnough(passwordRaw)) {
            return res.status(400).json({ message: MSG_PASSWORD_WEAK });
        }

        const existingUser = await prisma.user.findUnique({ where: { email: emailClean } });
        if (existingUser) return res.status(400).json({ message: "Cet email est déjà utilisé." });

        const passwordHash = await bcrypt.hash(passwordRaw, 10);

        const newUser = await prisma.user.create({
            data: { fullName: fullNameTrim, email: emailClean, passwordHash }
        });

        const validationToken = jwt.sign(
            { userId: newUser.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        const confirmationPath = `${frontendBaseUrl()}/auth/confirm?token=${encodeURIComponent(validationToken)}`;

        // SIMULATION D'ENVOI D'E-MAIL
        console.log("\n=========================================");
        console.log("📧 NOUVEL E-MAIL À ENVOYER À :", newUser.email);
        console.log("Lien de confirmation (page Althea) :");
        console.log(confirmationPath);
        console.log("=========================================\n");

        res.status(201).json({ message: MSG_INSCRIPTION_REUSSIE });
    } catch (error) {
        console.error("🚨 ERREUR INSCRIPTION :", error);
        res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
    }
};

// --- 1b. Confirmer l’e-mail + session (clic sur le lien → front → POST ici) ---
exports.confirmEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ message: "Le jeton de confirmation est requis." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return res.status(404).json({ message: "Aucun compte ne correspond à ce lien." });
        }

        if (user.isEmailConfirmed) {
            const sessionToken = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            return res.status(200).json({
                message: "Votre compte est déjà confirmé. Vous êtes connecté.",
                token: sessionToken,
                user: { id: user.id, fullName: user.fullName, email: user.email },
            });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { isEmailConfirmed: true },
        });

        const sessionToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Votre compte est confirmé. Bienvenue sur Althea Systems !",
            token: sessionToken,
            user: { id: user.id, fullName: user.fullName, email: user.email },
        });
    } catch (error) {
        console.error("🚨 ERREUR CONFIRMATION EMAIL :", error);
        res.status(400).json({ message: "Le lien de confirmation est invalide ou a expiré." });
    }
};

// --- 1c. Ancien lien API / e-mails : redirige vers le front (confirm + auto-login) ---
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const to = `${frontendBaseUrl()}/auth/confirm?token=${encodeURIComponent(token)}`;
        return res.redirect(302, to);
    } catch (error) {
        console.error("🚨 ERREUR REDIRECT VERIFY :", error);
        res.status(400).send("<h1>❌ Lien invalide.</h1>");
    }
};

// --- 3. LA CONNEXION (Mise à jour) ---
// --- 3. LA CONNEXION (Version finale avec "Se souvenir de moi") ---
exports.login = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        // On récupère le sessionId depuis les headers
        const sessionId = req.headers['x-session-id'];

        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe requis." });
        }

        // --- SÉCURITÉ : Nettoyage de l'email (Faille n°3 Deep Audit) ---
        const emailClean = email.toLowerCase().trim();

        // 1. Recherche de l'utilisateur
        const user = await prisma.user.findUnique({ where: { email: emailClean } });
        if (!user) {
            return res.status(401).json({ message: "Identifiants incorrects." });
        }

        // 2. Vérification du mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: "Mot de passe incorrect.",
                suggestion: "Avez-vous oublié votre mot de passe ?",
                resetLink: "http://localhost:3000/api/auth/forgot-password" 
            });
        }

        // 3. Vérification de l'email
        if (!user.isEmailConfirmed) {
            return res.status(403).json({ 
                message: "Compte non confirmé. Vérifiez vos e-mails." 
            });
        }

        // --- 4. LOGIQUE DE FUSION (GUEST -> USER) ---
        // SÉCURITÉ : On vérifie que le sessionId n'est pas le texte "undefined" ou "null" (Faille n°2 Deep Audit)
        if (sessionId && sessionId !== "undefined" && sessionId !== "null") {
            try {
                // SÉCURITÉ : On utilise une TRANSACTION pour être sûr que tout passe ou rien (Faille n°1 Deep Audit)
                await prisma.$transaction(async (tx) => {
                    
                    // A. FUSION DES ADRESSES
                    await tx.address.updateMany({
                        where: { sessionId: sessionId },
                        data: { userId: user.id, sessionId: null }
                    });

                    // B. CORRECTIF : FUSION DES COMMANDES (Ghost Orders)
                    await tx.order.updateMany({
                        where: { sessionId: sessionId },
                        data: { userId: user.id, sessionId: null }
                    });

                    // C. FUSION DU PANIER
                    const guestCart = await tx.cart.findUnique({
                        where: { sessionId: sessionId },
                        include: { items: true }
                    });

                    if (guestCart && guestCart.items.length > 0) {
                        let userCart = await tx.cart.findUnique({
                            where: { userId: user.id },
                            include: { items: true }
                        });

                        if (!userCart) {
                            // Si l'user n'a pas de panier, on lui donne celui de l'invité
                            await tx.cart.update({
                                where: { id: guestCart.id },
                                data: { userId: user.id, sessionId: null }
                            });
                        } else {
                            // Sinon fusion article par article
                            for (const guestItem of guestCart.items) {
                                const existingItem = userCart.items.find(i => i.productId === guestItem.productId);
                                
                                if (existingItem) {
                                    await tx.cartItem.update({
                                        where: { id: existingItem.id },
                                        data: { quantity: existingItem.quantity + guestItem.quantity }
                                    });
                                    await tx.cartItem.delete({ where: { id: guestItem.id } });
                                } else {
                                    await tx.cartItem.update({
                                        where: { id: guestItem.id },
                                        data: { cartId: userCart.id }
                                    });
                                }
                            }
                            // Supprimer le panier invité vide
                            await tx.cart.delete({ where: { id: guestCart.id } });
                        }
                    }
                });
                console.log(`✅ Fusion réussie pour l'utilisateur ${user.id}`);
            } catch (mergeError) {
                console.error("⚠️ Erreur lors de la fusion sécurisée :", mergeError);
                // On continue le login même si la fusion échoue pour ne pas bloquer l'user
            }
        }

        // 5. Génération du Token
        const tokenExpiration = rememberMe ? '30d' : '24h';
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: tokenExpiration }
        );

        // 6. Réponse finale
        res.status(200).json({
            message: "Connexion réussie ! Vos données ont été synchronisées.",
            token: token,
            user: { 
                id: user.id, 
                fullName: user.fullName, 
                email: user.email 
            }
        });

    } catch (error) {
        console.error("🚨 ERREUR LOGIN :", error);
        res.status(500).json({ message: "Erreur serveur lors de la connexion." });
    }
};

// --- 4. MOT DE PASSE OUBLIÉ ---
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email requis." });

        const user = await prisma.user.findUnique({ where: { email } });

        // RÈGLE DE SÉCURITÉ : On ne dit pas explicitement si l'email existe ou pas 
        // pour éviter le "User Enumeration", mais on suit le cahier des charges.
        if (!user) {
            return res.status(404).json({ 
                message: "Ce compte n'existe pas. Veuillez vous inscrire ou contacter le support client à support@althea.com." 
            });
        }

        // Génération du Token de réinitialisation (valide 1h pour plus de sécurité)
        const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetLink = `http://localhost:3000/api/auth/reset-password/${resetToken}`;

        // Simulation d'envoi d'e-mail
        console.log("\n=========================================");
        console.log("📧 RÉINITIALISATION DE MOT DE PASSE POUR :", email);
        console.log("Lien de réinitialisation :", resetLink);
        console.log("=========================================\n");

        res.status(200).json({ message: "Un lien de réinitialisation a été envoyé à votre adresse e-mail." });

    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la demande de réinitialisation." });
    }
};


// --- 5. RÉINITIALISATION RÉELLE DU MOT DE PASSE ---
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params; // On récupère le token dans l'URL
        const { password } = req.body; // On récupère le nouveau mot de passe

        if (!password) {
            return res.status(400).json({ message: "Le nouveau mot de passe est obligatoire." });
        }

        if (!isPasswordStrongEnough(password)) {
            return res.status(400).json({ message: MSG_PASSWORD_WEAK });
        }

        // B. Vérifier si le token est valide et non expiré
        // jwt.verify lèvera une erreur si le token a plus d'une heure ou est corrompu
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // C. Hasher le nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // D. Mise à jour dans la base de données via Prisma
        await prisma.user.update({
            where: { id: decoded.userId },
            data: { passwordHash: passwordHash }
        });

        res.status(200).json({ message: "Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter." });

    } catch (error) {
        console.error("Erreur Reset Password:", error.message);
        // Si le token est expiré, jwt.verify envoie une erreur ici
        res.status(401).json({ message: "Le lien de réinitialisation est invalide ou a expiré." });
    }
};


// --- 6. RENVOYER LE LIEN DE CONFIRMATION ---
exports.resendConfirmation = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "L'adresse e-mail est requise." });
        }

        // Nettoyage de l'e-mail
        const emailClean = email.toLowerCase().trim();

        // 1. Chercher l'utilisateur
        const user = await prisma.user.findUnique({ where: { email: emailClean } });

        // 2. Vérifications selon ton cahier des charges (être précis sur l'erreur)
        if (!user) {
            return res.status(404).json({ message: "Aucun compte n'est associé à cette adresse e-mail." });
        }

        if (user.isEmailConfirmed) {
            return res.status(400).json({ message: "Ce compte est déjà confirmé. Vous pouvez vous connecter." });
        }

        // 3. Générer un nouveau token (Valide 24h)
        const validationToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        const confirmationPath = `${frontendBaseUrl()}/auth/confirm?token=${encodeURIComponent(validationToken)}`;

        console.log("\n=========================================");
        console.log("📧 RENVOI DU LIEN DE CONFIRMATION À :", user.email);
        console.log("Nouveau lien :", confirmationPath);
        console.log("=========================================\n");

        res.status(200).json({
            message: "Un nouveau lien de confirmation a été envoyé à votre adresse e-mail.",
        });

    } catch (error) {
        console.error("🚨 ERREUR RENVOI CONFIRMATION :", error);
        res.status(500).json({ message: "Erreur serveur lors du renvoi de l'e-mail." });
    }
};