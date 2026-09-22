import { getToken } from '@/utils/auth'
import {
  mockCaptcha,
  mockGetInfo,
  mockLogin,
  mockLogout,
  mockRegister
} from '@/mock/auth'

// 登录方法
export function login(username, password, code, uuid) {
  return mockLogin({
    username,
    password,
    code,
    uuid
  })
}

// 注册方法
export function register(data) {
  return mockRegister(data)
}

// 获取用户详细信息
export function getInfo() {
  return mockGetInfo(getToken())
}

// 退出方法
export function logout() {
  return mockLogout()
}

// 获取验证码
export function getCodeImg() {
  return mockCaptcha()
}
