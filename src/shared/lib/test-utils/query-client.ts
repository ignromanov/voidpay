/**
 * Shared QueryClient for tests
 *
 * Singleton pattern: создаётся один раз, очищается между тестами.
 * Это быстрее чем создание нового QueryClient на каждый render().
 */

import { QueryClient } from '@tanstack/react-query'

export const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0, // Не кэшировать между тестами
    },
    mutations: {
      retry: false,
    },
  },
})

/**
 * Очистка кэша между тестами.
 * Вызывать в beforeEach или afterEach.
 */
export function clearTestQueryClient(): void {
  testQueryClient.clear()
}
