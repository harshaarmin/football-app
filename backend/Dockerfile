FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Copy Prisma schema before npm install
COPY prisma ./prisma

RUN npm install

# Copy remaining source code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]