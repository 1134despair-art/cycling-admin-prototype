<template><business-table-page v-bind="pageConfig" /></template>
<script setup>
import BusinessTablePage from '@/components/business/BusinessTablePage.vue'
import { deliveryResultOptions, routeDeliveryModule } from '@/mock/routes'
const pageConfig = {
  title: '路线下发记录', description: '只读查询路线下发码表任务、目标设备、执行结果与失败原因。', module: routeDeliveryModule,
  allowAdd: false, allowBatchDelete: false, selectable: false, rowActions: [],
  filters: [{ key: 'keyword', label: '任务信息', type: 'input', placeholder: '任务号/路线/设备SN' }, { key: 'result', label: '执行结果', type: 'select', options: deliveryResultOptions }],
  columns: [
    { key: 'taskNo', label: '任务号', width: 190 }, { key: 'routeName', label: '路线名称', width: 180 },
    { key: 'targetSn', label: '目标码表SN', width: 180 }, { key: 'targetDevice', label: '目标设备', width: 180 },
    { key: 'result', label: '执行结果', type: 'status', options: deliveryResultOptions, width: 110 },
    { key: 'failureReason', label: '失败原因', width: 240 }, { key: 'createdAt', label: '下发时间', width: 175 }, { key: 'finishedAt', label: '完成时间', width: 175 }
  ]
}
</script>
