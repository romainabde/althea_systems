const prisma = require("../config/prisma");
const { getOrCreateStripeCustomer, stripe } = require("../utils/stripeCustomer");
function formatPaymentMethod(row) {
    return {
        id: row.id,
        stripePaymentMethodId: row.stripePaymentMethodId,
        brand: row.brand,
        last4: row.last4,
        expMonth: row.expMonth,
        expYear: row.expYear,
        cardName: row.cardName,
        isDefault: row.isDefault,
    };
}

/** GET /api/users/payments */
exports.listPaymentMethods = async (req, res) => {
    try {
        const userId = req.user.userId;

        const methods = await prisma.paymentMethod.findMany({
            where: { userId },
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        });

        res.status(200).json({ paymentMethods: methods.map(formatPaymentMethod) });
    } catch (error) {
        console.error("🚨 ERREUR LISTE CARTES :", error);
        res.status(500).json({ message: "Impossible de récupérer vos cartes." });
    }
};

/** POST /api/users/payments — body: { paymentMethodId, cardName? } */
exports.addPaymentMethod = async (req, res) => {
    try {
        const userId = req.user.userId;
        const paymentMethodId = String(req.body.paymentMethodId || "").trim();
        const cardName = req.body.cardName
            ? String(req.body.cardName).trim()
            : null;

        if (!paymentMethodId) {
            return res.status(400).json({ message: "Moyen de paiement invalide." });
        }

        const existing = await prisma.paymentMethod.findUnique({
            where: { stripePaymentMethodId: paymentMethodId },
        });
        if (existing) {
            if (existing.userId === userId) {
                return res.status(400).json({ message: "Cette carte est déjà enregistrée." });
            }
            return res.status(400).json({ message: "Cette carte est déjà utilisée." });
        }

        const { user, customerId } = await getOrCreateStripeCustomer(userId);

        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });

        const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
        const card = pm.card;
        if (!card) {
            return res.status(400).json({ message: "Carte invalide." });
        }

        const count = await prisma.paymentMethod.count({ where: { userId } });
        const isDefault = count === 0;

        const saved = await prisma.paymentMethod.create({
            data: {
                userId,
                stripePaymentMethodId: paymentMethodId,
                brand: card.brand || "card",
                last4: card.last4 || "0000",
                expMonth: card.exp_month,
                expYear: card.exp_year,
                cardName: cardName || user.fullName,
                isDefault,
            },
        });

        res.status(201).json({
            message: "Carte enregistrée.",
            paymentMethod: formatPaymentMethod(saved),
        });
    } catch (error) {
        console.error("🚨 ERREUR AJOUT CARTE :", error.message);
        const msg =
            error.type === "StripeInvalidRequestError"
                ? error.message
                : "Impossible d'enregistrer la carte.";
        res.status(500).json({ message: msg });
    }
};

/** DELETE /api/users/payments/:id */
exports.deletePaymentMethod = async (req, res) => {
    try {
        const userId = req.user.userId;
        const id = parseInt(req.params.id, 10);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "Identifiant invalide." });
        }

        const row = await prisma.paymentMethod.findFirst({
            where: { id, userId },
        });
        if (!row) {
            return res.status(404).json({ message: "Carte introuvable." });
        }

        try {
            await stripe.paymentMethods.detach(row.stripePaymentMethodId);
        } catch (stripeErr) {
            console.warn("Detach Stripe ignoré :", stripeErr.message);
        }

        await prisma.paymentMethod.delete({ where: { id: row.id } });

        if (row.isDefault) {
            const next = await prisma.paymentMethod.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });
            if (next) {
                await prisma.paymentMethod.update({
                    where: { id: next.id },
                    data: { isDefault: true },
                });
            }
        }

        res.status(200).json({ message: "Carte supprimée." });
    } catch (error) {
        console.error("🚨 ERREUR SUPPRESSION CARTE :", error);
        res.status(500).json({ message: "Impossible de supprimer la carte." });
    }
};
