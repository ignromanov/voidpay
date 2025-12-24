# Binary Codec V3 - Fix Documentation

## Проблема: Двойное кодирование (Double Encoding)

**Исходная реализация V3 давала худшие результаты, чем V2** (476 байт vs 401 байт).

### Причины неэффективности:

#### 1. Двойное кодирование (главная ошибка)

**Старая реализация:**
```typescript
// ❌ НЕПРАВИЛЬНО
const textData = textParts.join('\x00');
const finalTextData = LZString.compressToEncodedURIComponent(textData); // Шаг 1: сжатие + Base64
const textDataBytes = new TextEncoder().encode(finalTextData);          // Шаг 2: Base64 → UTF-8 bytes
buffer.push(...Array.from(textDataBytes));                               // Шаг 3: → Base62
```

**Проблема:**
1. `LZString.compressToEncodedURIComponent()` сжимает данные **И** кодирует их в Base64-подобную строку (+33% overhead)
2. Затем эта строка кодируется в UTF-8 байты
3. Затем весь буфер кодируется в Base62

**Итог:** Сжали → раздули в Base64 → раздули в UTF-8 → сжали в Base62. Сжимаем "воздух".

#### 2. Низкая энтропия коротких строк

LZ-алгоритмы работают за счет поиска повторений. В типичном инвойсе:
- `"Crypto Advisory Group"`, `"admin@business.com"`, `"Smart Contracts Co"`
- Почти нет повторяющихся слов
- **Словарь сжатия весит больше, чем экономия**

LZ-String эффективен только для:
- Длинных текстов (> 200 символов)
- Текстов с повторяющимися словами

---

## Решение: Использование pako (Deflate)

### Новая реализация V3:

```typescript
// ✅ ПРАВИЛЬНО
import pako from 'pako'; // Deflate/Inflate, возвращает Uint8Array

// 1. Собираем текст
const textData = textParts.join('\x00');
const textEncoder = new TextEncoder();
const rawTextBytes = textEncoder.encode(textData);

// 2. Сжимаем ТОЛЬКО если > 100 байт (deflate добавляет ~10 байт заголовка)
let finalTextBytes: Uint8Array;
let isCompressed = false;

if (rawTextBytes.length > 100) {
  try {
    // Ключевое отличие: pako.deflate возвращает RAW Uint8Array
    const compressedBytes = pako.deflate(rawTextBytes);

    // Используем сжатие только если оно реально уменьшило размер
    if (compressedBytes.length < rawTextBytes.length) {
      finalTextBytes = compressedBytes;
      isCompressed = true;
    } else {
      finalTextBytes = rawTextBytes;
    }
  } catch (e) {
    finalTextBytes = rawTextBytes;
  }
} else {
  // Слишком короткий текст
  finalTextBytes = rawTextBytes;
}

// 3. Записываем сырые байты напрямую
writeVarInt(buffer, finalTextBytes.length);
buffer.push(...Array.from(finalTextBytes));

// 4. Один раз кодируем в Base62
const bytes = new Uint8Array(buffer);
const encoded = encodeBase62(bytes);
```

### Ключевые отличия:

| Аспект | Старый V3 (LZ-String) | Новый V3 (pako) |
|--------|----------------------|-----------------|
| **Библиотека** | `lz-string` | `pako` |
| **Возвращаемый тип** | `string` (Base64) | `Uint8Array` (raw bytes) |
| **Кодирование** | 3 этапа (LZ→Base64→UTF8→Base62) | 2 этапа (Deflate→Base62) |
| **Overhead** | +33% от Base64 | Нет overhead |
| **Порог сжатия** | 50 байт | 100 байт |
| **Проверка эффективности** | Нет | Да (используем только если меньше) |

---

## Преимущества V3 (исправленного)

### 1. Сохраняет все оптимизации V2:
- ✅ Bit-packing флагов (2 байта вместо ~10)
- ✅ Delta encoding для дат (экономия 2-3 байта)
- ✅ Dictionary compression для валют и токенов

### 2. Добавляет умное сжатие текста:
- ✅ Deflate (стандарт индустрии, лучше LZ-String для бинарных протоколов)
- ✅ Сжимает только когда выгодно (> 100 байт И compressedSize < rawSize)
- ✅ Нет двойного кодирования

### 3. Когда V3 побеждает V2:
- Инвойсы с длинными Notes (> 200 символов)
- Инвойсы с множественными повторяющимися описаниями
- Инвойсы с большим количеством line items (> 10)

### 4. Когда V2 и V3 примерно равны:
- Обычные инвойсы с короткими текстовыми полями
- V3 в этом случае просто не применяет сжатие (флаг TEXT_COMPRESSED = 0)

---

## Ожидаемые результаты

**Типичный инвойс (5 items, короткие поля):**
- LZ-String: ~612 bytes
- Binary V1: ~387 bytes (-37%)
- Binary V2: ~401 bytes (-34%)
- Binary V3 (old): ~476 bytes (-22%) ❌
- Binary V3 (new): ~390-410 bytes (-35-38%) ✅

**Инвойс с длинными Notes (300+ chars):**
- LZ-String: ~850 bytes
- Binary V2: ~550 bytes (-35%)
- Binary V3 (new): ~420-480 bytes (-44-50%) ✅ **ПОБЕДИТЕЛЬ**

---

## Резюме

**V2** — отличный выбор для обычных инвойсов. Оптимальное соотношение "простота/эффективность".

**V3** — специализированный вариант для инвойсов с большим количеством текста. Добавляет умное Deflate-сжатие без потери эффективности V2.

**Рекомендация:** Использовать V3 как основной метод. Он автоматически:
- Сжимает текст когда выгодно
- Оставляет текст как есть когда сжатие неэффективно
- Сохраняет все преимущества V2

---

## Технические детали

### Формат V3

```
Prefix: 'H' (Hybrid)
[1 byte]     version = 3
[2 bytes]    bit-packed flags (includes TEXT_COMPRESSED flag at bit 11)
[16 bytes]   UUID
[4 bytes]    issue timestamp
[varint]     delta for due date
[varint]     network ID
[varint]     decimals
[optional]   token address (dict code or 20 bytes)
[20 bytes]   from address
[optional]   client address (20 bytes)
[varint]     line items count
[varint]     text data length
[variable]   text data (Deflate compressed if TEXT_COMPRESSED flag set, otherwise raw UTF-8)
```

### Decoder

```typescript
// ✅ ПРАВИЛЬНО
let rawTextBytes: Uint8Array;
if (flags & OptionalFields.TEXT_COMPRESSED) {
  // pako.inflate возвращает Uint8Array
  rawTextBytes = pako.inflate(textDataBytes);
} else {
  rawTextBytes = textDataBytes;
}

const textDecoder = new TextDecoder();
const textData = textDecoder.decode(rawTextBytes);
```

**NO double decoding!** Deflate → UTF-8, всё.

---

## Установка

```bash
pnpm add pako
pnpm add -D @types/pako
```

## Использование

```typescript
import { encodeBinaryV3, decodeBinaryV3 } from '@/shared/lib/binary-codec';

// Encode
const invoice: InvoiceSchemaV1 = {...};
const encoded = encodeBinaryV3(invoice); // Returns: 'H...' (Base62)

// Decode
const decoded = decodeBinaryV3(encoded);
```
