const mockUsers = [
  {
    userId: 1,
    userName: 'admin',
    nickName: '超级管理员',
    password: 'admin123',
    deptName: '平台运营中心',
    roles: ['admin'],
    permissions: ['*:*:*']
  },
  {
    userId: 2,
    userName: 'ops_manager',
    nickName: '运营管理员',
    password: 'admin123',
    deptName: '运营中心',
    roles: ['admin'],
    permissions: ['*:*:*']
  },
  {
    userId: 3,
    userName: 'device_admin',
    nickName: '设备管理员',
    password: 'admin123',
    deptName: '设备中心',
    roles: ['admin'],
    permissions: ['*:*:*']
  },
  {
    userId: 4,
    userName: 'service_admin',
    nickName: '服务管理员',
    password: 'admin123',
    deptName: '用户服务部',
    roles: ['admin'],
    permissions: ['*:*:*']
  },
  {
    userId: 5,
    userName: 'content_admin',
    nickName: '内容管理员',
    password: 'admin123',
    deptName: '内容运营部',
    roles: ['admin'],
    permissions: ['*:*:*']
  }
]

function buildToken(userName) {
  return `mock-token::${userName}`
}

function parseToken(token = '') {
  const match = String(token).match(/^mock-token::(.+)$/)
  return match?.[1] || ''
}

function resolveUser(userName = '') {
  return mockUsers.find((item) => item.userName === userName)
}

export function mockLogin(payload = {}) {
  const userName = payload.username?.trim() || ''
  const password = payload.password || ''
  const user = resolveUser(userName)

  if (!userName) {
    return Promise.reject(new Error('请输入账号'))
  }

  if (!password) {
    return Promise.reject(new Error('请输入密码'))
  }

  if (!user || password !== user.password) {
    return Promise.reject(new Error('账号或密码错误'))
  }

  return Promise.resolve({
    code: 200,
    msg: '登录成功',
    token: buildToken(user.userName)
  })
}

export function mockGetInfo(token) {
  const user = resolveUser(parseToken(token))

  if (!user) {
    return Promise.reject(new Error('登录状态已失效，请重新登录'))
  }

  return Promise.resolve({
    code: 200,
    permissions: user.permissions,
    roles: user.roles,
    user: {
      userId: user.userId,
      userName: user.userName,
      nickName: user.nickName,
      avatar: '',
      dept: {
        deptName: user.deptName
      }
    },
    isDefaultModifyPwd: false,
    isPasswordExpired: false,
    pwdChrtype: '0'
  })
}

export function mockChangePassword(token, payload = {}) {
  const user = resolveUser(parseToken(token))
  const oldPassword = payload.oldPassword || ''
  const newPassword = payload.newPassword || ''

  if (!user) {
    return Promise.reject(new Error('登录状态已失效，请重新登录'))
  }
  if (!oldPassword || !newPassword) {
    return Promise.reject(new Error('请完整填写密码信息'))
  }
  if (oldPassword !== user.password) {
    return Promise.reject(new Error('当前密码不正确'))
  }
  if (newPassword === oldPassword) {
    return Promise.reject(new Error('新密码不能与当前密码相同'))
  }
  if (newPassword.length < 6 || newPassword.length > 20) {
    return Promise.reject(new Error('新密码长度必须介于 6 和 20 之间'))
  }
  if (!/^[^<>"'|\\]+$/.test(newPassword)) {
    return Promise.reject(new Error('新密码包含非法字符'))
  }

  user.password = newPassword

  return Promise.resolve({
    code: 200,
    msg: '密码修改成功'
  })
}

export function mockLogout() {
  return Promise.resolve({
    code: 200,
    msg: '退出成功'
  })
}

export function mockCaptcha() {
  return Promise.resolve({
    code: 200,
    captchaEnabled: false,
    img: '',
    uuid: 'mock-captcha'
  })
}

export function mockRegister(data = {}) {
  return Promise.resolve({
    code: 200,
    msg: `${data.username || '新用户'} 注册成功`
  })
}
