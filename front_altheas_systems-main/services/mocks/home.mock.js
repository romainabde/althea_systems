export const homeMock = {
  heroSlides: [
    {
      id: 1,
      title: "Solutions médicales innovantes",
      subtitle: "Découvrez nos équipements de pointe",
      image: "/images/slide-1.jpg",
      link: "/categories/1",
    },
    {
      id: 2,
      title: "Performance et fiabilité",
      subtitle: "Des produits pensés pour les professionnels de santé",
      image: "/images/slide-2.jpg",
      link: "/categories/2",
    },
    {
      id: 3,
      title: "Top produits du moment",
      subtitle: "Retrouvez notre sélection phare",
      image: "/images/slide-3.jpg",
      link: "/search",
    },
  ],
  categories: [
    { id: 1, name: "Imagerie", image: "/images/cat-imagerie.jpg" },
    { id: 2, name: "Chirurgie", image: "/images/cat-chirurgie.jpg" },
    { id: 3, name: "Monitoring", image: "/images/cat-monitoring.jpg" },
    { id: 4, name: "Mobilier", image: "/images/cat-mobilier.jpg" },
  ],
  topProducts: [
    { id: 101, name: "Scanner médical", price: 1200, image: "/images/product-1.jpg" },
    { id: 201, name: "Laser chirurgical", price: 950, image: "/images/product-2.jpg" },
    { id: 301, name: "Moniteur patient", price: 700, image: "/images/product-3.jpg" },
    { id: 401, name: "Table d’examen", price: 450, image: "/images/product-4.jpg" },
  ],
  footer: {
    contact: "Contact",
    legal: "Mentions légales",
    cgu: "CGU",
  },
};
