const prisma = require('../config/prisma');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_KEY);

/** Crée ou récupère le client Stripe lié au compte utilisateur. */
async function getOrCreateStripeCustomer(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error('Utilisateur introuvable.');
    }

    if (user.stripeCustomerId) {
        return { user, customerId: user.stripeCustomerId };
    }

    const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: { userId: String(userId) },
    });

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id },
    });

    return { user: updated, customerId: customer.id };
}

module.exports = { getOrCreateStripeCustomer, stripe };
