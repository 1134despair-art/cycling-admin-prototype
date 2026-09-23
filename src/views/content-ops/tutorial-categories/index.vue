<template>
  <business-table-page v-bind="pageConfig" />
</template>

<script setup>
import BusinessTablePage from '@/components/business/BusinessTablePage.vue'
import { tutorialCategoryModule, tutorialEntryStatusOptions } from '@/mock/content'

const pageConfig = {
  title: '教程分组管理',
  description: '配置教程首页中的产品分组与模块入口，承接公路电变、TT 公路电变、山地电变及其它入口展示。',
  module: tutorialCategoryModule,
  filters: [
    { key: 'keyword', label: '分组信息', type: 'input', placeholder: '请输入分组名称/模块入口/跳转类型' },
    { key: 'status', label: '状态', type: 'select', options: tutorialEntryStatusOptions.map(({ label, value }) => ({ label, value })) }
  ],
  columns: [
    { key: 'groupName', label: '产品分组', width: 180 },
    { key: 'groupIcon', label: '分组图标', width: 120 },
    { key: 'entryName', label: '模块入口', width: 140 },
    { key: 'entryIcon', label: '入口图标', width: 120 },
    { key: 'jumpType', label: '跳转类型', width: 140 },
    { key: 'description', label: '入口说明', width: 280 },
    { key: 'sort', label: '排序', width: 90 },
    { key: 'status', label: '状态', type: 'status', options: tutorialEntryStatusOptions, width: 120 },
    { key: 'updatedAt', label: '更新时间', width: 180 }
  ],
  formFields: [
    { key: 'groupName', label: '产品分组', placeholder: '请输入分组名称，如公路电变套件' },
    { key: 'groupIcon', label: '分组图标', placeholder: '请输入分组图标标识' },
    { key: 'entryName', label: '模块入口', placeholder: '请输入入口名称，如手变 / 前拨 / 手册' },
    { key: 'entryIcon', label: '入口图标', placeholder: '请输入入口图标标识' },
    {
      key: 'jumpType',
      label: '跳转类型',
      type: 'select',
      options: ['视频教程', '用户手册', '故障排查', '更多入口'].map(item => ({ label: item, value: item }))
    },
    { key: 'description', label: '入口说明', type: 'textarea', rows: 3, placeholder: '请输入该入口在 APP 中的展示说明' },
    { key: 'sort', label: '排序', type: 'number' },
    { key: 'status', label: '状态', type: 'select', options: tutorialEntryStatusOptions.map(({ label, value }) => ({ label, value })) }
  ]
}
</script>
