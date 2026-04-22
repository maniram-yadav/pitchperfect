FROM node:24-alpine AS builder
RUN apk upgrade --no-cache
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN chmod -R 755 node_modules/.bin && npm run build

FROM node:24-alpine
RUN apk upgrade --no-cache
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY --from=builder /app/.next ./.next
EXPOSE 3000
CMD ["npm", "start"]
