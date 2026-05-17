import React from 'react'
import type { RouteObject } from 'react-router-dom'
import { lazyWithRetry } from '@/frontend/src/utils/lazyWithRetry'

function lazyPage(importFn: () => Promise<{ default: React.ComponentType }>) {
  // lazyWithRetry (not raw React.lazy) so stale-deploy chunk failures
  // recover transparently; created once, not per render.
  const Component = lazyWithRetry(importFn)
  return React.createElement(() =>
    React.createElement(React.Suspense,
      { fallback: React.createElement('div', null, '') },
      React.createElement(Component)))
}

export function getRoutes(): RouteObject[] {
  return [
    {
      path: '/contact',
      element: lazyPage(() => import('./components/ContactPage')),
      handle: { public: true, module: 'loupe' },
    },
    {
      path: '/landing/a',
      element: lazyPage(() => import('./components/LandingEditorial')),
      handle: { public: true, module: 'loupe' },
    },
    {
      path: '/landing/b',
      element: lazyPage(() => import('./components/LandingSplit')),
      handle: { public: true, module: 'loupe' },
    },
  ]
}
