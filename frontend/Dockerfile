# Etapa 1: Construcción de la aplicación con Node 20
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente
COPY . .

# Compilar la aplicación para producción (usando el base: "/portal-rh/" de tu vite.config)
RUN npm run build

# Etapa 2: Servidor Web con Nginx para producción
FROM nginx:alpine

# Copiar los archivos compilados al directorio público de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# 🟢 DESCOMENTADO: Copia tu configuración personalizada de Nginx para manejar /portal-rh/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]