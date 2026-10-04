# ============================================================
# Dockerfile multi-stage pour le backend Covoiturage
# (Express + TypeScript + MongoDB)
# ============================================================

# ------------------------------------------------------------
# Stage 1 : Build — compilation TypeScript -> JavaScript
# ------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les manifestes pour profiter du cache Docker
COPY package.json package-lock.json ./

# Installer TOUTES les dépendances (dev incluses) pour compiler
RUN npm ci

# Copier le code source et compiler
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Supprimer les devDependencies : on ne garde que le runtime
RUN npm prune --omit=dev


# ------------------------------------------------------------
# Stage 2 : Runtime — image finale légère
# ------------------------------------------------------------
FROM node:20-alpine AS runner

# Mises à jour de sécurité + outils pour le healthcheck
RUN apk add --no-cache wget

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Récupérer uniquement l'artefact compilé et les deps de production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Exécuter en tant qu'utilisateur non-root (fourni par l'image node)
USER node

EXPOSE 3000

# Vérification de l'état de santé via l'endpoint /health
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Démarrer l'application
CMD ["node", "dist/server.js"]
