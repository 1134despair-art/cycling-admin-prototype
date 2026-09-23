export function getDashboardData() {
  const labels7 = ['07-22', '07-23', '07-24', '07-25', '07-26', '07-27', '07-28']
  const labels30 = Array.from({ length: 30 }, (_, index) => `06-${String(29 + index).padStart(2, '0')}`)
    .map((label, index) => index < 2 ? label : `07-${String(index - 1).padStart(2, '0')}`)

  return {
    overviewCards: [
      card('totalUsers', '用户规模', '18,640', '人', 6.8, '累计注册用户', [42, 48, 53, 58, 64, 71, 78]),
      card('activeUsers', '活跃用户', '3,926', '人', 8.2, '近 7 日活跃用户', [46, 52, 48, 66, 72, 68, 82]),
      card('connectedDevices', '设备连接', '2,184', '台', 3.6, '当前已连接设备', [54, 56, 58, 61, 64, 68, 72]),
      card('routes', '路线数量', '8,126', '条', 5.1, '用户与官方路线总量', [44, 47, 51, 54, 60, 64, 69]),
      card('messages', '消息数量', '46,892', '条', -1.8, '近 30 日推送消息', [72, 68, 66, 61, 64, 59, 56])
    ],
    trends: {
      7: trendGroup(labels7, {
        newUsers: [168, 174, 181, 193, 205, 217, 226],
        activeUsers: [1534, 1588, 1612, 1695, 1768, 1824, 1906],
        onlineDevices: [842, 886, 918, 962, 1018, 1062, 1124],
        routeImports: [42, 56, 48, 61, 72, 66, 84]
      }),
      30: trendGroup(labels30, {
        newUsers: series(30, 142, 5, 18),
        activeUsers: series(30, 1320, 22, 90),
        onlineDevices: series(30, 760, 13, 44),
        routeImports: series(30, 36, 2, 14)
      })
    }
  }
}

function card(key, title, value, unit, trend, desc, sparkValues) {
  return { key, title, value, unit, trend, desc, period: '较上期', sparkValues }
}

function series(length, base, step, wave) {
  return Array.from({ length }, (_, index) => Math.round(base + step * index + Math.sin(index / 2) * wave))
}

function trendGroup(labels, valuesByKey) {
  const definitions = [
    ['newUsers', '新增用户', '人'],
    ['activeUsers', '活跃用户', '人'],
    ['onlineDevices', '设备在线', '台'],
    ['routeImports', '路线导入', '条']
  ]
  return {
    labels,
    metrics: definitions.map(([key, label, unit]) => {
      const values = valuesByKey[key]
      const total = values.reduce((sum, value) => sum + value, 0)
      return {
        key, label, unit, values,
        total: total.toLocaleString('zh-CN'),
        average: Math.round(total / values.length).toLocaleString('zh-CN'),
        peak: Math.max(...values).toLocaleString('zh-CN'),
        low: Math.min(...values).toLocaleString('zh-CN'),
        summary: `${label}在当前周期内整体保持稳定。`
      }
    })
  }
}
