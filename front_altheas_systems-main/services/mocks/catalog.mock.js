// --- 📦 CATALOGUE COMPLET (24 PRODUITS) ---
export const mockCatalogData = {
  "imagerie": {
    name: "Imagerie Médicale",
    description: "Systèmes de diagnostic haute performance",
    products: [
      { id: 101, name: "Scanner IRM Optima 1.5T", price: 245000, inStock: true, imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400", createdAt: "2024-01-10", fullDescription: "Système IRM silencieux pour un confort patient optimal.", technicalSpecs: ["1.5 Tesla", "Gradients 33/120"] },
      { id: 102, name: "Échographe Doppler Couleur", price: 18500, inStock: true, imageUrl: "https://images.unsplash.com/photo-1579154234431-15553177651a?auto=format&fit=crop&q=80&w=400", createdAt: "2024-02-15", fullDescription: "Échographe polyvalent pour cardiologie et obstétrique.", technicalSpecs: ["Écran LED 19\"", "Sonde multi-fréquence"] },
      { id: 103, name: "Radiographie Numérique DR", price: 85000, inStock: false, imageUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=400", createdAt: "2024-03-01", fullDescription: "Système de radio haute vitesse avec capteur plan.", technicalSpecs: ["Capteur WiFi", "Logiciel d'IA inclus"] },
      { id: 104, name: "Mammographe Numérique 3D", price: 120000, inStock: true, imageUrl: "https://images.unsplash.com/photo-1516549177391-da9032ca058c?auto=format&fit=crop&q=80&w=400", createdAt: "2024-03-12", fullDescription: "Précision maximale pour le dépistage précoce.", technicalSpecs: ["Tomosynthèse 3D", "Compression douce"] }
    ]
  },
  "mobilier": {
    name: "Mobilier Médical",
    description: "Équipement de confort hospitalier",
    products: [
      { id: 201, name: "Lit Médicalisé Électrique V3", price: 2800, inStock: true, imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=400", createdAt: "2024-01-20", fullDescription: "Lit réglable 5 fonctions avec télécommande.", technicalSpecs: ["Charge max 250kg", "Batterie secours"] },
      { id: 202, name: "Fauteuil de Prélèvement Pro", price: 850, inStock: true, imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400", createdAt: "2024-02-10", fullDescription: "Confort ergonomique pour les laboratoires.", technicalSpecs: ["Accoudoirs réglables", "Revêtement antibactérien"] },
      { id: 203, name: "Table d'Opération Universelle", price: 12500, inStock: true, imageUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=400", createdAt: "2024-03-05", fullDescription: "Modulable pour toutes les spécialités chirurgicales.", technicalSpecs: ["Radiotransparente", "Réglage hydraulique"] },
      { id: 204, name: "Chariot d'Urgence Inox", price: 3200, inStock: true, imageUrl: "https://images.unsplash.com/photo-1583331619037-3359d437c920?auto=format&fit=crop&q=80&w=400", createdAt: "2024-04-02", fullDescription: "Organisation optimisée pour la réanimation.", technicalSpecs: ["5 tiroirs", "Support défibrillateur"] }
    ]
  },
  "dentaire": {
    name: "Équipement Dentaire",
    description: "Soins et chirurgie dentaire",
    products: [
      { id: 501, name: "Unité Dentaire Premium", price: 42000, inStock: true, imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400", createdAt: "2024-02-05", fullDescription: "Fauteuil complet avec turbine et caméra.", technicalSpecs: ["Écran tactile", "Cuve céramique"] },
      { id: 502, name: "Capteur Radio Intra-oral", price: 3500, inStock: true, imageUrl: "https://images.unsplash.com/photo-1579154234431-15553177651a?auto=format&fit=crop&q=80&w=400", createdAt: "2024-02-20", fullDescription: "Capteur numérique CMOS haute résolution.", technicalSpecs: ["Taille 2", "USB 3.0"] },
      { id: 503, name: "Autoclave Dentaire 24L", price: 4800, inStock: true, imageUrl: "https://images.unsplash.com/photo-1584036533563-c2423182917d?auto=format&fit=crop&q=80&w=400", createdAt: "2024-03-15", fullDescription: "Stérilisation rapide classe B.", technicalSpecs: ["24 Litres", "Séchage sous vide"] },
      { id: 504, name: "Moteur d'Implantologie", price: 5200, inStock: false, imageUrl: "https://images.unsplash.com/photo-1516549177391-da9032ca058c?auto=format&fit=crop&q=80&w=400", createdAt: "2024-04-05", fullDescription: "Précision chirurgicale extrême.", technicalSpecs: ["80 Ncm", "Pompe intégrée"] }
    ]
  },
  "laboratoire": {
    name: "Laboratoire",
    description: "Analyse et recherche scientifique",
    products: [
      { id: 601, name: "Analyseur Hématologie", price: 12000, inStock: true, imageUrl: "https://images.unsplash.com/photo-1579154234431-15553177651a?auto=format&fit=crop&q=80&w=400", createdAt: "2024-01-25", fullDescription: "Numération formule sanguine automatique.", technicalSpecs: ["22 paramètres", "60 tests/h"] },
      { id: 602, name: "Microscope Binoculaire LED", price: 1200, inStock: true, imageUrl: "https://images.unsplash.com/photo-1583331619037-3359d437c920?auto=format&fit=crop&q=80&w=400", createdAt: "2024-02-28", fullDescription: "Optique haute définition pour recherche.", technicalSpecs: ["Grossissement 1000x"] },
      { id: 603, name: "Centrifugeuse de Paillasse", price: 2100, inStock: true, imageUrl: "https://images.unsplash.com/photo-1584036533563-c2423182917d?auto=format&fit=crop&q=80&w=400", createdAt: "2024-03-10", fullDescription: "Séparation rapide des plasmas.", technicalSpecs: ["15000 RPM", "Rotor 24 tubes"] },
      { id: 604, name: "Agitateur Magnétique LED", price: 350, inStock: true, imageUrl: "https://images.unsplash.com/photo-1583331619037-3359d437c920?auto=format&fit=crop&q=80&w=400", createdAt: "2024-04-18", fullDescription: "Mélange précis avec chauffe.", technicalSpecs: ["500 RPM", "Plaque céramique"] }
    ]
  },
  "urgence": {
    name: "Urgence et Secours",
    description: "Matériel de réanimation critique",
    products: [
      { id: 701, name: "Défibrillateur DEA", price: 1800, inStock: true, imageUrl: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400", createdAt: "2024-01-05", fullDescription: "Défibrillateur avec guidage vocal.", technicalSpecs: ["Biphasique", "Batterie 5 ans"] },
      { id: 702, name: "Ventilateur de Transport", price: 8900, inStock: true, imageUrl: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=400", createdAt: "2024-03-25", fullDescription: "Respirateur compact pour ambulance.", technicalSpecs: ["Modes invasifs", "O2 intégré"] },
      { id: 703, name: "Sac d'Urgence Modulable", price: 650, inStock: true, imageUrl: "https://images.unsplash.com/photo-1583331619037-3359d437c920?auto=format&fit=crop&q=80&w=400", createdAt: "2024-04-12", fullDescription: "Sac avec compartiments oxygène.", technicalSpecs: ["Tissu Ripstop", "Imperméable"] },
      { id: 704, name: "Aspirateur de Mucosités", price: 1100, inStock: true, imageUrl: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400", createdAt: "2024-04-20", fullDescription: "Aspiration puissante sur batterie.", technicalSpecs: ["Bocal 1L", "Silencieux"] }
    ]
  },
  "consommables": {
    name: "Consommables",
    description: "Hygiène et protection",
    products: [
      { id: 401, name: "Masques FFP2 (Boîte de 50)", price: 25, inStock: true, imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400", createdAt: "2024-04-01", fullDescription: "Protection respiratoire haute efficacité.", technicalSpecs: ["Norme CE", "Efficacité 94%"] },
      { id: 402, name: "Gel Hydroalcoolique 5L", price: 45, inStock: true, imageUrl: "https://images.unsplash.com/photo-1584036533563-c2423182917d?auto=format&fit=crop&q=80&w=400", createdAt: "2024-04-05", fullDescription: "Désinfection rapide des mains.", technicalSpecs: ["Bidon recharge", "Sans rinçage"] },
      { id: 403, name: "Seringues 5ml (Lot de 100)", price: 15, inStock: true, imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400", createdAt: "2024-04-10", fullDescription: "Usage unique stérile.", technicalSpecs: ["Luer Lock", "Sans latex"] },
      { id: 404, name: "Gants Nitrile Non Poudrés", price: 75, inStock: true, imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400", createdAt: "2024-04-22", fullDescription: "Gants d'examen haute résistance.", technicalSpecs: ["Carton de 1000", "Tailles S à XL"] }
    ]
  }
};

// --- 🏠 DONNÉES ACCUEIL ---
export const mockHomeData = {
  banner: {
    title: "Althea Systems : L'excellence Médicale",
    subtitle: "Équipez votre établissement avec les meilleures technologies du marché.",
    buttonText: "Explorer le catalogue"
  },
  featuredProductIds: [101, 201, 501, 701] // Les IDs que tu veux voir en Une
};

// --- 🛒 DONNÉES PANIER ---
export const mockCartData = {
  initialItems: []
};