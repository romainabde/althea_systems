const prisma = require('../config/prisma');

function fallbackProduct(id) {
    return {
        name: `Produit n°${id}`,
        price: 0,
        stock: 0,
    };
}

/** Lit name / price / stock depuis la table `product` (Neon, partagée avec catalog). */
async function getProductCatalogEntry(id) {
    const productId = parseInt(String(id), 10);
    if (!Number.isFinite(productId)) {
        return fallbackProduct(id);
    }

    try {
        const rows = await prisma.$queryRaw`
            SELECT id, name, price, stock, active
            FROM product
            WHERE id = ${productId}
            LIMIT 1
        `;
        const row = rows?.[0];
        if (!row) {
            return fallbackProduct(productId);
        }

        const stock = Math.max(0, Number(row.stock ?? 0));
        const active = row.active !== false;

        return {
            name: row.name || fallbackProduct(productId).name,
            price: Number(row.price ?? 0),
            stock: active ? stock : 0,
        };
    } catch (error) {
        console.error('getProductCatalogEntry:', error);
        return fallbackProduct(productId);
    }
}

/** @deprecated Préférer getProductCatalogEntry (async). */
const getFakeProduct = getProductCatalogEntry;

module.exports = { getProductCatalogEntry, getFakeProduct };
