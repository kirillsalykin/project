# Dockerfile
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf \
 && cat << 'EOF' > /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html/site;
        index index.html;
        try_files $uri $uri.html $uri/ /index.html;
    }

    location /app {
        alias /usr/share/nginx/html/app;
        index index.html;
        try_files $uri $uri/ /app/index.html;
    }
}
EOF

COPY dist/site  /usr/share/nginx/html/site
COPY dist/app   /usr/share/nginx/html/app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
