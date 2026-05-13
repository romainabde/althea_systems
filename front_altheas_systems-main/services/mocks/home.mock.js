export const mockHomeData = {
  welcomeMessage: {
    title: "Bienvenue chez Althea Systems",
    content: "Votre partenaire de confiance pour l'équipement médical de pointe. Depuis plus de 15 ans, nous accompagnons les hôpitaux, cliniques et cabinets privés en fournissant des solutions d'imagerie, de chirurgie et de monitorage fiables et innovantes."
  },
  carousel: [
    {
      id: "slide-1",
      title: "Équipement d'Imagerie de Pointe",
      subtitle: "Des diagnostics précis grâce à notre nouvelle gamme de scanners IRM et d'échographes.",
      imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200",
      buttonText: "Découvrir l'imagerie",
      link: "/products?category=Imagerie"
    },
    {
      id: "slide-2",
      title: "Matériel de Bloc Opératoire",
      subtitle: "Sécurité et ergonomie pour vos interventions chirurgicales les plus complexes.",
      imageUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1200",
      buttonText: "Voir les équipements",
      link: "/products?category=Chirurgie"
    },
    {
      id: "slide-3",
      title: "Monitorage Patient Avancé",
      subtitle: "Surveillez les constantes vitales avec une fiabilité inégalée.",
      imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200",
      buttonText: "Voir les moniteurs",
      link: "/products?category=Monitorage"
    }
  ],
  categories: [
    {
      id: "cat-1",
      name: "Imagerie Médicale",
      imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600",
      link: "/products?category=Imagerie",
      order: 1
    },
    {
      id: "cat-2",
      name: "Chirurgie & Bloc",
      imageUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=600",
      link: "/products?category=Chirurgie",
      order: 2
    },
    {
      id: "cat-3",
      name: "Monitorage",
      imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600",
      link: "/products?category=Monitorage",
      order: 3
    }
  ],
  topProducts: [
    { 
      id: "top-1", 
      name: "Scanner IRM 3 Tesla", 
      imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=400" 
    },
    { 
      id: "top-2", 
      name: "Échographe Portable", 
      imageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=400" 
    },
    { 
      id: "top-3", 
      name: "Moniteur Multiparamétrique", 
      imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400" 
    },
    { 
      id: "top-4", 
      name: "Table d'opération", 
      imageUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=400" 
    }
  ]
};