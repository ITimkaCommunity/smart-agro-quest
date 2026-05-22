# Диаграммы для ВКР: EduFarm (полный комплект)

Ниже собраны **все ключевые диаграммы** под структуру из `VKR_PLAN.md`: от предметной области до архитектуры, БД, AI и пользовательских потоков.

## 1) Схема участников системы (Context)
```mermaid
graph LR
    NP[Нацпроект «Кадры в АПК»] --> Platform[EduFarm платформа]
    Student[Ученик] --> Platform
    Teacher[Учитель] --> Platform
    Admin[Администратор] --> Platform
    Parent[Родитель, опционально] -.->|просмотр прогресса| Platform
    Platform --> School[Школа и агрокласс]
```

## 2) BPMN AS-IS (как обычно проходит обучение без модуля)
```mermaid
flowchart TD
    A([Начало]) --> B[Учитель выдает задание вручную]
    B --> C[Ученик выполняет задание]
    C --> D[Проверка учителем]
    D --> E{Ученик мотивирован?}
    E -- Нет --> F[Падение вовлеченности]
    E -- Да --> G[Продолжение обучения]
    F --> H[Нет персональных рекомендаций]
    G --> I[Нерегулярная обратная связь]
    H --> J([Снижение качества прогресса])
    I --> J
```

## 3) Use-Case диаграмма
```mermaid
graph TB
    Student((Ученик))
    Teacher((Учитель))
    Admin((Админ))

    UC1[Регистрация/вход]
    UC2[Просмотр задач]
    UC3[Отправка решения]
    UC4[Развитие фермы/питомца]
    UC5[Получение достижений]
    UC6[AI-чат и рекомендации]

    UC7[Создание и назначение задач]
    UC8[Проверка и оценка решений]
    UC9[Просмотр аналитики класса]

    UC10[Управление пользователями и ролями]
    UC11[Мониторинг системы]

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6

    Teacher --> UC1
    Teacher --> UC7
    Teacher --> UC8
    Teacher --> UC9

    Admin --> UC10
    Admin --> UC11
```

## 4) Главная архитектурная схема (C4 System Context)
```mermaid
graph LR
    Student[Ученик] -->|HTTPS и WS| Web[Web SPA React и Vite]
    Teacher[Учитель] --> Web
    Admin[Админ] --> Web
    Web -->|REST и Socket io| API[NestJS API]
    API --> PG[(PostgreSQL)]
    API --> Redis[(Redis)]
    API --> S3[(MinIO или S3)]
    API --> AI[FastAPI AI-сервис]
    API --> Prom[Prometheus]
    API --> ELK[ELK]
```

## 5) Контейнерная диаграмма (C4 Containers)
```mermaid
graph TB
    subgraph Client
        SPA[React SPA + Nginx]
    end
    subgraph Backend
        API1[NestJS #1]
        API2[NestJS #2]
        AIS[FastAPI AI]
    end
    subgraph Data
        PG1[(Postgres primary)]
        PG2[(Postgres replica)]
        R[(Redis)]
        M[(MinIO)]
    end
    SPA --> API1
    SPA --> API2
    API1 --> PG1
    API2 --> PG1
    PG1 --> PG2
    API1 --> R
    API2 --> R
    API1 --> M
    API2 --> M
    API1 --> AIS
    API2 --> AIS
```

## 6) ER-диаграмма
```mermaid
erDiagram
    USERS ||--|| PROFILES : has
    USERS ||--o{ TASK_SUBMISSIONS : submits
    USERS ||--o{ USER_INVENTORY : owns
    USERS ||--o{ USER_PLANTS : grows
    USERS ||--o{ USER_FARM_ANIMALS : keeps
    USERS ||--o{ USER_PRODUCTIONS : runs
    USERS ||--o{ USER_ZONE_PROGRESS : progresses
    USERS ||--o{ USER_ACHIEVEMENTS : unlocks

    FARM_ZONES ||--o{ FARM_ITEMS : contains
    FARM_ZONES ||--o{ FARM_ANIMALS : contains
    FARM_ZONES ||--o{ PRODUCTION_CHAINS : contains
    FARM_ZONES ||--o{ TASKS : categorizes

    TASKS ||--o{ TASK_SUBMISSIONS : has
    TASK_SUBMISSIONS ||--o{ SUBMISSION_COMMENTS : has
    ACHIEVEMENTS ||--o{ USER_ACHIEVEMENTS : awarded
```

## 7) Sequence: авторизация
```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as Backend
    participant DB as PostgreSQL

    FE->>API: POST auth login
    API->>DB: Проверка пользователя и пароля
    DB-->>API: Пользователь найден
    API-->>FE: JWT + профиль
    FE->>API: Запросы с Bearer токеном
    API-->>FE: Доступ к защищённым данным
```

## 8) Sequence: AI-запрос
```mermaid
sequenceDiagram
    participant U as Ученик
    participant FE as ChatWidget
    participant API as NestJS
    participant AI as FastAPI и Ollama

    U->>FE: Вопрос в чат
    FE->>API: POST ai chat
    API->>AI: prompt + контекст + история
    AI-->>API: Ответ + рекомендации
    API-->>FE: Готовый ответ
    FE-->>U: Показ ответа
```

## 9) AI pipeline (обязательно для 2.4)
```mermaid
flowchart LR
    A[Входной запрос пользователя] --> B[Нормализация текста]
    B --> C[Intent classification]
    C --> D[Извлечение контекста профиля и прогресса]
    D --> E[RAG: поиск релевантных фрагментов]
    E --> F[Формирование system and user prompt]
    F --> G[LLM Ollama FastAPI]
    G --> H[Постобработка и проверка тона/безопасности]
    H --> I[Ответ + рекомендации + next steps]
```

## 10) Пользовательский flow (UI)
```mermaid
flowchart TD
    A[Вход в систему] --> B[Dashboard]
    B --> C[Выбор: Задания]
    B --> D[Выбор: Ферма]
    B --> E[Выбор: AI-чат]
    C --> F[Отправка решения]
    D --> G[Посадка/сбор/крафт]
    E --> H[Получение подсказки]
    F --> I[Рост XP и достижений]
    G --> I
    H --> I
```

## 11) Диаграмма развертывания/наблюдаемости
```mermaid
graph LR
    App[NestJS] -->|/metrics| Prom[Prometheus]
    App -->|logs| Loki[Loki]
    Prom --> Graf[Grafana]
    Loki --> Graf
    App --> Filebeat[Filebeat]
    Filebeat --> Logstash[Logstash]
    Logstash --> Elastic[Elasticsearch]
    Elastic --> Kibana[Kibana]
```
