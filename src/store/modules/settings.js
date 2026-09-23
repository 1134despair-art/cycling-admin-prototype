import defaultSettings from '@/settings'
import { useDark } from '@vueuse/core'
import { useDynamicTitle } from '@/utils/dynamicTitle'
import { handleThemeStyle } from '@/utils/theme'

const darkPreference = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: 'admin-color-scheme',
  initialValue: 'light'
})

const { showSettings, navType, tagsView, tagsViewPersist, tagsIcon, tagsViewStyle, fixedHeader, sidebarLogo, dynamicTitle, footerVisible, footerContent } = defaultSettings

const storageSetting = JSON.parse(localStorage.getItem('layout-setting')) || ''

const useSettingsStore = defineStore(
  'settings',
  {
    state: () => ({
      title: '',
      theme: storageSetting.theme || '#409EFF',
      showSettings: showSettings,
      navType: storageSetting.navType === undefined ? navType : storageSetting.navType,
      tagsView: storageSetting.tagsView === undefined ? tagsView : storageSetting.tagsView,
      tagsViewPersist: storageSetting.tagsViewPersist === undefined ? tagsViewPersist : storageSetting.tagsViewPersist,
      tagsIcon: storageSetting.tagsIcon === undefined ? tagsIcon : storageSetting.tagsIcon,
      tagsViewStyle: storageSetting.tagsViewStyle === undefined ? tagsViewStyle : storageSetting.tagsViewStyle,
      fixedHeader: storageSetting.fixedHeader === undefined ? fixedHeader : storageSetting.fixedHeader,
      sidebarLogo: storageSetting.sidebarLogo === undefined ? sidebarLogo : storageSetting.sidebarLogo,
      dynamicTitle: storageSetting.dynamicTitle === undefined ? dynamicTitle : storageSetting.dynamicTitle,
      footerVisible: storageSetting.footerVisible === undefined ? footerVisible : storageSetting.footerVisible,
      footerContent: footerContent,
      isDark: darkPreference.value
    }),
    actions: {
      // 修改布局设置
      changeSetting(data) {
        const { key, value } = data
        if (this.hasOwnProperty(key)) {
          this[key] = value
        }
      },
      // 设置网页标题
      setTitle(title) {
        this.title = title
        useDynamicTitle()
      },
      // 设置全局显示模式
      setThemeMode(mode) {
        const nextIsDark = mode === 'dark'
        this.isDark = nextIsDark
        darkPreference.value = nextIsDark
        nextTick(() => {
          handleThemeStyle(this.theme)
        })
      },
      // 切换全局显示模式
      toggleTheme() {
        this.setThemeMode(this.isDark ? 'light' : 'dark')
      }
    }
  })

export default useSettingsStore
