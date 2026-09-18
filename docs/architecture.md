# Архитектура проекта

Приложение состоит из клиентской части Vue и облачного сервиса Supabase.

```mermaid
flowchart LR
    U[Пользователь] --> V[Vue 3]
    V --> A[Supabase Auth]
    V --> API[Supabase API]
    API --> DB[(PostgreSQL)]
    V --> GH[GitHub Pages]
```

## Основные модули

- авторизация и регистрация;
- профиль пользователя;
- проекты и участники;
- задачи, комментарии и журнал действий;
- уведомления;
- административная панель.

## Таблицы базы данных

```mermaid
erDiagram
    PROFILES ||--o{ PROJECTS : owns
    PROFILES ||--o{ PROJECT_MEMBERS : participates
    PROJECTS ||--o{ PROJECT_MEMBERS : contains
    PROJECTS ||--o{ TASKS : contains
    PROFILES ||--o{ TASKS : assigned
    TASKS ||--o{ COMMENTS : has
    PROFILES ||--o{ COMMENTS : writes
    PROFILES ||--o{ NOTIFICATIONS : receives
    PROJECTS ||--o{ ACTIVITY_LOGS : records
```

Доступ к строкам таблиц ограничивается правилами Row Level Security. Пользователь видит только проекты, в которых он состоит. Администратор имеет расширенный доступ.

