<template>
  <div class="unit-number-input">
    <el-input-number
      v-bind="$attrs"
      :model-value="modelValue"
      controls-position="right"
      class="unit-number-input__control"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <span class="unit-number-input__suffix">{{ unit }}</span>
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  modelValue: {
    type: [Number, String],
    default: 0
  },
  unit: {
    type: String,
    required: true
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped lang="scss">
.unit-number-input {
  display: inline-flex;
  width: 100%;
  align-items: center;
  gap: 10px;
}

.unit-number-input__control {
  flex: 1;
}

.unit-number-input__suffix {
  flex: 0 0 auto;
  min-width: 24px;
  font-size: 13px;
  color: var(--admin-text-muted, #64748b);
}
</style>
