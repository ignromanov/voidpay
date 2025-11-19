# Part 2: Architectural Hypotheses

> **Status:** Brainstorm Result
> **Date:** November 18, 2025
> **Topic:** Data Model, Storage & Tech Stack

## 2.1. Модель данных (URL State Architecture)

Так как мы не используем базу данных, вся информация об инвойсе должна быть самодостаточной и передаваться через URL.

### 2.1.1. Схема данных (JSON Schema)

Мы используем агрессивную минимизацию ключей JSON, чтобы уместить максимальное количество данных в лимит URL (обычно ~2000 символов для безопасной кросс-браузерности и генерации QR-кодов).

**Draft Interface:**

```typescript
interface InvoiceSchema {
  v: number // Version (e.g., 1). Allows future schema migrations.
  id: string // Invoice ID (e.g., "INV-001").
  iss: string // Issue Date (Unix Timestamp or YYYY-MM-DD).
  due: string // Due Date.
  nt?: string // Notes / Terms (Optional, max 280 chars).

  // Network & Token
  net: number // Chain ID (e.g., 1 for ETH, 42161 for Arbitrum).
  cur: string // Currency Symbol (USDC, ETH).
  t?: string // Token Address (undefined = Native Currency).
  dec: number // Token decimals (ОБЯЗАТЕЛЬНОЕ ПОЛЕ: запекается в URL для мгновенной загрузки страницы оплаты без RPC-вызовов).

  // Sender (From) - Ключ "f"
  f: {
    n: string // Name / Company.
    a?: string // Address (Physical).
    e?: string // Email.
    w: string // Wallet Address (Receiver of funds).
  }

  // Client (To) - Ключ "c"
  c: {
    n: string // Name.
    a?: string // Address.
    e?: string // Email.
    w?: string // Optional Wallet Address (for verification).
  }

  // Line Items - Ключ "it"
  it: Array<{
    d: string // Description.
    q: number // Quantity.
    r: number // Rate (Price per unit).
  }>

  // Meta
  tax: number // Tax Rate (%).
  dsc: number // Discount Amount.
}
```

**Изменения в v1:**

- `nt` (Notes): Жесткий лимит 280 символов для обеспечения генерации QR-кода.
- `c.w` (Client Wallet): Опциональное поле для более точной верификации платежа (если известен адрес плательщика).
- `net`: Расширенный комментарий с примерами Chain ID для всех поддерживаемых сетей.
- `dec` (Decimals): **ОБЯЗАТЕЛЬНОЕ ПОЛЕ (Вариант А - Snapshot / Baked-in).** Создатель инвойса делает один RPC-запрос `readContract(tokenAddress, 'decimals')` при создании и "запекает" значение в URL (`&dec=6`), чтобы страница оплаты грузилась мгновенно без дополнительных RPC-вызовов. Это поле обязательно для всех токенов (включая нативные ETH/MATIC где `dec=18`).

### 2.1.2. Пайплайн сжатия (Compression Pipeline)

Чтобы превратить этот JSON в URL-параметр `?d=...`, используется следующий алгоритм:

1.  **Serialize:** Объект преобразуется в JSON строку.
2.  **Compress:** Используется библиотека `lz-string` (алгоритм LZW), оптимизированная для JS.
    - Функция: `LZString.compressToEncodedURIComponent(jsonString)`.
3.  **URL Construction:** Результат подставляется в параметр: `https://voidpay.xyz/pay?d={COMPRESSED_STRING}`.

_Откат (Fallback):_ Если длина сжатой строки превышает 2048 байт, UI блокирует генерацию и просит пользователя сократить описание ("Notes" или "Items").

## 2.2. Клиентское хранилище (Client-Side Storage)

Мы используем **LocalStorage** браузера как "персональную базу данных" пользователя. Управление состоянием осуществляется через **Zustand** с middleware `persist`.

### 2.2.1. Creator Store (`useCreatorStore`)

Хранит данные для того, кто выставляет счета:

- **Preferences:** Шаблон "по умолчанию" (Мое имя, Мой кошелек). Заполняется один раз, подставляется во все новые инвойсы.
- **History:** Массив метаданных созданных инвойсов (ID, Client Name, Amount, Date, Generated Link).
- **Drafts:** Текущее состояние формы (чтобы не потерять данные при закрытии вкладки).
- **Invoice ID Counter:** Локальный авто-инкремент счетчик (INV-001, INV-002...), хранится в LocalStorage для последовательной нумерации.

### 2.2.2. Payer Store (`usePayerStore`)

Хранит данные для того, кто платит:

- **Receipts:** Массив оплаченных инвойсов. Запись создается в момент успешного выполнения транзакции.
  - Структура: `{ invoiceData, txHash, paidAt, networkId }`.

## 2.3. Технологический стек (Tech Stack)

Выбор технологий обусловлен требованиями: SEO (для превью ссылок), Производительность, Web3 совместимость.

| Компонент        | Технология                                  | Обоснование                                                                                                                                        |
| :--------------- | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**    | **Next.js 14+ (App Router + Edge Runtime)** | Server Components нужны для динамической генерации OG Images (превью ссылок в соцсетях). Edge Runtime для Serverless Proxy (защита RPC ключей).    |
| **Language**     | **TypeScript**                              | Строгая типизация критична для работы с деньгами и сложными структурами данных.                                                                    |
| **State**        | **Zustand**                                 | Легче и проще Redux. Отличная поддержка LocalStorage "из коробки".                                                                                 |
| **Async Data**   | **TanStack Query**                          | Кэширование RPC запросов, дедупликация, поллинг статусов транзакций.                                                                               |
| **Web3 Core**    | **Wagmi v2 + Viem**                         | Viem — самая легкая и быстрая библиотека на сегодня. Wagmi предоставляет удобные хуки.                                                             |
| **Wallet UI**    | **RainbowKit v2**                           | Красивый готовый UI для подключения кошельков. Легкая кастомизация, популярен в Web3 комьюнити. Интеграция с Wagmi.                                |
| **RPC Provider** | **Alchemy + Infura**                        | Alchemy (primary) для скорости, Infura (fallback) для стабильности. Автоматический failover через Wagmi config.                                    |
| **Indexer API**  | **Alchemy Transfers API**                   | Для верификации входящих платежей. Интегрируется с RPC провайдером, бесплатный tier.                                                               |
| **Token Lists**  | **Uniswap Token List**                      | Стандарт де-факто для валидации токенов. Decentralized, высокое качество курации.                                                                  |
| **UI Styling**   | **Tailwind CSS**                            | Быстрая верстка.                                                                                                                                   |
| **UI Kit**       | **shadcn/ui**                               | Готовые доступные компоненты (Radix UI), которые легко кастомизировать.                                                                            |
| **Typography**   | **Geist Sans + Geist Mono**                 | Единая семья шрифтов от Vercel. Оптимизирована для Next.js, отличная поддержка tabular-nums для моноширинных цифр.                                 |
| **PDF**          | **react-pdf (Lazy Load)**                   | Генерация PDF документов из React компонентов прямо в браузере (Client-side only). Используется ленивая загрузка для минимизации влияния на бандл. |
| **Compression**  | **lz-string**                               | LZW компрессия для сжатия JSON в URL. Оптимизирована для JavaScript строк.                                                                         |

## 2.3.1. Защита RPC Ключей (API Key Security)

Отказ от чистого "Client-side only" для RPC ключей из-за риска утечки и абьюза.

**Решение: Serverless Proxy**

- **Архитектура:** Next.js API Routes (Edge Runtime) работают как прокси между клиентом и RPC провайдерами (Alchemy/Infura).
- **Механизм:**
  1. Клиент отправляет запрос на `/api/rpc` без знания ключей.
  2. Edge Function добавляет приватный RPC ключ из environment variables.
  3. Форвардит запрос к Alchemy/Infura.
  4. Возвращает ответ клиенту.
- **Преимущества:**
  - Ключи хранятся в Vercel Environment Variables (не в клиентском коде).
  - Rate limiting на уровне домена, а не публичного ключа.
  - Возможность логгирования абьюза (опционально).
- **Privacy Note:** Телеметрия полностью отключена (no Sentry, no analytics). Privacy Purist подход.

## 2.4. Архитектурный паттерн (Project Structure)

Мы используем **Feature-Sliced Design (FSD)** для организации кодовой базы. Это критично для масштабируемости и изоляции бизнес-логики от UI.

- **Layers:** `app` (routing), `pages` (composition), `widgets` (ui blocks), `features` (actions), `entities` (business logic), `shared` (utils).
- **Routing Strategy:**
  - `/` -> Marketing Landing Page (SEO optimized).
  - `/create` -> Editor Application (Client-side logic heavy).
  - `/pay` -> Payer View (Dynamic context).

## 2.5. Надежность и Безопасность (Long-Term Reliability)

### 2.5.1. Стратегия Обратной Совместимости (Schema Versioning)

Опыт проектов типа _Excalidraw_ показывает, что изменение структуры данных ломает старые ссылки.

- **Immutability:** Мы никогда не меняем логику парсинга для существующих версий (`v:1`).
- **Migrations:** Если мы внедряем `v:2` (например, добавляем поддержку фиата), мы создаем слой миграции `src/migrations/migrateV1toV2.ts`. Приложение при загрузке проверяет версию в URL и при необходимости "на лету" конвертирует объект в новый формат для отображения.
- **Reserved Fields:** В схеме `v:1` заранее резервируем поля `meta` или `_future` для расширения без смены версии.

### 2.5.2. Abuse Management (Модерация без бэкенда)

Риск использования сервиса для фишинга (создание инвойсов с текстом "Срочно оплатите штраф"). Так как базы данных нет, мы не можем удалить инвойс.

- **Static Blocklist:** Приложение при инициализации подгружает маленький JSON-файл с GitHub: `https://raw.githubusercontent.com/voidpay/blocklist/main/blocked-hashes.json`.
  - **Источник:** GitHub обеспечивает простоту обновления через Pull Request, надежность (CDN кэширование) и публичную прозрачность.
  - **Формат:** `{ "hashes": ["sha256_hash_1", "sha256_hash_2"], "updated": "2025-11-18T12:00:00Z" }`
- **Logic:** Если хэш открываемого инвойса есть в списке -> UI блокируется красным экраном: _"This invoice has been reported for abuse"_.
- **Reporting:** Кнопка "Report Abuse" в футере генерирует issue/PR в репозиторий с хэшем вредоносной ссылки.
- **Privacy Note:** Хэш генерируется от всего URL параметра `?d=...`, а не от персональных данных внутри инвойса.

---

_Конец Части 2_
