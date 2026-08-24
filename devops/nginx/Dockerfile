FROM nginx:stable-alpine

# Remove config padrão do nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# Copia configurações customizadas
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]