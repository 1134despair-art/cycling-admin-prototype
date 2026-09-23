<template>
  <div class="stat-card-group">
    <el-card v-for="item in items" :key="item.label" shadow="never" class="stat-card-item">
      <div class="stat-card-item__top">
        <div class="stat-card-item__meta">
          <div class="stat-card-item__label">{{ item.label }}</div>
          <div class="stat-card-item__value">{{ item.value }}<span v-if="item.unit" class="stat-card-item__unit">{{ item.unit }}</span></div>
        </div>
        <div class="stat-card-item__icon" :style="{ color: item.color || '#409eff' }">
          <component :is="item.icon || 'DataLine'" />
        </div>
      </div>
      <div class="stat-card-item__footer">
        <span v-if="item.trend" class="stat-card-item__trend">{{ item.trend }}</span>
        <span v-else class="stat-card-item__trend">较昨日持平</span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] }
})
</script>
