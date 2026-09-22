<template><business-table-page v-bind="pageConfig" /></template>

<script setup>
import BusinessTablePage from '@/components/business/BusinessTablePage.vue'
import { rideRecordModule, rideSyncStatusOptions } from '@/mock/riding'

const pageConfig = {
  title: '骑行记录',
  description: '按用户、时间和设备查询骑行记录及同步状态。',
  module: rideRecordModule,
  allowAdd: false,
  allowBatchDelete: false,
  selectable: false,
  filters: [
    { key: 'keyword', label: '记录信息', type: 'input', placeholder: '记录号/账号/昵称/设备SN' },
    { key: 'syncStatus', label: '同步状态', type: 'select', options: rideSyncStatusOptions },
    { key: 'dateRange', label: '骑行时间', type: 'daterange' }
  ],
  columns: [
    { key: 'recordNo', label: '记录编号', width: 180 },
    { key: 'userName', label: '用户账号', width: 120 },
    { key: 'nickName', label: '昵称', width: 100 },
    { key: 'startTime', label: '骑行时间', width: 175 },
    { key: 'distance', label: '距离', type: 'number', unit: 'km', precision: 1, width: 105 },
    { key: 'duration', label: '时长', width: 120 },
    { key: 'averageSpeed', label: '平均速度', type: 'number', unit: 'km/h', precision: 1, width: 120 },
    { key: 'sourceDevice', label: '来源设备', width: 190 },
    { key: 'deviceSn', label: '设备SN', width: 180 },
    { key: 'syncStatus', label: '同步状态', type: 'status', options: rideSyncStatusOptions, width: 110 }
  ],
  rowActions: []
}
</script>
