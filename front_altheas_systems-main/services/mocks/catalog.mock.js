export const categoriesMock = {
  1: {
    id: 1,
    name: "Imagerie",
    description: "Découvrez nos équipements d’imagerie médicale.",
    products: [
      { id: 101, name: "Scanner médical", price: 1200 },
      { id: 102, name: "Échographe", price: 980 },
      { id: 103, name: "IRM compacte", price: 2100 },
    ],
  },
  2: {
    id: 2,
    name: "Chirurgie",
    description: "Des outils de chirurgie performants et fiables.",
    products: [
      { id: 201, name: "Laser chirurgical", price: 950 },
      { id: 202, name: "Bistouri électrique", price: 600 },
      { id: 203, name: "Table opératoire", price: 1800 },
    ],
  },
  3: {
    id: 3,
    name: "Monitoring",
    description: "Matériel de suivi et de surveillance des patients.",
    products: [
      { id: 301, name: "Moniteur patient", price: 700 },
      { id: 302, name: "Oxymètre", price: 120 },
    ],
  },
  4: {
    id: 4,
    name: "Mobilier",
    description: "Mobilier médical fonctionnel pour les cabinets.",
    products: [
      { id: 401, name: "Table d’examen", price: 450 },
      { id: 402, name: "Fauteuil médical", price: 520 },
    ],
  },
};

export const productsMock = {
  101: {
    id: 101,
    name: "Scanner médical",
    description: "Scanner haute précision pour établissements de santé.",
    price: 1200,
    inStock: true,
    specifications: ["Haute résolution", "Interface intuitive", "Maintenance simplifiée"],
  },
  102: {
    id: 102,
    name: "Échographe",
    description: "Échographe performant pour diagnostics rapides.",
    price: 980,
    inStock: true,
    specifications: ["Imagerie temps réel", "Portable", "Écran HD"],
  },
  103: {
    id: 103,
    name: "IRM compacte",
    description: "IRM compacte adaptée aux structures modernes.",
    price: 2100,
    inStock: false,
    specifications: ["Format compact", "Grande précision", "Utilisation sécurisée"],
  },
  201: {
    id: 201,
    name: "Laser chirurgical",
    description: "Laser chirurgical précis pour interventions spécialisées.",
    price: 950,
    inStock: true,
    specifications: ["Haute précision", "Usage professionnel", "Sécurité renforcée"],
  },
  202: {
    id: 202,
    name: "Bistouri électrique",
    description: "Bistouri électrique fiable et ergonomique.",
    price: 600,
    inStock: true,
    specifications: ["Ergonomique", "Réglages simples", "Compact"],
  },
};
