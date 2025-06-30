# Docker Деплой для OOODMDK

## Описание

Этот проект настроен для деплоя на VPS с использованием Docker Compose. Приложение использует Astro с Node.js адаптером вместо Vercel.

## Файлы конфигурации

- `Dockerfile` - конфигурация Docker образа
- `docker-compose.yml` - оркестрация контейнеров
- `stack.env` - переменные окружения
- `.dockerignore` - исключения для Docker сборки

## Настройка

### 1. Переменные окружения

Отредактируйте файл `stack.env`:

```bash
# Замените на ваш домен
PUBLIC_SITE_URL=https://yourdomain.com

# Настройки порта (если нужно)
APP_PORT=4321

# Sanity токен (если используете приватные данные)
SANITY_TOKEN=your_sanity_token_here
```

### 2. Сборка и запуск

```bash
# Сборка образа
docker-compose build

# Запуск в фоновом режиме
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### 3. Обновление

```bash
# Остановка контейнеров
docker-compose down

# Пересборка с обновлениями
docker-compose build --no-cache

# Запуск обновленной версии
docker-compose up -d
```

## Мониторинг

Приложение включает health check, который проверяет доступность на порту 4321 каждые 30 секунд.

```bash
# Проверка статуса контейнеров
docker-compose ps

# Проверка health check
docker inspect ooodmdk-app | grep Health -A 10
```

## Порты

- **4321** - основное приложение Astro

## Безопасность

- Приложение запускается под непривилегированным пользователем
- Используется многоэтапная сборка для минимизации размера образа
- Переменные окружения изолированы в `stack.env`

## Nginx (настройте самостоятельно)

Пример базовой конфигурации для Nginx:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:4321;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
``` 