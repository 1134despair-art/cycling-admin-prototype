<template>
  <div class="app-container business-page">
    <div class="business-page-shell">
      <page-header-card
        title="产品列表"
        description="维护 APP 产品名称、分类、型号、卖点、详情内容，并与设备映射、教程内容联动配置。"
      >
        <template #extra>
          <el-button type="primary" icon="Plus" @click="openCreateDialog">新增产品</el-button>
        </template>
      </page-header-card>

      <el-card shadow="never" class="business-query-card">
        <el-form :model="queryParams" :inline="true" label-width="76px" class="business-query-form" @submit.prevent>
          <el-form-item label="产品信息">
            <el-input v-model="queryParams.keyword" placeholder="请输入产品名称/型号/卖点" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="产品分类">
            <el-select v-model="queryParams.category" placeholder="请选择分类" clearable>
              <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="设备类型">
            <el-select v-model="queryParams.deviceType" placeholder="请选择设备类型" clearable>
              <el-option v-for="item in staticDeviceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="上架状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item class="business-query-form__actions">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <section-card title="产品列表" description="支持查看产品基础信息、设备映射、教程关联和官网展示状态。">
        <template #extra>
          <el-button plain icon="Refresh" @click="loadTableData">刷新</el-button>
        </template>

        <el-table :data="rows" stripe>
          <el-table-column prop="id" label="产品ID" min-width="90" align="center" />
          <el-table-column prop="productName" label="产品名称" min-width="180" />
          <el-table-column prop="category" label="产品分类" min-width="130" />
          <el-table-column prop="productModel" label="型号" min-width="110" />
          <el-table-column prop="speedLevel" label="速别" min-width="90" align="center" />
          <el-table-column prop="deviceType" label="关联设备类型" min-width="120" align="center" />
          <el-table-column prop="deviceModel" label="关联设备型号" min-width="130" />
          <el-table-column prop="coverTag" label="产品卖点" min-width="160" />
          <el-table-column label="关联教程" min-width="220">
            <template #default="{ row }">
              <div class="tag-list">
                <el-tag v-for="item in row.relatedTutorials || []" :key="item" effect="light">{{ item }}</el-tag>
                <span v-if="!(row.relatedTutorials || []).length" class="table-placeholder">--</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="主图" min-width="100" align="center">
            <template #default="{ row }">
              <el-image :src="row.imageUrl" fit="cover" preview-teleported class="product-cover" />
            </template>
          </el-table-column>
          <el-table-column label="上架状态" min-width="100" align="center">
            <template #default="{ row }">
              <status-tag :value="row.status" :options="productStatusOptions" />
            </template>
          </el-table-column>
          <el-table-column label="官网显示" min-width="100" align="center">
            <template #default="{ row }">
              <status-tag :value="row.webVisible" :options="toggleOptions" />
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" min-width="90" align="center" />
          <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
          <el-table-column label="操作" fixed="right" min-width="220" align="right">
            <template #default="{ row }">
              <el-space wrap>
                <el-button link type="primary" @click="openDetailDrawer(row)">详情</el-button>
                <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
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

      <el-dialog v-model="editDialogVisible" :title="editingId ? '编辑产品' : '新增产品'" width="920px" append-to-body>
        <el-form :model="formModel" label-width="96px" class="business-form-grid">
          <el-form-item label="产品名称">
            <el-input v-model="formModel.productName" placeholder="请输入产品名称" />
          </el-form-item>
          <el-form-item label="产品分类">
            <el-select v-model="formModel.category" placeholder="请选择产品分类" style="width: 100%">
              <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="产品型号">
            <el-input v-model="formModel.productModel" placeholder="请输入产品型号" />
          </el-form-item>
          <el-form-item label="速别">
            <el-input v-model="formModel.speedLevel" placeholder="如 12S / 11S" />
          </el-form-item>
          <el-form-item label="关联设备类型">
            <el-select v-model="formModel.deviceType" placeholder="请选择关联设备类型" style="width: 100%">
              <el-option v-for="item in staticDeviceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="关联设备型号">
            <el-input v-model="formModel.deviceModel" placeholder="请输入关联设备型号" />
          </el-form-item>
          <el-form-item label="产品规格">
            <el-input v-model="formModel.parameters" placeholder="请输入产品规格简述" />
          </el-form-item>
          <el-form-item label="产品卖点">
            <el-input v-model="formModel.coverTag" placeholder="请输入产品卖点标签" />
          </el-form-item>
          <el-form-item label="功能亮点" class="is-full">
            <el-input v-model="formModel.sellingPoint" type="textarea" :rows="3" maxlength="180" show-word-limit />
          </el-form-item>
          <el-form-item label="APP详情介绍" class="is-full">
            <el-input v-model="formModel.appDetailContent" type="textarea" :rows="4" maxlength="500" show-word-limit />
          </el-form-item>
          <el-form-item label="官网详情介绍" class="is-full">
            <el-input v-model="formModel.webDetailContent" type="textarea" :rows="4" maxlength="500" show-word-limit />
          </el-form-item>
          <el-form-item label="视频链接">
            <el-input v-model="formModel.mediaAssets" placeholder="请输入视频链接或媒体说明" />
          </el-form-item>
          <el-form-item label="关联教程" class="is-full">
            <el-select
              v-model="formModel.relatedTutorials"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择关联教程"
              style="width: 100%"
            >
              <el-option v-for="item in tutorialOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="主图">
            <local-image-upload v-model="formModel.imageUrl" />
          </el-form-item>
          <el-form-item label="APP显示">
            <el-switch v-model="formModel.appVisible" inline-prompt active-text="显示" inactive-text="隐藏" />
          </el-form-item>
          <el-form-item label="官网显示">
            <el-switch v-model="formModel.webVisible" inline-prompt active-text="显示" inactive-text="隐藏" />
          </el-form-item>
          <el-form-item label="推荐状态">
            <el-select v-model="formModel.recommendStatus" placeholder="请选择推荐状态" style="width: 100%">
              <el-option label="推荐" value="recommended" />
              <el-option label="普通" value="normal" />
            </el-select>
          </el-form-item>
          <el-form-item label="上架状态">
            <el-radio-group v-model="formModel.status">
              <el-radio-button value="enabled">上架</el-radio-button>
              <el-radio-button value="disabled">下架</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="formModel.sort" :min="1" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-form>

        <el-collapse class="product-rule-collapse">
          <el-collapse-item name="rules" :title="`产品规则值（41 个固定字段，已填写 ${filledRuleCount} 项）`">
            <div class="product-rule-grid">
              <el-form-item v-for="item in fixedProductRuleFields" :key="item[1]" :label="item[0]">
                <el-input v-model="formModel.ruleValues[item[1]]" :type="item[1] === 'remarks' ? 'textarea' : 'text'" clearable />
              </el-form-item>
            </div>
          </el-collapse-item>
          <el-collapse-item name="features" title="可选技术特点">
            <div class="feature-toolbar"><el-button type="primary" plain icon="Plus" @click="addFeature">新增技术特点</el-button></div>
            <div v-for="(feature, index) in formModel.technicalFeatures" :key="index" class="feature-row">
              <el-input v-model="feature.title" placeholder="特点标题" />
              <el-input v-model="feature.description" placeholder="可选说明" />
              <el-input v-model="feature.image" placeholder="可选图片地址" />
              <el-input-number v-model="feature.sort" :min="1" controls-position="right" />
              <el-switch v-model="feature.enabled" />
              <el-button type="danger" plain icon="Delete" circle title="删除技术特点" @click="removeFeature(index)" />
            </div>
            <el-empty v-if="!formModel.technicalFeatures.length" description="未配置时 APP 和官网均不展示技术特点模块" :image-size="64" />
          </el-collapse-item>
        </el-collapse>

        <template #footer>
          <div class="drawer-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm">保存</el-button>
          </div>
        </template>
      </el-dialog>

      <el-drawer v-model="detailDrawerVisible" title="产品详情" size="560px" append-to-body>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="产品ID">{{ currentRow.id || '--' }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ currentRow.productName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="产品分类">{{ currentRow.category || '--' }}</el-descriptions-item>
          <el-descriptions-item label="产品型号">{{ currentRow.productModel || '--' }}</el-descriptions-item>
          <el-descriptions-item label="速别">{{ currentRow.speedLevel || '--' }}</el-descriptions-item>
          <el-descriptions-item label="关联设备类型">{{ currentRow.deviceType || '--' }}</el-descriptions-item>
          <el-descriptions-item label="关联设备型号">{{ currentRow.deviceModel || '--' }}</el-descriptions-item>
          <el-descriptions-item label="产品规格">{{ currentRow.parameters || '--' }}</el-descriptions-item>
          <el-descriptions-item label="产品卖点">{{ currentRow.coverTag || '--' }}</el-descriptions-item>
          <el-descriptions-item label="功能亮点">{{ currentRow.sellingPoint || '--' }}</el-descriptions-item>
          <el-descriptions-item label="APP详情介绍">{{ currentRow.appDetailContent || '--' }}</el-descriptions-item>
          <el-descriptions-item label="官网详情介绍">{{ currentRow.webDetailContent || '--' }}</el-descriptions-item>
          <el-descriptions-item label="视频链接">{{ currentRow.mediaAssets || '--' }}</el-descriptions-item>
          <el-descriptions-item label="APP显示">
            <status-tag :value="currentRow.appVisible" :options="toggleOptions" />
          </el-descriptions-item>
          <el-descriptions-item label="上架状态">
            <status-tag :value="currentRow.status" :options="productStatusOptions" />
          </el-descriptions-item>
          <el-descriptions-item label="官网显示">
            <status-tag :value="currentRow.webVisible" :options="toggleOptions" />
          </el-descriptions-item>
          <el-descriptions-item label="推荐状态">{{ currentRow.recommendStatus === 'recommended' ? '推荐' : '普通' }}</el-descriptions-item>
          <el-descriptions-item label="排序">{{ currentRow.sort ?? '--' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentRow.updatedAt || '--' }}</el-descriptions-item>
        </el-descriptions>

        <section-card title="关联教程" description="展示当前产品关联的教程内容。">
          <div class="tag-list">
            <el-tag v-for="item in currentRow.relatedTutorials || []" :key="item" effect="light">{{ item }}</el-tag>
            <span v-if="!(currentRow.relatedTutorials || []).length" class="table-placeholder">暂无关联教程</span>
          </div>
        </section-card>
      </el-drawer>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import LocalImageUpload from '@/components/business/LocalImageUpload.vue'
import PageHeaderCard from '@/components/business/PageHeaderCard.vue'
import SectionCard from '@/components/business/SectionCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import { buildBusinessConfirmOptions } from '@/plugins/modal'
import {
  fixedProductRuleFields,
  productCategoryModule,
  productModule,
  productStatusOptions
} from '@/mock/products'
import { tutorialModule } from '@/mock/content'

const rows = ref([])
const total = ref(0)
const editingId = ref('')
const currentRow = ref({})
const editDialogVisible = ref(false)
const detailDrawerVisible = ref(false)

const queryParams = reactive({
  keyword: '',
  category: '',
  deviceType: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const formModel = reactive(getDefaultForm())

const toggleOptions = [
  { label: '显示', value: true, type: 'success' },
  { label: '隐藏', value: false, type: 'info' }
]

const statusOptions = productStatusOptions.map(({ label, value }) => ({ label, value }))
const staticDeviceTypeOptions = ['码表', '心率带', '功率计', '前拨', '后拨', '手变', '夹器', '控制器', '骑行台', '升降座管'].map(value => ({ label: value, value }))
const categoryOptions = computed(() => productCategoryModule.snapshot().map(item => ({ label: item.categoryName, value: item.categoryName })))
const tutorialOptions = computed(() => tutorialModule.snapshot().map(item => ({ label: item.title, value: item.title })))
const filledRuleCount = computed(() => Object.values(formModel.ruleValues || {}).filter(value => String(value || '').trim()).length)

function getDefaultForm() {
  return {
    productName: '',
    category: '',
    productModel: '',
    speedLevel: '',
    deviceType: '',
    deviceModel: '',
    parameters: '',
    coverTag: '',
    sellingPoint: '',
    appDetailContent: '',
    webDetailContent: '',
    mediaAssets: '',
    relatedTutorials: [],
    imageUrl: '',
    appVisible: true,
    webVisible: true,
    recommendStatus: 'normal',
    status: 'enabled',
    sort: 1,
    ruleValues: {},
    technicalFeatures: []
  }
}

function nowString() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function loadTableData() {
  const result = productModule.list({
    keyword: queryParams.keyword,
    category: queryParams.category,
    deviceType: queryParams.deviceType,
    status: queryParams.status,
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize
  })
  rows.value = result.rows
  total.value = result.total
}

function handleQuery() {
  queryParams.pageNum = 1
  loadTableData()
}

function handleReset() {
  Object.assign(queryParams, {
    keyword: '',
    category: '',
    deviceType: '',
    status: '',
    pageNum: 1,
    pageSize: 10
  })
  loadTableData()
}

function openCreateDialog() {
  editingId.value = ''
  currentRow.value = {}
  Object.assign(formModel, getDefaultForm())
  editDialogVisible.value = true
}

function openEditDialog(row) {
  const detail = productModule.detail(row.id)
  if (!detail) return
  editingId.value = detail.id
  currentRow.value = detail
  Object.assign(formModel, {
    ...getDefaultForm(),
    ...detail,
    relatedTutorials: Array.isArray(detail.relatedTutorials) ? [...detail.relatedTutorials] : [],
    ruleValues: { ...(detail.ruleValues || {}) },
    technicalFeatures: (detail.technicalFeatures || []).map(item => ({ ...item, enabled: item.status !== 'disabled' }))
  })
  editDialogVisible.value = true
}

function openDetailDrawer(row) {
  currentRow.value = productModule.detail(row.id) || row
  detailDrawerVisible.value = true
}

function buildSubmitPayload() {
  return {
    productName: String(formModel.productName || '').trim(),
    category: String(formModel.category || '').trim(),
    productModel: String(formModel.productModel || '').trim(),
    speedLevel: String(formModel.speedLevel || '').trim(),
    deviceType: String(formModel.deviceType || '').trim(),
    deviceModel: String(formModel.deviceModel || '').trim(),
    parameters: String(formModel.parameters || '').trim(),
    coverTag: String(formModel.coverTag || '').trim(),
    sellingPoint: String(formModel.sellingPoint || '').trim(),
    appDetailContent: String(formModel.appDetailContent || '').trim(),
    webDetailContent: String(formModel.webDetailContent || '').trim(),
    mediaAssets: String(formModel.mediaAssets || '').trim(),
    relatedTutorials: Array.isArray(formModel.relatedTutorials) ? [...formModel.relatedTutorials] : [],
    imageUrl: String(formModel.imageUrl || '').trim(),
    appVisible: Boolean(formModel.appVisible),
    webVisible: Boolean(formModel.webVisible),
    recommendStatus: formModel.recommendStatus || 'normal',
    status: formModel.status || 'enabled',
    sort: Number(formModel.sort || 1),
    ruleValues: { ...formModel.ruleValues, model: String(formModel.productModel || '').trim(), speedLevel: String(formModel.speedLevel || '').trim() },
    technicalFeatures: (formModel.technicalFeatures || []).filter(item => String(item.title || '').trim()).map(item => ({
      ...item,
      title: item.title.trim(),
      description: String(item.description || '').trim(),
      image: String(item.image || '').trim(),
      sort: Number(item.sort || 1),
      status: item.enabled === false ? 'disabled' : 'enabled'
    })),
    updatedAt: nowString()
  }
}

function submitForm() {
  if (!String(formModel.productName || '').trim()) {
    ElMessage.warning('请输入产品名称')
    return
  }
  if (!String(formModel.category || '').trim()) {
    ElMessage.warning('请选择产品分类')
    return
  }
  if (!String(formModel.productModel || '').trim()) {
    ElMessage.warning('请输入产品型号')
    return
  }
  if (!String(formModel.deviceType || '').trim()) {
    ElMessage.warning('请选择关联设备类型')
    return
  }
  if (!String(formModel.deviceModel || '').trim()) {
    ElMessage.warning('请输入关联设备型号')
    return
  }
  const duplicate = productModule.snapshot().find(item =>
    item.productName === String(formModel.productName || '').trim() &&
    item.productModel === String(formModel.productModel || '').trim() &&
    String(item.id) !== String(editingId.value)
  )
  if (duplicate) {
    ElMessage.warning('产品名称和型号组合已存在')
    return
  }

  const payload = buildSubmitPayload()
  if (editingId.value) {
    productModule.update({ id: editingId.value, ...payload })
    ElMessage.success('产品已更新')
  } else {
    productModule.add(payload)
    ElMessage.success('产品已新增')
  }
  editDialogVisible.value = false
  loadTableData()
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `删除产品「${row.productName}」后不可恢复，是否继续？`,
      '删除产品',
      buildBusinessConfirmOptions({ confirmButtonText: '确认删除', confirmType: 'danger' })
    )
  } catch {
    return
  }
  productModule.remove(row.id)
  ElMessage.success('产品已删除')
  loadTableData()
}

function addFeature() {
  formModel.technicalFeatures.push({ title: '', description: '', image: '', sort: formModel.technicalFeatures.length + 1, enabled: true })
}

function removeFeature(index) {
  formModel.technicalFeatures.splice(index, 1)
}

loadTableData()
</script>

<style scoped lang="scss">
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.table-placeholder {
  color: var(--admin-text-muted, #64748b);
  font-size: 13px;
}

.product-cover {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  border: 1px solid var(--admin-border, #dfe5ec);
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.product-rule-collapse { margin: 16px 0; padding: 0 16px; border: 1px solid var(--admin-border, #dfe5ec); border-radius: 8px; }
.product-rule-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; max-height: 420px; overflow-y: auto; padding-right: 6px; }
.feature-toolbar { margin-bottom: 12px; }
.feature-row { display: grid; grid-template-columns: 1fr 1.4fr 1fr 110px 48px 40px; align-items: center; gap: 8px; margin-bottom: 10px; }
@media (max-width: 768px) { .product-rule-grid { grid-template-columns: 1fr; } .feature-row { grid-template-columns: 1fr; padding-bottom: 12px; border-bottom: 1px solid var(--admin-border-soft, #e9edf2); } }
</style>
