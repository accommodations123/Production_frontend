FROM node:20-alpine AS build
WORKDIR /frontend-accommodations
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci --silent --ignore-scripts
COPY . .
RUN npm run build
 
# Runtime stage (nginx serves the static files)
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /frontend-accommodations/dist /usr/share/nginx/html
# Optional: copy a small nginx config if you want to override (not required)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
CMD ["nginx", "-g", "daemon off;"]