# Services architecture (front)

Objectif: isoler proprement l'accès API du rendu UI et garder une base facilement branchable au backend final.

## Structure

```txt
services/
  config.js          # URLs et flags (NEXT_PUBLIC_*)
  routes.js          # Chemins relatifs des endpoints
  authSession.js     # Stockage token / user (session/localStorage)
  api/
    http/client.js   # fetch partagé (buildRequestUrl, Bearer si besoin)
    mocks/*.mock.js  # Données mock pour le dev sans backend
    *Api.js          # Appels par domaine (catalogue, panier, auth, …)
```

- `services/config.js` — configuration centrale (URLs par service, headers par défaut).
- `services/routes.js` — définition unique des endpoints API.
- `services/authSession.js` — JWT et profil minimal après login (client uniquement).
- `services/api/http/client.js` — client HTTP générique (fetch + erreurs).
- `services/api/mocks/*.mock.js` — données mock centralisées.
- `services/api/*Api.js` — couche données : routes + fetch (+ mocks). Les petites orchestrations (ex. catégorie + produits, home, chatbot « façade ») vivent ici si elles ne méritent pas un fichier séparé.

## Règle de séparation

- Les composants/pages importent depuis `services/api/*Api.js` ou les helpers racine (`config`, `routes`, `authSession` si besoin direct).
- Pas de logique réseau dans la UI autre que via cette couche.
- Toute nouvelle route backend doit être ajoutée d'abord dans `services/routes.js`.

## Quand le backend est prêt

1. Renseigner les `NEXT_PUBLIC_*_API_URL` dans `.env.local`.
2. Mettre `NEXT_PUBLIC_USE_API_MOCKS=false` pour activer les vraies requêtes.
3. Adapter les mappings si le format des payloads backend diffère.
