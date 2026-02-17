FROM node:20-alpine

WORKDIR /app

# Instala dependencias primeiro para aproveitar cache em rebuilds.
COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000", "--strictPort"]