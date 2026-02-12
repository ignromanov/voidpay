/**
 * Fetch Spy utilities for tests
 *
 * Паттерн: создать spy в beforeAll, очищать в beforeEach, restore в afterAll.
 * Это быстрее чем vi.spyOn() на каждый тест.
 */

import { vi, type MockInstance } from 'vitest'

type FetchSpy = MockInstance<typeof globalThis.fetch>

let fetchSpy: FetchSpy | null = null

/**
 * Создаёт spy на fetch. Если уже создан — возвращает существующий.
 * Использовать в beforeAll.
 */
export function setupFetchSpy(): FetchSpy {
  if (!fetchSpy) {
    fetchSpy = vi.spyOn(globalThis, 'fetch')
  }
  return fetchSpy
}

/**
 * Получить текущий spy (без создания нового).
 * Бросает ошибку если spy не создан.
 */
export function getFetchSpy(): FetchSpy {
  if (!fetchSpy) {
    throw new Error('Fetch spy not initialized. Call setupFetchSpy() in beforeAll first.')
  }
  return fetchSpy
}

/**
 * Очистить mock data между тестами.
 * Использовать в beforeEach.
 */
export function clearFetchSpy(): void {
  fetchSpy?.mockClear()
}

/**
 * Восстановить оригинальный fetch.
 * Использовать в afterAll.
 */
export function restoreFetchSpy(): void {
  fetchSpy?.mockRestore()
  fetchSpy = null
}
