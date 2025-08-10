FROM node:20-bullseye
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN bash -lc 'if [ -f yarn.lock ]; then corepack enable && yarn install; elif [ -f package-lock.json ]; then npm ci; else npm install; fi'
COPY . .
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost:3001/healthz || exit 1
CMD ["node", "server.js"]

