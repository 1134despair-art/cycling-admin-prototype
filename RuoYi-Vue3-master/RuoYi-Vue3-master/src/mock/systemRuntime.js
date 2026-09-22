const runtimeNoticeList = [
  {
    noticeId: 1,
    noticeTitle: '欢迎使用前端演示环境',
    noticeType: '2',
    isRead: false,
    status: '0',
    createBy: '系统管理员',
    createTime: '2026-06-03 09:30:00',
    noticeContent: '<p>当前系统为纯前端 Mock 演示环境，公告、配置和字典能力均使用本地静态数据展示。</p>'
  },
  {
    noticeId: 2,
    noticeTitle: '业务数据已切换为本地 Mock',
    noticeType: '1',
    isRead: true,
    status: '0',
    createBy: '平台运营',
    createTime: '2026-06-03 10:00:00',
    noticeContent: '<p>登录、菜单、业务列表和详情交互均不依赖后端接口，可直接在前端完成演示。</p>'
  }
]

const runtimeConfigMap = {
  'sys.user.initPassword': '123456',
  'sys.account.captchaEnabled': 'false',
  'sys.index.skinName': 'skin-blue'
}

const runtimeDictMap = {
  sys_normal_disable: [
    { dictLabel: '正常', dictValue: '0', listClass: 'primary', cssClass: '' },
    { dictLabel: '停用', dictValue: '1', listClass: 'danger', cssClass: '' }
  ],
  sys_notice_status: [
    { dictLabel: '正常', dictValue: '0', listClass: 'success', cssClass: '' },
    { dictLabel: '关闭', dictValue: '1', listClass: 'info', cssClass: '' }
  ],
  sys_notice_type: [
    { dictLabel: '通知', dictValue: '1', listClass: 'warning', cssClass: '' },
    { dictLabel: '公告', dictValue: '2', listClass: 'success', cssClass: '' }
  ]
}

export function getRuntimeNoticeList() {
  return runtimeNoticeList.map(item => ({ ...item }))
}

export function getRuntimeNotice(noticeId) {
  const found = runtimeNoticeList.find(item => String(item.noticeId) === String(noticeId))
  return found ? { ...found } : null
}

export function getRuntimeConfigValue(configKey) {
  return runtimeConfigMap[configKey] ?? ''
}

export function getRuntimeDicts(dictType) {
  return (runtimeDictMap[dictType] || []).map(item => ({ ...item }))
}
