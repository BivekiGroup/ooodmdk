# Многоэтапная сборка для оптимизации размера образа
FROM node:20-alpine AS base

# Этап установки зависимостей
FROM base AS deps
WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package*.json ./

# Устанавливаем все зависимости для сборки
RUN npm ci

# Этап сборки
FROM base AS builder
WORKDIR /app

# Копируем зависимости из предыдущего этапа
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Собираем приложение
RUN npm run build

# Финальный этап - production
FROM base AS runner
WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Копируем package.json для установки production зависимостей
COPY --from=builder --chown=astro:nodejs /app/package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем собранное приложение
COPY --from=builder --chown=astro:nodejs /app/dist ./dist

# Переключаемся на пользователя astro
USER astro

# Открываем порт
EXPOSE 4321

# Устанавливаем переменные окружения
ENV HOST=0.0.0.0
ENV PORT=4321

# Запускаем приложение
CMD ["node", "./dist/server/entry.mjs"] 