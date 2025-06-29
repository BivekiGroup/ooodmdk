# Многоэтапная сборка для оптимизации размера образа
FROM node:20-alpine AS base

# Установка pnpm глобально
RUN npm install -g pnpm

# Этап установки зависимостей
FROM base AS deps
WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Этап сборки
FROM base AS builder
WORKDIR /app

# Копируем зависимости из предыдущего этапа
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Собираем приложение
RUN pnpm run build

# Финальный этап - production
FROM base AS runner
WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Копируем собранное приложение
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /app/package.json ./package.json

# Переключаемся на пользователя astro
USER astro

# Открываем порт
EXPOSE 4321

# Устанавливаем переменные окружения
ENV HOST=0.0.0.0
ENV PORT=4321

# Запускаем приложение
CMD ["node", "./dist/server/entry.mjs"] 