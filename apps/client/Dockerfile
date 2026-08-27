FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages ./packages
COPY apps/client ./apps/client
RUN npm ci
RUN npm run build --workspace=apps/client

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
