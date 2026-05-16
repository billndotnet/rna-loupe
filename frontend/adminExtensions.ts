import type { User } from '@/frontend/src/UserContext'
import type { RouteObject } from 'react-router-dom'

export interface AdminTool {
  id: string; label: string; path: string
  description?: string; module: string; category?: string
}

export function getLoupeAdminTools(user: User): AdminTool[] {
  return []
}

export function getLoupeAdminRoutes(): RouteObject[] {
  return []
}
