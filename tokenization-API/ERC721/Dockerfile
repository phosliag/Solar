# Usa una imagen base ligera de Node.js
FROM node:20-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia package.json y package-lock.json antes para aprovechar el cache de Docker
COPY package*.json ./

# Instala las dependencias (incluyendo las de desarrollo)
RUN npm install --include=dev

# Copia el resto de los archivos de la aplicación
COPY . .

# Compila TypeScript
RUN npx tsc

# Expone el puerto que la aplicación usará
EXPOSE 3000

# Comando por defecto al iniciar el contenedor
CMD ["node", "dist/main.js"]
