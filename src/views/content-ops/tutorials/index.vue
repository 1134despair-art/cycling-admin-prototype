<template>
  <business-table-page v-bind="pageConfig" />
</template>

<script setup>
import BusinessTablePage from '@/components/business/BusinessTablePage.vue'
import { tutorialModule, tutorialStatusOptions } from '@/mock/content'

const pageConfig = {
  title: '视频教程管理',
  description: '维护 APP 教程模块下的视频教程内容，支持配置封面图、所属分组、所属模块与视频链接。',
  module: tutorialModule,
  filters: [
    { key: 'keyword', label: '教程信息', type: 'input', placeholder: '请输入教程标题/产品分组/模块入口' },
    { key: 'status', label: '状态', type: 'select', options: tutorialStatusOptions.map(({ label, value }) => ({ label, value })) }
  ],
  columns: [
    { key: 'title', label: '教程标题', width: 260 },
    { key: 'productGroup', label: '产品分组', width: 160 },
    { key: 'moduleName', label: '模块入口', width: 120 },
    { key: 'coverImage', label: '封面图', type: 'image', width: 120 },
    { key: 'relatedProduct', label: '关联产品', width: 160 },
    { key: 'videoLink', label: '视频链接', width: 240 },
    { key: 'sort', label: '排序', width: 90 },
    { key: 'status', label: '状态', type: 'status', options: tutorialStatusOptions, width: 120 },
    { key: 'updatedAt', label: '更新时间', width: 180 }
  ],
  formFields: [
    { key: 'title', label: '教程标题', placeholder: '请输入教程标题' },
    {
      key: 'productGroup',
      label: '产品分组',
      type: 'select',
      options: ['公路电变套件', 'TT 公路电变套件', '山地电变', '其它'].map(item => ({ label: item, value: item }))
    },
    { key: 'moduleName', label: '模块入口', placeholder: '请输入所属模块，如手变 / 前拨 / 视频' },
    { key: 'coverImage', label: '封面图', type: 'upload' },
    { key: 'videoLink', label: '视频链接', placeholder: '请输入哔哩哔哩或其它视频播放链接' },
    { key: 'relatedProduct', label: '关联产品', placeholder: '请输入关联产品名称' },
    { key: 'sort', label: '排序', type: 'number' },
    { key: 'status', label: '状态', type: 'select', options: tutorialStatusOptions.map(({ label, value }) => ({ label, value })) }
  ],
  detailFields: [
    { key: 'title', label: '教程标题' },
    { key: 'productGroup', label: '产品分组' },
    { key: 'moduleName', label: '模块入口' },
    { key: 'coverImage', label: '封面图', type: 'image' },
    { key: 'videoLink', label: '视频链接' },
    { key: 'relatedProduct', label: '关联产品' },
    { key: 'sort', label: '排序', type: 'number' },
    { key: 'status', label: '状态', type: 'status', options: tutorialStatusOptions },
    { key: 'updatedAt', label: '更新时间' }
  ]
}
</script>
