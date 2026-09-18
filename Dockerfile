FROM node:18-alpine

WORKDIR /emp-typescript

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Verify dist exists
RUN ls -la dist/ || (echo "dist/ not found — build failed" && exit 1)

EXPOSE 3000

CMD ["node", "dist/index.js"]
