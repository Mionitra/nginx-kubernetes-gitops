FROM nginx:1.27-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY web/HTML/ /usr/share/nginx/html/

EXPOSE 80
