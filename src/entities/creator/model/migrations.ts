/**
 * Creator Store Migrations
 *
 * Schema migration logic for CreatorStore.
 * Handles version upgrades while maintaining backward compatibility.
 *
 * Constitution Principle IV: Backward Compatibility & Schema Versioning
 */

import type { CreatorStoreV1 } from './types'

/**
 * Migrate persisted state to current version
 *
 * @param persistedState - The persisted state from LocalStorage
 * @param version - The version number of the persisted state
 * @returns Migrated state matching current schema
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateCreatorStore(persistedState: any, version: number): CreatorStoreV1 {
  // Version 0 (no version field) → Version 1
  if (version === 0 || !persistedState.version) {
    console.warn('[CreatorStore] Migrating from v0 to v1')

    return {
      version: 1,
      activeDraft: persistedState.activeDraft || null,
      templates: persistedState.templates || [],
      history: persistedState.history || [],
      preferences: persistedState.preferences || {},
      idCounter: persistedState.idCounter || {
        currentValue: 1,
        prefix: 'INV',
      },
    }
  }

  // Version 1 (current) - no migration needed
  if (version === 1) {
    return persistedState as CreatorStoreV1
  }

  // Future migrations go here
  // Example: Version 1 → Version 2
  // if (version === 1) {
  //   console.warn('[CreatorStore] Migrating from v1 to v2');
  //   return {
  //     ...persistedState,
  //     version: 2,
  //     newField: defaultValue,
  //   };
  // }

  // Fallback: return persisted state as-is
  console.warn(`[CreatorStore] Unknown version ${version}, using as-is`)
  return persistedState
}

/**
 * Validate migrated state
 *
 * Ensures the migrated state has all required fields.
 * Throws an error if validation fails.
 *
 * @param state - The migrated state to validate
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateCreatorStore(state: any): asserts state is CreatorStoreV1 {
  if (typeof state !== 'object' || state === null) {
    throw new Error('Invalid state: must be an object')
  }

  if (state.version !== 1) {
    throw new Error(`Invalid version: expected 1, got ${state.version}`)
  }

  if (!Array.isArray(state.templates)) {
    throw new Error('Invalid templates: must be an array')
  }

  if (!Array.isArray(state.history)) {
    throw new Error('Invalid history: must be an array')
  }

  if (typeof state.preferences !== 'object' || state.preferences === null) {
    throw new Error('Invalid preferences: must be an object')
  }

  if (typeof state.idCounter !== 'object' || state.idCounter === null) {
    throw new Error('Invalid idCounter: must be an object')
  }

  if (typeof state.idCounter.currentValue !== 'number' || state.idCounter.currentValue < 1) {
    throw new Error('Invalid idCounter.currentValue: must be a number >= 1')
  }

  if (typeof state.idCounter.prefix !== 'string') {
    throw new Error('Invalid idCounter.prefix: must be a string')
  }
}

/**
 * Migration Rules (Constitution Principle IV)
 *
 * 1. Migrations MUST be additive only (no field removal)
 * 2. Old data MUST remain functional after migration
 * 3. Migration MUST be tested with real v1 data
 * 4. Migration errors MUST be logged and handled gracefully
 * 5. Default values MUST be provided for new fields
 * 6. Version number MUST be incremented
 * 7. Migration function MUST be idempotent (safe to run multiple times)
 */
