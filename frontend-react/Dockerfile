# Étape 1 : Construction de l'app
FROM node:20.18.0 AS build

# Créer un dossier pour l'app
WORKDIR /app

# Copier les fichiers nécessaires
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste de l'application
COPY . .

# Construire l'app
RUN npm run build

# Étape 2 : Serveur Nginx pour servir l'app
FROM nginx:alpine

# Supprimer la configuration par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copier les fichiers build de React dans le dossier de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copier la configuration custom de Nginx si nécessaire
# COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port 80
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]
