/** Mock catalogue — même source de prix pour panier et checkout. */
function getFakeProduct(id) {
    const products = {
        "1": { name: "iPhone 15", price: 999, stock: 10 },
        "2": { name: "MacBook Air", price: 1200, stock: 5 },
        "3": { name: "AirPods Pro", price: 250, stock: 50 },
    };
    return products[id] || { name: `Produit n°${id}`, price: 49.99, stock: 100 };
}

module.exports = { getFakeProduct };
