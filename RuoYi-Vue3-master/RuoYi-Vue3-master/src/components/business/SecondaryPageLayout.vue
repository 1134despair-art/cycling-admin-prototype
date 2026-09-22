<template>
  <div class="app-container secondary-page-layout">
    <page-header-card
      :title="title"
      :description="description"
      :secondary="true"
      :show-back="showBack"
      @back="$emit('back')"
    >
      <template v-if="$slots.actions" #extra>
        <slot name="actions" />
      </template>
    </page-header-card>

    <div v-if="$slots.summary" class="secondary-page-layout__summary secondary-page-layout__summary-card">
      <slot name="summary" />
    </div>

    <div class="secondary-page-layout__content">
      <slot />
    </div>

    <div v-if="$slots.footer" class="secondary-page-layout__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import PageHeaderCard from './PageHeaderCard.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  showBack: { type: Boolean, default: true }
})

defineEmits(['back'])
</script>
