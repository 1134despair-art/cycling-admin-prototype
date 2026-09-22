<template>
  <div class="business-toolbar">
    <div class="business-toolbar__left">
      <slot />
      <el-button v-if="selectedCount" plain size="small" type="danger" @click="$emit('batch-delete')">批量删除</el-button>
    </div>
    <div class="business-toolbar__right">
      <el-button plain size="small" @click="$emit('refresh')">刷新</el-button>
      <el-button plain size="small" @click="$emit('export')">导出</el-button>
      <el-popover placement="bottom-end" trigger="click" width="220">
        <template #reference>
          <el-button plain size="small">列设置</el-button>
        </template>
        <el-checkbox-group :model-value="checkedKeys" @change="handleChange">
          <div v-for="column in columns" :key="column.key" class="business-toolbar__column-item">
            <el-checkbox :value="column.key">{{ column.label }}</el-checkbox>
          </div>
        </el-checkbox-group>
      </el-popover>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedCount: { type: Number, default: 0 },
  columns: { type: Array, default: () => [] }
})

const emit = defineEmits(['refresh', 'export', 'batch-delete', 'update:columns'])

const checkedKeys = computed(() => props.columns.filter(item => item.visible !== false).map(item => item.key))

function handleChange(values) {
  emit('update:columns', props.columns.map(item => ({ ...item, visible: values.includes(item.key) })))
}
</script>
