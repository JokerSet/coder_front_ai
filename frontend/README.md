# Chirp — фронтенд (React + TypeScript + Vite)

SPA-клиент для микросервисного NestJS API (сервис авторизации + сервис контента, JWT).
Реализованы все маршруты из `API.txt`.

## Стек
- **React 18 + TypeScript** (сборка на Vite; Node.js ≥ 18 для разработки и сборки)
- `react-router-dom` — маршрутизация
- `axios` — HTTP-клиент с интерцепторами JWT

> Примечание: «angularjs» — легаси-фреймворк (EOL с 2022 г.), поэтому клиент сделан на
> современном React + TS. Если нужен именно Angular (v17+), структура API-слоя переносится 1-в-1.

## Запуск

```bash
cd frontend
npm install
cp .env.example .env   # при необходимости поменяйте адрес API
npm run dev            # http://localhost:5173
```

Адрес бэкенда задаётся переменной `VITE_API_URL` (по умолчанию `http://localhost:3000`).

Продакшен-сборка: `npm run build` (результат в `dist/`), запуск статики — любым сервером,
например `npx serve dist`.

## Структура

```
src/
  api/
    client.ts      # axios-клиенты auth/content, Bearer-заголовок, авто-refresh токенов (401 -> /auth/refresh)
    auth.ts        # POST /auth/login, /auth/register, GET /auth/logout, GET /auth
    content.ts     # GET /content, /content/byUser/:id, /content/replies/:id, /content/id/:id,
                   # POST /content/create, /content/replie, GET /content/like/:id, /content/liked/:id
  context/AuthContext.tsx  # состояние пользователя, login/register/logout
  components/      # Layout, ProtectedRoute, PostCard (лайки/ответы), Pagination
  pages/           # FeedPage (лента), LoginPage, RegisterPage, ProfilePage, PostPage (пост + ответы)
  types.ts         # User, Tokens, Content, PagedContent, PageMeta
```

## Соответствие маршрутам API

| Маршрут | Где используется |
|---|---|
| POST /auth/login | страница «Вход» |
| POST /auth/register | страница «Регистрация» |
| POST /auth/refresh | интерцептор axios при 401 |
| GET /auth/logout | кнопка «Выйти» в шапке |
| GET /auth | восстановление сессии при загрузке приложения |
| GET /content | лента (`/`) с пагинацией `page`/`limit` |
| GET /content/byUser/:userId | профиль (`/profile/:userId`) |
| GET /content/replies/:parentId | страница поста (`/post/:postId`) |
| GET /content/id/:contentId | страница поста |
| POST /content/create | форма «Что нового?» (лента/профиль) |
| POST /content/replie | форма ответа под постом |
| GET /content/like/:contentId | кнопка ♥ |
| GET /content/liked/:contentId | подсветка уже поставленного лайка |

## JWT
- `accessToken`/`refreshToken` хранятся в `localStorage`.
- Request-интерцептор добавляет `Authorization: Bearer <accessToken>`.
- При `401` выполняется один запрос `POST /auth/refresh` (с дедупликацией параллельных
  запросов), после чего исходный запрос повторяется; при неудаче сессия сбрасывается
  и пользователь перенаправляется на вход.

## Требования к бэкенду
На NestJS-сервисах должен быть включён CORS для адреса фронтенда, например:
```ts
app.enableCors({ origin: 'http://localhost:5173', credentials: true });
```
