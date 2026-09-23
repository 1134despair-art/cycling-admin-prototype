const primaryMenuOrder = [1, 3, 6, 9, 7, 4, 5, 8, 2]

export const businessMenuCatalog = [
  {
    id: 1,
    name: 'BusinessDashboard',
    title: '仪表盘',
    path: '/dashboard',
    redirect: '/dashboard/overview',
    icon: 'dashboard',
    permission: 'dashboard:view',
    description: '后台首页，展示用户、设备、路线和消息核心数据。',
    children: [
      menu(11, 'DashboardOverview', '数据看板', 'overview', 'dashboard/index', 'dashboard', 'dashboard:overview:view', '展示平台核心数量与趋势。', true)
    ]
  },
  {
    id: 2,
    name: 'SettingsCenter',
    title: '系统管理',
    path: '/settings-center',
    redirect: '/settings-center/admins',
    icon: 'system',
    permission: 'settings-center:view',
    description: '管理后台账号、角色、访问控制和系统日志。',
    children: [
      menu(21, 'SettingsAdmins', '超管账号管理', 'admins', 'settings-center/admins/index', 'user', 'settings-center:admins:list', '后台超级管理员账号维护。'),
      menu(22, 'SettingsRoles', '角色管理', 'roles', 'settings-center/roles/index', 'peoples', 'settings-center:roles:list', '角色与权限配置。'),
      menu(26, 'SettingsIpAccess', 'IP访问控制', 'ip-access', 'settings-center/ip-access/index', 'monitor', 'settings-center:ip-access:list', '配置允许访问后台的 IP 地址和网段。'),
      menu(27, 'SettingsAuditLogin', '登录日志', 'audit-login', 'audit-log/login/index', 'logininfor', 'settings-center:audit-login:list', '后台登录记录审计。'),
      menu(28, 'SettingsAuditOperate', '操作日志', 'audit-operate', 'audit-log/operate/index', 'form', 'settings-center:audit-operate:list', '后台操作记录审计。')
    ]
  },
  {
    id: 3,
    name: 'UserCenter',
    title: '用户管理',
    path: '/user-center',
    redirect: '/user-center/users',
    icon: 'user',
    permission: 'user-center:view',
    description: '管理 APP 用户账号和设备绑定关系。',
    children: [
      menu(31, 'UserCenterUsers', '用户列表', 'users', 'user-center/users/index', 'people', 'user-center:users:list', '只读查询 APP 用户基础信息。'),
      menu(32, 'UserCenterDeviceBindings', '用户绑定设备', 'device-bindings', 'user-center/device-bindings/index', 'link', 'user-center:device-bindings:list', '用户与设备绑定关系维护。')
    ]
  },
  {
    id: 4,
    name: 'ProductCenter',
    title: '产品管理',
    path: '/product-center',
    redirect: '/product-center/categories',
    icon: 'shopping',
    permission: 'product-center:view',
    description: '统一维护产品分类、主数据、规则、图片和说明书。',
    children: [
      menu(41, 'ProductCenterCategories', '产品分类管理', 'categories', 'product-center/categories/index', 'tree', 'product-center:categories:list', '维护产品分类、图标、排序和状态。'),
      menu(42, 'ProductCenterProducts', '产品列表', 'products', 'product-center/products/index', 'shopping', 'product-center:products:list', '维护产品主数据、规则值和技术特点。'),
      menu(43, 'ProductCenterRuleFields', '产品规则字段管理', 'rule-fields', 'product-center/rule-fields/index', 'tool', 'product-center:rule-fields:list', '维护固定字段、自定义字段和 APP 展示规则。'),
      menu(44, 'ProductCenterImages', '产品图片管理', 'images', 'product-center/images/index', 'picture', 'product-center:images:list', '维护产品图片和双端展示状态。'),
      menu(56, 'ProductCenterManuals', '产品说明书管理', 'manuals', 'content-ops/manual-faq/index', 'documentation', 'product-center:manuals:list', '维护产品说明书与故障排查内容。')
    ]
  },
  {
    id: 5,
    name: 'ContentOps',
    title: '内容管理',
    path: '/content-ops',
    redirect: '/content-ops/home-banners',
    icon: 'documentation',
    permission: 'content-ops:view',
    description: '维护首页运营、教程和路线分享模板。',
    children: [
      menu(51, 'ContentOpsHomeBanners', '首页轮播图管理', 'home-banners', 'content-ops/home-banners/index', 'picture', 'content-ops:home-banners:list', '首页 Banner 运营配置。'),
      menu(52, 'ContentOpsRecommendedProducts', '推荐产品管理', 'recommended-products', 'content-ops/recommended-products/index', 'star', 'content-ops:recommended-products:list', '引用产品中心数据配置推荐位。'),
      menu(54, 'ContentOpsTutorialCategories', '教程分类管理', 'tutorial-categories', 'content-ops/tutorial-categories/index', 'tree', 'content-ops:tutorial-categories:list', '教程分类维护。'),
      menu(55, 'ContentOpsTutorials', '视频教程管理', 'tutorials', 'content-ops/tutorials/index', 'edit', 'content-ops:tutorials:list', '教程视频和内容维护。'),
      menu(72, 'ContentOpsShareTemplates', '分享模板管理', 'share-templates', 'route-center/share-templates/index', 'picture', 'content-ops:share-templates:list', '普通图和路线长图模板配置。')
    ]
  },
  {
    id: 6,
    name: 'DeviceCenter',
    title: '设备管理',
    path: '/device-center',
    redirect: '/device-center/devices',
    icon: 'build',
    permission: 'device-center:view',
    description: '管理设备资料和组件固件。',
    children: [
      menu(61, 'DeviceCenterDevices', '设备列表', 'devices', 'device-center/devices/index', 'list', 'device-center:devices:list', '设备基础信息、详情和状态管理。'),
      menu(63, 'DeviceCenterFirmware', '固件包管理', 'firmware', 'device-center/firmware/index', 'upload', 'device-center:firmware:list', '维护固件包、版本日志和发布状态。'),
      menu(64, 'DeviceCenterOtaTasks', 'OTA升级任务', 'ota-tasks', 'device-center/ota-tasks/index', 'date', 'device-center:ota-tasks:list', '跟踪固件推送任务、设备结果和操作日志。')
    ]
  },
  {
    id: 7,
    name: 'RouteCenter',
    title: '路线管理',
    path: '/route-center',
    redirect: '/route-center/official-routes',
    icon: 'guide',
    permission: 'route-center:view',
    description: '管理官方路线和码表下发记录。',
    children: [
      menu(71, 'RouteCenterOfficialRoutes', '官方路线管理', 'official-routes', 'route-center/official-routes/index', 'star', 'route-center:official-routes:list', '官方路线导入和推荐运营。'),
      menu(73, 'RouteCenterDeliveryRecords', '路线下发记录', 'delivery-records', 'route-center/delivery-records/index', 'date', 'route-center:delivery-records:list', '路线下发码表任务记录。')
    ]
  },
  {
    id: 8,
    name: 'MessageVersionCenter',
    title: '消息推送',
    path: '/message-version',
    redirect: '/message-version/messages',
    icon: 'message',
    permission: 'message-version:view',
    description: '维护系统通知模板和推送记录。',
    children: [
      menu(81, 'MessageVersionMessages', 'TOC 消息通知推送', 'messages', 'message-center/messages/index', 'bell', 'message-version:messages:list', '面向 APP 用户的通知模板和推送记录。')
    ]
  },
  {
    id: 9,
    name: 'RidingData',
    title: '骑行数据管理',
    path: '/riding-data',
    redirect: '/riding-data/records',
    icon: 'chart',
    permission: 'riding-data:view',
    description: '查询骑行记录、同步和异常数据。',
    children: [
      menu(91, 'RidingDataRecords', '骑行记录', 'records', 'riding-data/records/index', 'list', 'riding-data:records:list', '查询设备同步的骑行记录。'),
      menu(93, 'RidingDataSyncLogs', '同步记录', 'sync-logs', 'riding-data/sync-logs/index', 'date', 'riding-data:sync-logs:list', '设备数据同步记录。'),
      menu(94, 'RidingDataAbnormalData', '异常数据处理', 'abnormal-data', 'riding-data/abnormal-data/index', 'bug', 'riding-data:abnormal-data:list', '异常数据质量治理。')
    ]
  }
].sort((left, right) => primaryMenuOrder.indexOf(left.id) - primaryMenuOrder.indexOf(right.id))

function menu(id, name, title, path, component, icon, permission, description, affix = false) {
  return { id, name, title, path, component, icon, permission, description, affix }
}

export const secondLevelMenuTitles = businessMenuCatalog.flatMap(item => item.children.map(child => child.title))

export function createBusinessMenus() {
  return businessMenuCatalog.map(group => ({
    name: group.name,
    path: group.path,
    hidden: false,
    alwaysShow: true,
    component: 'Layout',
    redirect: group.redirect,
    meta: { title: group.title, icon: group.icon, noCache: false },
    children: group.children.map(item => ({
      name: item.name,
      path: item.path,
      hidden: false,
      component: item.component,
      meta: { title: item.title, icon: item.icon, noCache: false, affix: item.affix }
    }))
  }))
}
