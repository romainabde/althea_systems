"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getHomeData } from "../services/api/homeApi";
import { fetchAllCategories } from "../services/api/catalogApi";

/** Réponse GET /home (catalog) ou ancienne forme mock (carousel, welcomeMessage…). */
function normalizeHomePayload(data) {
  if (!data) return null;
  if (Array.isArray(data.carouselSections)) {
    return data;
  }
  if (Array.isArray(data.carousel)) {
    return {
      carouselSections: data.carousel.map((slide, i) => ({
        id: slide.id,
        title: slide.title,
        text: slide.subtitle,
        imageUrl: slide.imageUrl,
        linkUrl: slide.link,
        displayOrder: i,
      })),
      homepageTexts: data.welcomeMessage
        ? [
            {
              id: 1,
              content: `${data.welcomeMessage.title}\n\n${data.welcomeMessage.content}`,
            },
          ]
        : [],
      topProducts: (data.topProducts || []).map((p) => ({
        product: { id: p.id, name: p.name },
        images: [{ url: p.imageUrl }],
      })),
    };
  }
  return data;
}

function catalogAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base =
    process.env.NEXT_PUBLIC_CATALOG_API_URL || "http://localhost:8082";
  const trimmed = base.replace(/\/$/, "");
  return `${trimmed}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [homePayload, setHomePayload] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [homeRaw, cats] = await Promise.all([
          getHomeData(),
          fetchAllCategories(),
        ]);
        if (cancelled) return;
        setHomePayload(normalizeHomePayload(homeRaw));
        setCategories(Array.isArray(cats) ? cats : []);
        setLoadError(null);
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e.message || "Impossible de charger la page d’accueil."
          );
          setHomePayload(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const carouselSlides = useMemo(() => {
    const sections = homePayload?.carouselSections;
    if (!Array.isArray(sections)) return [];
    return [...sections]
      .sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
      )
      .map((slide) => ({
        id: slide.id ?? slide.title,
        title: slide.title ?? "",
        subtitle: slide.text ?? "",
        imageUrl: slide.imageUrl ?? "",
        link: slide.linkUrl || "/products",
        buttonText: "Découvrir",
      }));
  }, [homePayload]);

  const homepageTexts = homePayload?.homepageTexts ?? [];

  const sortedCategories = useMemo(() => {
    return [...categories].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
  }, [categories]);

  const topProducts = Array.isArray(homePayload?.topProducts)
    ? homePayload.topProducts
    : [];

  useEffect(() => {
    setCurrentSlide(0);
  }, [carouselSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === carouselSlides.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? carouselSlides.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    if (carouselSlides.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  if (loading) {
    return (
      <main style={{ fontFamily: "sans-serif", padding: "4rem", textAlign: "center" }}>
        <p>Chargement…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main style={{ fontFamily: "sans-serif", padding: "4rem", textAlign: "center" }}>
        <p style={{ color: "#b91c1c" }}>{loadError}</p>
        <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
          Vérifie que le catalog-service tourne (port 8082) et que{" "}
          <code>NEXT_PUBLIC_CATALOG_API_URL</code> est correct.
        </p>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "sans-serif" }}>
      <section
        style={{
          position: "relative",
          height: "500px",
          overflow: "hidden",
          backgroundColor: "#0f172a",
        }}
      >
        {carouselSlides.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#94a3b8",
            }}
          >
            Aucune bannière configurée (carousel vide).
          </div>
        ) : (
          carouselSlides.map((slide, index) => (
            <div
              key={String(slide.id)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: currentSlide === index ? 1 : 0,
                transition: "opacity 0.8s ease-in-out",
                zIndex: currentSlide === index ? 1 : 0,
              }}
            >
              <Link
                href={slide.link}
                style={{ display: "block", width: "100%", height: "100%" }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.4)), url(${catalogAssetUrl(slide.imageUrl)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    cursor: "pointer",
                  }}
                />
              </Link>

              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  color: "white",
                  pointerEvents: "none",
                }}
              >
                <h1
                  style={{
                    fontSize: "3.5rem",
                    fontWeight: "bold",
                    marginBottom: "15px",
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {slide.title}
                </h1>
                <p
                  style={{
                    fontSize: "1.2rem",
                    marginBottom: "30px",
                    maxWidth: "600px",
                    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  }}
                >
                  {slide.subtitle}
                </p>

                <Link href={slide.link} style={{ pointerEvents: "auto" }}>
                  <button
                    type="button"
                    style={{
                      backgroundColor: "#2563eb",
                      color: "white",
                      padding: "15px 30px",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
                    }}
                  >
                    {slide.buttonText}
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}

        {carouselSlides.length > 0 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              style={{
                position: "absolute",
                top: "50%",
                left: "20px",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                border: "none",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                fontSize: "1.5rem",
                cursor: "pointer",
                backdropFilter: "blur(5px)",
                transition: "background 0.3s",
                zIndex: 10,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.4)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.2)")
              }
            >
              ❮
            </button>

            <button
              type="button"
              onClick={nextSlide}
              style={{
                position: "absolute",
                top: "50%",
                right: "20px",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                border: "none",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                fontSize: "1.5rem",
                cursor: "pointer",
                backdropFilter: "blur(5px)",
                transition: "background 0.3s",
                zIndex: 10,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.4)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.2)")
              }
            >
              ❯
            </button>

            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "10px",
                zIndex: 10,
              }}
            >
              {carouselSlides.map((_, index) => (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => setCurrentSlide(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setCurrentSlide(index);
                  }}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor:
                      currentSlide === index
                        ? "white"
                        : "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <section
        style={{
          backgroundColor: "#f8fafc",
          padding: "50px 20px",
          textAlign: "center",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "2rem",
              color: "#0f172a",
              marginBottom: "20px",
              fontWeight: "bold",
            }}
          >
            Bienvenue
          </h2>
          {homepageTexts.length === 0 ? (
            <p style={{ fontSize: "1.1rem", color: "#475569", lineHeight: "1.8" }}>
              Texte d’accueil à définir dans le catalog (homepage_text).
            </p>
          ) : (
            homepageTexts.map((t, idx) => {
              const parts = (t.content || "").split("\n\n");
              if (parts.length >= 2 && idx === 0) {
                return (
                  <div key={t.id ?? idx}>
                    <h3
                      style={{
                        fontSize: "1.5rem",
                        color: "#0f172a",
                        marginBottom: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {parts[0]}
                    </h3>
                    <p
                      style={{
                        fontSize: "1.1rem",
                        color: "#475569",
                        lineHeight: "1.8",
                      }}
                    >
                      {parts.slice(1).join("\n\n")}
                    </p>
                  </div>
                );
              }
              return (
                <p
                  key={t.id ?? idx}
                  style={{
                    fontSize: "1.1rem",
                    color: "#475569",
                    lineHeight: "1.8",
                  }}
                >
                  {t.content}
                </p>
              );
            })
          )}
        </div>
      </section>

      <section style={{ maxWidth: "1200px", margin: "60px auto", padding: "0 20px" }}>
        <h2
          style={{
            fontSize: "2rem",
            color: "#0f172a",
            marginBottom: "30px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Nos Catégories d&apos;Équipements
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "30px",
          }}
        >
          {sortedCategories.map((category) => (
            <Link
              href={`/products?category=${encodeURIComponent(category.name)}`}
              key={category.id}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  position: "relative",
                  height: "250px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.03)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1,
                    backgroundImage: `url(${catalogAssetUrl(category.imageUrl)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "transform 0.5s ease",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 2,
                    backgroundColor: "rgba(15, 23, 42, 0.4)",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "25px",
                    boxSizing: "border-box",
                  }}
                >
                  <h3
                    style={{
                      color: "white",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      margin: 0,
                      textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    {category.name} →
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "1200px", margin: "60px auto", padding: "0 20px" }}>
        <h2
          style={{
            fontSize: "2rem",
            color: "#0f172a",
            marginBottom: "30px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Les Top Produits du moment
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "30px",
          }}
        >
          {topProducts.map((entry, idx) => {
            const product = entry.product ?? entry;
            const images = entry.images ?? [];
            const firstUrl = images[0]?.url;
            const imgSrc = catalogAssetUrl(firstUrl);
            const pid = product.id ?? idx;
            return (
              <Link
                key={pid}
                href={`/products/${pid}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    backgroundColor: "white",
                    transition: "transform 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-5px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <div
                    style={{
                      height: "200px",
                      backgroundImage: imgSrc ? `url(${imgSrc})` : "none",
                      backgroundColor: imgSrc ? undefined : "#e2e8f0",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div style={{ padding: "20px", textAlign: "center" }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.2rem",
                        color: "#0f172a",
                        fontWeight: "bold",
                      }}
                    >
                      {product.name}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
