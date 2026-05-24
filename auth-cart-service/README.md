# Auth & panier (`auth-cart-service`)

## Base de données : PostgreSQL (Neon)

Le schéma Prisma utilise **`DATABASE_URL`** (PostgreSQL avec SSL, même logique que `admin-service`).

1. Dans **Neon**, copie la **connection string URI** pour Prisma (`postgresql://...` avec `sslmode=require` si demandé).
2. Colle-la dans **`auth-cart-service/.env`** :
   ```env
   DATABASE_URL="postgresql://..."
   ```
3. Génére le client et synchronise si besoin :
   ```bash
   cd auth-cart-service
   npm install
   npm run db:generate
   ```
4. Si la base **Neon contient déjà** les tables `User`, `cart`, etc. (déjà migrées depuis ce repo) :
   ```bash
   npm run db:push
   ```
   (pour aligner ponctuellement le schéma sans réécrire l’historique Prisma.)

   Sinon, première installation sur une base vide :
   ```bash
   npx prisma migrate deploy
   ```

> Les utilisateurs inscrits et le panier/commandes lisent désormais la **même** base que le dashboard admin (liste utilisateurs).

## Scripts

| Script            | Effet                                      |
|-------------------|--------------------------------------------|
| `npm run db:generate` | `prisma generate`                      |
| `npm run db:push`    | `prisma db push` (schéma → base)       |
| `npm run dev`        | Serveur nodemon (`PORT` dans `.env`)   |

## Ancien SQLite

Les fichiers `prisma/dev.db` locaux ne sont plus utilisés par le schéma ; ils sont ignorés par Git (`prisma/*.db`).
