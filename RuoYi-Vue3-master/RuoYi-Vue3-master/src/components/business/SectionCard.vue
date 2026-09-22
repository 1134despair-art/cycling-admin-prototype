<template>
  <el-card shadow="never" class="section-card">
    <template v-if="title || description || $slots.extra" #header>
      <div class="section-card__header">
        <div class="section-card__meta">
          <h2 v-if="title" class="section-card__title">{{ title }}</h2>
          <div v-if="description" class="section-card__desc">{{ description }}</div>
        </div>
        <div v-if="$slots.extra" class="section-card__extra"><slot name="extra" /></div>
      </div>
    </template>
    <div class="section-card__body">
      <slot />
    </div>
  </el-card>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' }
})
</script>
