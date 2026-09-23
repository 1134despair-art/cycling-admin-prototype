<template><business-table-page v-bind="pageConfig" /></template>
<script setup>
import BusinessTablePage from '@/components/business/BusinessTablePage.vue'
import { loginLogModule } from '@/mock/audit'
const pageConfig = {
  title: '登录日志',
  description: '记录后台登录时间、IP、设备、浏览器和登录结果。',
  module: loginLogModule,
  detailRoute: row => `/audit-log/login/detail/${row.id}`,
  allowAdd: false,
  allowBatchDelete: false,
  filters: [
    { key: 'keyword', label: '登录信息', type: 'input', placeholder: '请输入账号/IP/地区/设备/浏览器' },
    { key: 'result', label: '登录结果', type: 'select', options: [{ label: '成功', value: 'success' }, { label: '失败', value: 'failed' }] },
    { key: 'dateRange', label: '登录时间', type: 'daterange', advanced: true }
  ],
  columns: [
    { key: 'userName', label: '管理员账号', width: 140 }, { key: 'ip', label: 'IP地址', width: 130 }, { key: 'location', label: '登录地点', width: 120 }, { key: 'device', label: '设备信息', width: 140 }, { key: 'browser', label: '浏览器', width: 140 }, { key: 'result', label: '结果', type: 'status', width: 120 }, { key: 'createTime', label: '登录时间', width: 180 }
  ],
  rowActions: ['view']
}
</script>
