<template>
  <header class="page-header-card" :class="{ 'page-header-card--secondary': secondary }">
    <div class="page-header-card__inner">
      <div class="page-header-card__content">
        <div v-if="displayBreadcrumbItems.length || showBack" class="page-header-card__topline">
          <div v-if="showBack" class="page-header-card__back">
            <el-button link type="primary" icon="ArrowLeft" @click="$emit('back')">返回</el-button>
          </div>
          <el-breadcrumb v-if="displayBreadcrumbItems.length" separator="/" class="page-breadcrumb">
            <el-breadcrumb-item v-for="item in displayBreadcrumbItems" :key="item">{{ item }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <h1 class="page-title">{{ title }}</h1>
        <div v-if="description" class="page-desc">{{ description }}</div>
      </div>
      <div v-if="$slots.extra" class="page-header-card__extra">
        <slot name="extra" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  showBack: { type: Boolean, default: false },
  secondary: { type: Boolean, default: false }
})

defineEmits(['back'])

const route = useRoute()

const breadcrumbItems = computed(() => {
  const items = route.matched
    .map(item => item.meta?.title)
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)

  if (!items.length) return [props.title]
  if (items[items.length - 1] !== props.title) items.push(props.title)
  return items
})

const displayBreadcrumbItems = computed(() => {
  if (!props.showBack) return []
  if (breadcrumbItems.value.length <= 1) return []

  const items = [...breadcrumbItems.value]
  if (items[items.length - 1] === props.title) {
    items.pop()
  }

  return items
})
</script>
