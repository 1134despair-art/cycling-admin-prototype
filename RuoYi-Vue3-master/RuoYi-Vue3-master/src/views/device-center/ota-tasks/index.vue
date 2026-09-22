<template>
  <div class="app-container business-page ota-page">
    <div class="business-page-shell">
      <page-header-card title="OTA升级任务" description="跟踪固件推送范围、执行进度、设备结果与操作日志。">
        <template #extra>
          <el-button icon="Refresh" @click="refreshData">刷新</el-button>
        </template>
      </page-header-card>

      <div class="task-metrics">
        <div>
          <span>任务总数</span>
          <strong>{{ stats.taskCount }}</strong>
          <small>个 OTA 任务</small>
        </div>
        <div>
          <span>成功设备</span>
          <strong class="success-text">{{ stats.successCount }}</strong>
          <small>已完成升级</small>
        </div>
        <div>
          <span>失败设备</span>
          <strong class="danger-text">{{ stats.failedCount }}</strong>
          <small>可执行失败重试</small>
        </div>
        <div>
          <span>离线排队</span>
          <strong class="warning-text">{{ stats.queuedCount }}</strong>
          <small>平均成功率 {{ stats.averageSuccessRate }}</small>
        </div>
      </div>

      <el-card shadow="never" class="business-query-card">
        <el-form :model="query" :inline="true" label-width="auto" class="business-query-form" @submit.prevent>
          <el-form-item label="任务信息">
            <el-input v-model="query.keyword" clearable placeholder="任务编号/名称/版本" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="适配型号">
            <el-select v-model="query.targetModel" clearable placeholder="全部型号">
              <el-option v-for="model in modelOptions" :key="model" :label="model" :value="model" />
            </el-select>
          </el-form-item>
          <el-form-item label="任务状态">
            <el-select v-model="query.status" clearable placeholder="全部状态">
              <el-option v-for="item in otaTaskStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建日期">
            <el-date-picker v-model="query.dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" range-separator="至" />
          </el-form-item>
          <el-form-item class="business-query-form__actions">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <section-card title="任务列表" :description="`共 ${filteredRows.length} 个任务，设备结果统计随任务操作实时更新。`">
        <el-table :data="pagedRows" stripe empty-text="暂无符合条件的 OTA 任务">
          <el-table-column label="任务编号" min-width="180">
            <template #default="{ row }"><el-button link type="primary" class="mono" @click="openDetail(row)">{{ row.taskNo }}</el-button></template>
          </el-table-column>
          <el-table-column prop="taskName" label="任务名称" min-width="190" />
          <el-table-column label="固件版本" min-width="150">
            <template #default="{ row }"><span class="mono">{{ row.versionName }}</span></template>
          </el-table-column>
          <el-table-column label="适配对象" min-width="165">
            <template #default="{ row }"><span class="mono">{{ row.targetModel }}</span><div class="cell-secondary">{{ row.componentType }}</div></template>
          </el-table-column>
          <el-table-column prop="scopeLabel" label="目标范围" min-width="150" />
          <el-table-column label="升级策略" min-width="130">
            <template #default="{ row }">{{ upgradeModeLabel(row.upgradeMode) }}<div class="cell-secondary">{{ scheduleModeLabel(row.scheduleMode) }}</div></template>
          </el-table-column>
          <el-table-column label="执行结果" min-width="215">
            <template #default="{ row }">
              <div class="result-counts">
                <span>目标 {{ row.targetCount }}</span>
                <span class="success-text">成功 {{ row.successCount }}</span>
                <span class="danger-text">失败 {{ row.failedCount }}</span>
                <span class="warning-text">排队 {{ row.queuedCount }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="110">
            <template #default="{ row }"><status-tag :value="row.status" :options="otaTaskStatusOptions" /></template>
          </el-table-column>
          <el-table-column label="计划/执行时间" min-width="180">
            <template #default="{ row }">{{ row.executeAt || '--' }}</template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" min-width="180" />
          <el-table-column label="操作" fixed="right" min-width="190" align="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openDetail(row)">详情</el-button>
              <el-button v-if="row.status === 'scheduled'" link type="warning" @click="handleCancel(row)">取消</el-button>
              <el-button v-if="row.failedCount > 0" link type="danger" @click="handleRetry(row)">重试失败设备</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="business-pagination-wrap">
          <el-pagination
            v-if="filteredRows.length > pageSize"
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            layout="total, sizes, prev, pager, next"
            :page-sizes="[10, 20, 50]"
            :total="filteredRows.length"
          />
        </div>
      </section-card>
    </div>

    <el-drawer v-model="detailDrawerVisible" size="min(880px, 94vw)" append-to-body @closed="handleDrawerClosed">
      <template #header>
        <div class="drawer-heading">
          <span>OTA 任务详情</span>
          <strong class="mono">{{ currentTask.taskNo || '--' }}</strong>
        </div>
      </template>

      <div v-if="currentTask.id" class="task-detail">
        <div class="task-detail__headline">
          <div>
            <span class="eyebrow">{{ currentTask.taskName }}</span>
            <h2 class="mono">{{ currentTask.versionName }}</h2>
            <p>{{ currentTask.targetModel }} · {{ currentTask.componentType }} · {{ currentTask.scopeLabel }}</p>
          </div>
          <status-tag :value="currentTask.status" :options="otaTaskStatusOptions" />
        </div>

        <div class="drawer-actions">
          <el-button v-if="currentTask.status === 'scheduled'" type="warning" plain icon="CircleClose" @click="handleCancel(currentTask)">取消待执行任务</el-button>
          <el-button v-if="currentTask.failedCount > 0" type="danger" plain icon="RefreshRight" @click="handleRetry(currentTask)">重试失败设备</el-button>
        </div>

        <div class="task-result-metrics">
          <div><span>目标</span><strong>{{ currentTask.targetCount }}</strong></div>
          <div><span>成功</span><strong class="success-text">{{ currentTask.successCount }}</strong></div>
          <div><span>失败</span><strong class="danger-text">{{ currentTask.failedCount }}</strong></div>
          <div><span>排队</span><strong class="warning-text">{{ currentTask.queuedCount }}</strong></div>
        </div>

        <el-descriptions :column="2" border class="task-descriptions">
          <el-descriptions-item label="任务编号"><span class="mono">{{ currentTask.taskNo }}</span></el-descriptions-item>
          <el-descriptions-item label="固件版本"><span class="mono">{{ currentTask.versionName }}</span></el-descriptions-item>
          <el-descriptions-item label="目标范围">{{ currentTask.scopeLabel }}</el-descriptions-item>
          <el-descriptions-item label="升级方式">{{ upgradeModeLabel(currentTask.upgradeMode) }}</el-descriptions-item>
          <el-descriptions-item label="执行方式">{{ scheduleModeLabel(currentTask.scheduleMode) }}</el-descriptions-item>
          <el-descriptions-item label="执行时间">{{ currentTask.executeAt || '--' }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentTask.createdBy || '--' }}</el-descriptions-item>
          <el-descriptions-item label="重试次数">{{ currentTask.retryCount || 0 }} 次</el-descriptions-item>
          <el-descriptions-item label="任务备注" :span="2">{{ currentTask.remark || '--' }}</el-descriptions-item>
        </el-descriptions>

        <el-tabs v-model="activeTab" class="task-tabs">
          <el-tab-pane label="设备结果" name="results">
            <el-table :data="currentTask.deviceResults || []" stripe empty-text="暂无设备结果">
              <el-table-column label="设备 SN" min-width="190">
                <template #default="{ row }"><span class="mono">{{ row.deviceSn }}</span></template>
              </el-table-column>
              <el-table-column label="设备状态" min-width="105">
                <template #default="{ row }"><status-tag :value="row.deviceStatus" :options="deviceStatusOptions" /></template>
              </el-table-column>
              <el-table-column label="升级结果" min-width="105">
                <template #default="{ row }"><status-tag :value="row.result" :options="otaDeviceResultOptions" /></template>
              </el-table-column>
              <el-table-column prop="reason" label="结果说明" min-width="220">
                <template #default="{ row }">{{ row.reason || '执行完成' }}</template>
              </el-table-column>
              <el-table-column prop="completedAt" label="完成时间" min-width="180">
                <template #default="{ row }">{{ row.completedAt || '--' }}</template>
              </el-table-column>
              <el-table-column prop="retryCount" label="重试" width="75" align="center" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="操作日志" name="logs">
            <el-empty v-if="!currentTask.logs?.length" description="暂无操作日志" :image-size="72" />
            <el-timeline v-else class="operation-timeline">
              <el-timeline-item v-for="log in currentTask.logs" :key="log.id" :timestamp="log.time" placement="top" type="primary">
                <div class="operation-log">
                  <div><strong>{{ log.action }}</strong><span>{{ log.operator }}</span></div>
                  <p>{{ log.content }}</p>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeaderCard from '@/components/business/PageHeaderCard.vue'
import SectionCard from '@/components/business/SectionCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import {
  cancelOtaTask,
  deviceStatusOptions,
  getOtaTaskDetail,
  getOtaTaskStats,
  otaDeviceResultOptions,
  otaTaskModule,
  otaTaskStatusOptions,
  retryFailedDevices
} from '@/mock/devices'

const route = useRoute()
const router = useRouter()
const revision = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const detailDrawerVisible = ref(false)
const currentTask = ref({})
const activeTab = ref('results')
const query = reactive({ keyword: '', targetModel: '', status: '', dateRange: [] })

const allRows = computed(() => {
  revision.value
  return otaTaskModule.snapshot().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
})
const stats = computed(() => {
  revision.value
  return getOtaTaskStats()
})
const modelOptions = computed(() => [...new Set(allRows.value.map(item => item.targetModel).filter(Boolean))])
const filteredRows = computed(() => {
  const keyword = query.keyword.trim().toLowerCase()
  const [startDate, endDate] = query.dateRange || []
  return allRows.value.filter(item => {
    if (keyword && ![item.taskNo, item.taskName, item.versionName, item.targetModel].some(value => String(value || '').toLowerCase().includes(keyword))) return false
    if (query.targetModel && item.targetModel !== query.targetModel) return false
    if (query.status && item.status !== query.status) return false
    const createdDate = String(item.createdAt || '').slice(0, 10)
    if (startDate && createdDate < startDate) return false
    if (endDate && createdDate > endDate) return false
    return true
  })
})
const pagedRows = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

watch([filteredRows, pageSize], () => {
  const maxPage = Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value))
  if (pageNum.value > maxPage) pageNum.value = maxPage
})

watch(() => route.query.taskId, taskId => {
  if (taskId) openTaskById(taskId, false)
})

onMounted(() => {
  if (route.query.taskId) openTaskById(route.query.taskId, false)
})

function handleQuery() {
  pageNum.value = 1
}

function resetQuery() {
  Object.assign(query, { keyword: '', targetModel: '', status: '', dateRange: [] })
  pageNum.value = 1
}

function refreshData() {
  revision.value += 1
  syncCurrentTask()
  ElMessage.success('任务数据已刷新')
}

function openDetail(row) {
  openTaskById(row.id, true)
}

function openTaskById(id, syncQuery) {
  const detail = getOtaTaskDetail(id)
  if (!detail) {
    ElMessage.warning('未找到指定的 OTA 任务')
    return
  }
  currentTask.value = detail
  activeTab.value = 'results'
  detailDrawerVisible.value = true
  if (syncQuery && String(route.query.taskId || '') !== String(id)) {
    router.replace({ path: route.path, query: { ...route.query, taskId: id } })
  }
}

function syncCurrentTask() {
  if (!currentTask.value.id) return
  currentTask.value = getOtaTaskDetail(currentTask.value.id) || {}
}

async function handleCancel(task) {
  try {
    await ElMessageBox.confirm(
      `任务 ${task.taskNo} 尚未执行，取消后目标设备将不再接收本次升级。`,
      '确认取消 OTA 任务',
      { confirmButtonText: '确认取消', cancelButtonText: '暂不取消', type: 'warning' }
    )
  } catch {
    return
  }
  try {
    cancelOtaTask(task.id)
    revision.value += 1
    syncCurrentTask()
    ElMessage.success('OTA 任务已取消')
  } catch (error) {
    ElMessage.error(error?.message || '任务取消失败')
  }
}

async function handleRetry(task) {
  try {
    await ElMessageBox.confirm(
      `将仅重试任务 ${task.taskNo} 中的 ${task.failedCount} 台失败设备，成功与排队设备不受影响。`,
      '确认重试失败设备',
      { confirmButtonText: '确认重试', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }
  try {
    retryFailedDevices(task.id)
    revision.value += 1
    syncCurrentTask()
    ElMessage.success('失败设备重试完成')
  } catch (error) {
    ElMessage.error(error?.message || '失败设备重试失败')
  }
}

function handleDrawerClosed() {
  currentTask.value = {}
  if (route.query.taskId) {
    const nextQuery = { ...route.query }
    delete nextQuery.taskId
    router.replace({ path: route.path, query: nextQuery })
  }
}

function upgradeModeLabel(value) {
  return value === 'forced' ? '强制升级' : '可选升级'
}

function scheduleModeLabel(value) {
  return value === 'scheduled' ? '定时执行' : '立即执行'
}
</script>

<style scoped lang="scss">
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
.task-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.task-metrics > div { min-width: 0; padding: 16px 18px; border: 1px solid var(--admin-border, #dfe5ec); border-radius: 8px; background: var(--admin-surface, #fff); }
.task-metrics span { display: block; color: var(--admin-text-muted, #64748b); font-size: 12px; }
.task-metrics strong { display: block; margin-top: 8px; color: var(--admin-text-primary, #111827); font-size: 24px; line-height: 1; }
.task-metrics small { display: block; margin-top: 8px; color: var(--admin-text-muted, #64748b); font-size: 12px; }
.cell-secondary { margin-top: 4px; color: var(--admin-text-muted, #64748b); font-size: 12px; }
.result-counts { display: flex; flex-wrap: wrap; gap: 6px 10px; font-size: 12px; }
.success-text { color: #15803d !important; }
.warning-text { color: #c2410c !important; }
.danger-text { color: #dc2626 !important; }
.drawer-heading { display: flex; align-items: baseline; gap: 12px; min-width: 0; }
.drawer-heading > span { color: var(--admin-text-primary, #111827); font-weight: 600; }
.drawer-heading strong { overflow: hidden; color: #2563eb; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.task-detail__headline { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; padding-bottom: 18px; border-bottom: 1px solid var(--admin-border, #e5e7eb); }
.task-detail__headline > div { min-width: 0; }
.eyebrow { color: var(--admin-text-muted, #64748b); font-size: 12px; }
.task-detail__headline h2 { overflow-wrap: anywhere; margin: 6px 0; color: var(--admin-text-primary, #111827); font-size: 22px; }
.task-detail__headline p { margin: 0; color: var(--admin-text-muted, #64748b); font-size: 13px; }
.drawer-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; min-height: 32px; margin: 14px 0; }
.task-result-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 16px; border: 1px solid var(--admin-border, #dfe5ec); border-radius: 6px; background: #f8fafc; }
.task-result-metrics > div { padding: 13px 16px; border-right: 1px solid var(--admin-border, #dfe5ec); text-align: center; }
.task-result-metrics > div:last-child { border-right: 0; }
.task-result-metrics span { display: block; color: var(--admin-text-muted, #64748b); font-size: 12px; }
.task-result-metrics strong { display: block; margin-top: 5px; color: var(--admin-text-primary, #111827); font-size: 20px; }
.task-descriptions { margin-bottom: 18px; }
.task-tabs { margin-top: 8px; }
.operation-timeline { padding-top: 12px; }
.operation-log { padding: 13px 15px; border: 1px solid var(--admin-border, #e5e7eb); border-radius: 6px; }
.operation-log > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.operation-log span { color: var(--admin-text-muted, #64748b); font-size: 12px; }
.operation-log p { margin: 8px 0 0; color: var(--admin-text-primary, #111827); line-height: 1.6; }
@media (max-width: 900px) {
  .task-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 768px) {
  .task-detail__headline { flex-direction: column; }
  .task-result-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .task-result-metrics > div:nth-child(2) { border-right: 0; }
  .task-result-metrics > div:nth-child(-n + 2) { border-bottom: 1px solid var(--admin-border, #dfe5ec); }
  .task-descriptions :deep(.el-descriptions__body) { overflow-x: auto; }
}
</style>
