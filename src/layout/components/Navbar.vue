<template>
  <div class="navbar" :class="'nav' + settingsStore.navType">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb v-if="settingsStore.navType == 1" id="breadcrumb-container" class="breadcrumb-container" />
    <top-nav v-if="settingsStore.navType == 2" id="topmenu-container" class="topmenu-container" />
    <template v-if="settingsStore.navType == 3">
      <logo v-show="settingsStore.sidebarLogo" :collapse="false"></logo>
      <top-bar id="topbar-container" class="topbar-container" />
    </template>

    <div class="right-menu">
      <el-tooltip :content="themeToggleLabel" placement="bottom">
        <button type="button" class="navbar-action" :aria-label="themeToggleLabel" @click="settingsStore.toggleTheme()">
          <el-icon><Sunny v-if="settingsStore.isDark" /><Moon v-else /></el-icon>
        </button>
      </el-tooltip>
      <el-dropdown @command="handleCommand" class="avatar-container right-menu-item hover-effect" trigger="click" placement="bottom-end">
        <button type="button" class="avatar-wrapper" aria-label="打开账号菜单">
          <img :src="userStore.avatar" class="user-avatar" />
          <span class="user-nickname"> {{ userStore.nickName }} </span>
          <el-icon class="avatar-caret"><ArrowDown /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="changePassword">
              <svg-icon icon-class="password" class="dropdown-icon" />
              <span>修改密码</span>
            </el-dropdown-item>
            <el-dropdown-item command="logout" divided>
              <el-icon class="dropdown-icon"><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
  <change-password-dialog v-model="changePasswordVisible" />
</template>

<script setup>
import { ArrowDown, Moon, Sunny, SwitchButton } from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb'
import ChangePasswordDialog from './ChangePasswordDialog.vue'
import TopNav from './TopNav'
import TopBar from './TopBar'
import Logo from './Sidebar/Logo'
import Hamburger from '@/components/Hamburger'
import { useLogoutAction } from '@/composables/useLogoutAction'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'

const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const { confirmLogout } = useLogoutAction()
const changePasswordVisible = ref(false)
const themeToggleLabel = computed(() => settingsStore.isDark ? '切换到白天模式' : '切换到夜间模式')

function toggleSideBar() {
  appStore.toggleSideBar()
}

function handleCommand(command) {
  if (command === 'changePassword') {
    changePasswordVisible.value = true
  } else if (command === 'logout') {
    confirmLogout()
  }
}

</script>

<style lang='scss' scoped>
.navbar.nav3 {
  .hamburger-container {
    display: none !important;
  }
}

.navbar {
  height: 56px;
  overflow: hidden;
  position: relative;
  background: var(--navbar-bg, #fff);
  box-shadow: none;
  border-bottom: 1px solid var(--el-border-color-lighter, #e5e7eb);
  display: flex;
  align-items: center;
  padding: 0 12px 0 8px;
  box-sizing: border-box;

  .hamburger-container {
    line-height: 56px;
    height: 100%;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-right: 8px;
    border-radius: 6px;

    &:hover {
      background: var(--el-fill-color-light, #f3f4f6);
    }
  }

  .breadcrumb-container {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .topbar-container {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    margin-left: 8px;
  }

  .right-menu {
    height: 100%;
    line-height: 56px;
    display: flex;
    align-items: center;
    margin-left: auto;
    gap: 2px;
    flex-shrink: 0;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 6px;
      height: 100%;
      font-size: 18px;
      color: var(--admin-text-secondary, #475569);
      vertical-align: text-bottom;
      border-radius: 6px;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: var(--el-fill-color-light, #f3f4f6);
        }
      }

    }

    .navbar-action {
      width: 36px;
      height: 36px;
      flex: 0 0 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: 0;
      border-radius: 6px;
      color: var(--admin-text-secondary, #475569);
      background: transparent;
      cursor: pointer;
      transition: color 0.2s ease, background-color 0.2s ease;

      .el-icon {
        font-size: 18px;
      }

      &:hover,
      &:focus-visible {
        color: var(--el-color-primary, #409eff);
        background: var(--el-fill-color-light, #f3f4f6);
      }
    }

    .avatar-container {
      margin-right: 0px;
      padding-right: 0px;

      .avatar-wrapper {
        margin-top: 0;
        right: 0;
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 6px;
        border-radius: 6px;
        border: 0;
        color: inherit;
        background: transparent;
        font: inherit;
        cursor: pointer;

        .user-avatar {
          cursor: pointer;
          width: 30px;
          height: 30px;
          margin-right: 0;
          border-radius: 50%;
        }

        .user-nickname{
          position: relative;
          left: 0;
          bottom: 0;
          font-size: 14px;
          max-width: 120px;
          overflow: hidden;
          color: var(--el-text-color-primary, #0f172a);
          font-weight: 500;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .avatar-caret {
          width: 14px;
          height: 14px;
          flex: 0 0 14px;
          color: var(--el-text-color-secondary, #64748b);
          font-size: 12px;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

.navbar :deep(.el-breadcrumb__inner),
.navbar :deep(.el-breadcrumb__separator) {
  font-size: 13px;
}

:global(.el-dropdown-menu .dropdown-icon) {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

@media (max-width: 768px) {
  .navbar {
    padding-right: 8px;

    .breadcrumb-container {
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .right-menu {
      gap: 0;

      .navbar-action {
        width: 34px;
        height: 34px;
        flex-basis: 34px;
      }
    }

    .right-menu .avatar-container .avatar-wrapper {
      padding: 4px;

      .user-nickname {
        display: none;
      }
    }
  }
}
</style>
