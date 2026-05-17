# Services architecture (front)

Objectif: isoler proprement l'acces API du rendu UI et garder une base facilement branchable au backend final.

## Structure

```txt
services/
  config.js
  routes.js
  api.js
  index.js
  http/
    client.js
  mocks/
    home.mock.js
    catalog.mock.js
    cart.mock.js
    search.mock.js
    checkout.mock.js
  api/
    homeApi.js
    catalogApi.js
    cartApi.js
    searchApi.js
    checkoutApi.js
  homeService.js
  categoryService.js
  productService.js
  cartService.js
  searchService.js
  checkoutService.js
```

- `services/config.js`
  - Configuration centrale (base URL, headers par defaut).
- `services/routes.js`
  - Definition unique des endpoints API (alignes avec `ROUTES/Routes.pdf`).
- `services/http/client.js`
  - Client HTTP generique (fetch + gestion d'erreur standard).
- `services/mocks/*.mock.js`
  - Donnees mock centralisees pour dev frontend sans backend.
- `services/api/*Api.js`
  - Couche acces donnees (route + fetch + fallback mock).
- `services/*Service.js`
  - Couche metier front (composition des appels API, adaptation des donnees).
- `services/index.js`
  - Point d'entree unique des services metier pour les pages/components.

## Regle de separation

- Les composants/pages App Router ne parlent qu'aux `*Service`.
- Les `*Service` ne font pas de rendu UI.
- Les `*Api` ne contiennent pas de logique metier complexe.
- Toute nouvelle route backend doit etre ajoutee d'abord dans `services/routes.js`.

## Quand le backend est pret

1. Mettre `NEXT_PUBLIC_API_BASE_URL` dans `.env.local`.
2. Mettre `NEXT_PUBLIC_USE_API_MOCKS=false` pour activer les vraies requetes.
3. Adapter les mappings si le format des payloads backend differe.
