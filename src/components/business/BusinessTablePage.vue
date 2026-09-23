<template>
  <div class="app-container business-page">
    <div class="business-page-shell">
      <page-header-card :title="title" :description="description">
        <template #extra>
          <slot name="header-extra" />
        </template>
      </page-header-card>

      <div v-if="$slots.summary" class="business-summary-slot">
        <slot name="summary" :rows="tableRows" :total="total" :query-model="queryModel" :reload="loadData" />
      </div>

      <el-card
        v-show="showSearch"
        shadow="never"
        class="business-query-card"
      >
        <div class="business-query-card__head">
          <div class="business-query-card__meta">
            <h2 class="business-query-card__title">筛选条件</h2>
            <div class="business-query-card__desc">按名称、状态、时间等条件快速筛选当前{{ title }}数据。</div>
          </div>
        </div>
        <el-form
          :model="queryModel"
          :inline="true"
          label-width="auto"
          class="business-query-form"
          @submit.prevent
        >
          <template v-for="field in basicFilters" :key="field.key">
            <el-form-item :label="field.label" class="business-query-form__item">
              <component :is="getFilterComponent(field)" v-model="queryModel[field.key]" v-bind="getFilterProps(field)">
                <template v-if="field.type === 'select'">
                  <el-option v-for="option in field.options || []" :key="option.value" :label="option.label" :value="option.value" />
                </template>
              </component>
            </el-form-item>
          </template>
          <template v-if="showAdvanced">
            <template v-for="field in advancedFilters" :key="field.key">
              <el-form-item :label="field.label" class="business-query-form__item">
                <component :is="getFilterComponent(field)" v-model="queryModel[field.key]" v-bind="getFilterProps(field)">
                  <template v-if="field.type === 'select'">
                    <el-option v-for="option in field.options || []" :key="option.value" :label="option.label" :value="option.value" />
                  </template>
                </component>
              </el-form-item>
            </template>
          </template>
          <el-form-item class="business-query-form__actions">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="handleReset">重置</el-button>
            <el-button v-if="advancedFilters.length" link type="primary" @click="showAdvanced = !showAdvanced">
              {{ showAdvanced ? '收起' : '展开' }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="never" class="business-table-card">
        <div class="business-table-card__head">
          <div class="business-table-card__meta">
            <h2 class="business-table-card__title">{{ listSectionTitle }}</h2>
            <div class="business-table-card__desc">
              共 {{ total }} 条
              <span v-if="selectedIds.length">，已选 {{ selectedIds.length }} 条</span>
            </div>
          </div>

          <div class="business-table-card__actions">
            <div class="business-toolbar-row__left">
              <el-button v-if="allowAdd" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
              <el-button
                v-if="allowBatchDelete"
                type="danger"
                plain
                icon="Delete"
                :disabled="!selectedIds.length"
                @click="handleBatchDelete"
              >
                批量删除
              </el-button>
              <el-button v-if="showExport" plain icon="Download" @click="handleExport">导出</el-button>
              <slot name="toolbar-left" :reload="loadData" :selected-ids="selectedIds" />
            </div>

            <RightToolbar
              v-model:showSearch="showSearch"
              :columns="columnsState"
              :storage-key="toolbarStorageKey"
              @queryTable="loadData"
            />
          </div>
        </div>

        <div class="business-table-wrap">
          <el-table :data="tableRows" stripe empty-text="暂无数据" @selection-change="handleSelectionChange">
            <el-table-column v-if="selectable" type="selection" width="48" />
            <el-table-column
              v-for="column in visibleColumns"
              :key="column.key"
              :prop="column.key"
              :label="column.label"
              :min-width="column.width || 120"
              :align="column.align || 'left'"
              :header-align="column.align || 'left'"
              :show-overflow-tooltip="column.type !== 'image'"
            >
              <template #default="scope">
                <template v-if="column.type === 'status'">
                  <status-tag :value="scope.row[column.key]" :options="column.options || []" />
                </template>
                <template v-else-if="column.type === 'money'">
                  {{ formatFieldDisplay(column, scope.row) }}
                </template>
                <template v-else-if="column.type === 'number'">
                  {{ formatFieldDisplay(column, scope.row) }}
                </template>
                <template v-else-if="column.type === 'image'">
                  <el-image :src="scope.row[column.key]" fit="cover" preview-teleported class="business-image-cell" />
                </template>
                <template v-else>
                  {{ scope.row[column.key] || '--' }}
                </template>
              </template>
            </el-table-column>
            <el-table-column
              v-if="showActionColumn"
              label="操作"
              fixed="right"
              :min-width="resolvedActionColumnWidth"
              align="right"
              class-name="business-table__action-column"
            >
              <template #default="scope">
                <div class="business-action-group">
                  <el-button
                    v-for="action in currentActions(scope.row)"
                    :key="action.key"
                    link
                    :type="action.type || 'primary'"
                    @click="handleAction(action, scope.row)"
                  >
                    {{ action.label }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="business-pagination-wrap">
          <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryModel.pageNum"
            v-model:limit="queryModel.pageSize"
            @pagination="loadData"
          />
        </div>
      </el-card>
    </div>

    <el-dialog
      v-if="formFields.length"
      v-model="dialogVisible"
      :title="isEdit ? '编辑' + title : '新增' + title"
      width="780px"
      append-to-body
      class="business-dialog"
    >
      <el-form :model="formModel" label-width="96px" class="business-form-grid">
        <el-form-item v-for="field in formFields" :key="field.key" :label="field.label" :class="field.full ? 'is-full' : ''">
          <component :is="getFormComponent(field)" v-model="formModel[field.key]" v-bind="getFormProps(field)">
            <template v-if="field.type === 'select'">
              <el-option v-for="option in field.options || []" :key="option.value" :label="option.label" :value="option.value" />
            </template>
          </component>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="drawerVisible" :title="detailDrawerTitle" size="560px" class="business-drawer">
      <div class="business-drawer-panel">
        <div class="business-drawer-panel__head">
          <div class="business-drawer-panel__title">{{ title }}详情</div>
          <div class="business-drawer-panel__desc">查看当前记录的摘要信息与完整字段，便于快速核对关键信息。</div>
        </div>
        <div v-if="detailSummaryItems.length" class="business-drawer-summary">
          <div v-for="item in detailSummaryItems" :key="item.label" class="business-drawer-summary__item">
            <div class="business-drawer-summary__label">{{ item.label }}</div>
            <div class="business-drawer-summary__value">
              <template v-if="item.type === 'status'">
                <status-tag :value="item.value" :options="item.options || []" />
              </template>
              <template v-else>
                {{ item.value }}
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="business-detail-grid">
        <div v-for="field in detailFieldList" :key="field.key" class="business-detail-item">
          <div class="business-detail-item__label">{{ field.label }}</div>
          <div class="business-detail-item__value">
            <template v-if="field.type === 'status'">
              <status-tag :value="detailModel[field.key]" :options="field.options || []" />
            </template>
            <template v-else-if="field.type === 'image' && detailModel[field.key]">
              <el-image :src="detailModel[field.key]" fit="cover" preview-teleported class="business-image-cell" />
            </template>
            <template v-else-if="field.type === 'money'">
              {{ formatFieldDisplay(field, detailModel) }}
            </template>
            <template v-else-if="field.type === 'number'">
              {{ formatFieldDisplay(field, detailModel) }}
            </template>
            <template v-else>
              {{ formatFieldDisplay(field, detailModel) }}
            </template>
          </div>
        </div>
      </div>
    </el-drawer>

    <confirm-action-dialog
      v-model="confirmState.visible"
      :title="confirmConfig.title"
      :description="confirmConfig.description"
      :target-name="confirmConfig.targetName"
      :impact="confirmConfig.impact"
      :confirm-text="confirmConfig.confirmText"
      :confirm-type="confirmConfig.confirmType"
      @confirm="confirmAction"
    />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { formatNumber, deepClone } from '@/mock/_helpers'
import { formatCountUnit, formatMoneyUnit, formatPercentUnit } from '@/utils/unitDisplay'
import LocalImageUpload from './LocalImageUpload.vue'
import UnitNumberInput from './UnitNumberInput.vue'
import ConfirmActionDialog from './ConfirmActionDialog.vue'
import PageHeaderCard from './PageHeaderCard.vue'
import StatusTag from './StatusTag.vue'

const emit = defineEmits(['data-change'])

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  module: { type: Object, required: true },
  primaryKey: { type: String, default: 'id' },
  filters: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  formFields: { type: Array, default: () => [] },
  detailFields: { type: Array, default: () => [] },
  rowActions: { type: Array, default: () => ['view', 'edit', 'delete'] },
  actionHandlers: { type: Object, default: () => ({}) },
  detailRoute: { type: [String, Function], default: '' },
  editRoute: { type: [String, Function], default: '' },
  createRoute: { type: [String, Function], default: '' },
  confirmMap: { type: Object, default: () => ({}) },
  submitTransformer: { type: Function, default: null },
  allowAdd: { type: Boolean, default: true },
  allowBatchDelete: { type: Boolean, default: true },
  selectable: { type: Boolean, default: true },
  showExport: { type: Boolean, default: true },
  actionColumnWidth: { type: Number, default: 180 }
})

const actionPresets = {
  view: { key: 'view', label: '详情', type: 'primary' },
  edit: { key: 'edit', label: '编辑', type: 'primary' },
  delete: { key: 'delete', label: '删除', type: 'danger' },
  approve: { key: 'approve', label: '通过', type: 'success' },
  reject: { key: 'reject', label: '驳回', type: 'danger' },
  pay: { key: 'pay', label: '标记打款', type: 'warning' },
  publish: { key: 'publish', label: '发布', type: 'success' },
  offline: { key: 'offline', label: '下架', type: 'info' },
  freeze: { key: 'freeze', label: '冻结', type: 'warning' },
  ban: { key: 'ban', label: '封禁', type: 'danger' },
  restore: { key: 'restore', label: '恢复', type: 'success' },
  enable: { key: 'enable', label: '启用', type: 'success' },
  disable: { key: 'disable', label: '停用', type: 'warning' },
  renew: { key: 'renew', label: '续签', type: 'success' },
  buyback: { key: 'buyback', label: '回购', type: 'warning' },
  retrieve: { key: 'retrieve', label: '索回', type: 'danger' },
  read: { key: 'read', label: '标已读', type: 'success' },
  top: { key: 'top', label: '置顶', type: 'warning' },
  untop: { key: 'untop', label: '取消置顶', type: 'info' },
  resetPwd: { key: 'resetPwd', label: '重置密码', type: 'warning' }
}

const actionOrderMap = {
  view: 10,
  edit: 20,
  top: 30,
  untop: 31,
  read: 35,
  publish: 40,
  restore: 41,
  enable: 42,
  approve: 43,
  renew: 44,
  pay: 45,
  unbind: 49,
  offline: 50,
  disable: 51,
  reject: 52,
  buyback: 53,
  freeze: 60,
  retrieve: 61,
  resetPwd: 70,
  ban: 80,
  delete: 90
}

const router = useRouter()
const dialogVisible = ref(false)
const drawerVisible = ref(false)
const isEdit = ref(false)
const showSearch = ref(true)
const showAdvanced = ref(false)
const tableRows = ref([])
const total = ref(0)
const selectedIds = ref([])
const detailModel = ref({})
const columnsState = ref(props.columns.map(item => ({ ...item, visible: item.visible !== false })))
const formModel = ref({})
const queryModel = reactive(buildInitialQuery())
const confirmState = reactive({
  visible: false,
  actionKey: '',
  row: null,
  batch: false
})

const normalFilters = computed(() => props.filters.filter(item => !item.advanced))
const basicFilters = computed(() => normalFilters.value.slice(0, 4))
const advancedFilters = computed(() => [...normalFilters.value.slice(4), ...props.filters.filter(item => item.advanced)])
const visibleColumns = computed(() => columnsState.value.filter(item => item.visible !== false))
const showActionColumn = computed(() => props.rowActions.length > 0)
const detailFieldList = computed(() => props.detailFields.length ? props.detailFields : (props.formFields.length ? props.formFields : props.columns))
const toolbarStorageKey = computed(() => `business-table:${String(props.title).replace(/\s+/g, '-')}`)
const listSectionTitle = computed(() => {
  if (/(列表|记录|任务|日志|明细|数据)$/.test(props.title)) return props.title
  if (/管理$/.test(props.title)) return props.title.replace(/管理$/, '列表')
  return `${props.title}列表`
})
const resolvedActionColumnWidth = computed(() => {
  const rowActionCounts = tableRows.value.map(row => currentActions(row).length)
  const actionCount = Math.max(props.rowActions.length || 0, ...rowActionCounts, 1)
  const estimatedWidth = actionCount * 34 + 56
  return Math.max(props.actionColumnWidth, Math.min(estimatedWidth, 220))
})
const detailDrawerTitle = computed(() => {
  const primaryValue = detailModel.value?.[props.primaryKey]
  return primaryValue !== undefined && primaryValue !== null && primaryValue !== ''
    ? `${props.title}详情 · #${primaryValue}`
    : `${props.title}详情`
})
const detailSummaryItems = computed(() => {
  const model = detailModel.value || {}
  const usedKeys = new Set()
  const items = []

  const pushItem = item => {
    if (!item || usedKeys.has(item.label)) return
    if (item.value === undefined || item.value === null || item.value === '') return
    usedKeys.add(item.label)
    items.push(item)
  }

  pushItem({ label: '记录编号', value: model[props.primaryKey] })

  const keywordField = detailFieldList.value.find(field => {
    if ([props.primaryKey, 'status'].includes(field.key)) return false
    if (['image', 'upload', 'textarea'].includes(field.type)) return false
    const value = model[field.key]
    return value !== undefined && value !== null && value !== ''
  })
  if (keywordField) {
    pushItem({ label: keywordField.label, value: formatFieldDisplay(keywordField, model) })
  }

  const statusField = detailFieldList.value.find(field => field.type === 'status' && model[field.key] !== undefined && model[field.key] !== null && model[field.key] !== '')
  if (statusField) {
    pushItem({ label: statusField.label, value: model[statusField.key], type: 'status', options: statusField.options || [] })
  }

  const timeField = detailFieldList.value.find(field => {
    if (field.key === props.primaryKey) return false
    return /time|date|时间|日期/i.test(field.key) || /时间|日期/.test(field.label)
  })
  if (timeField) {
    pushItem({ label: timeField.label, value: formatFieldDisplay(timeField, model) })
  }

  return items.slice(0, 4)
})
const defaultConfirmMap = {
  delete: { title: '确认删除', description: '删除后当前记录将从本地静态列表中移除。', confirmText: '确认删除', confirmType: 'danger', impact: '该操作不可撤销，请确认后继续。' },
  batchDelete: { title: '确认批量删除', description: '批量删除后，所选记录会从当前静态列表中移除。', confirmText: '确认批量删除', confirmType: 'danger', impact: '该操作不可撤销，请确认后继续。' },
  approve: { title: '确认通过', description: '确认通过后将立即更新当前记录状态。', confirmText: '确认通过', confirmType: 'success' },
  reject: { title: '确认驳回', description: '驳回后当前记录将进入驳回状态。', confirmText: '确认驳回', confirmType: 'danger' },
  pay: { title: '确认标记打款', description: '确认后将把当前记录标记为已打款。', confirmText: '确认打款', confirmType: 'warning' },
  publish: { title: '确认发布', description: '发布后内容将进入生效状态。', confirmText: '确认发布', confirmType: 'success' },
  offline: { title: '确认下架', description: '下架后当前内容将不再对外展示。', confirmText: '确认下架', confirmType: 'warning' },
  freeze: { title: '确认冻结', description: '冻结后当前对象将被限制使用。', confirmText: '确认冻结', confirmType: 'warning' },
  ban: { title: '确认封禁', description: '封禁后当前对象将无法继续正常使用。', confirmText: '确认封禁', confirmType: 'danger' },
  restore: { title: '确认恢复', description: '恢复后当前对象将重新回到正常状态。', confirmText: '确认恢复', confirmType: 'success' },
  enable: { title: '确认启用', description: '启用后当前对象将恢复可用状态。', confirmText: '确认启用', confirmType: 'success' },
  disable: { title: '确认停用', description: '停用后当前对象将进入不可用状态。', confirmText: '确认停用', confirmType: 'warning' },
  renew: { title: '确认续签', description: '续签后将立即刷新当前记录的处理状态。', confirmText: '确认续签', confirmType: 'success' },
  buyback: { title: '确认回购', description: '回购后将更新当前记录的处理状态。', confirmText: '确认回购', confirmType: 'warning' },
  retrieve: { title: '确认索回', description: '索回后将结束当前记录的处理流程。', confirmText: '确认索回', confirmType: 'danger' },
  read: { title: '确认标已读', description: '确认后将把当前消息标记为已读。', confirmText: '确认标记', confirmType: 'success' },
  top: { title: '确认置顶', description: '置顶后当前内容会优先展示。', confirmText: '确认置顶', confirmType: 'warning' },
  untop: { title: '确认取消置顶', description: '取消后当前内容将恢复正常排序。', confirmText: '确认取消', confirmType: 'warning' },
  resetPwd: { title: '确认重置密码', description: '重置后将立即生成新的初始密码。', confirmText: '确认重置', confirmType: 'warning' }
}
const confirmConfig = computed(() => {
  const row = confirmState.row || {}
  const base = confirmState.batch
    ? defaultConfirmMap.batchDelete
    : (props.confirmMap[confirmState.actionKey] || defaultConfirmMap[confirmState.actionKey] || {})
  const targetName = confirmState.batch
    ? `已选 ${selectedIds.value.length} 条记录`
    : resolveTargetName(row)
  return {
    title: base.title || `确认${base.confirmText || '操作'}`,
    description: base.description || '确认后将执行当前操作。',
    targetName,
    impact: base.impact || '',
    confirmText: base.confirmText || '确认',
    confirmType: base.confirmType || 'danger'
  }
})

function buildInitialQuery() {
  const model = { pageNum: 1, pageSize: 10 }
  props.filters.forEach(field => {
    model[field.key] = field.default ?? (field.type === 'daterange' ? [] : '')
  })
  return model
}

function createEmptyForm() {
  const model = {}
  props.formFields.forEach(field => {
    if (field.default !== undefined) model[field.key] = deepClone(field.default)
    else if (field.type === 'number') model[field.key] = 0
    else model[field.key] = ''
  })
  return model
}

function loadData() {
  const result = props.module.list({ ...queryModel })
  tableRows.value = result.rows
  total.value = result.total
}

function handleQuery() {
  queryModel.pageNum = 1
  loadData()
}

function handleReset() {
  const initial = buildInitialQuery()
  Object.keys(initial).forEach(key => {
    queryModel[key] = initial[key]
  })
  showAdvanced.value = false
  loadData()
}

function handleSelectionChange(selection) {
  selectedIds.value = selection.map(item => item[props.primaryKey])
}

function handleAdd() {
  const targetRoute = resolveRoute(props.createRoute)
  if (targetRoute) {
    router.push(targetRoute)
    return
  }
  isEdit.value = false
  formModel.value = createEmptyForm()
  dialogVisible.value = true
}

function handleView(row) {
  const targetRoute = resolveRoute(props.detailRoute, row)
  if (targetRoute) {
    router.push(targetRoute)
    return
  }
  detailModel.value = props.module.detail(row[props.primaryKey]) || deepClone(row)
  drawerVisible.value = true
}

function handleEdit(row) {
  const targetRoute = resolveRoute(props.editRoute, row)
  if (targetRoute) {
    router.push(targetRoute)
    return
  }
  isEdit.value = true
  formModel.value = props.module.detail(row[props.primaryKey]) || deepClone(row)
  dialogVisible.value = true
}

function handleDelete(row) {
  props.module.remove(row[props.primaryKey])
  ElMessage.success('删除成功')
  loadData()
  emit('data-change')
}

function handleBatchDelete() {
  if (!props.allowBatchDelete || !selectedIds.value.length) return
  openConfirm('batchDelete', null, true)
}

function submitForm() {
  const payload = props.submitTransformer ? props.submitTransformer(deepClone(formModel.value), isEdit.value) : formModel.value
  if (payload === false) return
  if (isEdit.value) {
    props.module.update(payload)
    ElMessage.success('修改成功')
  } else {
    props.module.add(payload)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
  emit('data-change')
}

function handleExport() {
  ElMessage.success(`已模拟导出 ${props.title} 数据`)
}

function currentActions(row) {
  return props.rowActions
    .map(item => typeof item === 'string' ? actionPresets[item] : { ...(actionPresets[item.key] || {}), ...item })
    .filter(item => item && (!item.when || item.when(row)))
    .sort((a, b) => (actionOrderMap[a.key] || 999) - (actionOrderMap[b.key] || 999))
}

async function handleAction(action, row) {
  if (action.key === 'view') return handleView(row)
  if (action.key === 'edit') return handleEdit(row)
  if (shouldConfirm(action.key)) {
    openConfirm(action.key, row)
    return
  }
  if (action.key === 'delete') return handleDelete(row)
  return await executeAction(action, row)
}

async function executeAction(action, row) {
  const handler = props.actionHandlers[action.key]
  if (handler) {
    const result = await handler(row)
    if (result === false) return
    ElMessage.success(action.successMessage || `${action.label}成功`)
    loadData()
    emit('data-change')
  }
}

function shouldConfirm(actionKey) {
  return ['delete', 'approve', 'reject', 'pay', 'publish', 'offline', 'freeze', 'ban', 'restore', 'enable', 'disable', 'renew', 'buyback', 'retrieve', 'read', 'top', 'untop', 'resetPwd'].includes(actionKey)
    || Boolean(props.confirmMap[actionKey])
}

function openConfirm(actionKey, row, batch = false) {
  confirmState.visible = true
  confirmState.actionKey = actionKey
  confirmState.row = row
  confirmState.batch = batch
}

async function confirmAction() {
  if (confirmState.batch) {
    props.module.batchRemove(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    loadData()
    emit('data-change')
  } else if (confirmState.actionKey === 'delete') {
    handleDelete(confirmState.row)
  } else {
    const action = currentActions(confirmState.row).find(item => item.key === confirmState.actionKey)
    if (action) await executeAction(action, confirmState.row)
  }

  confirmState.visible = false
  confirmState.actionKey = ''
  confirmState.row = null
  confirmState.batch = false
}

function resolveRoute(target, row) {
  if (!target) return ''
  return typeof target === 'function' ? target(row) : target
}

function resolveTargetName(row) {
  const model = row || {}
  const primaryValue = model[props.primaryKey]
  const textColumn = props.columns.find(item => item.key !== props.primaryKey && item.type !== 'image')
  return textColumn && model[textColumn.key]
    ? `${textColumn.label}：${model[textColumn.key]}`
    : (primaryValue !== undefined ? `编号：${primaryValue}` : '')
}

function getFilterComponent(field) {
  if (field.type === 'select') return 'el-select'
  if (field.type === 'daterange') return 'el-date-picker'
  return 'el-input'
}

function getFilterProps(field) {
  if (field.type === 'select') return { placeholder: field.placeholder || `请选择${field.label}`, clearable: true }
  if (field.type === 'daterange') return { type: 'daterange', valueFormat: 'YYYY-MM-DD', rangeSeparator: '-', startPlaceholder: '开始日期', endPlaceholder: '结束日期' }
  return { placeholder: field.placeholder || `请输入${field.label}`, clearable: true, onKeyup: event => event.key === 'Enter' && handleQuery() }
}

function getFormComponent(field) {
  if (field.type === 'select') return 'el-select'
  if (field.type === 'textarea') return 'el-input'
  if (field.type === 'number' && field.unit) return UnitNumberInput
  if (field.type === 'number') return 'el-input-number'
  if (field.type === 'date') return 'el-date-picker'
  if (field.type === 'upload') return LocalImageUpload
  return 'el-input'
}

const formFieldKnownKeys = ['key', 'label', 'type', 'options', 'default', 'full', 'placeholder', 'rows', 'advanced', 'unit', 'precision', 'min', 'max']

function getFormProps(field) {
  let props
  if (field.type === 'select') props = { placeholder: field.placeholder || `请选择${field.label}`, clearable: true, style: 'width: 100%' }
  else if (field.type === 'textarea') props = { type: 'textarea', rows: field.rows || 4, placeholder: field.placeholder || `请输入${field.label}` }
  else if (field.type === 'number' && field.unit) props = { unit: field.unit, min: 0, precision: field.precision || 0 }
  else if (field.type === 'number') props = { min: 0, precision: field.precision || 0, controlsPosition: 'right' }
  else if (field.type === 'date') props = { type: 'datetime', valueFormat: 'YYYY-MM-DD HH:mm:ss', placeholder: field.placeholder || `请选择${field.label}`, style: 'width: 100%' }
  else props = { placeholder: field.placeholder || `请输入${field.label}` }
  Object.keys(field).forEach(k => {
    if (!formFieldKnownKeys.includes(k) && k !== 'when') {
      props[k] = field[k]
    }
  })
  return props
}

function formatFieldDisplay(field, model) {
  const value = model?.[field.key]
  if (value === undefined || value === null || value === '') return '--'
  if (Array.isArray(value)) return value.length ? value.join('、') : '--'
  if (field.type === 'money') return formatMoneyUnit(value, field.unit || '元', field.precision ?? 2)
  if (field.type === 'number' && field.unit === '%') return formatPercentUnit(value, field.precision ?? 2)
  if (field.type === 'number' && field.unit) return formatCountUnit(value, field.unit, field.precision ?? 0)
  if (field.type === 'number') return formatNumber(value, field.precision || 0)
  if (typeof value === 'boolean') return value ? '是' : '否'
  return value
}

loadData()
</script>

<style lang="scss" scoped>
.business-summary-slot {
  margin-bottom: 12px;
}

.business-query-card__head,
.business-table-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.business-query-card__head {
  padding: 12px 14px 0;
}

.business-query-card__meta,
.business-table-card__meta {
  min-width: 0;
}

.business-query-card__title,
.business-table-card__title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--admin-text-primary, #111827);
}

.business-query-card__desc,
.business-table-card__desc {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--admin-text-muted, #64748b);
}

.business-query-card {
  border-radius: 8px;
}

.business-query-form__item :deep(.el-form-item__label) {
  white-space: nowrap;
  word-break: keep-all;
  justify-content: flex-start;
  text-align: left;
  padding-right: 12px;
}

.business-query-form__item :deep(.el-form-item__content) {
  min-width: 0;
}

.business-query-form__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.business-table-card__head {
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--admin-border-soft, #e9edf2);
}

.business-table-card__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.business-toolbar-row__left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.business-action-group {
  display: inline-flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 2px 6px;
  max-width: 100%;
  margin-left: auto;
}

.business-action-group :deep(.el-button) {
  margin-left: 0;
  padding: 0 2px;
  min-height: 24px;
  font-size: 13px;
  line-height: 1.2;
  font-weight: 500;
  opacity: 0.92;
  transition: color 0.2s ease, opacity 0.2s ease;
}

.business-action-group :deep(.el-button:hover) {
  opacity: 1;
}

.business-action-group :deep(.el-button--primary.is-link) {
  color: #2563eb;
}

.business-action-group :deep(.el-button--warning.is-link) {
  color: #d97706;
}

.business-action-group :deep(.el-button--danger.is-link) {
  color: #dc2626;
}

.business-action-group :deep(.el-button--success.is-link) {
  color: #059669;
}

.business-action-group :deep(.el-button--info.is-link) {
  color: var(--admin-text-muted, #64748b);
}

.business-table-card :deep(.el-table th) {
  padding: 10px 0;
}

.business-table-card :deep(.el-table td) {
  padding: 9px 0;
}

.business-table__action-column :deep(.cell) {
  display: flex;
  justify-content: flex-end;
  padding-left: 6px;
  padding-right: 6px;
}

@media (max-width: 768px) {
  .business-query-card__head,
  .business-table-card__head,
  .business-table-card__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .business-query-form__actions {
    justify-content: flex-start;
  }

  .business-action-group {
    justify-content: flex-start;
  }
}
</style>
