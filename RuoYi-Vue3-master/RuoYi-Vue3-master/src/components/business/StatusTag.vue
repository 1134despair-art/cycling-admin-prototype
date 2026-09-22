<template>
  <el-tag :type="tagType" effect="light" round class="business-status-tag">{{ label }}</el-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: [String, Number, Boolean], default: '' },
  options: { type: Array, default: () => [] }
})

const builtinMap = {
  normal: { label: '正常', type: 'success' }, approved: { label: '已通过', type: 'success' }, active: { label: '进行中', type: 'success' }, enabled: { label: '启用', type: 'success' }, success: { label: '成功', type: 'success' }, paid: { label: '已打款', type: 'success' }, online: { label: '已上架', type: 'success' }, pending: { label: '待处理', type: 'warning' }, frozen: { label: '冻结', type: 'warning' }, warning: { label: '预警', type: 'warning' }, rejected: { label: '已驳回', type: 'danger' }, banned: { label: '封禁', type: 'danger' }, failed: { label: '失败', type: 'danger' }, disabled: { label: '停用', type: 'info' }, offline: { label: '已下架', type: 'info' }, draft: { label: '草稿', type: 'info' }, published: { label: '已发布', type: 'success' }
}

const matched = computed(() => props.options.find(item => String(item.value) === String(props.value)) || builtinMap[props.value] || { label: props.value || '--', type: 'info' })
const label = computed(() => matched.value.label)
const tagType = computed(() => matched.value.type)
</script>
