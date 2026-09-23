import { createMockModule } from './_helpers'

export const rideSyncStatusOptions = [
  { label: '同步成功', value: 'success', type: 'success' },
  { label: '同步失败', value: 'failed', type: 'danger' },
  { label: '同步中', value: 'processing', type: 'warning' }
]

export const abnormalStatusOptions = [
  { label: '待处理', value: 'pending', type: 'warning' },
  { label: '已修复', value: 'resolved', type: 'success' },
  { label: '已忽略', value: 'ignored', type: 'info' }
]

const recordSeed = [
  ride(1, 1, 'zhangsan', '张三', '2026-07-27 06:42:00', 86.4, 11820, 26.3, 'C1-202607010001', 'C1 GPS 智能码表', 'success'),
  ride(2, 3, 'wangwu', '王五', '2026-07-26 15:18:00', 52.7, 7410, 25.6, 'EGR-202606180055', 'eGR 砾石电子变速套件', 'success'),
  ride(3, 5, 'sunqi', '孙七', '2026-07-26 05:56:00', 121.3, 16740, 26.1, 'C1-202607120090', 'C1 GPS 智能码表', 'failed'),
  ride(4, 1, 'zhangsan', '张三', '2026-07-24 18:30:00', 34.8, 4680, 26.8, 'C1-202607010001', 'C1 GPS 智能码表', 'success'),
  ride(5, 6, 'zhouba', '周八', '2026-07-23 07:12:00', 18.6, 3120, 21.5, 'C1-202607260188', 'C1 GPS 智能码表', 'processing')
]

function ride(id, userId, userName, nickName, startTime, distance, durationSeconds, averageSpeed, deviceSn, sourceDevice, syncStatus) {
  const duration = formatDuration(durationSeconds)
  return {
    id, recordNo: `RIDE-202607-${String(id).padStart(4, '0')}`, userId, userName, nickName, startTime,
    distance, duration, averageSpeed, deviceSn, sourceDevice, syncStatus
  }
}

const syncSeed = recordSeed.map((item, index) => ({
  id: index + 1, syncTime: item.startTime, deviceSn: item.deviceSn, deviceName: item.sourceDevice,
  result: item.syncStatus, dataSize: `${(1.8 + index * 0.6).toFixed(1)} MB`, recordCount: index === 2 ? 0 : 1,
  failureReason: item.syncStatus === 'failed' ? '轨迹数据包校验失败' : ''
}))

const abnormalSeed = [
  { id: 1, recordNo: 'RIDE-202607-0003', userName: 'sunqi', abnormalType: '轨迹点丢失', detectedValue: '连续缺失 86 点', expectedRange: '连续缺失 < 20 点', status: 'pending', detectedAt: '2026-07-26 10:40:00', handler: '', handleRemark: '' },
  { id: 2, recordNo: 'RIDE-202607-0002', userName: 'wangwu', abnormalType: '里程异常', detectedValue: '瞬时里程跳变 1.8 km', expectedRange: '< 0.2 km', status: 'resolved', detectedAt: '2026-07-26 15:50:00', handler: 'device_admin', handleRemark: '已按轨迹点重算' },
  { id: 3, recordNo: 'RIDE-202607-0001', userName: 'zhangsan', abnormalType: '功率重复', detectedValue: '相同功率连续 180 秒', expectedRange: '< 60 秒', status: 'ignored', detectedAt: '2026-07-27 09:00:00', handler: 'device_admin', handleRemark: '室内匀速训练，数据有效' }
]

export const rideRecordModule = createMockModule(recordSeed, { idKey: 'id', searchFields: ['recordNo', 'userName', 'nickName', 'deviceSn', 'sourceDevice'], dateRangeKey: 'startTime', defaultSort: 'startTime:desc' })
export const rideSyncModule = createMockModule(syncSeed, { searchFields: ['deviceSn', 'deviceName', 'failureReason'], defaultSort: 'syncTime:desc' })
export const abnormalDataModule = createMockModule(abnormalSeed, { searchFields: ['recordNo', 'userName', 'abnormalType', 'handleRemark'], defaultSort: 'detectedAt:desc' })

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}小时${minutes}分钟`
}
