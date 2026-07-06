# Step 1: Build the frontend static assets
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Set up the production server
# Debian-based (not alpine) specifically so the jobspy scraper's Python dependencies
# (pandas, numpy, etc.) install from prebuilt manylinux wheels instead of needing to
# compile from source against musl libc, which alpine would otherwise require.
FROM node:18-slim
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-pip \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
# Wildcard rather than an explicit per-file list: this has already broken the
# production build twice (encryption.js/secureDataStore.js/intelligentRescheduler.js
# missing, then tokenStore.js missing) because it's easy to add a new backend
# module and forget to add a matching COPY line for it here.
COPY --from=builder /app/*.js ./
COPY --from=builder /app/jobscraper ./jobscraper

RUN pip3 install --no-cache-dir --break-system-packages -r jobscraper/requirements.txt

ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
