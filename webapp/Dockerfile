FROM node:20-alpine
WORKDIR /app

COPY ./package*.json ./
RUN npm install

COPY . ./
RUN npm run build:client

EXPOSE 5000
CMD ["npm", "run", "server"]