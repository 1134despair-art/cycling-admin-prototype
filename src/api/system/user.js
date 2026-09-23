import { mockChangePassword } from '@/mock/auth'
import { getToken } from '@/utils/auth'

// 修改当前登录用户密码
export function updateUserPwd(oldPassword, newPassword) {
  return mockChangePassword(getToken(), { oldPassword, newPassword })
}
