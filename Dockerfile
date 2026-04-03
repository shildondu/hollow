FROM node:24-alpine
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

RUN mkdir -p public/uploads

EXPOSE 3000
CMD ["npm", "start"]
