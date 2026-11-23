FROM nginx:1.30.8-alpine3.24

# Remove config padrão do nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# Copia configurações customizadas
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d.dev/ /etc/nginx/conf.d/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]