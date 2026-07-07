# BUILD
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# RUNTIME
FROM nginx:alpine

# Remove configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuração do nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build do frontend
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
EXPOSE 443
