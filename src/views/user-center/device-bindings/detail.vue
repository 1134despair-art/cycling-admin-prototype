<template>
  <secondary-page-layout
    title="用户绑定设备详情"
    description="查看该用户的全部设备绑定记录，并在设备维度维护绑定关系。"
    @back="router.push('/user-center/device-bindings')"
  >
    <template #summary>
      <div class="user-summary">
        <div class="user-avatar">{{ user.nickName?.slice(0, 1) || 'U' }}</div>
        <div class="user-identity">
          <h2>{{ user.nickName || '--' }}</h2>
          <p>{{ user.userName || '--' }} · {{ user.phone || '--' }}</p>
        </div>
        <div class="summary-metrics">
          <div><span>当前绑定</span><strong>{{ activeCount }}</strong><small>台</small></div>
          <div><span>绑定记录</span><strong>{{ bindings.length }}</strong><small>条</small></div>
          <div><span>最近同步</span><strong class="summary-time">{{ latestSyncTime || '--' }}</strong></div>
        </div>
      </div>
    </template>

    <section-card title="绑定设备" description="列表包含当前绑定和历史解绑记录，一个用户可同时绑定多台设备。">
      <div class="business-table-wrap">
        <el-table :data="bindings" stripe>
          <el-table-column prop="deviceSn" label="设备SN" min-width="170" />
          <el-table-column prop="deviceName" label="设备名称" min-width="190" />
          <el-table-column prop="deviceModel" label="设备型号" min-width="130" />
          <el-table-column prop="deviceType" label="设备分类" min-width="120" />
          <el-table-column label="绑定状态" width="100">
            <template #default="{ row }"><status-tag :value="row.bindStatus" :options="bindingStatusOptions" /></template>
          </el-table-column>
          <el-table-column prop="bindTime" label="绑定时间" min-width="170" />
          <el-table-column prop="lastSyncTime" label="最近同步" min-width="170" />
          <el-table-column label="操作" fixed="right" width="120" align="right">
            <template #default="{ row }">
              <el-button v-if="row.bindStatus === 'bound'" link type="danger" @click="handleUnbind(row)">解绑</el-button>
              <el-button v-else link type="primary" @click="handleRebind(row)">重新绑定</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section-card>
  </secondary-page-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SecondaryPageLayout from '@/components/business/SecondaryPageLayout.vue'
import SectionCard from '@/components/business/SectionCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import { userModule } from '@/mock/users'
import { bindingStatusOptions, getBindingsForUser, rebindDevice, unbindDevice } from '@/mock/devices'
import { buildBusinessConfirmOptions } from '@/plugins/modal'

const route = useRoute()
const router = useRouter()
const bindings = ref([])
const user = computed(() => userModule.detail(route.params.userId) || {})
const activeCount = computed(() => bindings.value.filter(item => item.bindStatus === 'bound').length)
const latestSyncTime = computed(() => bindings.value.map(item => item.lastSyncTime).filter(Boolean).sort((a, b) => String(b).localeCompare(String(a)))[0] || '')

function load() {
  bindings.value = getBindingsForUser(route.params.userId)
}

async function handleUnbind(row) {
  await ElMessageBox.confirm(`确认解绑设备「${row.deviceSn}」？`, '解绑设备', buildBusinessConfirmOptions({ confirmButtonText: '确认解绑', confirmType: 'danger' }))
  if (!unbindDevice(row.id)) return ElMessage.warning('设备解绑失败，请刷新后重试')
  ElMessage.success('设备已解绑')
  load()
}

async function handleRebind(row) {
  await ElMessageBox.confirm(`确认将设备「${row.deviceSn}」重新绑定给当前用户？`, '重新绑定设备', buildBusinessConfirmOptions({ confirmButtonText: '确认绑定' }))
  if (!rebindDevice(row.id, route.params.userId)) return ElMessage.warning('重新绑定失败，请检查设备当前归属')
  ElMessage.success('设备已重新绑定')
  load()
}

load()
</script>

<style scoped lang="scss">
.user-summary { display: flex; align-items: center; gap: 16px; padding: 20px 24px; border: 1px solid var(--admin-border, #dfe5ec); border-radius: 8px; background: var(--admin-surface, #fff); }
.user-avatar { display: grid; flex: 0 0 52px; place-items: center; width: 52px; height: 52px; border-radius: 8px; background: var(--el-color-primary); color: #fff; font-size: 22px; font-weight: 700; }
.user-identity { min-width: 160px; }
.user-identity h2 { margin: 0 0 7px; color: var(--admin-text-primary, #111827); font-size: 18px; }
.user-identity p { margin: 0; color: var(--admin-text-muted, #64748b); font-size: 13px; }
.summary-metrics { display: grid; grid-template-columns: 110px 110px minmax(180px, 1fr); gap: 12px; margin-left: auto; }
.summary-metrics > div { min-width: 0; padding-left: 16px; border-left: 1px solid var(--admin-border, #dfe5ec); }
.summary-metrics span { display: block; margin-bottom: 7px; color: var(--admin-text-muted, #64748b); font-size: 12px; }
.summary-metrics strong { color: var(--admin-text-primary, #111827); font-size: 22px; }
.summary-metrics small { margin-left: 4px; color: var(--admin-text-muted, #64748b); }
.summary-metrics .summary-time { font-size: 14px; font-weight: 600; }
@media (max-width: 768px) {
  .user-summary { align-items: flex-start; flex-wrap: wrap; padding: 16px; }
  .summary-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); width: 100%; margin-left: 0; }
  .summary-metrics > div { padding-left: 0; border-left: 0; }
  .summary-metrics > div:last-child { grid-column: 1 / -1; }
}
</style>
