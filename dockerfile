FROM node:23-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine

# Instalar dependencias necesarias
RUN apk add --no-cache gettext

# Configuración de Nginx
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
COPY generate-config.sh /docker-entrypoint.d/

# Permisos y limpieza
RUN chmod +x /docker-entrypoint.d/generate-config.sh && \
    rm -rf /etc/nginx/conf.d/default.conf

# No establecer PORT aquí, Cloud Run lo inyectará