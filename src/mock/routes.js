import { createMockModule } from './_helpers'

export const routeStatusOptions = [
  { label: '已上线', value: 'online', type: 'success' },
  { label: '已下线', value: 'offline', type: 'info' }
]

export const deliveryResultOptions = [
  { label: '成功', value: 'success', type: 'success' },
  { label: '失败', value: 'failed', type: 'danger' },
  { label: '下发中', value: 'processing', type: 'warning' }
]

export const templateLayoutOptions = [
  { label: '普通图', value: 'standard' },
  { label: '路线长图', value: 'long' }
]

const routeSeed = [
  route(1, '环青海湖东线', 'Qinghai-East-2026.gpx', 'GPX', 128.6, 860, '困难', true, 1, 'online'),
  route(2, '崇礼森林骑行线', 'Chongli-Forest.fit', 'FIT', 62.4, 1240, '中等', true, 2, 'online'),
  route(3, '杭州西湖休闲环线', 'West-Lake.gpx', 'GPX', 28.2, 126, '轻松', false, 3, 'online'),
  route(4, '川西高原训练线', 'West-Sichuan.fit', 'FIT', 176.8, 2350, '困难', false, 4, 'offline')
]

function route(id, routeName, sourceFile, sourceFormat, distance, elevationGain, difficulty, recommended, sort, status) {
  return {
    id, routeName, sourceFile, sourceFormat, distance, elevationGain, difficulty, recommended, sort, status,
    summary: `${routeName}官方推荐路线`, importedAt: '2026-07-26 10:00:00', updatedAt: '2026-07-28 09:00:00'
  }
}

const templateSeed = [
  template(1, '标准数据卡片', 'standard', true, true, 1, '普通图，展示路线、里程、时长与海拔摘要'),
  template(2, '标准极简卡片', 'standard', false, true, 2, '普通图，突出路线图与里程'),
  template(3, '路线长图默认版', 'long', true, true, 1, '长图，展示完整轨迹、分段和海拔'),
  template(4, '路线长图深色版', 'long', false, false, 2, '长图备用视觉模板')
]

function template(id, templateName, layoutType, isDefault, enabled, sort, ruleText) {
  return {
    id, templateName, layoutType, isDefault, enabled, sort, ruleText,
    imageUrl: 'https://dummyimage.com/420x640/e2e8f0/334155&text=Route+Template',
    updatedAt: '2026-07-28 09:00:00'
  }
}

const deliverySeed = [
  delivery(1, 'TASK-20260728-001', 1, '环青海湖东线', 'C1-202607010001', 'C1 GPS 智能码表', 'success', ''),
  delivery(2, 'TASK-20260728-002', 2, '崇礼森林骑行线', 'C1-202607120090', 'C1 GPS 智能码表', 'failed', '设备存储空间不足'),
  delivery(3, 'TASK-20260728-003', 3, '杭州西湖休闲环线', 'C1-202607260188', 'C1 GPS 智能码表', 'processing', '')
]

function delivery(id, taskNo, routeId, routeName, targetSn, targetDevice, result, failureReason) {
  return { id, taskNo, routeId, routeName, targetSn, targetDevice, result, failureReason, createdAt: '2026-07-28 08:30:00', finishedAt: result === 'processing' ? '' : '2026-07-28 08:31:12' }
}

export const officialRouteModule = createMockModule(routeSeed, { searchFields: ['routeName', 'sourceFile', 'difficulty'], defaultSort: 'sort:asc' })
const templateModule = createMockModule(templateSeed, { searchFields: ['templateName', 'ruleText'], defaultSort: 'sort:asc' })
export const shareTemplateModule = {
  ...templateModule,
  add(payload) {
    const row = templateModule.add(payload)
    if (row.isDefault && row.enabled) setDefaultTemplate(row.id)
    return row
  },
  update(payload) {
    const row = templateModule.update(payload)
    if (row?.isDefault && row.enabled) setDefaultTemplate(row.id)
    return row
  }
}
export const routeDeliveryModule = createMockModule(deliverySeed, { searchFields: ['taskNo', 'routeName', 'targetSn', 'targetDevice', 'failureReason'], defaultSort: 'createdAt:desc' })

export function importOfficialRoute({ routeName, sourceFile, difficulty = '中等' }) {
  const format = String(sourceFile || '').split('.').pop()?.toUpperCase()
  if (!['GPX', 'FIT'].includes(format)) return false
  return officialRouteModule.add({
    routeName, sourceFile, sourceFormat: format, distance: 0, elevationGain: 0, difficulty,
    recommended: false, sort: officialRouteModule.snapshot().length + 1, status: 'offline',
    summary: '等待完善路线数据', importedAt: nowString(), updatedAt: nowString()
  })
}

export function setDefaultTemplate(id) {
  const target = templateModule.detail(id)
  if (!target || !target.enabled) return false
  templateModule.snapshot().forEach(item => {
    if (item.layoutType === target.layoutType) {
      templateModule.update({ ...item, isDefault: String(item.id) === String(id) })
    }
  })
  return true
}

export function validateDefaultTemplates() {
  return templateLayoutOptions.every(option => shareTemplateModule.snapshot().filter(item => item.layoutType === option.value && item.enabled && item.isDefault).length === 1)
}

function nowString() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}
