import { fetchHomePageData } from "./api/homeApi";

export async function getHomeData() {
  return fetchHomePageData();
}