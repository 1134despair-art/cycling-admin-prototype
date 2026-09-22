import { createMockModule } from './_helpers'

const loginSeed = [
  { id: 1, userName: 'admin', ip: '127.0.0.1', location: '武汉', device: 'Windows 11', browser: 'Chrome 126', result: 'success', createTime: '2026-07-28 09:00:00' },
  { id: 2, userName: 'ops_manager', ip: '192.168.1.22', location: '杭州', device: 'macOS 14', browser: 'Edge 126', result: 'success', createTime: '2026-07-28 08:48:00' },
  { id: 3, userName: 'service_admin', ip: '192.168.1.25', location: '上海', device: 'Windows 11', browser: 'Chrome 126', result: 'failed', createTime: '2026-07-28 08:20:00' }
]

const operateSeed = [
  operate(1, '超管账号新增', 'admin', '超管账号管理', '新增超管账号', 'settings-center:admins:add', 'POST', '/mock/settings/admins', '{"userName":"content_admin"}', 'success', 122, '2026-07-28 10:02:00'),
  operate(2, '角色权限更新', 'ops_manager', '角色管理', '更新角色权限', 'settings-center:roles:edit', 'PUT', '/mock/settings/roles/2', '{"permissions":["content-ops:view"]}', 'success', 86, '2026-07-28 09:44:00')
]

function operate(id, logName, operator, moduleName, action, permissionKey, requestMethod, requestUrl, requestParams, result, cost, createTime) {
  return { id, logName, operator, moduleName, action, permissionKey, requestMethod, requestUrl, requestParams, ip: '127.0.0.1', device: 'Windows 11', browser: 'Chrome 126', result, cost, createTime }
}

export const loginLogModule = createMockModule(loginSeed, { searchFields: ['userName', 'ip', 'location', 'device', 'browser'], dateRangeKey: 'createTime', defaultSort: 'createTime:desc' })
export const operateLogModule = createMockModule(operateSeed, { searchFields: ['logName', 'operator', 'moduleName', 'action', 'permissionKey', 'requestUrl'], dateRangeKey: 'createTime', defaultSort: 'createTime:desc' })
