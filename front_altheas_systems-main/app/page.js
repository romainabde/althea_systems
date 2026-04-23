import { getHomeData } from "../services/homeService";
import HeroSection from "../components/home/HeroSection";
import CategoriesSection from "../components/home/CategoriesSection";
import TopProductsSection from "../components/home/TopProductsSection";

export default async function Home() {
  const data = await getHomeData();

  return (
    <div>
      <h1 style={{ padding: "2rem" }}>Accueil Althea Systems</h1>
      <HeroSection slides={data.heroSlides} />
      <CategoriesSection categories={data.categories} />
      <TopProductsSection products={data.topProducts} />
    </div>
  );
}