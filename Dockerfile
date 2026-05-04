# syntax=docker/dockerfile:1

FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM node:20-alpine AS backend-build

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npx prisma generate && npm prune --omit=dev

FROM node:20-alpine AS production

WORKDIR /app/backend
ENV NODE_ENV=production
ENV BACKEND_PORT=5001
ENV DATABASE_URL=file:./dev.db

COPY --from=backend-build /app/backend/package*.json ./
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/backend/prisma ./prisma
COPY --from=backend-build /app/backend/src ./src
COPY --from=frontend-build /app/frontend/dist ./public

RUN chown -R node:node /app/backend
USER node

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.BACKEND_PORT||5001)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["sh", "-c", "npm run db:init && npm run db:seed && node src/index.js"]