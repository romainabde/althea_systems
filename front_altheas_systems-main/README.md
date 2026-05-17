# Front Althea - Architecture Front/API

## Introduction

Le front est pret pour etre connecte au backend.
Les appels sont centralises dans la couche `services` pour garder une integration propre et maintenable.

## Structure des appels API

### Emplacements

- `services/routes.js`
- `services/http/client.js`
- `services/api/*Api.js`
- `services/*Service.js`
- `components/*`

### Role de chaque couche

- `services/api/*Api.js` : appels HTTP (ou mocks) vers les endpoints.
- `services/*Service.js` : logique metier front (orchestration/formatage).
- `components/*` : UI uniquement (pas d'appel API direct).
- `services/routes.js` : source unique des routes backend.

## Chatbot flow

### Fichiers

- UI : `components/chat/ChatWidget.js`
- Service metier : `services/chatbotService.js`
- Couche API : `services/api/chatbotApi.js`

### Fonctions exposees

- `startChatSession`
- `sendChatMessage`
- `endChatSession`
- `escalateChatSession`

### Correspondance routes backend

- `startChatSession` -> `/chatbot/start`
- `sendChatMessage` -> `/chatbot/message`
- `endChatSession` -> `/chatbot/end`
- `escalateChatSession` -> `/chatbot/escalate`

## Search flow

- `components/layout/HeaderSearchBar.js` redirige vers `/search?query=...`
- `app/search/page.js` lit la query URL puis alimente le flow de recherche
- endpoints prevus dans `services/routes.js` :
  - `/search/products`
  - `/search/facets`
  - `/search/sort-options`

## Bonnes pratiques pour brancher le backend

- Ne jamais appeler les API directement dans les composants.
- Toujours passer par `services/api/*Api.js`, puis `services/*Service.js`.
- Ajouter toute nouvelle route backend dans `services/routes.js`.
- Garder la separation UI / logique / appels reseau.

## Exemple de branchement (simple)

Pour remplacer un mock par du reel (ex: chatbot), garder la meme fonction service.
Seule la partie `if (API_CONFIG.useMocks)` dans `services/api/chatbotApi.js` est a remplacer par l'appel HTTP correspondant.
