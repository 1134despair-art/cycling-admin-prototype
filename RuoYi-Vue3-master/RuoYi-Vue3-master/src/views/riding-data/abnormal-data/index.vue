<template><business-table-page v-bind="pageConfig" /></template>

<script setup>
import BusinessTablePage from '@/components/business/BusinessTablePage.vue'
import { abnormalDataModule, abnormalStatusOptions } from '@/mock/riding'

function updateIssue(row, payload) {
  return abnormalDataModule.update({
    id: row.id,
    ...payload,
    handler: 'data_admin',
    handleRemark: payload.handleRemark
  })
}

const pageConfig = {
  title: '异常数据处理',
  description: '核对轨迹点丢失、里程跳变等数据质量问题，并记录修复或忽略结果。',
  module: abnormalDataModule,
  allowAdd: false,
  allowBatchDelete: false,
  selectable: false,
  filters: [
    { key: 'keyword', label: '异常信息', type: 'input', placeholder: '记录号/用户/异常类型' },
    { key: 'status', label: '处理状态', type: 'select', options: abnormalStatusOptions }
  ],
  columns: [
    { key: 'recordNo', label: '骑行记录', width: 180 },
    { key: 'userName', label: '用户账号', width: 120 },
    { key: 'abnormalType', label: '异常类型', width: 130 },
    { key: 'detectedValue', label: '检测值', width: 180 },
    { key: 'expectedRange', label: '参考范围', width: 170 },
    { key: 'status', label: '状态', type: 'status', options: abnormalStatusOptions, width: 120 },
    { key: 'handler', label: '处理人', width: 120 },
    { key: 'handleRemark', label: '处理说明', width: 210 },
    { key: 'detectedAt', label: '发现时间', width: 180 }
  ],
  rowActions: [
    {
      key: 'fix',
      label: '修复',
      type: 'success',
      when: row => row.status === 'pending',
      successMessage: '异常数据已修复'
    },
    {
      key: 'ignore',
      label: '忽略',
      type: 'info',
      when: row => row.status === 'pending',
      successMessage: '已忽略该异常'
    }
  ],
  actionHandlers: {
    fix: row => updateIssue(row, { status: 'resolved', handleRemark: '已依据有效轨迹点重新计算' }),
    ignore: row => updateIssue(row, { status: 'ignored', handleRemark: '确认数据有效，忽略告警' })
  }
}
</script>
