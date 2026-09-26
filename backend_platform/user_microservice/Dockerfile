FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY src ./src
COPY openapi.yaml ./
COPY drizzle ./drizzle
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/server.ts"]
