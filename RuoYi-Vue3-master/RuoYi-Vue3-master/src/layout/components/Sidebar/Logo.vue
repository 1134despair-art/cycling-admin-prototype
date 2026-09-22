<template>
  <div class="sidebar-logo-container" :class="{ 'collapse': collapse }">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1 v-else class="sidebar-title">{{ title }}</h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1 class="sidebar-title">{{ title }}</h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup>
import logo from '@/assets/logo/logo.svg'
import useSettingsStore from '@/store/modules/settings'

defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
})

const title = import.meta.env.VITE_APP_TITLE
const settingsStore = useSettingsStore()
// 获取Logo背景色
const getLogoBackground = computed(() => {
  return 'var(--sidebar-bg)'
})

// 获取Logo文字颜色
const getLogoTextColor = computed(() => {
  return 'var(--sidebar-logo-text)'
})
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  height: 56px;
  line-height: 56px;
  background: v-bind(getLogoBackground);
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    padding: 0 12px;

    & .sidebar-logo {
      width: 26px;
      height: 26px;
      flex-shrink: 0;
      vertical-align: middle;
      margin-right: 0;
    }

    & .sidebar-title {
      display: block;
      flex: 1;
      margin: 0;
      color: v-bind(getLogoTextColor);
      font-weight: 700;
      line-height: 56px;
      font-size: 13px;
      letter-spacing: 0;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: clip;
      text-align: left;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }

    .sidebar-logo-link {
      justify-content: center;
      padding: 0;
    }
  }
}
</style>
