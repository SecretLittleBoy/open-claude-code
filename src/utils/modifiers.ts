export type ModifierKey = 'shift' | 'command' | 'control' | 'option'

let prewarmed = false
type ModifiersModule = {
  prewarm: () => void
  isModifierPressed: (modifier: string) => boolean
}
let cachedModule: ModifiersModule | null | undefined

function loadModifiersModule(): ModifiersModule | null {
  if (process.platform !== 'darwin') {
    return null
  }
  if (cachedModule !== undefined) {
    return cachedModule
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require('modifiers-napi') as ModifiersModule
  } catch {
    cachedModule = null
  }
  return cachedModule
}

/**
 * Pre-warm the native module by loading it in advance.
 * Call this early to avoid delay on first use.
 */
export function prewarmModifiers(): void {
  if (prewarmed) {
    return
  }
  prewarmed = true
  loadModifiersModule()?.prewarm()
}

/**
 * Check if a specific modifier key is currently pressed (synchronous).
 */
export function isModifierPressed(modifier: ModifierKey): boolean {
  return loadModifiersModule()?.isModifierPressed(modifier) ?? false
}
