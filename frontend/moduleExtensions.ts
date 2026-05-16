import type { ModuleDefinition } from '@/frontend/src/services/navigationManager'
import { navigationManager } from '@/frontend/src/services/navigationManager'

export function registerLoupeModules(): void {
  const modules: ModuleDefinition[] = [
    {
      name: 'loupe',
      displayName: 'Portfolio',
      description: 'Portfolio sections and contact form',
      assignable: true,
      category: 'extension'
    }
  ]
  navigationManager.registerModules(modules)
}

registerLoupeModules()
