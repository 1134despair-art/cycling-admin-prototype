<template>
  <div class="login">
    <div class="login-shell">
      <div class="login-welcome">
        <h1 class="login-welcome__title">{{ title }}</h1>
        <p class="login-welcome__desc">统一管理电变、功率计、骑行台、电动升降座管、码表等智能骑行设备，并支撑用户与系统配置的日常运营。</p>
        <div class="login-welcome__points">
          <div class="login-welcome__point">
            <span class="login-welcome__dot" />
            <span>聚焦智能骑行设备与用户管理的后台协同</span>
          </div>
          <div class="login-welcome__point">
            <span class="login-welcome__dot" />
            <span>覆盖设备接入、型号配置、状态监控与用户服务</span>
          </div>
          <div class="login-welcome__point">
            <span class="login-welcome__dot" />
            <span>提升设备运营、售后处理与后台配置效率</span>
          </div>
        </div>
      </div>

      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
        <div class="login-form__header">
          <h3 class="title">欢迎登录</h3>
          <p class="login-form__desc">请输入管理员账号和密码，进入后台工作台。</p>
        </div>

        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            type="text"
            size="large"
            auto-complete="off"
            placeholder="请输入账号"
          >
            <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            size="large"
            auto-complete="off"
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          >
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>

        <div class="login-form__options">
          <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
        </div>

        <el-form-item style="width:100%;">
          <el-button
            :loading="loading"
            size="large"
            type="primary"
            class="login-form__submit"
            @click.prevent="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
        </el-form-item>

      </el-form>
    </div>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup>
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginForm = ref({
  username: "admin",
  password: "admin123",
  rememberMe: false
})

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }]
}

const loading = ref(false)
const redirect = ref(undefined)

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect
}, { immediate: true })

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 })
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
      } else {
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("rememberMe")
      }

      userStore.login({ ...loginForm.value }).then(() => {
        const query = route.query
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQueryParams })
      }).catch(() => {
        loading.value = false
      })
    }
  })
}

function getCookie() {
  const username = Cookies.get("username")
  const password = Cookies.get("password")
  const rememberMe = Cookies.get("rememberMe")
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}

getCookie()
</script>

<style lang='scss' scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 32px;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
  background-position: center;
  position: relative;
}

.login::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(115deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.58) 38%, rgba(15, 23, 42, 0.42) 100%),
    radial-gradient(circle at 18% 20%, rgba(59, 130, 246, 0.22), transparent 28%);
}

.login-shell {
  position: relative;
  z-index: 1;
  width: min(1080px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) 420px;
  gap: 28px;
  align-items: stretch;
}

.login-welcome {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 28px 12px 28px 0;
  color: #fff;
}

.login-welcome__title {
  margin: 0 0 14px;
  font-size: 42px;
  line-height: 1.18;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.login-welcome__desc {
  margin: 0;
  max-width: 560px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 16px;
  line-height: 1.8;
}

.login-welcome__points {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.login-welcome__point {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.login-welcome__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #60a5fa;
  box-shadow: 0 0 0 6px rgba(96, 165, 250, 0.16);
}

.title {
  margin: 6px 0 0;
  text-align: left;
  color: var(--admin-text-primary, #111827);
  font-size: 28px;
  font-weight: 700;
}

.login-form {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  width: 100%;
  padding: 28px 28px 24px;
  z-index: 1;
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.22);

  .el-form-item {
    margin-bottom: 18px;
  }

  .el-input {
    height: 46px;
    input {
      height: 46px;
    }
  }

  :deep(.el-input__wrapper) {
    border-radius: 12px;
    box-shadow: 0 0 0 1px rgba(203, 213, 225, 0.95) inset;
  }

  :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.95) inset;
  }

  :deep(.el-input.is-focus .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset;
  }

  .input-icon {
    height: 45px;
    width: 14px;
    margin-left: 0;
  }
}

.login-form__header {
  margin-bottom: 24px;
}

.login-form__desc {
  margin: 10px 0 0;
  color: var(--admin-text-muted, #64748b);
  font-size: 14px;
  line-height: 1.7;
}

.login-form__options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 4px 0 24px;
}

.login-form__register {
  font-size: 13px;
}

.login-form__submit {
  width: 100%;
  height: 46px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.24);
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

html.dark .login {
  background-image: linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url("../assets/images/login-background.jpg");
  .login-form {
    background: var(--el-bg-color-overlay) !important;
    border-color: var(--admin-border, #30343a);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  }

  :deep(.el-input__wrapper) {
    background: var(--admin-surface, #181b20);
    box-shadow: 0 0 0 1px var(--admin-border, #30343a) inset;
  }
}

@media (max-width: 980px) {
  .login-shell {
    grid-template-columns: 1fr;
    max-width: 460px;
  }

  .login-welcome {
    padding: 0;
  }

  .login-welcome__title {
    font-size: 32px;
  }
}

@media (max-width: 640px) {
  .login {
    padding: 18px;
  }

  .login-form {
    padding: 22px 20px 20px;
    border-radius: 20px;
  }

  .login-form__options {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
