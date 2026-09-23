<template>
  <business-table-page v-bind="pageConfig" />
</template>

<script setup>
import BusinessTablePage from '@/components/business/BusinessTablePage.vue'
import { manualFaqModule, tutorialStatusOptions } from '@/mock/content'

const pageConfig = {
  title: '产品说明书管理',
  description: '维护 APP 端产品说明书与故障排查内容。说明书以 PDF 文件为主，故障排查以问题与正文内容为主。',
  module: manualFaqModule,
  filters: [
    { key: 'keyword', label: '内容信息', type: 'input', placeholder: '请输入标题/产品分组/关键词' },
    {
      key: 'contentType',
      label: '内容类型',
      type: 'select',
      options: ['用户手册', '故障排查'].map(item => ({ label: item, value: item }))
    },
    { key: 'status', label: '状态', type: 'select', options: tutorialStatusOptions.map(({ label, value }) => ({ label, value })) }
  ],
  columns: [
    { key: 'title', label: '标题', width: 260 },
    { key: 'contentType', label: '内容类型', width: 120 },
    { key: 'productGroup', label: '产品分组', width: 160 },
    { key: 'keyword', label: '关键词', width: 180 },
    { key: 'pdfFile', label: 'PDF 文件', width: 180 },
    { key: 'sort', label: '排序', width: 90 },
    { key: 'status', label: '状态', type: 'status', options: tutorialStatusOptions, width: 120 },
    { key: 'updatedAt', label: '更新时间', width: 180 }
  ],
  formFields: [
    { key: 'title', label: '标题', placeholder: '请输入手册标题或故障问题标题' },
    {
      key: 'contentType',
      label: '内容类型',
      type: 'select',
      options: ['用户手册', '故障排查'].map(item => ({ label: item, value: item }))
    },
    {
      key: 'productGroup',
      label: '产品分组',
      type: 'select',
      options: ['公路电变套件', 'TT 公路电变套件', '山地电变', '其它'].map(item => ({ label: item, value: item }))
    },
    { key: 'keyword', label: '关键词', placeholder: '请输入关键词，多个使用逗号分隔' },
    { key: 'pdfFile', label: 'PDF 文件', type: 'upload', accept: '.pdf' },
    { key: 'contentText', label: '正文内容', type: 'textarea', rows: 6, placeholder: '请输入故障排查正文或手册说明' },
    { key: 'sort', label: '排序', type: 'number' },
    { key: 'status', label: '状态', type: 'select', options: tutorialStatusOptions.map(({ label, value }) => ({ label, value })) }
  ],
  detailFields: [
    { key: 'title', label: '标题' },
    { key: 'contentType', label: '内容类型' },
    { key: 'productGroup', label: '产品分组' },
    { key: 'keyword', label: '关键词' },
    { key: 'pdfFile', label: 'PDF 文件' },
    { key: 'contentText', label: '正文内容' },
    { key: 'sort', label: '排序', type: 'number' },
    { key: 'status', label: '状态', type: 'status', options: tutorialStatusOptions },
    { key: 'updatedAt', label: '更新时间' }
  ]
}
</script>
