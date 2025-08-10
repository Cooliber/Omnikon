FROM node:20-bullseye
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN bash -lc 'if [ -f yarn.lock ]; then corepack enable && yarn install; elif [ -f package-lock.json ]; then npm ci; else npm install; fi'
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]

