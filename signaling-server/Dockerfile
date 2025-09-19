FROM node:alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3001

CMD ["npm", "start"]