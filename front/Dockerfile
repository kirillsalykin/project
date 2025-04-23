FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build:site

RUN npm run build:app

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/site /usr/share/nginx/html/site
COPY --from=builder /app/dist/app /usr/share/nginx/html/app

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 