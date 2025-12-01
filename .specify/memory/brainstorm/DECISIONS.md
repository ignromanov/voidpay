# 🎯 Final Decisions Summary

> **Date:** November 18, 2025
> **Status:** Locked for MVP Development
> **Project:** VoidPay

Этот документ фиксирует все ключевые решения, принятые после анализа brainstorm документов и серии вопросов-ответов. Все решения синхронизированы с соответствующими частями brainstorm.

---

## 1. Branding & Identity

### 1.1 Naming

- **Название:** VoidPay
- **Домен:** voidpay.xyz
- **Философия:** "Void" отражает концепцию stateless (пустота, zero-backend), "Pay" — прямая функциональность
- **Визуальная метафора:** Черная дыра или минималистичный круг
- **Слоган:** _"The Stateless Crypto Invoice. No backend, no sign-up, just links."_

**Файл:** [Part 6: Branding & Growth Strategy](./06-branding-and-growth.md#61-нейминг-и-позиционирование-naming)

---

## 2. Visual Design

### 2.1 Color Palette

- **Accent Color:** Electric Violet `#7C3AED` (Tailwind Violet-600)
  - Используется для primary actions (кнопки "Create", "Pay")
  - Современный, выделяется на dark mode, ассоциируется с технологичностью

- **Semantic Colors:**
  - Success: Emerald `#10B981`
  - Warning: Amber `#F59E0B`
  - Error: Rose `#F43F5E`

### 2.2 Typography

- **UI/Headings:** Geist Sans
- **Data/Numbers:** Geist Mono
- **Преимущества:** Единая семья от Vercel, оптимизация для Next.js, отличная tabular-nums поддержка

**Файл:** [Part 3: User Experience & Design](./03-ux-and-design.md#31-визуальный-стиль-visual-identity)

### 2.3 App Shell Separation

- **Decision:** Explicit separation between "Platform" (App Shell) and "Document" (Invoice Card).
- **Rationale:**
  - **Branding:** VoidPay logo always visible in Header ("The Desk").
  - **Liability:** Disclaimer and Report Abuse moved to Footer ("The Desk"), implying platform responsibility.
  - **Content:** Invoice Card ("The Paper") contains ONLY user data and watermark.
- **Metaphor:** "Paper on a Desk". The desk (Shell) provides the tools and context. The paper (Card) is the artifact.

**Файл:** [Part 3: User Experience & Design](./03-ux-and-design.md#321-layout-app-shell--split-screen)

---

## 3. Technology Stack

### 3.1 Core Framework

| Компонент      | Решение                      | Обоснование                                                       |
| :------------- | :--------------------------- | :---------------------------------------------------------------- |
| **Framework**  | Next.js 14+ (App Router)     | Server Components для OG Images, SEO                              |
| **Language**   | TypeScript                   | Строгая типизация для работы с деньгами                           |
| **State**      | Zustand + persist middleware | Легковесная альтернатива Redux, отличная поддержка LocalStorage   |
| **Async Data** | TanStack Query               | Кэширование RPC, дедупликация, polling                            |
| **UI Styling** | Tailwind CSS                 | Быстрая верстка, хорошая экосистема                               |
| **UI Kit**     | Radix UI + CVA + Framer      | Radix primitives (доступность), CVA (варианты), Framer (анимации) |

### 3.2 Web3 Infrastructure

| Компонент        | Решение               | Обоснование                                                                  |
| :--------------- | :-------------------- | :--------------------------------------------------------------------------- |
| **Web3 Core**    | Wagmi v2 + Viem       | Viem — самая легкая и быстрая библиотека, Wagmi — удобные React хуки         |
| **Wallet UI**    | RainbowKit v2         | Красивый готовый UI, популярен в Web3, легкая кастомизация под violet accent |
| **RPC Provider** | Alchemy + Infura      | Alchemy (primary) для скорости, Infura (fallback) для стабильности           |
| **Indexer API**  | Alchemy Transfers API | Для верификации платежей, интеграция с RPC, бесплатный tier                  |
| **Token Lists**  | Uniswap Token List    | Стандарт де-факто, decentralized, высокое качество курации                   |

### 3.3 Utilities

| Компонент       | Решение             | Обоснование                                                 |
| :-------------- | :------------------ | :---------------------------------------------------------- |
| **PDF**         | @react-pdf/renderer | React компоненты → PDF, работает в браузере                 |
| **Compression** | lz-string           | LZW компрессия для сжатия JSON в URL, оптимизирована для JS |

**Файл:** [Part 2: Architectural Hypotheses](./02-architectural-hypotheses.md#23-технологический-стек-tech-stack)

---

## 4. Supported Networks (MVP)

- ✅ Ethereum Mainnet (Chain ID: 1)
- ✅ Arbitrum (Chain ID: 42161)
- ✅ Optimism (Chain ID: 10)
- ✅ Polygon PoS (Chain ID: 137)

**Обоснование:** Покрывает все сегменты пользователей:

- Ethereum — максимальная ликвидность и trust
- Arbitrum & Optimism — L2 с низкими комиссиями, популярны среди DAO
- Polygon — очень низкие комиссии для микроплатежей

**Файл:** [Part 2: Architectural Hypotheses](./02-architectural-hypotheses.md#211-схема-данных-json-schema)

---

## 5. Data Model & Validation

### 5.1 Invoice Schema (v1)

**Ключевые поля:**

```typescript
interface InvoiceSchema {
  v: number;        // Version
  id: string;       // Invoice ID
  iss: string;      // Issue Date
  due: string;      // Due Date
  nt?: string;      // Notes (max 280 chars) ⚠️
  net: number;      // Chain ID
  cur: string;      // Currency Symbol
  t?: string;       // Token Address (optional for native)
  f: { ... };       // Sender/Receiver info
  c: {              // Client info
    ...
    w?: string;     // Optional wallet for verification ✨
  };
  it: [...];        // Line items
}
```

**Изменения:**

- `nt` (Notes): **Жесткий лимит 280 символов** (как Twitter)
- `c.w` (Client Wallet): **Опциональное поле** для более точной верификации платежа

### 5.2 URL Limits

- **Max compressed URL length:** 2000 байт
- **Блокировка генерации:** Если сжатая строка превышает лимит
- **UI Warning:** Счетчик символов для поля Notes

**Файл:** [Part 2: Architectural Hypotheses](./02-architectural-hypotheses.md#211-схема-данных-json-schema)

---

## 6. Payment Verification Parameters

### 6.1 Fuzzy Matching

- **Tolerance:** **3%** погрешности от ожидаемой суммы
- **Формула:** `receivedAmount >= expectedAmount * 0.97`
- **Обоснование:** Балансирует точность и гибкость для fee-on-transfer токенов

### 6.2 Polling & Confirmations

- **Polling interval:** **10 секунд**
- **Confirmation strategy:** Ждать статус **`finalized`** для всех сетей
  - Ethereum: ~15 минут
  - Arbitrum/Optimism: ~10-15 минут
  - Polygon PoS: ~30-45 минут

### 6.3 UI Status Flow

1. **"Processing..."** — транзакция отправлена, ждем включения в блок
2. **"Confirming..."** — транзакция в блоке, ждем финализации
3. **"Paid ✓"** — транзакция финализирована, безопасно

**Файл:** [Part 4: Web3 Mechanics](./04-web3-mechanics.md#43-логика-верификации-verification--status-check)

---

## 7. Security & Compliance

### 7.1 Abuse Management

- **Blocklist Source:** GitHub (`raw.githubusercontent.com/voidpay/blocklist/main/blocked-hashes.json`)
- **Update Mechanism:** Pull Request в публичный репозиторий
- **Hash Format:** SHA-256 от всего URL параметра `?d=...`
- **UI Behavior:** Красный экран блокировки при обнаружении

### 7.2 OFAC Sanctions

- **MVP Decision:** ❌ **Не внедрять** OFAC проверку
- **Философия:** True permissionless подход, цензура противоречит crypto ethos
- **Post-MVP:** Рассмотреть опциональную проверку или disclaimer
- **Risk Mitigation:** Abuse Blocklist минимизирует риск репутационного ущерба

**Файл:**

- [Part 2: Architectural Hypotheses](./02-architectural-hypotheses.md#242-abuse-management-модерация-без-бэкенда)
- [Part 5: Risk Assessment](./05-risk-assessment.md#53-юридические-и-compliance-риски)

---

## 8. Infrastructure

### 8.1 RPC Failover Strategy

1. **Primary:** Alchemy (скорость, indexer integration)
2. **Fallback:** Infura (стабильность, SLA)
3. **Configuration:** Wagmi automatic failover

### 8.2 Token Validation

- **Primary List:** Uniswap Token List
- **Verified Status:** Зеленая галочка для известных токенов (USDC, USDT, DAI)
- **Unknown Status:** Желтый warning для токенов вне списка

**Файл:** [Part 2: Architectural Hypotheses](./02-architectural-hypotheses.md#23-технологический-стек-tech-stack)

---

## 9. Deferred Decisions (Post-MVP)

Следующие решения **отложены** до завершения MVP:

1. **Cross-chain payments** (Li.Fi / Jumper integration)
2. **AES Encryption** для password-protected ссылок
3. **IPFS Offloading** для тяжелых данных
4. **Telegram Mini App**
5. **Gnosis Safe App** интеграция

**Файл:** [Part 7: Future Possibilities](./07-future-possibilities.md)

---

## 10. Critical Constraints

### 10.1 Must Have

- ✅ URL length ≤ 2000 байт (для QR генерации)
- ✅ Finalized confirmations (безопасность получателя)
- ✅ LocalStorage history (privacy-first)
- ✅ Abuse reporting mechanism

### 10.2 Must NOT Have (MVP)

- ❌ Backend database
- ❌ User authentication
- ❌ OFAC screening
- ❌ Server-side payment processing

---

## 11. Implementation Priority

### Phase 1: Core (Week 1-2)

1. URL state codec (lz-string)
2. Invoice schema v1 + validation
3. Basic UI (Editor + Preview)
4. RainbowKit integration

### Phase 2: Web3 (Week 3-4)

1. Wagmi + Viem setup
2. Payment flow (ETH + ERC20)
3. Alchemy Transfers API integration
4. Finalized status polling

### Phase 3: Polish (Week 5-6)

1. PDF generation (@react-pdf/renderer)
2. Network themes (Ambient backgrounds)
3. OG Images (dynamic previews)
4. Abuse blocklist

**Для детальной структуры см.:** [Part 8: App Structure & Architecture](./08-app-structure-and-architecture.md)

---

## 12. Donation Strategy

### 12.1 Post-Payment Widget (Fast Lane)

- **Decision:** Donations via the post-payment widget must use the **Native Currency** of the current chain (ETH, MATIC, etc.).
- **Rationale:**
  - **Frictionless:** Eliminates the need for an ERC20 `approve` transaction.
  - **Speed:** Enables a single-click `sendTransaction` experience.
  - **Conversion:** Lower friction leads to higher conversion rates for impulse donations.

### 12.2 Footer Link (Slow Lane)

- **Decision:** The "Support VoidPay" footer link opens a modal supporting both Native and ERC20 tokens.
- **Rationale:** Users deliberately seeking to donate are more likely to tolerate the approval flow for specific tokens.

---

## 📚 Cross-Reference Index

| Topic                | Primary File                                     | Section                        |
| :------------------- | :----------------------------------------------- | :----------------------------- |
| Naming & Branding    | [Part 6](./06-branding-and-growth.md)            | 6.1 Нейминг и Позиционирование |
| Visual Design        | [Part 3](./03-ux-and-design.md)                  | 3.1 Визуальный стиль           |
| Tech Stack           | [Part 2](./02-architectural-hypotheses.md)       | 2.3 Технологический стек       |
| JSON Schema          | [Part 2](./02-architectural-hypotheses.md)       | 2.1.1 Схема данных             |
| Payment Verification | [Part 4](./04-web3-mechanics.md)                 | 4.3 Логика Верификации         |
| Security (Abuse)     | [Part 2](./02-architectural-hypotheses.md)       | 2.4.2 Abuse Management         |
| Compliance (OFAC)    | [Part 5](./05-risk-assessment.md)                | 5.3 Юридические риски          |
| FSD Architecture     | [Part 8](./08-app-structure-and-architecture.md) | 8.1 Architectural Pattern      |

---

**Document Status:** ✅ Finalized
**Last Updated:** November 18, 2025
**Next Action:** Begin MVP implementation using /speckit.specify
