<template>
  <el-dialog
    v-model="visibleProxy"
    width="480px"
    append-to-body
    class="confirm-action-dialog"
    align-center
    destroy-on-close
  >
    <template #header>
      <div class="confirm-action-dialog__title">{{ title }}</div>
    </template>

    <div class="confirm-action-dialog__body">
      <div v-if="description" class="confirm-action-dialog__desc">{{ description }}</div>
      <div v-if="targetName" class="confirm-action-dialog__target">操作对象：{{ targetName }}</div>
      <div v-if="impact" class="confirm-action-dialog__impact">{{ impact }}</div>
    </div>

    <template #footer>
      <el-button @click="visibleProxy = false">取消</el-button>
      <el-button :type="confirmType" @click="$emit('confirm')">{{ confirmText }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  targetName: { type: String, default: '' },
  impact: { type: String, default: '' },
  confirmText: { type: String, default: '确认' },
  confirmType: { type: String, default: 'danger' }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visibleProxy = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})
</script>
