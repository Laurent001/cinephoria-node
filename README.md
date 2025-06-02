# Cinephoria Backend

Backend Node.js/Express de Cinephoria, codé en TypeScript

## Sommaire

- Installation
- Environnement de développement
- Scripts NPM
- Variables d'environnement
- Structure du projet
- Accès rapide

## Installation

---

git clone https://github.com/ton-user/cinephoria-node.git
cd cinephoria-node
npm install

Le fichier docker-compose.yml est configuré pour démarrer les services de base de données et application.
initialisation des services : docker-compose up -d

## Environment de développement

---

services:
webdb:
image: webdb/app
restart: always
extra_hosts: - "host.docker.internal:host-gateway"
volumes: - "$HOME/.webdb:/usr/src/app/static/version"
ports: - "127.0.0.1:22071:22071"
depends_on: - maria - mongodb

    maria:
        image: mariadb
        restart: always
        ports:
            - 3307:3306
        environment:
            MARIADB_ROOT_PASSWORD: <your_root_password>
            MARIADB_USER_PASSWORD: <your_user_password>
        volumes:
            - mariadb_data:/var/lib/mysql

    mongodb:
        image: mongo:latest
        restart: always
        ports:
            - 27017:27017
        environment:
            MONGO_INITDB_ROOT_USERNAME: <your_mongo_user>
            MONGO_INITDB_ROOT_PASSWORD: <your_mongo_password>
        volumes:
            - mongodb_data:/data/db

    gitingest:
      image: gitingest
      build:
        context: ./gitingest
      ports:
        - "8000:8000"
      restart: unless-stopped

    proxy:
      image: nginx:alpine
      ports:
          - 82:80
          - 443:443
      volumes:
          - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
          - ./ssl:/etc/nginx/ssl
      restart: always

volumes:
mariadb_data:
mongodb_data:

## Scripts NPM

---

npm run dev # Démarre le serveur en mode développement avec nodemon
npm run start:dev # Démarre avec tsx en local
npm run start:prod # Démarre le serveur en exécutant le fichier JavaScript compilé (.js) depuis dist
npm run setup:dev # Initialise les bases de données en mode développement
npm run setup:prod # Initialise les bases de données en mode production
npm run build # Compile TypeScript vers JavaScript dans dist/
npm run test # Lance les tests avec Jest

## Variable d'environnements

---

Le fichier .env est utilisé pour gérer les variables d'environnement locales.
Attention : ne jamais committer ce fichier !

Exemple de fichier .env :

### Server

NODE_ENV=development
URL_FRONTEND='http://localhost:4200/#'
SECRET_KEY=<your_secret_key>
JWT_SECRET=<your_jwt_secret>

### SQL

MARIADB_HOST=localhost
MARIADB_USER=<your_mariadb_user>
MARIADB_PASS=<your_mariadb_password>
MARIADB_PORT=3307
MARIADB_NAME=cinephoria
MARIADB_CONNECT_LIMIT=5

### noSql

MONGODB_HOST=localhost
MONGODB_USER=<your_mongodb_user>
MONGODB_PASS=<your_mongodb_password>
MONGODB_PORT=27017
MONGODB_NAME=cinephoria

### image folder

DIR_IMAGES=public/images

### mailtrap

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=<smtp_user>
SMTP_PASS=<smtp_password>
SMTP_FROM=<smtp_email_from>
SUPPORT_EMAIL=<support_email>

## Structure du porjet

---

cinephoria-node/
├── src/
│ ├── app.ts ← Configuration Express
│ ├── server.ts ← Entrée principale
│ └── api/routes/ ← Routes Express
├── db/ ← Scripts base de données
├── public/ ← Dossier public (ex: images)
├── dist/ ← Code compilé (généré)
├── .env ← Variables d'env locales
├── package.json
├── tsconfig.json
└── README.md

## Accès rapide

- API backend : http://localhost:3000
- WebDB : http://localhost:22071
