import { createMockModule } from './_helpers'

const adminSeed = [
  admin(1, 'admin', '系统管理员', '平台管理部', '13800000001', 'admin@blt.com', 99, '超级管理员', true),
  admin(2, 'ops_manager', '李运营', '运营中心', '13800000002', 'ops@blt.com', 2, '运营管理员'),
  admin(3, 'device_admin', '王设备', '设备中心', '13800000003', 'device@blt.com', 3, '设备管理员'),
  admin(4, 'service_admin', '赵服务', '用户服务部', '13800000004', 'service@blt.com', 4, '售后管理员'),
  admin(5, 'content_admin', '陈内容', '内容运营部', '13800000005', 'content@blt.com', 5, '内容管理员')
]

function admin(id, userName, name, deptName, phone, email, roleId, roleName, isSuperAdmin = false) {
  const timestamp = '2026-07-28 09:00:00'
  return {
    id, userName, name, deptName, phone, email, roleId, roleName,
    roleIds: [roleId], roleNames: [roleName], status: 'enabled', passwordStatus: 'normal', passwordHint: '',
    passwordUpdatedAt: '2026-07-01 09:00:00', lastResetTime: '', lastLogin: '2026-07-28 08:50:00',
    lastLoginIp: '127.0.0.1', createTime: timestamp, updateTime: timestamp,
    creatorName: '系统初始化', updaterName: '系统初始化', remark: roleName + '后台账号。',
    isSuperAdmin,
    changeLogs: [adminLog('创建账号', '系统初始化', '创建后台管理员账号', timestamp)]
  }
}

const adminStore = createMockModule(adminSeed, {
  searchFields: ['userName', 'name', 'deptName', 'phone', 'email', 'roleName'],
  dateRangeKey: 'createTime',
  defaultSort: 'id:asc'
})

export const adminModule = {
  rawList: () => adminStore.snapshot(),
  list: params => adminStore.list(params),
  detail: id => adminStore.detail(id),
  create(payload) {
    const timestamp = nowString()
    return adminStore.add({
      ...payload,
      createTime: payload.createTime || timestamp,
      updateTime: payload.updateTime || timestamp,
      lastLogin: '',
      lastLoginIp: '',
      lastResetTime: '',
      changeLogs: [adminLog('创建账号', '超级管理员', '创建后台管理员账号', timestamp)]
    })
  },
  update(payload) {
    const current = adminStore.detail(payload.id)
    if (!current) return null
    return adminStore.update({
      ...payload,
      updateTime: payload.updateTime || nowString(),
      changeLogs: payload.changeLogs || current.changeLogs
    })
  },
  remove(id) {
    adminStore.remove(id)
    return true
  },
  findByUserName(value, excludeId = '') {
    const keyword = String(value || '').trim().toLowerCase()
    return this.rawList().find(item => item.userName.toLowerCase() === keyword && String(item.id) !== String(excludeId))
  },
  findByPhone(value, excludeId = '') {
    const keyword = String(value || '').trim()
    return this.rawList().find(item => item.phone === keyword && String(item.id) !== String(excludeId))
  },
  findByEmail(value, excludeId = '') {
    const keyword = String(value || '').trim().toLowerCase()
    return this.rawList().find(item => item.email.toLowerCase() === keyword && String(item.id) !== String(excludeId))
  },
  canDisable(row, currentUserName = '') {
    if (row.userName === currentUserName) return { ok: false, message: '不能停用当前登录账号' }
    if (row.isSuperAdmin) return { ok: false, message: '系统超级管理员不可停用' }
    return { ok: true, message: '' }
  },
  canDelete(row, currentUserName = '') {
    if (row.userName === currentUserName) return { ok: false, message: '不能删除当前登录账号' }
    if (row.isSuperAdmin) return { ok: false, message: '系统超级管理员不可删除' }
    return { ok: true, message: '' }
  },
  blockedLog(id, action, detail) {
    const current = adminStore.detail(id)
    if (!current) return false
    adminStore.update({ ...current, changeLogs: [adminLog(action, '超级管理员', detail, nowString(), 'blocked'), ...(current.changeLogs || [])] })
    return true
  },
  updateStatus(id, status) {
    const current = adminStore.detail(id)
    if (!current) return false
    adminStore.update({ ...current, status, updateTime: nowString(), updaterName: '超级管理员', changeLogs: [adminLog(status === 'enabled' ? '启用账号' : '停用账号', '超级管理员', '账号状态已更新'), ...(current.changeLogs || [])] })
    return true
  },
  resetPassword(id, password) {
    const current = adminStore.detail(id)
    if (!current) return false
    const timestamp = nowString()
    adminStore.update({ ...current, passwordStatus: 'initial', passwordHint: '初始密码：' + password, passwordUpdatedAt: timestamp, lastResetTime: timestamp, updateTime: timestamp, changeLogs: [adminLog('重置密码', '超级管理员', '管理员密码已重置', timestamp), ...(current.changeLogs || [])] })
    return true
  },
  assignRole(id, role) {
    const current = adminStore.detail(id)
    if (!current || !role) return false
    adminStore.update({ ...current, roleId: role.id, roleName: role.roleName, roleIds: [role.id], roleNames: [role.roleName], updateTime: nowString() })
    return true
  }
}

export function getEnabledRoleOptions(roleRows = []) {
  return roleRows.filter(item => item.status === 'enabled').map(item => ({ label: item.roleName, value: item.id }))
}

function adminLog(actionLabel, operator, detail, time = nowString(), result = 'success') {
  return { id: 'admin-log-' + Date.now() + '-' + Math.random(), actionLabel, operator, detail, time, result }
}

function nowString() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}
