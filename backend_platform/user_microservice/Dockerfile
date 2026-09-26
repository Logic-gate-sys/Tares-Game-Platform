FROM node:24-alpine
WORKDIR /app
COPY  backend_platform/user_microservice/package*.json ./
RUN   npm ci --omit=dev --legacy-peer-deps
COPY  backend_platform/user_microservice/src ./src
COPY  backend_platform/user_microservice/openapi.yaml ./
# copy proto files into app/proto 
COPY proto   ./proto
COPY backend_platform/user_microservice/drizzle ./drizzle
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/server.ts"]
