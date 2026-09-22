<template>
  <business-table-page v-bind="pageConfig" />
</template>

<script setup>
import BusinessTablePage from '@/components/business/BusinessTablePage.vue'
import { displayToggleOptions, productCategoryModule, productStatusOptions } from '@/mock/products'

const statusFilterOptions = productStatusOptions.map(({ label, value }) => ({ label, value }))
const displayFilterOptions = displayToggleOptions.map(({ label, value }) => ({ label, value }))

const pageConfig = {
  title: '产品分类管理',
  description: '维护产品分类名称、图标、排序及 APP / 官网 展示状态，统一产品中心双端分类配置。',
  module: productCategoryModule,
  filters: [
    { key: 'keyword', label: '分类信息', type: 'input', placeholder: '请输入分类名称/图标/说明' },
    { key: 'appVisible', label: 'APP 展示', type: 'select', options: displayFilterOptions },
    { key: 'webVisible', label: '官网展示', type: 'select', options: displayFilterOptions },
    { key: 'status', label: '状态', type: 'select', options: statusFilterOptions }
  ],
  columns: [
    { key: 'categoryName', label: '分类名称', width: 180 },
    { key: 'icon', label: '图标标识', width: 140 },
    { key: 'description', label: '分类说明', width: 280 },
    { key: 'appVisible', label: 'APP 展示', type: 'status', options: displayToggleOptions, width: 110 },
    { key: 'webVisible', label: '官网展示', type: 'status', options: displayToggleOptions, width: 110 },
    { key: 'sort', label: '排序', width: 90 },
    { key: 'status', label: '状态', type: 'status', options: productStatusOptions, width: 120 },
    { key: 'updatedAt', label: '更新时间', width: 180 }
  ],
  formFields: [
    { key: 'categoryName', label: '分类名称' },
    { key: 'icon', label: '图标标识' },
    { key: 'description', label: '分类说明', type: 'textarea', rows: 3, full: true },
    { key: 'appVisible', label: 'APP 展示', type: 'select', options: displayFilterOptions, default: true },
    { key: 'webVisible', label: '官网展示', type: 'select', options: displayFilterOptions, default: true },
    { key: 'sort', label: '排序', type: 'number' },
    { key: 'status', label: '状态', type: 'select', options: statusFilterOptions }
  ]
}
</script>
