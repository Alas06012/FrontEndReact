# Etapa 1: Construcción
FROM node:20-alpine AS build

# Crear directorio de la app
WORKDIR /app

# Copiar archivos de configuración e instalar dependencias
COPY package.json package-lock.json* pnpm-lock.yaml* bun.lockb* ./
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Construir la app
RUN npm run build

# Etapa 2: Servir la app con un servidor web estático (usamos nginx)
FROM nginx:stable-alpine

# Eliminar la configuración por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar la app construida desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar archivo personalizado de configuración de nginx si se desea
# COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto por defecto
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
