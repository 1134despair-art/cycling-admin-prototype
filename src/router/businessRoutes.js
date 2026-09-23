import Layout from '@/layout'
import { businessMenuCatalog } from '@/mock/menuCatalog'

const viewModules = import.meta.glob('../views/**/*.vue')

const hiddenRoutes = {
  '/settings-center': [
    hidden('audit-login/detail/:id', 'SettingsAuditLoginDetail', 'audit-log/login/detail', '登录日志详情', '/settings-center/audit-login'),
    hidden('audit-operate/detail/:id', 'SettingsAuditOperateDetail', 'audit-log/operate/detail', '操作日志详情', '/settings-center/audit-operate')
  ],
  '/user-center': [
    hidden('users/detail/:id', 'UserCenterUsersDetail', 'user-center/users/detail', '用户详情', '/user-center/users'),
    hidden('device-bindings/detail/:userId', 'UserCenterDeviceBindingsDetail', 'user-center/device-bindings/detail', '用户绑定设备详情', '/user-center/device-bindings')
  ],
  '/device-center': [
    hidden('devices/detail/:id', 'DeviceCenterDevicesDetail', 'device-center/devices/detail', '设备详情', '/device-center/devices'),
    hidden('firmware/detail/:id', 'DeviceCenterFirmwareDetail', 'device-center/firmware/detail', '固件包详情', '/device-center/firmware')
  ]
}

export const businessRoutes = businessMenuCatalog.map(group => ({
  path: group.path,
  name: group.name,
  component: Layout,
  redirect: group.redirect,
  alwaysShow: true,
  meta: { title: group.title, icon: group.icon },
  children: [
    ...group.children.map(item => ({
      path: item.path,
      name: item.name,
      component: loadView(item.component),
      meta: {
        title: item.title,
        icon: item.icon,
        noCache: false,
        affix: item.affix
      }
    })),
    ...(hiddenRoutes[group.path] || [])
  ]
}))

function loadView(component) {
  return viewModules[`../views/${component}.vue`]
}

function hidden(path, name, component, title, activeMenu) {
  return {
    path,
    name,
    hidden: true,
    component: loadView(component),
    meta: { title, activeMenu, noCache: true }
  }
}
