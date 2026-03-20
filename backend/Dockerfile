FROM node:20-alpine

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

RUN npx prisma generate

EXPOSE 5001

CMD ["sh", "-c", "npm run db:init && npm run db:seed && pm2-runtime start ecosystem.config.cjs"]
