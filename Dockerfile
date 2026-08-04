# Production image for Railway (or any Docker host).
# Runs the Next.js server AND generates PDFs, so it ships a system Chromium
# plus Hebrew + emoji fonts - without those the PDF text would render as boxes.

FROM node:20-slim

# Chromium and the fonts Puppeteer needs to render the report correctly.
# fonts-noto-core covers Hebrew; fonts-noto-color-emoji covers the UI emoji.
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      fonts-noto-core \
      fonts-noto-color-emoji \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Use the system Chromium and skip Puppeteer's own download.
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Install ALL dependencies (incl. dev) - Tailwind, PostCSS and TypeScript are
# needed at build time. NODE_ENV is intentionally not "production" here, or npm
# would skip devDependencies and the build would fail.
COPY package.json package-lock.json ./
RUN npm ci

# Build the app.
COPY . .
RUN npx prisma generate && npm run build

# Only now switch to production for the running server.
ENV NODE_ENV=production

# Railway provides $PORT; Next reads it automatically.
EXPOSE 3000

# Apply DB migrations against the mounted volume, then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
