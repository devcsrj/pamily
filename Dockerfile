FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json .
RUN npm ci
COPY . .
RUN mv .env.example .env
RUN npm run build
RUN npm prune --production

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production

HEALTHCHECK --interval=5m --timeout=30s \
  CMD curl -f http://localhost:${PORT}/api/healthcheck || exit 1

CMD [ "node", "build" ]
