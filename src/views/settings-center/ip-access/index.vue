<template>
  <div class="app-container business-page ip-access-page">
    <div class="business-page-shell">
      <page-header-card
        title="IP访问控制"
        description="维护后台访问白名单，仅启用规则中记录的 IP 地址或网段可以访问系统。"
      >
        <template #extra>
          <el-button type="primary" icon="Plus" @click="openCreateDialog">新增 IP 规则</el-button>
        </template>
      </page-header-card>

      <section-card title="访问策略" description="查看当前访问端与白名单校验状态。">
        <div class="ip-policy-row">
          <div class="ip-policy-state">
            <span class="ip-policy-state__dot" :class="{ 'is-enabled': settings.enabled }" />
            <div>
              <div class="ip-policy-state__title">白名单校验</div>
              <div class="ip-policy-state__desc">
                {{ settings.enabled ? '仅允许命中启用规则的 IP 访问' : '当前未限制访问来源' }}
              </div>
            </div>
          </div>
          <el-switch
            :model-value="settings.enabled"
            inline-prompt
            active-text="启用"
            inactive-text="停用"
            @change="handleControlChange"
          />
        </div>

        <div class="ip-policy-metrics">
          <div class="ip-policy-metric">
            <span>当前访问 IP</span>
            <strong class="ip-address-text">{{ settings.currentIp }}</strong>
          </div>
          <div class="ip-policy-metric">
            <span>访问状态</span>
            <el-tag :type="settings.currentIpAllowed ? 'success' : 'danger'" effect="light">
              {{ settings.currentIpAllowed ? '允许访问' : '禁止访问' }}
            </el-tag>
          </div>
          <div class="ip-policy-metric">
            <span>命中规则</span>
            <strong>{{ settings.matchedRuleName || (settings.enabled ? '--' : '校验未启用') }}</strong>
          </div>
          <div class="ip-policy-metric">
            <span>启用规则</span>
            <strong>{{ settings.enabledRuleCount }} / {{ settings.totalRuleCount }}</strong>
          </div>
        </div>
      </section-card>

      <el-card shadow="never" class="business-query-card">
        <el-form :model="queryParams" :inline="true" label-width="76px" class="business-query-form" @submit.prevent>
          <el-form-item label="规则信息">
            <el-input v-model="queryParams.keyword" placeholder="请输入名称/IP/备注" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="规则类型">
            <el-select v-model="queryParams.ruleType" placeholder="请选择类型" clearable>
              <el-option v-for="item in ipRuleTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option v-for="item in ipRuleStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item class="business-query-form__actions">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <section-card title="IP 白名单" description="单个 IP 支持 IPv4 和 IPv6，网段使用 CIDR 格式。">
        <template #extra>
          <el-button plain icon="Refresh" @click="loadTableData">刷新</el-button>
        </template>

        <el-table :data="rows" stripe>
          <el-table-column prop="ruleName" label="规则名称" min-width="150" />
          <el-table-column prop="address" label="IP 地址 / 网段" min-width="190">
            <template #default="{ row }">
              <span class="ip-address-text">{{ row.address }}</span>
            </template>
          </el-table-column>
          <el-table-column label="规则类型" min-width="110" align="center">
            <template #default="{ row }">
              <status-tag :value="row.ruleType" :options="ipRuleTypeOptions" />
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="90" align="center">
            <template #default="{ row }">
              <status-tag :value="row.status" :options="ipRuleStatusOptions" />
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="210" show-overflow-tooltip />
          <el-table-column prop="updatedBy" label="更新人" min-width="110" />
          <el-table-column prop="updatedAt" label="更新时间" min-width="170" />
          <el-table-column label="操作" fixed="right" min-width="180" align="right">
            <template #default="{ row }">
              <el-space wrap>
                <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
                <el-button
                  link
                  :type="row.status === 'enabled' ? 'warning' : 'success'"
                  @click="handleToggleStatus(row)"
                >
                  {{ row.status === 'enabled' ? '停用' : '启用' }}
                </el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>

        <div class="business-pagination-wrap">
          <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="loadTableData"
          />
        </div>
      </section-card>

      <el-dialog
        v-model="editDialogVisible"
        :title="editingId ? '编辑 IP 规则' : '新增 IP 规则'"
        width="680px"
        append-to-body
        destroy-on-close
      >
        <el-form
          ref="formRef"
          :model="formModel"
          :rules="formRules"
          label-width="102px"
          class="business-form-grid ip-rule-form"
        >
          <el-form-item label="规则名称" prop="ruleName">
            <el-input v-model="formModel.ruleName" maxlength="30" placeholder="请输入规则名称" />
          </el-form-item>
          <el-form-item label="规则类型" prop="ruleType">
            <el-select v-model="formModel.ruleType" placeholder="请选择规则类型" @change="handleRuleTypeChange">
              <el-option v-for="item in ipRuleTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="IP 地址" prop="address" class="is-full">
            <el-input
              v-model="formModel.address"
              :placeholder="formModel.ruleType === 'cidr' ? '例如 192.168.1.0/24' : '例如 192.168.1.20 或 ::1'"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formModel.status">
              <el-radio-button value="enabled">启用</el-radio-button>
              <el-radio-button value="disabled">停用</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注" prop="remark" class="is-full">
            <el-input v-model="formModel.remark" type="textarea" :rows="3" maxlength="100" show-word-limit />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="drawer-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitEdit">保存</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { nextTick, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeaderCard from '@/components/business/PageHeaderCard.vue'
import SectionCard from '@/components/business/SectionCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import { ipAccessModule, ipRuleStatusOptions, ipRuleTypeOptions } from '@/mock/ipAccess'

const rows = ref([])
const total = ref(0)
const editDialogVisible = ref(false)
const editingId = ref('')
const formRef = ref()
const settings = reactive(ipAccessModule.getSettings())

const queryParams = reactive({
  keyword: '',
  ruleType: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const formModel = reactive(createDefaultForm())

const formRules = {
  ruleName: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 2, max: 30, message: '规则名称长度为 2-30 个字符', trigger: 'blur' }
  ],
  ruleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  address: [{ required: true, validator: validateAddress, trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

loadTableData()

function createDefaultForm() {
  return {
    ruleName: '',
    ruleType: 'single',
    address: '',
    status: 'enabled',
    remark: ''
  }
}

function refreshSettings() {
  Object.assign(settings, ipAccessModule.getSettings())
}

function loadTableData() {
  const result = ipAccessModule.list(queryParams)
  rows.value = result.rows
  total.value = result.total
  refreshSettings()
}

function handleQuery() {
  queryParams.pageNum = 1
  loadTableData()
}

function handleReset() {
  Object.assign(queryParams, {
    keyword: '',
    ruleType: '',
    status: '',
    pageNum: 1,
    pageSize: queryParams.pageSize
  })
  loadTableData()
}

function openCreateDialog() {
  editingId.value = ''
  Object.assign(formModel, createDefaultForm())
  editDialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function openEditDialog(row) {
  editingId.value = row.id
  Object.assign(formModel, createDefaultForm(), row)
  editDialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function handleRuleTypeChange() {
  formModel.address = ''
  formRef.value?.clearValidate('address')
}

function validateAddress(rule, value, callback) {
  const result = ipAccessModule.validateAddress(value, formModel.ruleType)
  if (!result.ok) {
    callback(new Error(result.message))
    return
  }
  callback()
}

async function submitEdit() {
  try {
    await formRef.value?.validate()
    const duplicate = ipAccessModule.findByAddress(formModel.address, editingId.value)
    if (duplicate) {
      ElMessage.warning('该 IP 地址或网段已存在')
      return
    }

    if (editingId.value) {
      ipAccessModule.update({ ...formModel, id: editingId.value })
    } else {
      ipAccessModule.create(formModel)
    }
    editDialogVisible.value = false
    ElMessage.success(editingId.value ? 'IP 规则已更新' : 'IP 规则已新增')
    loadTableData()
  } catch (error) {
    if (error?.message) ElMessage.error(error.message)
  }
}

async function handleControlChange(value) {
  const enabling = Boolean(value)
  try {
    await ElMessageBox.confirm(
      enabling
        ? '启用后，未命中白名单的 IP 将无法访问系统。是否继续？'
        : '停用后，所有 IP 均可访问系统。是否继续？',
      enabling ? '启用白名单校验' : '停用白名单校验',
      {
        confirmButtonText: enabling ? '确认启用' : '确认停用',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'business-confirm-box'
      }
    )
    ipAccessModule.setEnabled(enabling)
    ElMessage.success(enabling ? '白名单校验已启用' : '白名单校验已停用')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close' && error?.message) ElMessage.error(error.message)
  } finally {
    refreshSettings()
  }
}

async function handleToggleStatus(row) {
  const nextStatus = row.status === 'enabled' ? 'disabled' : 'enabled'
  try {
    if (nextStatus === 'disabled') {
      await ElMessageBox.confirm(
        `停用规则“${row.ruleName}”后，该地址范围将不再允许访问。是否继续？`,
        '停用 IP 规则',
        {
          confirmButtonText: '确认停用',
          cancelButtonText: '取消',
          type: 'warning',
          customClass: 'business-confirm-box'
        }
      )
    }
    ipAccessModule.updateStatus(row.id, nextStatus)
    ElMessage.success(nextStatus === 'enabled' ? 'IP 规则已启用' : 'IP 规则已停用')
    loadTableData()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close' && error?.message) ElMessage.error(error.message)
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `删除规则“${row.ruleName}”后不可恢复，是否继续？`,
      '删除 IP 规则',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'business-confirm-box'
      }
    )
    ipAccessModule.remove(row.id)
    ElMessage.success('IP 规则已删除')
    if (rows.value.length === 1 && queryParams.pageNum > 1) queryParams.pageNum -= 1
    loadTableData()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close' && error?.message) ElMessage.error(error.message)
  }
}
</script>

<style lang="scss" scoped>
.ip-policy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--admin-border-soft, #e9edf2);
}

.ip-policy-state {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.ip-policy-state__dot {
  width: 10px;
  height: 10px;
  flex: 0 0 10px;
  border-radius: 50%;
  background: var(--el-color-info, #909399);
  box-shadow: 0 0 0 4px var(--el-fill-color, #f0f2f5);
}

.ip-policy-state__dot.is-enabled {
  background: var(--el-color-success, #67c23a);
  box-shadow: 0 0 0 4px var(--el-color-success-light-9, #f0f9eb);
}

.ip-policy-state__title {
  color: var(--admin-text-primary, #111827);
  font-size: 14px;
  font-weight: 600;
}

.ip-policy-state__desc {
  margin-top: 3px;
  color: var(--admin-text-muted, #64748b);
  font-size: 12px;
  line-height: 1.5;
}

.ip-policy-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding-top: 16px;
}

.ip-policy-metric {
  min-width: 0;
  padding: 0 18px;
  border-left: 1px solid var(--admin-border-soft, #e9edf2);
}

.ip-policy-metric:first-child {
  padding-left: 0;
  border-left: 0;
}

.ip-policy-metric > span:first-child {
  display: block;
  margin-bottom: 7px;
  color: var(--admin-text-muted, #64748b);
  font-size: 12px;
}

.ip-policy-metric strong {
  display: block;
  overflow: hidden;
  color: var(--admin-text-primary, #111827);
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ip-address-text {
  color: var(--admin-text-primary, #111827);
  font-family: Consolas, 'Courier New', monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
}

.ip-rule-form :deep(.el-select) {
  width: 100%;
}

@media (max-width: 900px) {
  .ip-policy-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px 0;
  }

  .ip-policy-metric:nth-child(3) {
    padding-left: 0;
    border-left: 0;
  }
}

@media (max-width: 640px) {
  .ip-policy-row {
    align-items: flex-start;
  }

  .ip-policy-metrics {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .ip-policy-metric,
  .ip-policy-metric:nth-child(3) {
    padding: 12px 0;
    border-left: 0;
    border-bottom: 1px solid var(--admin-border-soft, #e9edf2);
  }

  .ip-policy-metric:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }
}
</style>
