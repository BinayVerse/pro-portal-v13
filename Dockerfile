# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:22-alpine

WORKDIR /app

# Copy only what we need for runtime
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# Install only production deps
RUN npm install --omit=dev --legacy-peer-deps

ENV NUXT_PUBLIC_APP_URL=http://localhost:80
ENV HOST=0.0.0.0
ENV PORT=80

EXPOSE 80

# Nuxt 3 correct entrypoint
CMD ["node", ".output/server/index.mjs"]
