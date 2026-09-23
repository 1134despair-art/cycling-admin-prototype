<template>
  <business-table-page v-bind="pageConfig" />
</template>

<script setup>
import BusinessTablePage from '@/components/business/BusinessTablePage.vue'
import { homeBannerModule, productStatusOptions } from '@/mock/content'

const statusFilterOptions = productStatusOptions.map(({ label, value }) => ({ label, value }))

const pageConfig = {
  title: '首页轮播图管理',
  description: '维护首页轮播图的标题、封面、展示位置、跳转目标、排序与上下架状态。',
  module: homeBannerModule,
  filters: [
    { key: 'keyword', label: '轮播图信息', type: 'input', placeholder: '请输入标题/位置/跳转目标' },
    { key: 'displayPosition', label: '展示位置', type: 'select', options: ['首页首屏', '首页次屏', '消息中心入口'].map(item => ({ label: item, value: item })) },
    { key: 'status', label: '状态', type: 'select', options: statusFilterOptions }
  ],
  columns: [
    { key: 'bannerName', label: '轮播图标题', width: 220 },
    { key: 'displayPosition', label: '展示位置', width: 140 },
    { key: 'coverImage', label: '封面图', type: 'image', width: 120 },
    { key: 'jumpTarget', label: '跳转目标', width: 220 },
    { key: 'sort', label: '排序', type: 'number', width: 80 },
    { key: 'status', label: '状态', type: 'status', options: productStatusOptions, width: 120 },
    { key: 'updatedAt', label: '更新时间', width: 180 }
  ],
  detailFields: [
    { key: 'bannerName', label: '轮播图标题' },
    { key: 'displayPosition', label: '展示位置' },
    { key: 'coverImage', label: '封面图', type: 'image' },
    { key: 'jumpTarget', label: '跳转目标' },
    { key: 'bannerDescription', label: '运营说明' },
    { key: 'sort', label: '排序', type: 'number' },
    { key: 'status', label: '状态', type: 'status', options: productStatusOptions },
    { key: 'updatedAt', label: '更新时间' }
  ],
  formFields: [
    { key: 'bannerName', label: '轮播图标题' },
    { key: 'displayPosition', label: '展示位置', type: 'select', options: ['首页首屏', '首页次屏', '消息中心入口'].map(item => ({ label: item, value: item })) },
    { key: 'jumpTarget', label: '跳转目标' },
    { key: 'coverImage', label: '封面图', type: 'upload' },
    { key: 'bannerDescription', label: '运营说明', type: 'textarea', rows: 4, full: true },
    { key: 'sort', label: '排序', type: 'number' },
    { key: 'status', label: '状态', type: 'select', options: statusFilterOptions }
  ]
}
</script>
