# syntax=docker/dockerfile:1
FROM oven/bun:1
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Build frontend
COPY frontend ./frontend
RUN cd frontend && bun run build

# Copy backend and built frontend to /server/public
COPY server ./server
RUN mkdir -p server/public && cp -r frontend/dist/* server/public/

# Expose port & start server
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "server/index.ts"]
