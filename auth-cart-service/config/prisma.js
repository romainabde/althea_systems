const { PrismaClient } = require('@prisma/client');

// Connexion Postgres (Neon) via DATABASE_URL — voir prisma/schema.prisma et .env
const prisma = new PrismaClient();

module.exports = prisma;