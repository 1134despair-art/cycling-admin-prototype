<template>
  <div class="app-container business-page">
    <div class="business-page-shell">
      <page-header-card :title="pageHeader.title" :description="pageHeader.description" />

      <div class="dashboard-overview-grid">
        <article v-for="card in overviewCards" :key="card.key" class="dashboard-overview-card">
          <div class="dashboard-overview-card__top">
            <div class="dashboard-overview-card__heading">
              <div class="dashboard-overview-card__title">{{ card.title }}</div>
              <div class="dashboard-overview-card__desc">{{ card.desc }}</div>
            </div>
            <span :class="['dashboard-overview-card__trend', card.trend >= 0 ? 'is-up' : 'is-down']">
              {{ card.trend >= 0 ? '+' : '' }}{{ card.trend }}%
            </span>
          </div>
          <div class="dashboard-overview-card__value">
            {{ card.value }}
            <span class="dashboard-overview-card__unit">{{ card.unit }}</span>
          </div>
          <div class="dashboard-overview-card__footer">
            <span class="dashboard-overview-card__period">{{ card.period }}</span>
            <div class="dashboard-overview-spark" aria-hidden="true">
              <span
                v-for="(value, index) in card.sparkValues"
                :key="index"
                class="dashboard-overview-spark__bar"
                :style="{ height: `${value}%` }"
              />
            </div>
          </div>
        </article>
      </div>

      <section-card
        class="dashboard-trend-card"
        title="核心数据趋势"
        description="切换查看新增用户、活跃用户、设备在线和路线导入趋势。"
      >
        <template #extra>
          <el-radio-group v-model="activePeriod" size="small">
            <el-radio-button value="7">近 7 日</el-radio-button>
            <el-radio-button value="30">近 30 日</el-radio-button>
          </el-radio-group>
        </template>
        <div class="trend-panel">
          <div class="trend-panel__header">
            <div class="trend-panel__tabs" role="group" aria-label="用户趋势指标">
              <button
                v-for="metric in trendMetrics"
                :key="metric.key"
                type="button"
                :class="['trend-panel__tab', { 'is-active': metric.key === activeTrendKey }]"
                :aria-pressed="metric.key === activeTrendKey"
                @click="switchTrend(metric.key)"
              >
                {{ metric.label }}
              </button>
            </div>
            <div class="trend-panel__summary">{{ activeTrend.summary }}</div>
          </div>

          <div class="trend-panel__stats">
            <div class="trend-panel__stat">
              <span class="label">当前周期累计</span>
              <span class="value">{{ activeTrend.total }}{{ activeTrend.unit }}</span>
            </div>
            <div class="trend-panel__stat">
              <span class="label">日均用户</span>
              <span class="value">{{ activeTrend.average }}{{ activeTrend.unit }}</span>
            </div>
            <div class="trend-panel__stat">
              <span class="label">单日峰值</span>
              <span class="value">{{ activeTrend.peak }}{{ activeTrend.unit }}</span>
            </div>
            <div class="trend-panel__stat">
              <span class="label">单日低谷</span>
              <span class="value">{{ activeTrend.low }}{{ activeTrend.unit }}</span>
            </div>
          </div>

          <div class="trend-panel__chart-area">
            <div class="trend-panel__chart-value">
              <strong>{{ activeTrend.total }}</strong>
              <span>{{ activeTrend.unit }}</span>
            </div>
            <div class="trend-panel__chart-caption">近 {{ activePeriod }} 日累计{{ activeTrend.label }}</div>

            <div class="trend-panel__chart-shell">
              <div class="trend-panel__y-axis">
                <span v-for="item in trendYAxisLabels" :key="item.key">{{ item.text }}</span>
              </div>

              <div class="trend-panel__chart">
                <div class="trend-panel__grid">
                  <span v-for="line in 4" :key="line" />
                </div>
                <svg class="trend-panel__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="dashboardUserTrendArea" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stop-color="rgba(22, 119, 255, 0.24)" />
                      <stop offset="100%" stop-color="rgba(22, 119, 255, 0.02)" />
                    </linearGradient>
                  </defs>
                  <path :d="trendAreaPath" fill="url(#dashboardUserTrendArea)" />
                  <path :d="trendLinePath" fill="none" stroke="#1677ff" stroke-width="2.4" stroke-linecap="round" />
                </svg>
                <el-tooltip
                  v-for="point in trendPoints"
                  :key="point.label"
                  placement="top"
                  effect="light"
                >
                  <template #content>
                    <div class="trend-panel__tooltip">
                      <div class="trend-panel__tooltip-label">{{ point.label }}</div>
                      <div class="trend-panel__tooltip-value">{{ point.value }}{{ activeTrend.unit }}</div>
                    </div>
                  </template>
                  <span
                    class="trend-panel__point"
                    :style="{ left: `${point.x}%`, top: `${point.y}%` }"
                  >
                    <i />
                  </span>
                </el-tooltip>
              </div>
            </div>

            <div class="trend-panel__axis">
              <span v-for="label in trendLabels" :key="label">{{ label }}</span>
            </div>
          </div>
        </div>
      </section-card>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import PageHeaderCard from '@/components/business/PageHeaderCard.vue'
import SectionCard from '@/components/business/SectionCard.vue'
import { getDashboardData } from '@/mock/dashboard'

const dashboardData = getDashboardData()
const activePeriod = ref('7')
const activeTrendKey = ref('newUsers')

const overviewCards = computed(() => dashboardData.overviewCards)
const activeTrendGroup = computed(() => dashboardData.trends[activePeriod.value])
const trendMetrics = computed(() => activeTrendGroup.value.metrics)
const trendLabels = computed(() => activeTrendGroup.value.labels)
const pageHeader = computed(() => ({
  title: '数据看板',
  description: '集中查看用户、设备、路线和消息的核心数量与 7/30 日趋势。'
}))

const activeTrend = computed(() => {
  return trendMetrics.value.find((item) => item.key === activeTrendKey.value) || trendMetrics.value[0]
})

const trendPoints = computed(() => {
  const values = activeTrend.value?.values || []
  const max = Math.max(...values, 1)
  const chartHeight = 72
  const chartBottom = 14
  return values.map((value, index) => {
    const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100
    const normalized = value / max
    const y = 100 - (normalized * chartHeight + chartBottom)
    return {
      label: trendLabels.value[index],
      value,
      x,
      y
    }
  })
})

const trendYAxisLabels = computed(() => {
  const values = activeTrend.value?.values || []
  const max = Math.max(...values, 0)
  const steps = [1, 0.66, 0.33, 0]
  return steps.map((ratio, index) => ({
    key: `${activeTrend.value?.key || 'trend'}-${index}`,
    text: `${Math.round(max * ratio)}${activeTrend.value?.unit || ''}`
  }))
})

const trendLinePath = computed(() => {
  return trendPoints.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
})

const trendAreaPath = computed(() => {
  if (!trendPoints.value.length) {
    return ''
  }
  const first = trendPoints.value[0]
  const last = trendPoints.value[trendPoints.value.length - 1]
  return `${trendLinePath.value} L ${last.x} 100 L ${first.x} 100 Z`
})

function switchTrend(key) {
  activeTrendKey.value = key
}
</script>

<style scoped lang="scss">
.business-page-shell :deep(.page-header-card) {
  margin-bottom: 0;
}

.dashboard-overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 0;
}

.dashboard-overview-card {
  min-width: 0;
  padding: 18px;
  border: 1px solid var(--admin-border-soft, #e9edf2);
  border-radius: 8px;
  background: var(--admin-surface, #fff);
  box-shadow: none;
}

.dashboard-overview-card__top,
.dashboard-overview-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dashboard-overview-card__heading {
  min-width: 0;
}

.dashboard-overview-card__title {
  color: var(--admin-text-primary, #111827);
  font-size: 15px;
  font-weight: 600;
}

.dashboard-overview-card__desc,
.trend-panel__summary,
.trend-panel__chart-caption {
  color: var(--admin-text-muted, #64748b);
  font-size: 13px;
  line-height: 1.6;
}

.dashboard-overview-card__desc {
  margin-top: 4px;
}

.dashboard-overview-card__trend {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.dashboard-overview-card__trend.is-up {
  color: #15803d;
  background: rgba(22, 163, 74, 0.1);
}

.dashboard-overview-card__trend.is-down {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
}

.dashboard-overview-card__value {
  margin: 14px 0 10px;
  color: var(--admin-text-primary, #111827);
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
}

.dashboard-overview-card__unit {
  margin-left: 6px;
  color: var(--admin-text-muted, #64748b);
  font-size: 14px;
  font-weight: 500;
}

.dashboard-overview-card__period {
  color: var(--admin-text-muted, #64748b);
  font-size: 12px;
}

.dashboard-overview-spark {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: end;
  gap: 5px;
  width: 104px;
  height: 36px;
}

.dashboard-overview-spark__bar {
  display: block;
  min-height: 20%;
  border-radius: 3px 3px 1px 1px;
  background: #1677ff;
}

.dashboard-trend-card :deep(.section-card__body) {
  padding-top: 4px;
}

.trend-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trend-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.trend-panel__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.trend-panel__tab {
  min-width: 88px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--admin-border, #dfe5ec);
  border-radius: 6px;
  background: var(--admin-surface, #fff);
  color: var(--admin-text-secondary, #475569);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.trend-panel__tab:hover,
.trend-panel__tab:focus-visible {
  color: #1677ff;
  border-color: rgba(22, 119, 255, 0.4);
  outline: none;
}

.trend-panel__tab.is-active {
  color: #1677ff;
  border-color: rgba(22, 119, 255, 0.28);
  background: rgba(22, 119, 255, 0.08);
}

.trend-panel__summary {
  max-width: 320px;
  text-align: right;
}

.trend-panel__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-block: 1px solid var(--admin-border-soft, #e9edf2);
  background: var(--admin-surface-subtle, #f8fafc);
}

.trend-panel__stat {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
  padding: 14px 16px;
}

.trend-panel__stat + .trend-panel__stat {
  border-left: 1px solid var(--admin-border-soft, #e9edf2);
}

.trend-panel__stat .label {
  color: var(--admin-text-muted, #64748b);
  font-size: 13px;
}

.trend-panel__stat .value {
  color: var(--admin-text-primary, #111827);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
}

.trend-panel__chart-area {
  min-width: 0;
}

.trend-panel__chart-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.trend-panel__chart-value strong {
  color: var(--admin-text-primary, #111827);
  font-size: 30px;
  line-height: 1;
}

.trend-panel__chart-value span {
  color: var(--admin-text-muted, #64748b);
  font-size: 14px;
}

.trend-panel__chart-shell {
  display: flex;
  align-items: stretch;
  gap: 12px;
  margin-top: 16px;
}

.trend-panel__y-axis {
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  align-items: start;
  width: 56px;
  padding: 18px 0 0;
  color: var(--admin-text-muted, #64748b);
  font-size: 12px;
  text-align: right;
}

.trend-panel__y-axis span:last-child {
  align-self: end;
}

.trend-panel__chart {
  position: relative;
  flex: 1;
  min-height: 280px;
  overflow: hidden;
  background: var(--admin-surface-subtle, #f8fafc);
}

.trend-panel__grid {
  position: absolute;
  inset: 18px 0 16px;
  display: grid;
  grid-template-rows: repeat(4, 1fr);
}

.trend-panel__grid span {
  border-top: 1px dashed rgba(148, 163, 184, 0.3);
}

.trend-panel__svg {
  position: absolute;
  inset: 18px 0;
  width: 100%;
  height: calc(100% - 36px);
}

.trend-panel__point {
  position: absolute;
  transform: translate(-50%, -50%);
}

.trend-panel__point i {
  display: block;
  width: 10px;
  height: 10px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #1677ff;
  box-shadow: 0 0 0 4px rgba(22, 119, 255, 0.12);
}

.trend-panel__tooltip {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trend-panel__tooltip-label {
  color: var(--admin-text-muted, #64748b);
  font-size: 12px;
  line-height: 1.4;
}

.trend-panel__tooltip-value {
  color: var(--admin-text-primary, #111827);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.trend-panel__axis {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  margin: 12px 0 0 68px;
  color: var(--admin-text-muted, #64748b);
  font-size: 12px;
  text-align: center;
}

.trend-panel__axis span {
  min-width: 0;
}

.trend-panel__axis span:not(:first-child):not(:last-child) {
  display: none;
}

.trend-panel__axis span:nth-child(2),
.trend-panel__axis span:nth-child(3),
.trend-panel__axis span:nth-child(4),
.trend-panel__axis span:nth-child(5),
.trend-panel__axis span:nth-child(6) {
  display: inline;
}

@media (max-width: 992px) {
  .dashboard-overview-grid {
    grid-template-columns: 1fr;
  }

  .trend-panel__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .trend-panel__stat:nth-child(3) {
    border-left: 0;
    border-top: 1px solid var(--admin-border-soft, #e9edf2);
  }

  .trend-panel__stat:nth-child(4) {
    border-top: 1px solid var(--admin-border-soft, #e9edf2);
  }
}

@media (max-width: 768px) {
  .trend-panel__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .dashboard-overview-grid {
    gap: 12px;
  }

  .dashboard-overview-card {
    padding: 16px;
  }

  .dashboard-overview-card__top,
  .dashboard-overview-card__footer {
    align-items: flex-start;
  }

  .dashboard-overview-card__value {
    font-size: 28px;
  }

  .trend-panel__summary {
    max-width: none;
    text-align: left;
  }

  .trend-panel__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .trend-panel__stat:nth-child(odd) {
    border-left: 0;
  }

  .trend-panel__stat:nth-child(n + 3) {
    border-top: 1px solid var(--admin-border-soft, #e9edf2);
  }

  .trend-panel__chart {
    min-height: 220px;
  }

  .trend-panel__chart-shell {
    gap: 8px;
  }

  .trend-panel__y-axis {
    width: 48px;
    font-size: 11px;
  }

  .trend-panel__axis {
    gap: 4px;
    margin-left: 56px;
    font-size: 11px;
  }
}
</style>
