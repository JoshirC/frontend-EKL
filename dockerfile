# Etapa 1: build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Desactiva lint en el build
ENV NEXT_IGNORE_ESLINT=true
RUN npm run build


# Etapa 2: producción
FROM node:20-alpine

WORKDIR /app

# Copiar solo lo necesario desde la etapa anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000

# Iniciar Next.js en producción
CMD ["npm", "run", "start"]
