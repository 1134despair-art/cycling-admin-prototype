<template>
  <business-table-page v-bind="pageConfig" />
</template>

<script setup>
import BusinessTablePage from '@/components/business/BusinessTablePage.vue'
import { activationStatusOptions, deviceCategoryOptions, deviceModule, deviceStatusOptions, setDeviceDisabled, unbindDeviceByDeviceId } from '@/mock/devices'

const pageConfig = {
  title: '设备列表',
  description: '查看设备 SN、产品、型号、品类、固件、激活与所属用户，支持设备解绑、禁用和解禁。',
  module: deviceModule,
  primaryKey: 'id',
  allowAdd: false,
  allowBatchDelete: false,
  selectable: false,
  detailRoute: row => '/device-center/devices/detail/' + row.id,
  filters: [
    { key: 'keyword', label: '设备信息', type: 'input', placeholder: 'SN/产品/型号/所属用户' },
    { key: 'categoryName', label: '设备品类', type: 'select', options: deviceCategoryOptions },
    { key: 'activationStatus', label: '激活状态', type: 'select', options: activationStatusOptions },
    { key: 'status', label: '设备状态', type: 'select', options: deviceStatusOptions }
  ],
  columns: [
    { key: 'sn', label: '设备SN', width: 180 },
    { key: 'productName', label: '产品名称', width: 190 },
    { key: 'model', label: '型号', width: 130 },
    { key: 'categoryName', label: '品类', width: 120 },
    { key: 'firmwareVersion', label: '固件版本', width: 140 },
    { key: 'activationStatus', label: '激活状态', type: 'status', options: activationStatusOptions, width: 110 },
    { key: 'activationTime', label: '激活时间', width: 175 },
    { key: 'userName', label: '所属用户', width: 120 },
    { key: 'status', label: '设备状态', type: 'status', options: deviceStatusOptions, width: 110 },
    { key: 'lastSyncTime', label: '最近同步', width: 175 }
  ],
  rowActions: [
    'view',
    { key: 'unbind', label: '解绑', type: 'danger', when: row => Boolean(row.userId), successMessage: '设备已解绑' },
    { key: 'disable', label: '禁用', type: 'warning', when: row => row.status !== 'disabled', successMessage: '设备已禁用' },
    { key: 'enable', label: '解禁', type: 'success', when: row => row.status === 'disabled', successMessage: '设备已解禁' }
  ],
  actionHandlers: {
    unbind: row => unbindDeviceByDeviceId(row.id),
    disable: row => setDeviceDisabled(row.id, true),
    enable: row => setDeviceDisabled(row.id, false)
  },
  confirmMap: {
    unbind: {
      title: '确认解绑设备',
      description: '解绑后将清除设备与当前用户的绑定关系。',
      impact: '设备及历史绑定记录会保留，用户设备数量将同步更新。',
      confirmText: '确认解绑',
      confirmType: 'danger'
    }
  }
}
</script>
