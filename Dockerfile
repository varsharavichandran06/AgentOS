# Step 1: Build the frontend static assets
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Set up the production server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/agents.js ./
COPY --from=builder /app/adk.js ./
COPY --from=builder /app/encryption.js ./
COPY --from=builder /app/secureDataStore.js ./
COPY --from=builder /app/intelligentRescheduler.js ./


ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
