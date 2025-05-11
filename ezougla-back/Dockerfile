# Utiliser l'image Node.js Alpine comme base
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app/ezougla-back

# Copier les fichiers du projet dans le conteneur
COPY . .

# Installer les dépendances du projet
RUN npm install

# Générer les fichiers Prisma nécessaires
RUN npx prisma generate

# Installer NestJS CLI comme dépendance de développement
RUN npm install @nestjs/cli --save-dev

# Créer le fichier .env avec les variables d'environnement nécessaires
RUN sh -c 'echo "DATABASE_URL=mysql://root:root@mysql_db_data:3307/ezougla" > .env'

# Commande pour lancer Prisma en mode dev et démarrer l'application
CMD sh -c 'until nc -z -v -w30 mysql_db_data 3306; do echo "En attente de MySQL..."; sleep 1; done && \
    npx prisma db push && \
    npm run build && \
    npm run start:dev'
