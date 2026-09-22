<template>
  <div :class="['sidebar-theme-wrapper', {'has-logo':showLogo}, sideTheme]" class="sidebar-container">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar class="sidebar-scrollbar" wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="getMenuBackground"
        :text-color="getMenuTextColor"
        :unique-opened="true"
        :active-text-color="theme"
        :collapse-transition="false"
        mode="vertical"
        :class="sideTheme"
      >
        <sidebar-item
          v-for="(route, index) in sidebarRouters"
          :key="route.path + index"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const sidebarRouters = computed(() => permissionStore.sidebarRouters)
const showLogo = computed(() => settingsStore.sidebarLogo)
const sideTheme = computed(() => settingsStore.isDark ? 'theme-dark' : 'theme-light')
const theme = computed(() => settingsStore.theme)
const isCollapse = computed(() => !appStore.sidebar.opened)

// 获取菜单背景色
const getMenuBackground = computed(() => {
  return 'var(--sidebar-bg)'
})

// 获取菜单文字颜色
const getMenuTextColor = computed(() => {
  return 'var(--sidebar-text)'
})

const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})
</script>

<style lang="scss" scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  background-color: v-bind(getMenuBackground);

  .sidebar-scrollbar {
    flex: 1;
    min-height: 0;
    height: auto !important;
  }
  
  .scrollbar-wrapper {
    background-color: v-bind(getMenuBackground);
  }

  .el-menu {
    border: none;
    height: 100%;
    width: 100% !important;
    padding: 6px 0 12px;
    font-size: 14px;
    
    .el-menu-item, .el-sub-menu__title {
      min-height: 40px;
      margin: 2px 8px;
      border-radius: 6px;
      padding-right: 14px;
      transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        background-color: var(--menu-hover, rgba(255, 255, 255, 0.08)) !important;
      }
    }

    .el-menu-item {
      color: v-bind(getMenuTextColor);
      
      &.is-active {
        color: var(--menu-active-text, #409eff);
        background: var(--sidebar-active-bg, #eff6ff) !important;
        box-shadow: inset 3px 0 0 v-bind(theme);
      }
    }

    .el-sub-menu__title {
      color: v-bind(getMenuTextColor);
    }

    > .el-sub-menu > .el-sub-menu__title {
      margin-top: 6px;
      margin-bottom: 4px;
      min-height: 40px;
      font-weight: 600;
      background: transparent !important;
      box-shadow: none !important;
    }

    > .el-sub-menu.is-active > .el-sub-menu__title {
      color: v-bind(getMenuTextColor);
      background: transparent !important;
    }

    > .el-sub-menu .el-menu-item {
      margin-left: 14px;
      margin-right: 8px;
      min-height: 40px;
      border-radius: 6px;
    }
  }

}
</style>
