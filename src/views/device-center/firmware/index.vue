<template><business-table-page v-bind="pageConfig" /></template>
<script setup>
import BusinessTablePage from '@/components/business/BusinessTablePage.vue'
import { firmwareModule, firmwareStatusOptions, setFirmwareStatus } from '@/mock/devices'
const statusOptions = firmwareStatusOptions.map(({ label, value }) => ({ label, value }))
const componentOptions = ['整机', '前拨', '后拨', '控制器'].map(value => ({ label: value, value }))
const pageConfig = {
  title: '固件包管理', description: '按设备型号和升级部件维护固件包、升级日志说明与发布状态，并从详情页创建 OTA 推送任务。', module: firmwareModule,
  filters: [
    { key: 'keyword', label: '固件信息', type: 'input', placeholder: '版本/型号/说明' },
    { key: 'componentType', label: '升级部件', type: 'select', options: componentOptions },
    { key: 'status', label: '发布状态', type: 'select', options: statusOptions }
  ],
  columns: [
    { key: 'versionName', label: '版本号', width: 150 }, { key: 'targetModel', label: '适配设备型号', width: 160 },
    { key: 'componentType', label: '升级部件', width: 110 }, { key: 'fileName', label: '固件文件', width: 190 },
    { key: 'packageSize', label: '包大小', width: 100 }, { key: 'releaseNotes', label: '升级日志说明', width: 260 },
    { key: 'status', label: '发布状态', type: 'status', options: firmwareStatusOptions, width: 110 }, { key: 'publishTime', label: '发布时间', width: 175 }
  ],
  formFields: [
    { key: 'versionName', label: '版本号' }, { key: 'versionCode', label: '版本编码' }, { key: 'targetModel', label: '适配型号' },
    { key: 'componentType', label: '升级部件', type: 'select', options: componentOptions }, { key: 'fileName', label: '固件文件' },
    { key: 'fileUrl', label: '文件地址' }, { key: 'packageSize', label: '包大小' },
    { key: 'releaseNotes', label: '升级日志说明', type: 'textarea', full: true }, { key: 'status', label: '发布状态', type: 'select', options: statusOptions, default: 'draft' },
    { key: 'publishTime', label: '发布时间', type: 'date' }
  ],
  detailRoute: row => `/device-center/firmware/detail/${row.id}`,
  rowActions: [
    'view',
    'edit',
    { key: 'publish', when: row => row.status === 'draft', successMessage: '固件包已发布' },
    { key: 'disable', when: row => row.status === 'published', successMessage: '固件包已停用' },
    { key: 'restore', label: '重新发布', when: row => row.status === 'disabled', successMessage: '固件包已重新发布' },
    'delete'
  ],
  actionHandlers: {
    publish: row => setFirmwareStatus(row.id, 'published'),
    disable: row => setFirmwareStatus(row.id, 'disabled'),
    restore: row => setFirmwareStatus(row.id, 'published')
  },
  confirmMap: {
    publish: { title: '确认发布固件包', description: '发布后该固件包可以创建 OTA 推送任务。', confirmText: '确认发布', confirmType: 'success' },
    disable: { title: '确认停用固件包', description: '停用后不能再创建新的 OTA 推送任务，已有任务不受影响。', confirmText: '确认停用', confirmType: 'warning' },
    restore: { title: '确认重新发布', description: '重新发布后将恢复 OTA 推送能力。', confirmText: '确认发布', confirmType: 'success' }
  },
  actionColumnWidth: 210
}
</script>
