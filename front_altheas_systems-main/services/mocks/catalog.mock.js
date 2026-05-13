export const mockCatalogData = {
  Imagerie: { // 💡 Majuscule ici pour correspondre à ton URL
    name: "Imagerie Médicale",
    description: "Équipements de pointe pour le diagnostic par l'image.",
    products: [
      {
        id: "img-1",
        sku: "ALTH-SCAN-001",
        name: "Scanner IRM 3 Tesla",
        brand: "Siemens Healthineers",
        price: 1500000,
        stockQuantity: 2,
        inStock: true,
        createdAt: "2024-01-15T08:00:00Z",
        imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600",
        fullDescription: "L'IRM 3 Tesla offre une résolution d'image exceptionnelle pour les diagnostics neurologiques et cardiovasculaires avancés.",
        technicalSpecs: ["Champ magnétique : 3 Tesla", "Poids : 4.5 tonnes", "Alimentation : 480V", "Garantie : 5 ans"]
      },
      {
        id: "img-2",
        sku: "ALTH-ECHO-002",
        name: "Échographe 3D Expert",
        brand: "GE Healthcare",
        price: 45000,
        stockQuantity: 12,
        inStock: true,
        createdAt: "2024-03-10T14:30:00Z",
        imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600",
        fullDescription: "Appareil d'échographie polyvalent, idéal pour l'obstétrique, la cardiologie et l'imagerie générale.",
        technicalSpecs: ["Sondes incluses : 4", "Écran : OLED 24 pouces", "Autonomie batterie : 2h"]
      },
      {
        id: "img-3",
        sku: "ALTH-RADIO-003",
        name: "Appareil Radiographie Mobile",
        brand: "Philips",
        price: 32000,
        stockQuantity: 0,
        inStock: false,
        createdAt: "2023-11-20T09:15:00Z",
        imageUrl: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=600",
        fullDescription: "Système de radiographie numérique motorisé pour des examens rapides au lit du patient.",
        technicalSpecs: ["Générateur : 32 kW", "Détecteur sans fil", "Connectivité Wi-Fi DICOM"]
      }
    ]
  },
  Chirurgie: { // 💡 Ajout de la catégorie Chirurgie
    name: "Bloc Opératoire & Chirurgie",
    description: "Équipements et instruments chirurgicaux de haute précision.",
    products: [
      {
        id: "chir-1",
        sku: "ALTH-BIST-001",
        name: "Bistouri Électrique Intelligent",
        brand: "Medtronic",
        price: 8500,
        stockQuantity: 8,
        inStock: true,
        createdAt: "2024-02-12T10:00:00Z",
        imageUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=600",
        fullDescription: "Générateur d'électrochirurgie avec reconnaissance automatique des tissus pour une coupe parfaite.",
        technicalSpecs: ["Puissance : 300W", "Écran tactile", "Modes : Coupe pure, Coagulation"]
      },
      {
        id: "chir-2",
        sku: "ALTH-TABLE-002",
        name: "Table d'Opération Universelle",
        brand: "Maquet",
        price: 55000,
        stockQuantity: 3,
        inStock: true,
        createdAt: "2023-09-05T11:20:00Z",
        imageUrl: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=600",
        fullDescription: "Table chirurgicale modulaire radiotransparente, idéale pour toutes les disciplines.",
        technicalSpecs: ["Charge max : 380 kg", "Inclinaison latérale : 25°", "Batterie de secours"]
      }
    ]
  },
  Mobilier: { // 💡 Majuscule ici aussi
    name: "Mobilier Médical",
    description: "Lits, brancards et tables d'examen ergonomiques.",
    products: [
      {
        id: "mob-1",
        sku: "ALTH-LIT-101",
        name: "Lit Médicalisé Électrique",
        brand: "Hill-Rom",
        price: 2500,
        stockQuantity: 45,
        inStock: true,
        createdAt: "2024-04-02T10:00:00Z",
        imageUrl: "https://images.unsplash.com/photo-1505692952047-1a7830724bf2?q=80&w=600",
        fullDescription: "Lit d'hospitalisation avec pesée intégrée et fonctions d'assistance au lever.",
        technicalSpecs: ["Charge max : 250 kg", "Moteurs : 4", "Barrières latérales escamotables"]
      }
    ]
  }
};