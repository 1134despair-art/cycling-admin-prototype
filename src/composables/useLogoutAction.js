import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { buildBusinessConfirmOptions } from '@/plugins/modal'
import useUserStore from '@/store/modules/user'

export function useLogoutAction() {
  const userStore = useUserStore()
  const loggingOut = ref(false)

  async function confirmLogout() {
    if (loggingOut.value) return false

    try {
      await ElMessageBox.confirm('确定注销并退出系统吗？', '退出登录', buildBusinessConfirmOptions({
        confirmButtonText: '退出登录'
      }))
    } catch {
      return false
    }

    loggingOut.value = true
    try {
      await userStore.logOut()
      location.href = `${import.meta.env.BASE_URL}#/index`
      return true
    } catch (error) {
      ElMessage.error(error?.message || '退出失败，请重试')
      return false
    } finally {
      loggingOut.value = false
    }
  }

  return {
    confirmLogout,
    loggingOut
  }
}
