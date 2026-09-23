<template>
  <section-card :title="title" :description="description" class="trend-chart-block">
    <div ref="chartRef" class="trend-chart-block__canvas"></div>
  </section-card>
</template>

<script setup>
import * as echarts from 'echarts'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SectionCard from './SectionCard.vue'
import useSettingsStore from '@/store/modules/settings'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  color: { type: String, default: '#2563eb' }
})

const chartRef = ref(null)
const settingsStore = useSettingsStore()
let chartInstance = null

function renderChart() {
  if (!chartRef.value) return
  if (!chartInstance) chartInstance = echarts.init(chartRef.value)
  const rootStyle = getComputedStyle(document.documentElement)
  const textColor = rootStyle.getPropertyValue('--admin-text-muted').trim() || '#64748b'
  const borderColor = rootStyle.getPropertyValue('--admin-border-soft').trim() || '#e9edf2'
  const surfaceColor = rootStyle.getPropertyValue('--admin-surface-subtle').trim() || '#f8fafc'
  const primaryTextColor = rootStyle.getPropertyValue('--admin-text-primary').trim() || '#111827'
  chartInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: surfaceColor,
      borderColor,
      textStyle: { color: primaryTextColor }
    },
    grid: { left: 24, right: 16, top: 24, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.labels,
      axisLine: { lineStyle: { color: borderColor } },
      axisTick: { lineStyle: { color: borderColor } },
      axisLabel: { color: textColor }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: borderColor } }
    },
    series: [{ type: 'line', smooth: true, data: props.values, lineStyle: { width: 3, color: props.color }, itemStyle: { color: props.color }, areaStyle: { color: props.color + '22' } }]
  })
}

onMounted(() => {
  nextTick(renderChart)
  window.addEventListener('resize', renderChart)
})

watch(() => [props.labels, props.values], () => nextTick(renderChart), { deep: true })
watch(() => settingsStore.isDark, () => nextTick(renderChart))

onBeforeUnmount(() => {
  window.removeEventListener('resize', renderChart)
  if (chartInstance) chartInstance.dispose()
})
</script>
