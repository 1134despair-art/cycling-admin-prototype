<template><business-table-page v-bind="pageConfig" /></template>

<script setup>
import BusinessTablePage from '@/components/business/BusinessTablePage.vue'
import { rideSyncModule, rideSyncStatusOptions } from '@/mock/riding'

const pageConfig = {
  title: '同步记录',
  description: '只读查看设备上传骑行数据的同步结果、数据量、记录数与失败原因。',
  module: rideSyncModule,
  allowAdd: false,
  allowBatchDelete: false,
  selectable: false,
  filters: [
    { key: 'keyword', label: '设备信息', type: 'input', placeholder: '设备SN/设备名称/失败原因' },
    { key: 'result', label: '同步结果', type: 'select', options: rideSyncStatusOptions }
  ],
  columns: [
    { key: 'syncTime', label: '同步时间', width: 180 },
    { key: 'deviceSn', label: '设备SN', width: 180 },
    { key: 'deviceName', label: '设备名称', width: 190 },
    { key: 'result', label: '同步结果', type: 'status', options: rideSyncStatusOptions, width: 110 },
    { key: 'dataSize', label: '数据量', width: 100 },
    { key: 'recordCount', label: '记录数', type: 'number', unit: '条', width: 100 },
    { key: 'failureReason', label: '失败原因', width: 220 }
  ],
  rowActions: []
}
</script>
