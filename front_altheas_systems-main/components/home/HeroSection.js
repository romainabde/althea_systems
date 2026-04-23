export default function HeroSection({ slides }) {
  return (
    <section style={{ padding: "2rem" }}>
      <h2>Carrousel</h2>
      <div style={{ display: "grid", gap: "1rem" }}>
        {slides.map((slide) => (
          <div
            key={slide.id}
            style={{
              padding: "1.5rem",
              border: "1px solid #ddd",
              borderRadius: "12px",
            }}
          >
            <h3>{slide.title}</h3>
            <p>{slide.subtitle}</p>
            <a href={slide.link}>Voir plus</a>
          </div>
        ))}
      </div>
    </section>
  );
}