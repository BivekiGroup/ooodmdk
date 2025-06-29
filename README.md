# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/minimal)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/minimal)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/minimal/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

# ooodmdk

## Docker Деплой

Проект настроен для деплоя через Docker с последующей настройкой Nginx через Timeweb Cloud.

### Подготовка к деплою

1. Создайте файл `.env` на основе `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Отредактируйте при необходимости переменные окружения.

2. Синхронизируйте package.json и package-lock.json:
   ```bash
   npm install
   ```

### Локальное использование

1. Убедитесь, что у вас установлены Docker и Docker Compose
2. Выполните сборку и запуск контейнеров:
   ```bash
   docker-compose up -d
   ```
3. Приложение будет доступно по адресу http://localhost:4321

### Деплой на Timeweb Cloud

1. При деплое через Timeweb Cloud:

   - Используется один Dockerfile для сборки приложения
   - Приложение работает на порту 4321
   - Timeweb Cloud автоматически настраивает Nginx для проксирования запросов
   - Для запуска приложения используется entrypoint.sh скрипт, который помогает диагностировать проблемы

2. Выполните деплой через панель управления Timeweb Cloud:

   - Создайте новый проект Docker
   - Загрузите код проекта
   - Установите переменные окружения в панели управления:
     - HOST=0.0.0.0
     - PORT=4321
     - PUBLIC_SANITY_PROJECT_ID=hngg8xd3
     - PUBLIC_SANITY_DATASET=production

3. В случае ошибок используйте скрипт debug.sh для диагностики:
   ```bash
   ./debug.sh
   ```

### Решение проблемы CSS/стилей

Если вы сталкиваетесь с проблемой отсутствия стилей при деплое:

1. Убедитесь, что в проекте есть директория `src/styles`:

   ```bash
   mkdir -p src/styles
   ```

2. Проверьте наличие файла `src/styles/tailwind.css` с содержимым:

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. Удостоверьтесь, что в `src/layouts/Layout.astro` импортируются стили:

   ```astro
   import "../styles/tailwind.css";
   ```

4. При ручном деплое рекомендуется очистить кэш и перестроить проект:
   ```bash
   npm run build && docker-compose build --no-cache
   ```

### Решение проблемы 502 Bad Gateway

Если вы сталкиваетесь с ошибкой 502 Bad Gateway при деплое:

1. Убедитесь, что приложение корректно запускается в контейнере:

   ```bash
   docker compose exec app wget -O- http://localhost:4321/
   ```

2. Проверьте логи для выявления ошибок:

   ```bash
   docker compose logs app
   ```

3. Убедитесь, что переменные окружения правильно настроены:
   - В Timeweb Cloud панели
   - В Dockerfile
   - В docker-compose.yml

### Деплой на собственный сервер

1. Настройте параметры в файле `deploy.sh`:

   - `SERVER_USER` - имя пользователя на сервере
   - `SERVER_IP` - IP-адрес сервера
   - `APP_PATH` - путь к директории приложения на сервере

2. Запустите скрипт деплоя:
   ```bash
   ./deploy.sh
   ```

### Отладка проблем

Если возникают проблемы при деплое (особенно 502 Bad Gateway):

1. Запустите скрипт отладки:

   ```bash
   ./debug.sh
   ```

2. Проверьте логи контейнеров для выявления ошибок
3. Убедитесь, что приложение доступно внутри контейнера на порту 4321

## Деплой на Vercel

### Автоматический деплой через GitHub

1. Создайте репозиторий на GitHub и загрузите код проекта

2. Зарегистрируйтесь на [Vercel](https://vercel.com) и создайте новый проект:

   - Выберите "Import Git Repository"
   - Подключите свой репозиторий GitHub
   - При настройке проекта выберите фреймворк "Astro"
   - Добавьте переменные окружения:
     - `PUBLIC_SANITY_PROJECT_ID=hngg8xd3`
     - `PUBLIC_SANITY_DATASET=production`

3. Нажмите "Deploy" и ожидайте завершения деплоя

### Деплой через Vercel CLI

1. Установите Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Авторизуйтесь:

   ```bash
   vercel login
   ```

3. Запустите деплой из корня проекта:

   ```bash
   vercel
   ```

4. Следуйте инструкциям в командной строке:
   - Подтвердите настройки проекта
   - Добавьте переменные окружения, когда будет предложено

### Настройка переменных окружения

В Vercel необходимо настроить следующие переменные окружения:

- `PUBLIC_SANITY_PROJECT_ID=hngg8xd3`
- `PUBLIC_SANITY_DATASET=production`

### Преимущества Vercel

- Автоматический CI/CD при пуше в репозиторий
- Бесплатное SSL-шифрование
- Глобальная CDN сеть для быстрой загрузки
- Предпросмотр для каждой ветки/PR
- Бесплатная квота для небольших проектов
