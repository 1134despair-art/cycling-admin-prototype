import { createMockModule, paginate } from './_helpers'
import { userModule } from './users'
import { getProductDetailPayload } from './products'

export const deviceStatusOptions = [
  { label: '在线', value: 'online', type: 'success' },
  { label: '离线', value: 'offline', type: 'info' },
  { label: '异常', value: 'abnormal', type: 'danger' },
  { label: '已禁用', value: 'disabled', type: 'warning' }
]

export const activationStatusOptions = [
  { label: '已激活', value: 'activated', type: 'success' },
  { label: '未激活', value: 'inactive', type: 'info' }
]

export const firmwareStatusOptions = [
  { label: '草稿', value: 'draft', type: 'info' },
  { label: '已发布', value: 'published', type: 'success' },
  { label: '已停用', value: 'disabled', type: 'warning' }
]

export const otaTaskStatusOptions = [
  { label: '待执行', value: 'scheduled', type: 'info' },
  { label: '进行中', value: 'running', type: 'warning' },
  { label: '已完成', value: 'completed', type: 'success' },
  { label: '部分失败', value: 'partial', type: 'warning' },
  { label: '失败', value: 'failed', type: 'danger' },
  { label: '已取消', value: 'canceled', type: 'info' }
]

export const otaDeviceResultOptions = [
  { label: '待执行', value: 'pending', type: 'info' },
  { label: '等待上线', value: 'queued', type: 'warning' },
  { label: '成功', value: 'success', type: 'success' },
  { label: '失败', value: 'failed', type: 'danger' },
  { label: '已取消', value: 'canceled', type: 'info' }
]

export const bindingStatusOptions = [
  { label: '已绑定', value: 'bound', type: 'success' },
  { label: '已解绑', value: 'unbound', type: 'info' }
]

export const deviceCategoryOptions = [
  { label: '码表', value: '码表', code: 'COMPUTER' },
  { label: '电子变速器', value: '电子变速器', code: 'E-SHIFT' },
  { label: '骑行台', value: '骑行台', code: 'TRAINER' },
  { label: '传感器', value: '传感器', code: 'SENSOR' },
  { label: '升降坐管', value: '升降坐管', code: 'DROPPER' }
]

const firmwareSeed = [
  firmware(1, 'C1-3.2.0', 'C1', '整机', 'c1-3.2.0.bin', '4.8 MB', '优化路线导航与同步稳定性', 'published', '2026-07-20 10:00:00'),
  firmware(2, 'ERX-2.4.1', 'ERX-COMPLETE', '整机', 'erx-2.4.1.bin', '7.2 MB', '整机通信协议升级', 'published', '2026-07-18 15:30:00'),
  firmware(3, 'ERX-FD-1.8.0', 'ERX-FD', '前拨', 'erx-fd-1.8.0.bin', '1.2 MB', '优化前拨微调', 'published', '2026-07-18 15:32:00'),
  firmware(4, 'ERX-RD-1.9.2', 'ERX-RD', '后拨', 'erx-rd-1.9.2.bin', '1.5 MB', '改善后拨换挡响应', 'published', '2026-07-18 15:34:00'),
  firmware(5, 'ERX-CTRL-1.5.4', 'ERX-CTRL', '控制器', 'erx-ctrl-1.5.4.bin', '980 KB', '控制器按键逻辑优化', 'published', '2026-07-18 15:36:00'),
  firmware(6, 'C1-3.3.0-beta', 'C1', '整机', 'c1-3.3.0-beta.bin', '5.1 MB', '内部验证版本', 'draft', '')
]

function firmware(id, versionName, targetModel, componentType, fileName, packageSize, releaseNotes, status, publishTime) {
  const logTime = publishTime || '2026-07-28 09:00:00'
  return {
    id, versionName, versionCode: versionName, targetModel, componentType, fileName, fileUrl: `/firmware/${fileName}`,
    packageSize, releaseNotes,
    versionLogs: [{ id: `${id}-1`, version: versionName, content: releaseNotes, operator: 'device_admin', time: logTime }],
    status, publishTime, updatedAt: logTime
  }
}

const deviceSeed = [
  device(1, 'C1-202607010001', 4, 'C1 GPS 智能码表', 'C1', '码表', 'C1-3.2.0', 1, 'zhangsan', '在线', 'online', 286.4, '2026-05-20 11:00:00', '2026-07-28 08:52:00'),
  device(2, 'ERX-202606120021', 1, 'eRX 无线电子变速套件', 'ERX-COMPLETE', '电子变速器', 'ERX-2.4.1', 1, 'zhangsan', '在线', 'online', 198.2, '2026-06-12 18:30:00', '2026-07-28 08:46:00'),
  device(3, 'EGR-202606180055', 2, 'eGR 砾石电子变速套件', 'EGR-COMPLETE', '电子变速器', 'EGR-2.1.0', 3, 'wangwu', '离线', 'offline', 122.7, '2026-06-18 09:10:00', '2026-07-27 20:16:00'),
  device(4, 'C1-202607120090', 4, 'C1 GPS 智能码表', 'C1', '码表', 'C1-3.2.0', 5, 'sunqi', '异常', 'abnormal', 58.1, '2026-07-12 12:20:00', '2026-07-27 19:40:00'),
  device(5, 'AXR-202605210016', 3, 'AX 山地后拨', 'AX-RD', '电子变速器', 'AX-1.6.8', 0, '', '已禁用', 'disabled', 76.5, '2026-05-21 14:00:00', '2026-07-20 12:10:00'),
  device(6, 'C1-202607260188', 4, 'C1 GPS 智能码表', 'C1', '码表', 'C1-3.2.0', 0, '', '离线', 'offline', 0, '', '')
]

function device(id, sn, productId, productName, model, categoryName, firmwareVersion, userId, userName, onlineLabel, status, useHours, bindTime, lastSyncTime) {
  const activated = Boolean(bindTime)
  return {
    id, sn, productId, productName, model, categoryName, firmwareVersion, userId: userId || '', userName,
    activationStatus: activated ? 'activated' : 'inactive', activationTime: bindTime || '', status, onlineLabel,
    useHours, bindTime, lastSyncTime, createdAt: '2026-05-01 09:00:00',
    componentFirmware: componentVersions(model, firmwareVersion),
    bindingHistory: bindTime ? [{ id: `BH-${id}-1`, userId, userName, action: '绑定', time: bindTime, result: '成功' }] : [],
    diagnostics: [
      { id: `DG-${id}-1`, time: '2026-07-27 10:20:00', type: '连接检查', result: status === 'abnormal' ? '异常' : '正常', detail: status === 'abnormal' ? 'GPS 数据包校验失败' : '蓝牙与组件通信正常' }
    ],
    upgradeHistory: [{ id: `UP-${id}-1`, componentType: '整机', fromVersion: '1.0.0', toVersion: firmwareVersion, result: '成功', time: '2026-07-20 10:35:00' }]
  }
}

function componentVersions(model, wholeVersion) {
  if (!String(model).startsWith('ERX')) return [{ componentType: '整机', model, version: wholeVersion, status: '最新' }]
  return [
    { componentType: '整机', model: 'ERX-COMPLETE', version: wholeVersion, status: '最新' },
    { componentType: '前拨', model: 'ERX-FD', version: 'ERX-FD-1.8.0', status: '最新' },
    { componentType: '后拨', model: 'ERX-RD', version: 'ERX-RD-1.9.2', status: '最新' },
    { componentType: '控制器', model: 'ERX-CTRL', version: 'ERX-CTRL-1.5.4', status: '最新' }
  ]
}

const bindingSeed = deviceSeed.filter(item => item.userId).map((item, index) => ({
  id: index + 1,
  userId: item.userId,
  userName: item.userName,
  nickName: userModule.detail(item.userId)?.nickName || item.userName,
  phone: userModule.detail(item.userId)?.phone || '',
  deviceId: item.id,
  deviceSn: item.sn,
  deviceName: item.productName,
  deviceType: item.categoryName,
  deviceStatus: item.onlineLabel,
  bindStatus: 'bound',
  bindTime: item.bindTime,
  unbindTime: '',
  lastSyncTime: item.lastSyncTime
}))

const firmwareStore = createMockModule(firmwareSeed, { searchFields: ['versionName', 'targetModel', 'componentType', 'releaseNotes'], defaultSort: 'updatedAt:desc' })

export const firmwareModule = {
  ...firmwareStore,
  add(payload = {}) {
    const nextId = Math.max(0, ...firmwareStore.snapshot().map(item => Number(item.id) || 0)) + 1
    return firmwareStore.add(normalizeFirmwarePayload(payload, null, nextId))
  },
  update(payload = {}) {
    const current = firmwareStore.detail(payload.id)
    if (!current) return null
    return firmwareStore.update(normalizeFirmwarePayload(payload, current, current.id))
  }
}

export const deviceModule = createMockModule(deviceSeed, { searchFields: ['sn', 'productName', 'model', 'categoryName', 'userName'], defaultSort: 'lastSyncTime:desc' })
export const deviceBindingModule = createMockModule(bindingSeed, { searchFields: ['userName', 'nickName', 'phone', 'deviceSn', 'deviceName'], defaultSort: 'bindTime:desc' })

const otaTaskSeed = [
  {
    id: 1,
    taskNo: 'OTA-20260728-001',
    taskName: 'C1 3.2.0 全量升级',
    firmwareId: 1,
    versionName: 'C1-3.2.0',
    targetModel: 'C1',
    componentType: '整机',
    targetScope: 'all',
    scopeLabel: '全部适配设备',
    grayPercent: 100,
    deviceIds: [1, 4, 6],
    upgradeMode: 'optional',
    scheduleMode: 'immediate',
    executeAt: '2026-07-28 08:30:00',
    remark: '面向 C1 设备的正式版本升级',
    status: 'running',
    targetCount: 3,
    successCount: 1,
    failedCount: 1,
    queuedCount: 1,
    retryCount: 0,
    createdBy: 'device_admin',
    createdAt: '2026-07-28 08:30:00',
    updatedAt: '2026-07-28 08:35:00',
    deviceResults: [
      otaDeviceResult(1, 1, 'C1-202607010001', 'online', 'success', '', '2026-07-28 08:33:00'),
      otaDeviceResult(1, 4, 'C1-202607120090', 'abnormal', 'failed', '设备状态异常，升级握手失败', '2026-07-28 08:34:00'),
      otaDeviceResult(1, 6, 'C1-202607260188', 'offline', 'queued', '设备离线，等待上线', '')
    ],
    logs: [
      otaLog('1-1', '任务创建', '创建全量可选升级任务，目标设备 3 台。', 'device_admin', '2026-07-28 08:30:00'),
      otaLog('1-2', '执行更新', '成功 1 台、失败 1 台、等待上线 1 台。', '系统', '2026-07-28 08:35:00')
    ]
  },
  {
    id: 2,
    taskNo: 'OTA-20260803-002',
    taskName: 'ERX 2.4.1 定时升级',
    firmwareId: 2,
    versionName: 'ERX-2.4.1',
    targetModel: 'ERX-COMPLETE',
    componentType: '整机',
    targetScope: 'all',
    scopeLabel: '全部适配设备',
    grayPercent: 100,
    deviceIds: [2],
    upgradeMode: 'forced',
    scheduleMode: 'scheduled',
    executeAt: '2026-08-05 02:00:00',
    remark: '业务低峰期执行',
    status: 'scheduled',
    targetCount: 1,
    successCount: 0,
    failedCount: 0,
    queuedCount: 0,
    retryCount: 0,
    createdBy: 'device_admin',
    createdAt: '2026-08-03 09:10:00',
    updatedAt: '2026-08-03 09:10:00',
    deviceResults: [otaDeviceResult(2, 2, 'ERX-202606120021', 'online', 'pending', '', '')],
    logs: [otaLog('2-1', '任务创建', '创建定时强制升级任务，计划 2026-08-05 02:00:00 执行。', 'device_admin', '2026-08-03 09:10:00')]
  }
]

const otaTaskStore = createMockModule(otaTaskSeed, {
  searchFields: ['taskNo', 'taskName', 'versionName', 'targetModel', 'componentType'],
  dateRangeKey: 'createdAt',
  defaultSort: 'createdAt:desc'
})

export const otaTaskModule = {
  ...otaTaskStore,
  add(payload) {
    return otaTaskStore.add(payload)
  },
  update(payload) {
    return otaTaskStore.update(payload)
  }
}

export function getFirmwareDetail(id) {
  const firmwareRow = firmwareModule.detail(id)
  if (!firmwareRow) return null
  return {
    ...firmwareRow,
    eligibleDevices: listEligibleDevices(id),
    otaTasks: listFirmwareTasks(id)
  }
}

export function setFirmwareStatus(id, status) {
  const current = firmwareModule.detail(id)
  if (!current || !['draft', 'published', 'disabled'].includes(status)) return null
  return firmwareModule.update({
    ...current,
    status,
    publishTime: status === 'published' ? (current.publishTime || nowString()) : current.publishTime
  })
}

export function listEligibleDevices(firmwareId) {
  const firmwareRow = firmwareModule.detail(firmwareId)
  if (!firmwareRow) return []
  return deviceModule.snapshot()
    .filter(item => item.status !== 'disabled')
    .filter(item => (
      item.model === firmwareRow.targetModel
      || (item.componentFirmware || []).some(component => component.model === firmwareRow.targetModel)
    ))
    .sort((a, b) => Number(a.id) - Number(b.id))
}

export function listFirmwareTasks(firmwareId) {
  return otaTaskModule.snapshot()
    .filter(item => String(item.firmwareId) === String(firmwareId))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
}

export function getOtaTaskDetail(id) {
  return otaTaskModule.detail(id)
}

export function getOtaTaskStats() {
  const tasks = otaTaskModule.snapshot()
  const successCount = tasks.reduce((sum, item) => sum + Number(item.successCount || 0), 0)
  const failedCount = tasks.reduce((sum, item) => sum + Number(item.failedCount || 0), 0)
  const resolvedCount = successCount + failedCount
  return {
    taskCount: tasks.length,
    successCount,
    failedCount,
    queuedCount: tasks.reduce((sum, item) => sum + Number(item.queuedCount || 0), 0),
    averageSuccessRate: resolvedCount ? `${((successCount / resolvedCount) * 100).toFixed(1)}%` : '--'
  }
}

export function createOtaTask(payload = {}) {
  const firmwareRow = firmwareModule.detail(payload.firmwareId)
  if (!firmwareRow) throw new Error('固件包不存在')
  if (firmwareRow.status !== 'published') throw new Error('仅已发布固件可以创建 OTA 升级任务')

  const eligibleDevices = listEligibleDevices(firmwareRow.id)
  if (!eligibleDevices.length) throw new Error('当前固件没有可推送的适配设备')

  const targetScope = ['gray', 'selected'].includes(payload.targetScope) ? payload.targetScope : 'all'
  let targetDevices = eligibleDevices
  let grayPercent = 100

  if (targetScope === 'gray') {
    grayPercent = Number(payload.grayPercent)
    if (!Number.isInteger(grayPercent) || grayPercent < 1 || grayPercent > 100) {
      throw new Error('灰度比例必须为 1-100 的整数')
    }
    const targetCount = Math.max(1, Math.ceil(eligibleDevices.length * grayPercent / 100))
    targetDevices = eligibleDevices.slice(0, targetCount)
  }

  if (targetScope === 'selected') {
    const selectedIds = new Set((payload.deviceIds || []).map(id => String(id)))
    targetDevices = eligibleDevices.filter(item => selectedIds.has(String(item.id)))
    grayPercent = 0
    if (!targetDevices.length) throw new Error('请至少选择一台适配设备')
  }

  const scheduleMode = payload.scheduleMode === 'scheduled' ? 'scheduled' : 'immediate'
  const executeAt = scheduleMode === 'scheduled' ? String(payload.executeAt || '').trim() : nowString()
  if (scheduleMode === 'scheduled') {
    const executeTimestamp = new Date(executeAt.replace(' ', 'T')).getTime()
    if (!executeAt || Number.isNaN(executeTimestamp) || executeTimestamp <= Date.now()) {
      throw new Error('定时执行时间必须晚于当前时间')
    }
  }

  const nextId = Math.max(0, ...otaTaskModule.snapshot().map(item => Number(item.id) || 0)) + 1
  const createdAt = nowString()
  const taskName = String(payload.taskName || '').trim() || `${firmwareRow.versionName} OTA 升级`
  const deviceResults = targetDevices.map(device => buildInitialDeviceResult(nextId, device, scheduleMode, createdAt))
  const summary = summarizeDeviceResults(deviceResults)
  const scopeLabel = targetScope === 'gray'
    ? `灰度 ${grayPercent}%`
    : targetScope === 'selected'
      ? `指定设备 ${targetDevices.length} 台`
      : '全部适配设备'
  const upgradeMode = payload.upgradeMode === 'forced' ? 'forced' : 'optional'
  const status = scheduleMode === 'scheduled' ? 'scheduled' : deriveTaskStatus(summary)
  const taskNo = `OTA-${createdAt.slice(0, 10).replace(/-/g, '')}-${String(nextId).padStart(3, '0')}`
  const logs = [otaLog(
    `${nextId}-1`,
    '任务创建',
    `创建${scopeLabel}的${upgradeMode === 'forced' ? '强制' : '可选'}升级任务，目标设备 ${targetDevices.length} 台。`,
    'device_admin',
    createdAt
  )]

  if (scheduleMode === 'immediate') {
    logs.push(otaLog(
      `${nextId}-2`,
      '执行更新',
      `成功 ${summary.successCount} 台、失败 ${summary.failedCount} 台、等待上线 ${summary.queuedCount} 台。`,
      '系统',
      createdAt
    ))
  }

  return otaTaskModule.add({
    id: nextId,
    taskNo,
    taskName,
    firmwareId: firmwareRow.id,
    versionName: firmwareRow.versionName,
    targetModel: firmwareRow.targetModel,
    componentType: firmwareRow.componentType,
    targetScope,
    scopeLabel,
    grayPercent,
    deviceIds: targetDevices.map(item => item.id),
    upgradeMode,
    scheduleMode,
    executeAt,
    remark: String(payload.remark || '').trim(),
    status,
    targetCount: targetDevices.length,
    ...summary,
    retryCount: 0,
    createdBy: 'device_admin',
    createdAt,
    updatedAt: createdAt,
    deviceResults,
    logs
  })
}

export function cancelOtaTask(id) {
  const task = otaTaskModule.detail(id)
  if (!task) throw new Error('OTA 任务不存在')
  if (task.status !== 'scheduled') throw new Error('仅待执行任务可以取消')
  const updatedAt = nowString()
  const deviceResults = (task.deviceResults || []).map(item => ({
    ...item,
    result: ['pending', 'queued'].includes(item.result) ? 'canceled' : item.result,
    reason: ['pending', 'queued'].includes(item.result) ? '任务已取消' : item.reason,
    completedAt: ['pending', 'queued'].includes(item.result) ? updatedAt : item.completedAt
  }))
  return otaTaskModule.update({
    ...task,
    status: 'canceled',
    updatedAt,
    deviceResults,
    logs: [...(task.logs || []), otaLog(`${task.id}-${(task.logs || []).length + 1}`, '任务取消', '管理员取消了待执行任务。', 'device_admin', updatedAt)]
  })
}

export function retryFailedDevices(id) {
  const task = otaTaskModule.detail(id)
  if (!task) throw new Error('OTA 任务不存在')
  const failedResults = (task.deviceResults || []).filter(item => item.result === 'failed')
  if (!failedResults.length) throw new Error('当前任务没有可重试的失败设备')
  const updatedAt = nowString()
  const deviceResults = (task.deviceResults || []).map(item => item.result === 'failed'
    ? { ...item, result: 'success', reason: '', completedAt: updatedAt, retryCount: Number(item.retryCount || 0) + 1 }
    : item)
  const summary = summarizeDeviceResults(deviceResults)
  return otaTaskModule.update({
    ...task,
    ...summary,
    status: deriveTaskStatus(summary),
    retryCount: Number(task.retryCount || 0) + 1,
    updatedAt,
    deviceResults,
    logs: [...(task.logs || []), otaLog(
      `${task.id}-${(task.logs || []).length + 1}`,
      '失败重试',
      `重试 ${failedResults.length} 台失败设备，本次模拟结果全部成功。`,
      'device_admin',
      updatedAt
    )]
  })
}

function normalizeFirmwarePayload(payload, current, id) {
  const updatedAt = nowString()
  const versionName = String(payload.versionName || '').trim()
  const releaseNotes = String(payload.releaseNotes || '').trim()
  const versionLogs = Array.isArray(current?.versionLogs) ? [...current.versionLogs] : []
  if (releaseNotes && (!current || releaseNotes !== current.releaseNotes || versionName !== current.versionName)) {
    versionLogs.unshift({
      id: `${id}-${versionLogs.length + 1}`,
      version: versionName,
      content: releaseNotes,
      operator: 'device_admin',
      time: updatedAt
    })
  }
  const status = ['published', 'disabled'].includes(payload.status) ? payload.status : 'draft'
  return {
    ...(current || {}),
    ...payload,
    id,
    versionName,
    versionCode: String(payload.versionCode || versionName).trim(),
    targetModel: String(payload.targetModel || '').trim(),
    componentType: String(payload.componentType || '').trim(),
    fileName: String(payload.fileName || '').trim(),
    fileUrl: String(payload.fileUrl || '').trim(),
    packageSize: String(payload.packageSize || '').trim(),
    releaseNotes,
    versionLogs,
    status,
    publishTime: status === 'published' ? (payload.publishTime || current?.publishTime || updatedAt) : (payload.publishTime || current?.publishTime || ''),
    updatedAt
  }
}

function buildInitialDeviceResult(taskId, device, scheduleMode, timestamp) {
  let result = 'pending'
  let reason = ''
  let completedAt = ''
  if (device.status === 'offline') {
    result = 'queued'
    reason = '设备离线，等待上线'
  } else if (scheduleMode === 'immediate' && device.status === 'abnormal') {
    result = 'failed'
    reason = '设备状态异常，升级握手失败'
    completedAt = timestamp
  } else if (scheduleMode === 'immediate') {
    result = 'success'
    completedAt = timestamp
  }
  return otaDeviceResult(taskId, device.id, device.sn, device.status, result, reason, completedAt)
}

function summarizeDeviceResults(results = []) {
  return {
    successCount: results.filter(item => item.result === 'success').length,
    failedCount: results.filter(item => item.result === 'failed').length,
    queuedCount: results.filter(item => item.result === 'queued').length
  }
}

function deriveTaskStatus(summary) {
  if (summary.queuedCount > 0) return 'running'
  if (summary.failedCount > 0 && summary.successCount > 0) return 'partial'
  if (summary.failedCount > 0) return 'failed'
  return 'completed'
}

function otaDeviceResult(taskId, deviceId, deviceSn, deviceStatus, result, reason, completedAt) {
  return {
    id: `${taskId}-${deviceId}`,
    deviceId,
    deviceSn,
    deviceStatus,
    result,
    reason,
    completedAt,
    retryCount: 0
  }
}

function otaLog(id, action, content, operator, time) {
  return { id, action, content, operator, time }
}

export function bindDevice({ userId, deviceId }) {
  const user = userModule.detail(userId)
  const target = deviceModule.detail(deviceId)
  if (!user || !target || target.userId) return false
  const now = nowString()
  deviceModule.update({ ...target, userId: user.userId, userName: user.userName, bindTime: now, lastSyncTime: now, activationStatus: 'activated', activationTime: target.activationTime || now })
  deviceBindingModule.add({
    userId: user.userId, userName: user.userName, nickName: user.nickName, phone: user.phone,
    deviceId: target.id, deviceSn: target.sn, deviceName: target.productName, deviceType: target.categoryName,
    deviceStatus: target.onlineLabel, bindStatus: 'bound', bindTime: now, unbindTime: '', lastSyncTime: now
  })
  userModule.update({ ...user, deviceCount: Number(user.deviceCount || 0) + 1 })
  return true
}

export function unbindDevice(bindingId) {
  const binding = deviceBindingModule.detail(bindingId)
  if (!binding || binding.bindStatus !== 'bound') return false
  const now = nowString()
  const target = deviceModule.detail(binding.deviceId)
  if (target) deviceModule.update({ ...target, userId: '', userName: '', bindTime: '' })
  deviceBindingModule.update({ ...binding, bindStatus: 'unbound', unbindTime: now })
  const user = userModule.detail(binding.userId)
  if (user) userModule.update({ ...user, deviceCount: Math.max(0, Number(user.deviceCount || 0) - 1) })
  return true
}

export function unbindDeviceByDeviceId(deviceId) {
  const binding = deviceBindingModule.snapshot().find(item =>
    String(item.deviceId) === String(deviceId) && item.bindStatus === 'bound'
  )
  return binding ? unbindDevice(binding.id) : false
}

export function rebindDevice(bindingId, newUserId) {
  const binding = deviceBindingModule.detail(bindingId)
  if (!binding) return false
  if (binding.bindStatus === 'bound' && !unbindDevice(bindingId)) return false
  return bindDevice({ userId: newUserId, deviceId: binding.deviceId })
}

export function setDeviceDisabled(id, disabled) {
  const row = deviceModule.detail(id)
  if (!row) return false
  deviceModule.update({ ...row, status: disabled ? 'disabled' : 'offline', onlineLabel: disabled ? '已禁用' : '离线' })
  return true
}

export function getDeviceDetail(id) {
  const row = deviceModule.detail(id)
  if (!row) return null
  const bindings = deviceBindingModule.snapshot().filter(item => String(item.deviceId) === String(id))
  return { ...row, bindings, product: getProductDetailPayload(row.productId) }
}

export function getBindingsForUser(userId) {
  return deviceBindingModule.snapshot()
    .filter(item => String(item.userId) === String(userId))
    .map(item => {
      const device = deviceModule.detail(item.deviceId)
      return {
        ...item,
        deviceModel: device?.model || '--',
        deviceType: device?.categoryName || item.deviceType,
        deviceStatus: device?.onlineLabel || item.deviceStatus
      }
    })
    .sort((a, b) => String(b.bindTime).localeCompare(String(a.bindTime)))
}

export function listUserBindingSummaries(params = {}) {
  const groups = new Map()

  deviceBindingModule.snapshot().forEach(binding => {
    const key = String(binding.userId)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(binding)
  })

  const keyword = String(params.keyword || '').trim().toLowerCase()
  const rows = [...groups.entries()]
    .map(([userId, bindings]) => {
      const user = userModule.detail(userId) || bindings[0] || {}
      const activeBindings = bindings.filter(item => item.bindStatus === 'bound')
      const latest = key => bindings.map(item => item[key]).filter(Boolean).sort((a, b) => String(b).localeCompare(String(a)))[0] || ''
      return {
        userId: user.userId || userId,
        userName: user.userName || '',
        nickName: user.nickName || '',
        phone: user.phone || '',
        boundDeviceCount: activeBindings.length,
        bindingRecordCount: bindings.length,
        lastBindTime: latest('bindTime'),
        lastSyncTime: latest('lastSyncTime'),
        bindings
      }
    })
    .filter(row => {
      if (params.bindStatus && !row.bindings.some(item => item.bindStatus === params.bindStatus)) return false
      if (!keyword) return true
      return [row.userName, row.nickName, row.phone, ...row.bindings.flatMap(item => [item.deviceSn, item.deviceName])]
        .some(value => String(value || '').toLowerCase().includes(keyword))
    })
    .sort((a, b) => String(b.lastBindTime).localeCompare(String(a.lastBindTime)))
    .map(({ bindings, ...row }) => row)

  return paginate(rows, params.pageNum, params.pageSize)
}

function nowString() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}
