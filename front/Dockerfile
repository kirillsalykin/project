FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/site  /usr/share/nginx/html/site
COPY dist/app   /usr/share/nginx/html/app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
