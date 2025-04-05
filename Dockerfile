FROM node:23-alpine3.20 AS base
FROM base AS builder

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

CMD [ "node", "dist/main" ]