const prisma = require('../config/prisma');

/** Adresse : si liée à un compte, seul ce userId ; sinon session invité. */
function ownsAddress(address, userId, sessionId) {
    if (address.userId != null) {
        return userId != null && address.userId === userId;
    }
    return Boolean(sessionId && address.sessionId === sessionId);
}

function parseAddressIdParam(req) {
    const raw = req.params.id;
    const id = parseInt(raw, 10);
    if (!Number.isFinite(id) || id < 1) return null;
    return id;
}

// --- 1. ENREGISTRER UNE NOUVELLE ADRESSE ---
exports.createAddress = async (req, res) => {
    try {
        const userId = req.user ? req.user.userId : null;
        const sessionId = req.headers['x-session-id'];
        const { firstName, lastName, street, city, zipCode, country, phone } = req.body;

        if (!userId && !sessionId) {
            return res.status(400).json({ message: "Non identifié. Connectez-vous ou fournissez un Session ID." });
        }

        if (!firstName || !lastName || !street || !city || !zipCode || !country || !phone) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires." });
        }

        const newAddress = await prisma.address.create({
            data: {
                userId: userId ? userId : undefined,
                sessionId: !userId ? sessionId : undefined,
                firstName,
                lastName,
                street,
                city,
                zipCode,
                country,
                phone
            }
        });

        res.status(201).json({ message: "Adresse enregistrée avec succès !", address: newAddress });
    } catch (error) {
        console.error("🚨 ERREUR CREATION ADRESSE :", error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement de l'adresse." });
    }
};


// --- 2. RÉCUPÉRER LES ADRESSES DE L'UTILISATEUR ---
// --- 2. RÉCUPÉRER LES ADRESSES (Connecté ou Invité) ---
exports.getAddresses = async (req, res) => {
    try {
        const userId = req.user ? req.user.userId : null;
        const sessionId = req.headers['x-session-id'];

        if (!userId && !sessionId) {
            return res.status(400).json({ message: "Non identifié. Connectez-vous ou fournissez un Session ID." });
        }

        const orConditions = [];
        if (userId) orConditions.push({ userId });
        if (sessionId) orConditions.push({ sessionId });

        const addresses = await prisma.address.findMany({
            where: { OR: orConditions },
            orderBy: { id: "desc" },
        });

        res.status(200).json(addresses);
    } catch (error) {
        console.error("🚨 ERREUR RECUPERATION ADRESSES :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des adresses." });
    }
};

// --- 3. METTRE À JOUR UNE ADRESSE ---
exports.updateAddress = async (req, res) => {
    try {
        const id = parseAddressIdParam(req);
        if (id == null) {
            return res.status(400).json({ message: "Identifiant d'adresse invalide." });
        }

        const userId = req.user ? req.user.userId : null;
        const sessionId = req.headers['x-session-id'];

        if (!userId && !sessionId) {
            return res.status(400).json({ message: "Non identifié. Connectez-vous ou fournissez un Session ID." });
        }

        const existing = await prisma.address.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: "Adresse introuvable." });
        }
        if (!ownsAddress(existing, userId, sessionId)) {
            return res.status(403).json({ message: "Vous ne pouvez pas modifier cette adresse." });
        }

        const { firstName, lastName, street, city, zipCode, country, phone } = req.body;
        if (!firstName || !lastName || !street || !city || !zipCode || !country || !phone) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires." });
        }

        const updated = await prisma.address.update({
            where: { id },
            data: {
                firstName,
                lastName,
                street,
                city,
                zipCode,
                country,
                phone,
            },
        });

        res.status(200).json({ message: "Adresse mise à jour.", address: updated });
    } catch (error) {
        console.error("🚨 ERREUR MAJ ADRESSE :", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'adresse." });
    }
};

// --- 4. SUPPRIMER UNE ADRESSE ---
exports.deleteAddress = async (req, res) => {
    try {
        const id = parseAddressIdParam(req);
        if (id == null) {
            return res.status(400).json({ message: "Identifiant d'adresse invalide." });
        }

        const userId = req.user ? req.user.userId : null;
        const sessionId = req.headers['x-session-id'];

        if (!userId && !sessionId) {
            return res.status(400).json({ message: "Non identifié. Connectez-vous ou fournissez un Session ID." });
        }

        const existing = await prisma.address.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: "Adresse introuvable." });
        }
        if (!ownsAddress(existing, userId, sessionId)) {
            return res.status(403).json({ message: "Vous ne pouvez pas supprimer cette adresse." });
        }

        const orderCount = await prisma.order.count({ where: { addressId: id } });
        if (orderCount > 0) {
            return res.status(409).json({
                message:
                    "Impossible de supprimer cette adresse : elle est liée à une ou plusieurs commandes.",
            });
        }

        await prisma.address.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error("🚨 ERREUR SUPPRESSION ADRESSE :", error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'adresse." });
    }
};