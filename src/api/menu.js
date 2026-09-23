import { businessMenus } from '@/mock/businessMenus'

// 获取路由
export const getRouters = () => {
  return Promise.resolve({
    code: 200,
    data: businessMenus
  })
}
