import { createWebHashHistory, createRouter } from 'vue-router'
import Layout from '@/layout'
import { businessRoutes } from './businessRoutes'

const retainedFunctionRedirects = [
  redirect('/device-contract/devices', '/device-center/devices'),
  redirect('/device-contract/devices/detail/:id', to => `/device-center/devices/detail/${to.params.id}`),
  redirect('/device-contract/firmware', '/device-center/firmware'),
  redirect('/content-ops/product-categories', '/product-center/categories'),
  redirect('/content-ops/spec-fields', '/product-center/rule-fields'),
  redirect('/route-center/official', '/route-center/official-routes'),
  redirect('/route-center/share-templates', '/content-ops/share-templates'),
  redirect('/route-center/share', '/content-ops/share-templates'),
  redirect('/route-center/delivery', '/route-center/delivery-records'),
  redirect('/audit-log/login', '/settings-center/audit-login'),
  redirect('/audit-log/login/detail/:id', to => `/settings-center/audit-login/detail/${to.params.id}`),
  redirect('/audit-log/operate', '/settings-center/audit-operate'),
  redirect('/audit-log/operate/detail/:id', to => `/settings-center/audit-operate/detail/${to.params.id}`),
  redirect('/content-notify/messages', '/message-version/messages'),
  redirect('/content-ops/manual-faq', '/product-center/manuals')
]

export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401'),
    hidden: true
  },
  {
    path: '/ip-denied',
    component: () => import('@/views/error/ip-denied'),
    hidden: true
  },
  {
    path: '/index',
    redirect: '/dashboard/overview',
    hidden: true
  },
  ...retainedFunctionRedirects,
  ...businessRoutes,
  {
    path: '',
    redirect: '/dashboard/overview',
    hidden: true
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404'),
    hidden: true
  }
]

export const dynamicRoutes = []

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

function redirect(path, target) {
  return { path, redirect: target, hidden: true }
}

export default router
