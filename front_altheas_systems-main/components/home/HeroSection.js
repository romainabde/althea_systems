"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroSection({ customSlides }) {
  // Slides par défaut si le back-office ne renvoie rien
  const defaultSlides = [
    {
      id: 1,
      title: "L'Excellence Médicale au Quotidien",
      subtitle: "Découvrez notre nouvelle gamme d'équipements de diagnostic de pointe.",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
      ctaText: "Voir les nouveautés",
      ctaLink: "/products?category=diagnostic"
    },
    {
      id: 2,
      title: "Consommables Hospitaliers",
      subtitle: "Réapprovisionnez vos stocks avec nos produits certifiés conformes.",
      image: "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?q=80&w=2070&auto=format&fit=crop",
      ctaText: "Commander en lot",
      ctaLink: "/products?category=consommables"
    }
  ];

  const slides = customSlides && customSlides.length > 0 ? customSlides : defaultSlides;
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fait défiler le carrousel automatiquement toutes les 5 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '60vh', minHeight: '400px', overflow: 'hidden', backgroundColor: '#0f172a' }}>
      
      {/* Affichage des Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            opacity: index === currentSlide ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.4)), url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <div style={{ color: 'white', padding: '0 20px', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>{slide.title}</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{slide.subtitle}</p>
            <Link href={slide.ctaLink}>
              <button style={{
                backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', 
                fontSize: '1.1rem', border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontWeight: '600', transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                {slide.ctaText}
              </button>
            </Link>
          </div>
        </div>
      ))}

      {/* Points de navigation (Dots) en bas du carrousel */}
      <div style={{ position: 'absolute', bottom: '20px', width: '100%', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            style={{
              width: '12px', height: '12px', borderRadius: '50%', border: 'none', cursor: 'pointer',
              backgroundColor: index === currentSlide ? '#3b82f6' : 'rgba(255,255,255,0.5)'
            }}
            aria-label={`Aller au slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}