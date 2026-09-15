# Builda o frontend (Vue + Vite) para arquivos estáticos.
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM nginx:stable-alpine

# Remove config padrão do nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# Copia configurações customizadas
COPY devops/nginx/nginx.conf /etc/nginx/nginx.conf
COPY devops/nginx/conf.d.prod/ /etc/nginx/conf.d/

# Copia os arquivos estáticos já buildados do frontend para dentro da imagem
# (no docker-compose local o frontend roda como servidor de dev do Vite com
# hot reload; para o Kubernetes a imagem precisa carregar os arquivos prontos,
# pois não há bind mount nem servidor de dev no cluster).
COPY --from=frontend-build /app/dist/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
