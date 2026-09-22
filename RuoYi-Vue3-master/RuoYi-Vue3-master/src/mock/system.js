import { createMockModule } from './_helpers'
import { secondLevelMenuTitles } from './menuCatalog'

export const roleStatusOptions = [
  { label: '启用', value: 'enabled', type: 'success' },
  { label: '停用', value: 'disabled', type: 'info' }
]

export const roleSummaryCards = []
export const rolePermissionOptions = [...secondLevelMenuTitles]

const roleSeed = [
  role(99, 'ROLE-099', '超级管理员', 'super-admin', '全部数据', secondLevelMenuTitles, ['admin'], true),
  role(2, 'ROLE-002', '运营管理员', 'ops-admin', '运营业务范围', [
    '数据看板', '产品分类管理', '产品列表', '产品规则字段管理', '产品图片管理',
    '首页轮播图管理', '推荐产品管理', '教程分类管理', '视频教程管理',
    '产品说明书管理', '官方路线管理', '分享模板管理', 'TOC 消息通知推送'
  ], ['ops_manager']),
  role(3, 'ROLE-003', '设备管理员', 'device-admin', '设备业务范围', [
    '数据看板', '用户绑定设备', '设备列表', '固件包管理', 'OTA升级任务',
    '路线下发记录', '同步记录', '异常数据处理'
  ], ['device_admin']),
  role(4, 'ROLE-004', '售后管理员', 'service-admin', '用户服务范围', [
    '数据看板', '用户列表', '用户绑定设备', '设备列表', '产品说明书管理', 'TOC 消息通知推送'
  ], ['service_admin']),
  role(5, 'ROLE-005', '内容管理员', 'content-admin', '内容运营范围', [
    '数据看板', '产品列表', '产品图片管理', '首页轮播图管理', '推荐产品管理',
    '教程分类管理', '视频教程管理', '产品说明书管理'
  ], [])
]

function role(id, roleCode, roleName, roleKey, dataScope, permissions, members, isSystemRole = false) {
  const timestamp = '2026-07-28 09:00:00'
  return {
    id,
    roleCode,
    roleName,
    roleKey,
    dataScope,
    memberCount: members.length,
    permissionCount: permissions.length,
    isDefaultRole: isSystemRole,
    status: 'enabled',
    createdAt: timestamp,
    createdBy: '系统初始化',
    updatedAt: timestamp,
    updatedBy: '系统初始化',
    permissions: [...permissions],
    members: [...members],
    memberIds: [],
    remark: `${roleName}的 v5 默认权限。`,
    isSystemRole,
    changeLogs: [createRoleLog('创建角色', '系统初始化', `已创建角色 ${roleName}`, timestamp)]
  }
}

function nowString() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function createRoleLog(actionLabel, operator, detail, time = nowString(), result = 'success') {
  return { id: `role-log-${Date.now()}-${Math.random()}`, actionType: 'update', actionLabel, operator, result, time, detail }
}

const roleStore = createMockModule(roleSeed, {
  idKey: 'id',
  searchFields: ['roleCode', 'roleName', 'roleKey', 'dataScope', 'remark'],
  dateRangeKey: 'updatedAt',
  defaultSort: 'updatedAt:desc'
})

function normalizeRolePayload(payload = {}) {
  const permissions = Array.isArray(payload.permissions) ? [...payload.permissions] : []
  const memberIds = Array.isArray(payload.memberIds) ? [...payload.memberIds] : []
  const members = Array.isArray(payload.members) ? [...payload.members] : []
  return {
    ...payload,
    roleCode: String(payload.roleCode || '').trim(),
    roleName: String(payload.roleName || '').trim(),
    roleKey: String(payload.roleKey || '').trim(),
    permissions,
    permissionCount: permissions.length,
    memberIds,
    members,
    memberCount: memberIds.length || members.length,
    updatedAt: payload.updatedAt || nowString(),
    updatedBy: payload.updatedBy || '超级管理员'
  }
}

export const roleModule = {
  list: params => roleStore.list(params),
  detail: id => roleStore.detail(id),
  rawList: () => roleStore.snapshot(),
  findByRoleName(roleName, excludeId = '') {
    return this.rawList().find(item => item.roleName === String(roleName || '').trim() && String(item.id) !== String(excludeId))
  },
  findByRoleKey(roleKey, excludeId = '') {
    return this.rawList().find(item => item.roleKey === String(roleKey || '').trim() && String(item.id) !== String(excludeId))
  },
  create(payload) {
    const normalized = normalizeRolePayload(payload)
    return roleStore.add({
      ...normalized,
      createdAt: normalized.createdAt || nowString(),
      createdBy: normalized.createdBy || '超级管理员',
      changeLogs: [createRoleLog('创建角色', '超级管理员', `已创建角色 ${normalized.roleName}`)]
    })
  },
  update(payload) {
    const current = roleStore.detail(payload.id)
    if (!current) return null
    const normalized = normalizeRolePayload({ ...current, ...payload })
    const log = createRoleLog('更新角色', normalized.updatedBy, `已更新角色 ${normalized.roleName}`)
    return roleStore.update({ ...normalized, id: payload.id, changeLogs: [log, ...(current.changeLogs || [])].slice(0, 8) })
  },
  updateStatus(id, status) {
    return this.update({ id, status })
  },
  syncMembers(id, admins = []) {
    return this.update({ id, memberIds: admins.map(item => item.id), members: admins.map(item => item.userName) })
  },
  blockedLog(id, actionLabel, detail) {
    const current = roleStore.detail(id)
    if (!current) return null
    return roleStore.update({
      id,
      changeLogs: [createRoleLog(actionLabel, '超级管理员', detail, nowString(), 'blocked'), ...(current.changeLogs || [])].slice(0, 8)
    })
  },
  canDisable(record) {
    if (record?.isSystemRole) return { ok: false, message: '系统核心角色不可停用' }
    return { ok: true }
  },
  canDelete(record) {
    if (record?.isSystemRole) return { ok: false, message: '系统核心角色不可删除' }
    if (Number(record?.memberCount || 0) > 0) return { ok: false, message: '请先移除角色成员' }
    return { ok: true }
  },
  remove: id => roleStore.remove(id)
}
