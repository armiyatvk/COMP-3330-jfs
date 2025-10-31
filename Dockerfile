# syntax=docker/dockerfile:1
FROM oven/bun:1
WORKDIR /app

# Install backend deps
COPY package.json ./
RUN bun install

# Copy frontend and install its deps
COPY frontend ./frontend
RUN cd frontend && bun install && bun run build

# Copy backend + built frontend to server/public
COPY server ./server
RUN mkdir -p server/public && cp -r frontend/dist/* server/public/

# Expose port and run app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "server/index.ts"]
