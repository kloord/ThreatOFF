FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 80

RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "80"]