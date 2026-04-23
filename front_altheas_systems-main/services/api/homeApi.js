import { API_ROUTES } from "../routes";
import { httpClient } from "../http/client";
import { API_CONFIG } from "../config";
import { homeMock } from "../mocks/home.mock";

export async function fetchHomePageData() {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.home) {
    return homeMock;
  }

  let homeData = null;
  let categories = [];
  try {
    [homeData, categories] = await Promise.all([
      httpClient(API_ROUTES.home.getPage),
      httpClient(API_ROUTES.categories.list),
    ]);
  } catch (error) {
    return {
      heroSlides: [],
      categories: [],
      topProducts: [],
    };
  }

  const topProducts = Array.isArray(homeData?.topProducts)
    ? homeData.topProducts.map((item) => {
        const product = item?.product || {};
        return {
          id: product.id,
          name: product.name,
          price: product.price ?? 0,
        };
      })
    : [];

  const heroSlides = Array.isArray(homeData?.carouselSections)
    ? homeData.carouselSections.map((slide) => ({
        id: slide.id,
        title: slide.title,
        text: slide.text,
        imageUrl: slide.imageUrl,
        linkUrl: slide.linkUrl,
      }))
    : [];

  return {
    heroSlides,
    categories: Array.isArray(categories) ? categories : [],
    topProducts,
  };
}
