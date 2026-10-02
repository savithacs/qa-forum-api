FROM node:26-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:26-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV NODE_PATH=/app/dist

COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 10000
CMD ["node", "dist/src/main.js"]
