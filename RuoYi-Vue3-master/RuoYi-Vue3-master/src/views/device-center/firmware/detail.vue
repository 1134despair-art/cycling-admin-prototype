<template>
  <secondary-page-layout
    v-if="firmware"
    title="固件包详情"
    description="核对固件版本、升级日志说明与历史 OTA 推送结果。"
    @back="router.push('/device-center/firmware')"
  >
    <template #actions>
      <el-tooltip :disabled="canPush" :content="pushDisabledReason" placement="bottom">
        <span>
          <el-button type="primary" icon="Promotion" :disabled="!canPush" @click="openPushDialog">
            推送固件包
          </el-button>
        </span>
      </el-tooltip>
    </template>

    <template #summary>
      <div class="firmware-identity">
        <div class="firmware-identity__main">
          <span class="eyebrow">目标版本</span>
          <h2 class="mono">{{ firmware.versionName }}</h2>
          <p>{{ firmware.targetModel }} · {{ firmware.componentType }} · {{ firmware.fileName }}</p>
        </div>
        <status-tag :value="firmware.status" :options="firmwareStatusOptions" />
      </div>
    </template>

    <el-alert
      v-if="!canPush"
      :title="pushDisabledReason"
      :type="firmware.status === 'draft' ? 'warning' : 'error'"
      :closable="false"
      show-icon
      class="state-alert"
    />

    <div class="detail-metrics">
      <div>
        <span>版本编码</span>
        <strong class="mono">{{ firmware.versionCode || firmware.versionName }}</strong>
      </div>
      <div>
        <span>固件文件</span>
        <strong class="small-value">{{ firmware.fileName || '--' }}</strong>
      </div>
      <div>
        <span>固件大小</span>
        <strong>{{ firmware.packageSize || '--' }}</strong>
      </div>
      <div>
        <span>发布时间</span>
        <strong class="small-value">{{ firmware.publishTime || '尚未发布' }}</strong>
      </div>
    </div>

    <div class="detail-section-grid detail-section-grid--two firmware-overview-grid">
      <section-card title="固件包信息" description="用于校验设备型号、升级部件和包文件。">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="版本号"><span class="mono">{{ firmware.versionName }}</span></el-descriptions-item>
          <el-descriptions-item label="版本编码"><span class="mono">{{ firmware.versionCode || '--' }}</span></el-descriptions-item>
          <el-descriptions-item label="适配型号"><span class="mono">{{ firmware.targetModel }}</span></el-descriptions-item>
          <el-descriptions-item label="升级部件">{{ firmware.componentType }}</el-descriptions-item>
          <el-descriptions-item label="固件文件"><span class="mono">{{ firmware.fileName || '--' }}</span></el-descriptions-item>
          <el-descriptions-item label="文件地址"><span class="file-url mono">{{ firmware.fileUrl || '--' }}</span></el-descriptions-item>
          <el-descriptions-item label="包大小">{{ firmware.packageSize || '--' }}</el-descriptions-item>
        </el-descriptions>
      </section-card>

      <section-card title="升级日志说明" description="新增或编辑说明后会同步写入版本升级日志。">
        <div class="release-notes">{{ firmware.releaseNotes || '暂无升级日志说明' }}</div>
        <div class="release-meta">
          <span>最近更新</span>
          <strong>{{ firmware.updatedAt || '--' }}</strong>
        </div>
        <div class="release-meta">
          <span>可用设备</span>
          <strong>{{ firmware.eligibleDevices.length }} 台</strong>
        </div>
        <div class="release-meta">
          <span>离线设备</span>
          <strong class="warning-text">{{ eligibleOfflineCount }} 台</strong>
        </div>
      </section-card>
    </div>

    <section-card title="版本升级日志" description="按记录时间倒序展示版本内容和操作人。">
      <el-empty v-if="!firmware.versionLogs.length" description="暂无版本升级日志" :image-size="72" />
      <el-timeline v-else class="version-timeline">
        <el-timeline-item
          v-for="log in firmware.versionLogs"
          :key="log.id"
          :timestamp="log.time"
          placement="top"
          type="primary"
        >
          <div class="timeline-entry">
            <div class="timeline-entry__head">
              <strong class="mono">{{ log.version }}</strong>
              <span>{{ log.operator }}</span>
            </div>
            <p>{{ log.content }}</p>
          </div>
        </el-timeline-item>
      </el-timeline>
    </section-card>

    <section-card title="关联 OTA 任务" description="查看该固件包的目标范围、执行状态和设备结果统计。">
      <template #extra>
        <el-button link type="primary" @click="router.push('/device-center/ota-tasks')">查看全部任务</el-button>
      </template>
      <el-table :data="firmware.otaTasks" stripe empty-text="该固件包暂无关联任务">
        <el-table-column label="任务编号" min-width="180">
          <template #default="{ row }">
            <el-button link type="primary" class="mono" @click="openTask(row)">{{ row.taskNo }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="taskName" label="任务名称" min-width="190" />
        <el-table-column prop="scopeLabel" label="设备范围" min-width="150" />
        <el-table-column label="升级策略" min-width="120">
          <template #default="{ row }">{{ upgradeModeLabel(row.upgradeMode) }} · {{ scheduleModeLabel(row.scheduleMode) }}</template>
        </el-table-column>
        <el-table-column label="执行结果" min-width="230">
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
        <el-table-column prop="createdAt" label="创建时间" min-width="175" />
      </el-table>
    </section-card>

    <el-dialog
      v-model="pushDialogVisible"
      title="推送固件包"
      width="min(720px, 94vw)"
      append-to-body
      :close-on-click-modal="false"
      @closed="resetPushForm"
    >
      <div class="push-package-bar">
        <div>
          <span>固件版本</span>
          <strong class="mono">{{ firmware.versionName }}</strong>
        </div>
        <div>
          <span>适配型号</span>
          <strong class="mono">{{ firmware.targetModel }}</strong>
        </div>
        <div>
          <span>可用设备</span>
          <strong>{{ firmware.eligibleDevices.length }} 台</strong>
        </div>
      </div>

      <el-form ref="pushFormRef" :model="pushForm" :rules="pushRules" label-width="104px" class="push-form">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="pushForm.taskName" maxlength="50" show-word-limit placeholder="请输入 OTA 任务名称" />
        </el-form-item>
        <el-form-item label="目标范围" prop="targetScope">
          <el-radio-group v-model="pushForm.targetScope" @change="handleScopeChange">
            <el-radio-button value="all">全部设备</el-radio-button>
            <el-radio-button value="gray">灰度推送</el-radio-button>
            <el-radio-button value="selected">指定设备</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="pushForm.targetScope === 'gray'" label="灰度比例" prop="grayPercent">
          <el-input-number v-model="pushForm.grayPercent" :min="1" :max="100" :step="1" step-strictly controls-position="right" />
          <span class="field-suffix">%</span>
          <span class="field-hint">按设备 ID 稳定选取 {{ targetDevices.length }} 台</span>
        </el-form-item>
        <el-form-item v-if="pushForm.targetScope === 'selected'" label="设备 SN" prop="deviceIds">
          <el-select v-model="pushForm.deviceIds" multiple filterable collapse-tags collapse-tags-tooltip placeholder="请选择适配设备" style="width: 100%">
            <el-option v-for="device in firmware.eligibleDevices" :key="device.id" :label="`${device.sn} · ${device.onlineLabel}`" :value="device.id">
              <span class="mono">{{ device.sn }}</span>
              <span class="device-option-state">{{ device.onlineLabel }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="升级方式" prop="upgradeMode">
          <el-radio-group v-model="pushForm.upgradeMode">
            <el-radio-button value="optional">可选升级</el-radio-button>
            <el-radio-button value="forced">强制升级</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="pushForm.upgradeMode === 'forced'">
          <el-alert title="强制升级可能中断设备当前操作，请确认已评估业务影响。" type="warning" :closable="false" show-icon />
        </el-form-item>
        <el-form-item label="执行方式" prop="scheduleMode">
          <el-radio-group v-model="pushForm.scheduleMode">
            <el-radio-button value="immediate">立即执行</el-radio-button>
            <el-radio-button value="scheduled">定时执行</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="pushForm.scheduleMode === 'scheduled'" label="执行时间" prop="executeAt">
          <el-date-picker
            v-model="pushForm.executeAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择未来时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="任务备注" prop="remark">
          <el-input v-model="pushForm.remark" type="textarea" :rows="3" maxlength="160" show-word-limit placeholder="选填，记录本次推送背景或注意事项" />
        </el-form-item>
      </el-form>

      <div class="delivery-preview">
        <div><span>目标设备</span><strong>{{ targetDevices.length }}</strong><small>台</small></div>
        <div><span>在线可执行</span><strong class="success-text">{{ targetOnlineCount }}</strong><small>台</small></div>
        <div><span>离线排队</span><strong class="warning-text">{{ targetOfflineCount }}</strong><small>台</small></div>
      </div>

      <template #footer>
        <el-button @click="pushDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitPush">下一步确认</el-button>
      </template>
    </el-dialog>
  </secondary-page-layout>

  <div v-else class="app-container missing-state">
    <el-result icon="warning" title="固件包不存在" sub-title="该记录可能已删除，或链接中的固件 ID 无效。">
      <template #extra><el-button type="primary" @click="router.push('/device-center/firmware')">返回固件包管理</el-button></template>
    </el-result>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import SecondaryPageLayout from '@/components/business/SecondaryPageLayout.vue'
import SectionCard from '@/components/business/SectionCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import {
  createOtaTask,
  firmwareStatusOptions,
  getFirmwareDetail,
  otaTaskStatusOptions
} from '@/mock/devices'

const route = useRoute()
const router = useRouter()
const revision = ref(0)
const pushDialogVisible = ref(false)
const pushFormRef = ref()
const submitting = ref(false)

const createDefaultPushForm = () => ({
  taskName: '',
  targetScope: 'all',
  grayPercent: 30,
  deviceIds: [],
  upgradeMode: 'optional',
  scheduleMode: 'immediate',
  executeAt: '',
  remark: ''
})

const pushForm = reactive(createDefaultPushForm())
const firmware = computed(() => {
  revision.value
  return getFirmwareDetail(route.params.id)
})
const canPush = computed(() => firmware.value?.status === 'published' && firmware.value.eligibleDevices.length > 0)
const pushDisabledReason = computed(() => {
  if (!firmware.value) return '固件包不存在'
  if (firmware.value.status === 'draft') return '草稿固件需先发布后才能推送'
  if (firmware.value.status === 'disabled') return '已停用固件禁止创建新的推送任务'
  if (!firmware.value.eligibleDevices.length) return '当前没有符合型号且未禁用的设备'
  return ''
})
const eligibleOfflineCount = computed(() => firmware.value?.eligibleDevices.filter(item => item.status === 'offline').length || 0)
const targetDevices = computed(() => {
  const devices = firmware.value?.eligibleDevices || []
  if (pushForm.targetScope === 'gray') {
    const percent = Number(pushForm.grayPercent)
    if (!Number.isInteger(percent) || percent < 1 || percent > 100) return []
    return devices.slice(0, Math.max(1, Math.ceil(devices.length * percent / 100)))
  }
  if (pushForm.targetScope === 'selected') {
    const selectedIds = new Set(pushForm.deviceIds.map(id => String(id)))
    return devices.filter(item => selectedIds.has(String(item.id)))
  }
  return devices
})
const targetOfflineCount = computed(() => targetDevices.value.filter(item => item.status === 'offline').length)
const targetOnlineCount = computed(() => targetDevices.value.length - targetOfflineCount.value)

const pushRules = {
  taskName: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '任务名称长度为 2-50 个字符', trigger: 'blur' }
  ],
  targetScope: [{ required: true, message: '请选择目标范围', trigger: 'change' }],
  grayPercent: [{
    validator: (_rule, value, callback) => {
      if (pushForm.targetScope !== 'gray') return callback()
      const percent = Number(value)
      if (!Number.isInteger(percent) || percent < 1 || percent > 100) return callback(new Error('灰度比例必须为 1-100 的整数'))
      callback()
    },
    trigger: 'change'
  }],
  deviceIds: [{
    validator: (_rule, value, callback) => {
      if (pushForm.targetScope === 'selected' && (!Array.isArray(value) || !value.length)) return callback(new Error('请至少选择一台适配设备'))
      callback()
    },
    trigger: 'change'
  }],
  upgradeMode: [{ required: true, message: '请选择升级方式', trigger: 'change' }],
  scheduleMode: [{ required: true, message: '请选择执行方式', trigger: 'change' }],
  executeAt: [{
    validator: (_rule, value, callback) => {
      if (pushForm.scheduleMode !== 'scheduled') return callback()
      const timestamp = new Date(String(value || '').replace(' ', 'T')).getTime()
      if (!value || Number.isNaN(timestamp) || timestamp <= Date.now()) return callback(new Error('定时执行时间必须晚于当前时间'))
      callback()
    },
    trigger: 'change'
  }]
}

function openPushDialog() {
  if (!canPush.value) {
    ElMessage.warning(pushDisabledReason.value)
    return
  }
  Object.assign(pushForm, createDefaultPushForm(), { taskName: `${firmware.value.versionName} OTA 升级` })
  pushDialogVisible.value = true
}

function resetPushForm() {
  Object.assign(pushForm, createDefaultPushForm())
  pushFormRef.value?.clearValidate()
}

function handleScopeChange() {
  pushFormRef.value?.clearValidate(['grayPercent', 'deviceIds'])
}

async function submitPush() {
  if (!pushFormRef.value) return
  try {
    await pushFormRef.value.validate()
  } catch {
    return
  }
  if (!targetDevices.value.length) {
    ElMessage.error('没有符合条件的目标设备，无法创建任务')
    return
  }

  const forcedRisk = pushForm.upgradeMode === 'forced'
    ? '\n风险提示：这是强制升级，可能中断设备当前操作。'
    : ''
  const message = [
    `固件版本：${firmware.value.versionName}`,
    `目标设备：${targetDevices.value.length} 台`,
    `离线排队：${targetOfflineCount.value} 台`,
    `执行方式：${scheduleModeLabel(pushForm.scheduleMode)}`
  ].join('\n') + forcedRisk

  try {
    await ElMessageBox.confirm(message, '确认创建 OTA 升级任务', {
      confirmButtonText: '确认创建',
      cancelButtonText: '返回修改',
      type: pushForm.upgradeMode === 'forced' ? 'warning' : 'info',
      customClass: 'ota-confirm-message'
    })
  } catch {
    return
  }

  submitting.value = true
  try {
    const task = createOtaTask({ firmwareId: firmware.value.id, ...pushForm })
    revision.value += 1
    pushDialogVisible.value = false
    ElMessage.success(`OTA 任务 ${task.taskNo} 已创建`)
  } catch (error) {
    ElMessage.error(error?.message || 'OTA 任务创建失败')
  } finally {
    submitting.value = false
  }
}

function openTask(task) {
  router.push({ path: '/device-center/ota-tasks', query: { taskId: task.id } })
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
.firmware-identity { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 24px; border: 1px solid var(--admin-border, #dfe5ec); border-radius: 8px; background: var(--admin-surface, #fff); }
.firmware-identity__main { min-width: 0; }
.eyebrow { color: #2563eb; font-size: 12px; font-weight: 600; }
.firmware-identity h2 { margin: 6px 0; color: var(--admin-text-primary, #111827); font-size: 22px; line-height: 1.3; }
.firmware-identity p { overflow-wrap: anywhere; margin: 0; color: var(--admin-text-muted, #64748b); font-size: 13px; }
.state-alert { margin-bottom: 12px; }
.detail-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px; }
.detail-metrics > div { min-width: 0; padding: 16px; border: 1px solid var(--admin-border, #dfe5ec); border-radius: 8px; background: var(--admin-surface, #fff); }
.detail-metrics span { display: block; color: var(--admin-text-muted, #64748b); font-size: 12px; }
.detail-metrics strong { display: block; overflow-wrap: anywhere; margin-top: 8px; color: var(--admin-text-primary, #111827); font-size: 18px; line-height: 1.35; }
.detail-metrics .small-value { font-size: 14px; }
.firmware-overview-grid { align-items: stretch; }
.file-url { overflow-wrap: anywhere; color: #2563eb; font-size: 12px; }
.release-notes { min-height: 112px; padding: 16px; border-left: 3px solid #2563eb; background: #f8fafc; color: var(--admin-text-primary, #111827); line-height: 1.7; white-space: pre-wrap; }
.release-meta { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 13px 0; border-bottom: 1px solid var(--admin-border, #e5e7eb); font-size: 13px; }
.release-meta:last-child { border-bottom: 0; }
.release-meta span { color: var(--admin-text-muted, #64748b); }
.release-meta strong { color: var(--admin-text-primary, #111827); }
.version-timeline { padding-top: 8px; }
.timeline-entry { padding: 14px 16px; border: 1px solid var(--admin-border, #e5e7eb); border-radius: 6px; background: #fff; }
.timeline-entry__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.timeline-entry__head strong { color: #2563eb; }
.timeline-entry__head span { color: var(--admin-text-muted, #64748b); font-size: 12px; }
.timeline-entry p { margin: 8px 0 0; color: var(--admin-text-primary, #111827); line-height: 1.6; white-space: pre-wrap; }
.result-counts { display: flex; flex-wrap: wrap; gap: 8px 12px; font-size: 12px; }
.success-text { color: #15803d !important; }
.warning-text { color: #c2410c !important; }
.danger-text { color: #dc2626 !important; }
.push-package-bar { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-bottom: 22px; border: 1px solid var(--admin-border, #dfe5ec); border-radius: 6px; background: #f8fafc; }
.push-package-bar > div { min-width: 0; padding: 14px 16px; border-right: 1px solid var(--admin-border, #dfe5ec); }
.push-package-bar > div:last-child { border-right: 0; }
.push-package-bar span { display: block; color: var(--admin-text-muted, #64748b); font-size: 12px; }
.push-package-bar strong { display: block; overflow-wrap: anywhere; margin-top: 6px; color: var(--admin-text-primary, #111827); font-size: 14px; }
.push-form :deep(.el-radio-group) { max-width: 100%; }
.field-suffix { margin-left: 8px; color: var(--admin-text-primary, #111827); }
.field-hint { margin-left: 12px; color: var(--admin-text-muted, #64748b); font-size: 12px; }
.device-option-state { float: right; color: var(--admin-text-muted, #64748b); font-size: 12px; }
.delivery-preview { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; padding: 14px; border: 1px solid #bfdbfe; border-radius: 6px; background: #eff6ff; }
.delivery-preview > div { text-align: center; }
.delivery-preview span { display: block; color: #475569; font-size: 12px; }
.delivery-preview strong { display: inline-block; margin-top: 6px; color: #1d4ed8; font-size: 20px; }
.delivery-preview small { margin-left: 4px; color: #64748b; }
.missing-state { display: grid; min-height: 60vh; place-items: center; }
@media (max-width: 768px) {
  .firmware-identity { align-items: flex-start; padding: 16px; }
  .detail-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .push-package-bar, .delivery-preview { grid-template-columns: 1fr; }
  .push-package-bar > div { border-right: 0; border-bottom: 1px solid var(--admin-border, #dfe5ec); }
  .push-package-bar > div:last-child { border-bottom: 0; }
  .timeline-entry__head { align-items: flex-start; flex-direction: column; gap: 4px; }
}
</style>
