FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./tsconfig.json

COPY src ./src

EXPOSE 3000

RUN npm run build

CMD ["npm", "start"]