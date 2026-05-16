import React from 'react'
import type { RouteObject } from 'react-router-dom'

function lazyPage(importFn: () => Promise<{ default: React.ComponentType }>) {
  return React.createElement(() => {
    const Component = React.lazy(importFn)
    return React.createElement(React.Suspense,
      { fallback: React.createElement('div', null, '') },
      React.createElement(Component))
  })
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
