import { createMockModule } from './_helpers'

export const messageTypeOptions = ['设备通知', '固件通知', '系统通知', '活动通知', '训练通知'].map(value => ({ label: value, value }))

export const templateStatusOptions = [
  { label: '启用', value: 'enabled', type: 'success' },
  { label: '停用', value: 'disabled', type: 'info' }
]

export const readStatusOptions = [
  { label: '已读', value: 'read', type: 'success' },
  { label: '未读', value: 'unread', type: 'warning' }
]

const templateSeed = [
  template(1, '设备离线提醒', '设备通知', '设备 {{deviceName}} 已离线，请检查连接状态。'),
  template(2, '固件升级提醒', '固件通知', '{{deviceName}} 有新固件 {{version}} 可升级。'),
  template(3, '系统维护通知', '系统通知', '系统将于 {{time}} 进行维护。'),
  template(4, '活动开始提醒', '活动通知', '您报名的 {{activityName}} 即将开始。'),
  template(5, '训练目标提醒', '训练通知', '今日训练目标为 {{target}}，请合理安排骑行。')
]

function template(id, templateName, messageType, content) {
  return {
    id,
    templateCode: 'TPL-' + String(id).padStart(3, '0'),
    templateName,
    messageType,
    title: templateName,
    content,
    channel: 'APP站内 + Push',
    status: 'enabled',
    updatedAt: '2026-07-28 09:00:00'
  }
}

const pushSeed = [
  {
    id: 1,
    title: 'C1 固件升级提醒',
    content: 'C1 GPS 智能码表有新固件 3.2.0 可升级。',
    scope: '指定设备型号',
    recipient: 'C1 用户（1,286 人）',
    sendTime: '2026-07-28 08:30:00',
    readStatus: 'read'
  },
  {
    id: 2,
    title: '系统维护通知',
    content: '系统将于 7 月 30 日 02:00 进行维护。',
    scope: '全体用户',
    recipient: '全部用户（18,640 人）',
    sendTime: '2026-07-27 18:00:00',
    readStatus: 'unread'
  },
  {
    id: 3,
    title: '夏季耐力训练',
    content: '本周耐力训练计划已更新。',
    scope: '用户分群',
    recipient: '活跃训练用户（3,926 人）',
    sendTime: '2026-07-26 10:20:00',
    readStatus: 'read'
  }
]

export const notificationTemplateModule = createMockModule(templateSeed, {
  searchFields: ['templateCode', 'templateName', 'messageType', 'content'],
  defaultSort: 'updatedAt:desc'
})

export const pushRecordModule = createMockModule(pushSeed, {
  searchFields: ['title', 'content', 'scope', 'recipient'],
  dateRangeKey: 'sendTime',
  defaultSort: 'sendTime:desc'
})
