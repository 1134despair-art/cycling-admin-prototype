<template>
  <div class="search-panel-card">
    <el-form :model="model" label-width="74px" class="search-panel__form" @submit.prevent>
      <div class="search-panel__row">
        <div class="search-panel__fields">
          <slot />
        </div>
        <div class="search-panel__actions">
          <el-button type="primary" size="small" @click="$emit('search')">搜索</el-button>
          <el-button size="small" @click="$emit('reset')">清空</el-button>
          <el-button v-if="hasMore" text size="small" @click="expanded = !expanded">
            {{ expanded ? '收起' : '展开' }}
          </el-button>
        </div>
      </div>

      <div v-if="hasMore && expanded" class="search-panel__advanced">
        <div class="search-panel__fields search-panel__fields--advanced">
          <slot name="more" />
        </div>
      </div>

      <div v-if="hasToolbar" class="search-panel__toolbar">
        <slot name="toolbar" />
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { computed, ref, useSlots } from 'vue'

defineProps({
  model: { type: Object, required: true }
})

defineEmits(['search', 'reset'])

const slots = useSlots()
const expanded = ref(false)
const hasMore = computed(() => Boolean(slots.more))
const hasToolbar = computed(() => Boolean(slots.toolbar))
</script>
