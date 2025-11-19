# Part 6: Branding & Growth Strategy

> **Status:** Brainstorm Result
> **Date:** November 18, 2025
> **Topic:** Naming, Visual Identity, Marketing Channels

## 6.1. Нейминг и Позиционирование (Naming)

**Официальное название:** `VoidPay`
**Домен:** `voidpay.xyz`
**Слоган:** _"The Stateless Crypto Invoice. No backend, no sign-up, just links."_

**Философия названия:**

- **Void (Пустота):** Отражает концепцию "Zero-Backend" и "Stateless Architecture" — сервис существует в "пустоте", не храня данных.
- **Pay (Платеж):** Прямая и понятная функциональность.
- **Визуальная метафора:** Черная дыра или минималистичный круг. Футуристично и запоминается.
- **Домен .xyz:** Современный, tech-forward, Web3-friendly.

**Ключевые ценности бренда:**

1.  **Speed:** Быстрее, чем открыть Google Doc.
2.  **Privacy:** Твои данные принадлежат тебе (Local-first).
3.  **Professionalism:** Выглядит как серьезный финтех-продукт, а не как "крипто-казино".

## 6.2. Виральные Механики (Growth Hacks)

Так как бюджет на маркетинг отсутствует (0$), ставка делается на виральность самого продукта.

### 6.2.1. "Watermark Marketing"

В футере каждого инвойса (Web и PDF версия) размещается **обязательная, не отключаемая** ссылка:

> _"Powered by VoidPay. Create your own crypto invoice for free."_

**Важно:** Watermark является обязательным для всех инвойсов и не может быть удален или скрыт пользователями. Это превращает каждого получателя инвойса (обычно это платежеспособные клиенты или DAO) в потенциального пользователя и обеспечивает виральный рост проекта.

### 6.2.2. Rich Link Previews (OG Images)

Когда пользователь делится ссылкой в Telegram/Twitter/Discord, генерируется динамическая картинка с использованием **`@vercel/og` (Edge Runtime)**:

- **Технология:** `@vercel/og` — библиотека от Vercel для генерации OG изображений на Edge Runtime без необходимости headless browser.
- **Визуал:** Красивая карточка с суммой, логотипом токена и именем получателя.
- **Преимущества:**
  - Быстрая генерация (Edge Runtime).
  - Не требует сложной инфраструктуры (Puppeteer/Playwright).
  - Интегрируется с Next.js App Router из коробки.
- **Эффект:** Это привлекает внимание в ленте и повышает CTR (Click-Through Rate).

### 6.2.3. Trust Signals

- **Verified Open Source:** Ссылка на репозиторий GitHub на видном месте.
- **Self-Hostable:** Инструкция "Deploy to Vercel" в README. Возможность поднять свой экземпляр повышает доверие к основному домену (парадокс доверия).

## 6.3. Каналы Продвижения (Channels)

1.  **Twitter (X) - Build in Public:**
    - Публикация процесса разработки.
    - Твиттер-треды с демонстрацией проблем ("Как я перестал отправлять 0x адреса в чат").
2.  **DAO Discord Communities:**
    - Нативное продвижение в каналах `#bounties` и `#general` как инструмента для контрибьюторов.
    - Создание брендированных шаблонов для крупных DAO (например, тема "Arbitrum DAO").
3.  **Launch Platforms:**
    - Product Hunt launch.
    - Hacker News (Show HN) — фокус на технической реализации (lz-string, stateless architecture).

### 6.3.1. SEO Strategy (Hybrid Approach)

- **Landing Page (`/`):** Максимальная SEO оптимизация. Ключевые слова: "Crypto Invoice Generator", "Freelance Web3 Payment". Мета-теги, OG Images, Schema.org разметка.
- **App Pages (`/create`, `/pay`):** **Strict No-Index.**
  - **Реализация:**
    - HTTP заголовок: `X-Robots-Tag: noindex, nofollow`
    - Мета-тег: `<meta name="robots" content="noindex, nofollow">`
  - **Причина:** Защита приватности пользователей (чтобы личные инвойсы не гуглились) и предотвращение индексации спам-ссылок, созданных через наш сервис. Также снижает риск блокировки домена Google/Metamask из-за фишинговых инвойсов.

---

_Конец Части 6_
