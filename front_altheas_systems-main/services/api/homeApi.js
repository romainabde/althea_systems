import { API_ROUTES } from "../routes";
import { httpClient } from "./http/client";
import { API_CONFIG } from "../config";
import { mockHomeData } from "./mocks/home.mock";

export async function fetchHomePageData() {
  if (API_CONFIG.useMocks) {
    return mockHomeData;
  }

  return httpClient(API_ROUTES.home.getPage);
}

export async function getHomeData() {
  return fetchHomePageData();
}
