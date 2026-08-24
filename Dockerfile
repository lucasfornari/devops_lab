FROM nginx:stable-alpine

# Remove config padrão do nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# Copia configurações customizadas
COPY devops/nginx/nginx.conf /etc/nginx/nginx.conf
COPY devops/nginx/conf.d/ /etc/nginx/conf.d/

# Copia os arquivos estáticos do site para dentro da imagem
# (no docker-compose local eles entram via volume; para o Kubernetes
# a imagem precisa carregar os arquivos, pois não há bind mount do host)
COPY www/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
