FROM node:22-alpine
WORKDIR /app
COPY ../shared ./shared
COPY . .
RUN npm ci 2>/dev/null; npm run build 2>/dev/null || npx tsc -p tsconfig.json
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node","dist/index.js"]
