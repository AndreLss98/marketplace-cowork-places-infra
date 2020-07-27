FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/
COPY /etc/letsencrypt/live/placeet.com /etc/nginx/certs