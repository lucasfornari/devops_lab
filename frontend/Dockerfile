# Imagem de dev: servidor do Vite com hot reload, usada pelo docker-compose.
FROM node:22-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Build de produção: gera dist/ estático, consumido pelo Dockerfile de nginx da raiz.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
