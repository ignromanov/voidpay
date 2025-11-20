# Part 8: App Structure & Architecture (FSD)

> **Status:** Brainstorm Result
> **Date:** November 18, 2025
> **Topic:** Feature-Sliced Design, Routing, and Page Logic

## 8.1. Architectural Pattern: Feature-Sliced Design (FSD)

Проект использует методологию FSD, адаптированную под Next.js App Router. Это обеспечивает слабую связность компонентов и масштабируемость.

### Directory Structure

```text
src/
├── app/                  # Layer: App (Routing & Entry points only)
│   ├── page.tsx          # -> Landing Page
│   ├── create/
│   │   └── page.tsx      # -> Editor App
│   ├── pay/
│   │   └── page.tsx      # -> Payer View
│   └── layout.tsx        # Global Providers (Wagmi, Query, Theme)
│
├── pages/                # Layer: Pages (Composition of Widgets)
│   ├── landing/          # Marketing page composition
│   ├── editor/           # The "Create" app composition
│   └── payment/          # The "Pay" view composition
│
├── widgets/              # Layer: Widgets (Self-contained UI blocks)
│   ├── invoice-editor/   # Complex form with validation
│   ├── invoice-paper/    # Visual representation (HTML/CSS)
│   ├── payment-terminal/ # Web3 interaction card (Connect/Pay)
│   ├── history-drawer/   # Slide-over panel with local history
│   └── app-shell/        # Global Layout (Header, Footer, Background)
│
├── features/             # Layer: Features (User Actions)
│   ├── generate-link/    # Logic: Form -> LZ-String -> URL
│   ├── wallet-connect/   # Logic: Wagmi connectors
│   ├── network-switch/   # Logic: Chain switching
│   └── payment-status/   # Logic: Polling blockchain for tx
│
├── entities/             # Layer: Entities (Business Logic & State)
│   ├── invoice/          # Schema, Types, Zustand Store (Drafts)
│   ├── token/            # ERC20 logic, Decimals, Token Lists
│   └── network/          # Chain configs, Theme maps
│
└── shared/               # Layer: Shared (Reusable primitives)
    ├── ui/               # Shadcn components (Button, Card, Input)
    ├── lib/              # Utilities (cn, formatters, url-state)
    └── api/              # RPC & Indexer clients
```

---

## 8.2. Routing & Page Logic (The "Three Worlds")

Мы разделяем приложение на три изолированных контекста.

### 8.2.1. Landing Page (`/`)

- **Цель:** Маркетинг, SEO, Доверие.
- **Компоненты:** Hero Section, Feature Grid, Trust Signals (GitHub link).
- **Action:** Кнопка "Start Invoicing" ведет на `/create`.

### 8.2.2. Editor App (`/create`)

- **Цель:** Инструмент для создания инвойса.
- **State:** Использует `useCreatorStore` (Zustand Persist). При загрузке проверяет наличие черновика в LocalStorage и восстанавливает его.
- **Layout:** Wrapped in `AppShell`.
  - **Desktop:** Split View (50% Form / 50% Preview).
  - **Mobile:** Tabs (`Edit` | `Preview`).
- **Action:** Кнопка "Generate Link" не меняет URL страницы. Она открывает **Success Modal** с готовой ссылкой и QR-кодом.

### 8.2.3. Payer View (`/pay`)

- **Цель:** Просмотр и Оплата.
- **State:** Hydration из URL Params (`?d=...`). Read-only режим.
- **Visuals:** Использует концепцию **Ambient Background**.
  - Фон страницы меняется в зависимости от `chainId` в инвойсе.
  - _Arbitrum:_ Синий градиент. _Optimism:_ Красный. _Polygon:_ Фиолетовый.
- **Layout:** Wrapped in `AppShell`.
  - Слой 1: `InvoicePaper` (Визуализация документа).
  - Слой 2: `PaymentTerminal` (Плавающая панель управления оплатой).

---

## 8.3. Data Flow (Потоки данных)

### Creator Flow

1.  **Input:** Пользователь вводит данные в `widgets/invoice-editor`.
2.  **Store Update:** Данные сохраняются в `entities/invoice/model/store.ts` (draft).
3.  **Reactive Preview:** `widgets/invoice-paper` подписан на стор и мгновенно обновляется.
4.  **Generate:**
    - Feature `generate-link` берет объект из стора.
    - Сжимает через `shared/lib/url-state.ts`.
    - Формирует ссылку `voidpay.xyz/pay?d=...`.
    - Сохраняет метаданные в `history` (LocalStorage).

### Payer Flow

1.  **URL Parse:** Страница `/pay` получает строку `d`.
2.  **Decode:** `shared/lib/url-state.ts` разжимает строку в JSON.
3.  **Validate:** Проверка версии схемы (`v:1`).
4.  **Render:** Данные передаются в `InvoicePaper` и `PaymentTerminal`.
5.  **Web3 Check:** Feature `payment-status` начинает опрос блокчейна (используя данные из разжатого JSON).

---

## 8.4. Visual Mechanics & UX Details

### Dynamic Network Themes

Логика адаптации интерфейса под сеть.

- **Implementation:** Функция `getNetworkTheme(chainId)` возвращает объект с классами Tailwind (`bg`, `text`, `border`).
- **Usage:** Применяется на странице `/pay` к фону и кнопке оплаты, а также на странице `/create` для визуальной индикации выбора сети.

### History Drawer

- **Доступ:** Доступен через кнопку в хедере на странице `/create`.
- **Функционал:**
  - Список созданных ссылок.
  - Локальный статус (обновляется при открытии шторки).
  - Кнопки "Copy Link" и "Delete".

### Mobile Adaptation

- **Editor:** Вместо сплит-экрана используются табы. Кнопка "Generate" зафиксирована внизу экрана (Sticky Bottom).
- **Payer:** `InvoicePaper` отображает только ключевые данные (Сумма, Кто, Кому). Детали (список услуг) скрыты в аккордеон "View Details", чтобы кнопка "Pay" всегда была на первом экране.

---

_Конец Части 8_
