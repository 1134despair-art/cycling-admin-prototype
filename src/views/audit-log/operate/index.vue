<template><business-table-page v-bind="pageConfig" /></template>
<script setup>
import BusinessTablePage from '@/components/business/BusinessTablePage.vue'
import { operateLogModule } from '@/mock/audit'

const resultOptions = [
  { label: '成功', value: 'success', type: 'success' },
  { label: '失败', value: 'failed', type: 'danger' }
]

const pageConfig = {
  title: '操作日志',
  description: '记录后台新增、修改、删除、导出、发布、下发等关键操作。',
  module: operateLogModule,
  detailRoute: row => `/audit-log/operate/detail/${row.id}`,
  allowAdd: false,
  allowBatchDelete: false,
  filters: [
    { key: 'keyword', label: '操作信息', type: 'input', placeholder: '请输入日志名称/操作人/模块/权限标识/请求地址' },
    { key: 'requestMethod', label: '请求方式', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'].map(value => ({ label: value, value })) },
    { key: 'result', label: '操作结果', type: 'select', options: resultOptions },
    { key: 'dateRange', label: '发生时间', type: 'daterange', advanced: true }
  ],
  columns: [
    { key: 'id', label: '日志ID', width: 90, align: 'center' },
    { key: 'logName', label: '日志名称', width: 180 },
    { key: 'operator', label: '操作人', width: 120 },
    { key: 'moduleName', label: '操作模块', width: 150 },
    { key: 'action', label: '关键动作', width: 160 },
    { key: 'permissionKey', label: '权限标识', width: 180 },
    { key: 'requestMethod', label: '请求方式', width: 100, align: 'center' },
    { key: 'requestUrl', label: '请求地址', width: 240 },
    { key: 'requestParams', label: '请求参数', width: 240 },
    { key: 'ip', label: 'IP地址', width: 130 },
    { key: 'device', label: '设备', width: 120 },
    { key: 'browser', label: '浏览器', width: 120 },
    { key: 'result', label: '结果', type: 'status', width: 100, options: resultOptions, align: 'center' },
    { key: 'cost', label: '耗时(ms)', type: 'number', width: 100, align: 'center' },
    { key: 'createTime', label: '发生时间', width: 180 }
  ],
  rowActions: ['view']
}
</script>
