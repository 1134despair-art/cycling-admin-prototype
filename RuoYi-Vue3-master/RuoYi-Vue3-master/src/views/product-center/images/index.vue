<template>
  <div class="app-container business-page">
    <div class="business-page-shell">
      <page-header-card
        title="产品图片管理"
        description="维护产品主图、详情头图、安装示意图等图片资源，并配置 APP / 官网 的展示状态。"
      >
        <template #extra>
          <el-button type="primary" icon="Plus" @click="openCreateDialog">新增图片</el-button>
        </template>
      </page-header-card>

      <el-card shadow="never" class="business-query-card">
        <el-form :model="queryParams" :inline="true" label-width="76px" class="business-query-form" @submit.prevent>
          <el-form-item label="图片信息">
            <el-input v-model="queryParams.keyword" placeholder="请输入产品名称/型号/图片名称" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="图片类型">
            <el-select v-model="queryParams.imageType" placeholder="请选择图片类型" clearable>
              <el-option v-for="item in imageTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
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

      <section-card title="图片列表" description="查看产品图片类型、预览效果和双端展示状态。">
        <template #extra>
          <el-button plain icon="Refresh" @click="loadTableData">刷新</el-button>
        </template>

        <el-table :data="rows" stripe>
          <el-table-column prop="productName" label="产品名称" min-width="180" />
          <el-table-column prop="productModel" label="产品型号" min-width="120" />
          <el-table-column prop="imageType" label="图片类型" min-width="120" />
          <el-table-column prop="imageName" label="图片名称" min-width="160" />
          <el-table-column label="图片数" min-width="90" align="center">
            <template #default="{ row }">
              {{ getImageCount(row) }}
            </template>
          </el-table-column>
          <el-table-column label="图片预览" min-width="110" align="center">
            <template #default="{ row }">
              <div class="table-image-cell">
                <el-image :src="getPreviewImage(row)" fit="cover" preview-teleported class="image-thumb" />
                <span v-if="getImageCount(row) > 1" class="table-image-cell__count">+{{ getImageCount(row) - 1 }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="APP展示" min-width="100" align="center">
            <template #default="{ row }">
              <status-tag :value="row.appVisible" :options="toggleOptions" />
            </template>
          </el-table-column>
          <el-table-column label="官网展示" min-width="100" align="center">
            <template #default="{ row }">
              <status-tag :value="row.webVisible" :options="toggleOptions" />
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="100" align="center">
            <template #default="{ row }">
              <status-tag :value="row.status" :options="productStatusOptions" />
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

      <el-dialog v-model="editDialogVisible" :title="editingId ? '编辑图片' : '新增图片'" width="760px" append-to-body>
        <el-form :model="formModel" label-width="96px" class="business-form-grid">
          <el-form-item label="图片ID">
            <el-input :model-value="editingId || '新增后生成'" disabled />
          </el-form-item>
          <el-form-item label="关联产品">
            <el-select v-model="formModel.productId" placeholder="请选择产品" style="width: 100%" filterable>
              <el-option v-for="item in productOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="产品型号">
            <el-input :model-value="selectedProduct?.productModel || '--'" disabled />
          </el-form-item>
          <el-form-item label="图片类型">
            <el-select v-model="formModel.imageType" placeholder="请选择图片类型" style="width: 100%">
              <el-option v-for="item in imageTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="图片名称">
            <el-input v-model="formModel.imageName" placeholder="请输入图片名称" />
          </el-form-item>
          <el-form-item v-if="!isGalleryType" label="图片资源" class="is-full">
            <local-image-upload v-model="formModel.imageUrl" />
          </el-form-item>
          <el-form-item v-else label="图片图集" class="is-full">
            <local-image-gallery-upload v-model="formModel.galleryImages" />
          </el-form-item>
          <el-form-item label="资源地址" class="is-full">
            <el-input :model-value="isGalleryType ? (formModel.galleryImages || []).join(' , ') : formModel.imageUrl" disabled />
          </el-form-item>
          <el-form-item label="APP展示">
            <el-switch v-model="formModel.appVisible" inline-prompt active-text="显示" inactive-text="隐藏" />
          </el-form-item>
          <el-form-item label="官网展示">
            <el-switch v-model="formModel.webVisible" inline-prompt active-text="显示" inactive-text="隐藏" />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="formModel.status">
              <el-radio-button value="enabled">启用</el-radio-button>
              <el-radio-button value="disabled">停用</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="formModel.sort" :min="1" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-form>

        <section-card title="展示说明" description="不同图片类型会在 APP 产品列表、官网详情页和教程内容中按需使用。">
          <div class="image-usage-grid">
            <div class="image-usage-item">
              <div class="image-usage-item__title">APP 使用建议</div>
              <div class="image-usage-item__desc">{{ appUsageText }}</div>
            </div>
            <div class="image-usage-item">
              <div class="image-usage-item__title">官网使用建议</div>
              <div class="image-usage-item__desc">{{ webUsageText }}</div>
            </div>
          </div>
        </section-card>

        <template #footer>
          <div class="drawer-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm">保存</el-button>
          </div>
        </template>
      </el-dialog>

      <el-drawer v-model="detailDrawerVisible" title="图片详情" size="560px" append-to-body>
        <div class="detail-preview-wrap">
          <el-image :src="getPreviewImage(currentRow)" fit="contain" preview-teleported class="detail-preview-image" />
        </div>
        <div v-if="detailGalleryImages.length" class="detail-gallery-grid">
          <el-image
            v-for="(item, index) in detailGalleryImages"
            :key="`${item}-${index}`"
            :src="item"
            fit="cover"
            preview-teleported
            class="detail-gallery-grid__item"
          />
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="图片ID">{{ currentRow.id || '--' }}</el-descriptions-item>
          <el-descriptions-item label="产品ID">{{ currentRow.productId || '--' }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ currentRow.productName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="产品型号">{{ currentRow.productModel || '--' }}</el-descriptions-item>
          <el-descriptions-item label="图片类型">{{ currentRow.imageType || '--' }}</el-descriptions-item>
          <el-descriptions-item label="图片名称">{{ currentRow.imageName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="图片数量">{{ getImageCount(currentRow) }}</el-descriptions-item>
          <el-descriptions-item label="资源地址">{{ currentRow.imageUrl || '--' }}</el-descriptions-item>
          <el-descriptions-item label="APP展示">
            <status-tag :value="currentRow.appVisible" :options="toggleOptions" />
          </el-descriptions-item>
          <el-descriptions-item label="官网展示">
            <status-tag :value="currentRow.webVisible" :options="toggleOptions" />
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <status-tag :value="currentRow.status" :options="productStatusOptions" />
          </el-descriptions-item>
          <el-descriptions-item label="排序">{{ currentRow.sort ?? '--' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentRow.updatedAt || '--' }}</el-descriptions-item>
        </el-descriptions>
      </el-drawer>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import LocalImageGalleryUpload from '@/components/business/LocalImageGalleryUpload.vue'
import LocalImageUpload from '@/components/business/LocalImageUpload.vue'
import PageHeaderCard from '@/components/business/PageHeaderCard.vue'
import SectionCard from '@/components/business/SectionCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import { buildBusinessConfirmOptions } from '@/plugins/modal'
import { productImageModule, productImageTypeOptions, productModule, productStatusOptions } from '@/mock/products'

const rows = ref([])
const total = ref(0)
const editingId = ref('')
const currentRow = ref({})
const editDialogVisible = ref(false)
const detailDrawerVisible = ref(false)

const queryParams = reactive({
  keyword: '',
  imageType: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const formModel = reactive(getDefaultForm())

const toggleOptions = [
  { label: '展示', value: true, type: 'success' },
  { label: '隐藏', value: false, type: 'info' }
]
const statusOptions = productStatusOptions.map(({ label, value }) => ({ label, value }))
const imageTypeOptions = productImageTypeOptions.map(value => ({ label: value, value }))
const productOptions = computed(() =>
  productModule.snapshot().map(item => ({
    label: `${item.productName} / ${item.productModel}`,
    value: item.id
  }))
)
const selectedProduct = computed(() => productModule.detail(formModel.productId) || null)
const isGalleryType = computed(() => formModel.imageType === '详情图集')
const detailGalleryImages = computed(() => (Array.isArray(currentRow.value.galleryImages) ? currentRow.value.galleryImages : []))

const usageMap = {
  产品主图: {
    app: '用于 APP 产品列表、首页推荐位和产品详情顶部封面。',
    web: '用于官网产品列表、官网详情页首屏主视觉。'
  },
  详情头图: {
    app: '用于 APP 产品详情页顶部横幅或图集首图。',
    web: '用于官网详情页规格区块和头图展示。'
  },
  详情图集: {
    app: '用于 APP 产品详情页轮播图集、功能卖点分段展示。',
    web: '用于官网产品详情图集和规格说明插图。'
  },
  安装示意图: {
    app: '用于 APP 教程内容、绑定设备或故障排查辅助展示。',
    web: '用于官网帮助中心、安装文档和售后支持页面。'
  },
  视频封面: {
    app: '用于 APP 视频教程或产品视频入口封面。',
    web: '用于官网视频播放入口与品牌内容展示。'
  }
}

const appUsageText = computed(() => usageMap[formModel.imageType]?.app || '用于 APP 端产品展示、教程或辅助说明。')
const webUsageText = computed(() => usageMap[formModel.imageType]?.web || '用于官网产品页、帮助页或品牌展示内容。')

watch(
  () => formModel.productId,
  () => {
    if (!selectedProduct.value) return
    if (!formModel.imageName) {
      formModel.imageName = `${selectedProduct.value.productModel}-${formModel.imageType || 'image'}`.toLowerCase()
    }
  }
)

watch(
  () => formModel.imageType,
  value => {
    if (!selectedProduct.value || !value) return
    if (value === '详情图集') {
      formModel.imageUrl = ''
    } else {
      formModel.galleryImages = []
    }
    if (!editingId.value || !formModel.imageName) {
      formModel.imageName = `${selectedProduct.value.productModel}-${value}`.replace(/\s+/g, '-').toLowerCase()
    }
  }
)

function getDefaultForm() {
  return {
    productId: '',
    imageType: '',
    imageName: '',
    imageUrl: '',
    galleryImages: [],
    appVisible: true,
    webVisible: true,
    sort: 1,
    status: 'enabled'
  }
}

function nowString() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function loadTableData() {
  const result = productImageModule.list({
    keyword: queryParams.keyword,
    imageType: queryParams.imageType,
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
    imageType: '',
    status: '',
    pageNum: 1,
    pageSize: 10
  })
  loadTableData()
}

function openCreateDialog() {
  editingId.value = ''
  Object.assign(formModel, getDefaultForm())
  editDialogVisible.value = true
}

function openEditDialog(row) {
  const detail = productImageModule.detail(row.id)
  if (!detail) return
  editingId.value = detail.id
  Object.assign(formModel, {
    ...getDefaultForm(),
    ...detail
  })
  editDialogVisible.value = true
}

function openDetailDrawer(row) {
  currentRow.value = productImageModule.detail(row.id) || row
  detailDrawerVisible.value = true
}

function getPreviewImage(row = {}) {
  if (Array.isArray(row.galleryImages) && row.galleryImages.length) return row.galleryImages[0]
  return row.imageUrl || ''
}

function getImageCount(row = {}) {
  if (Array.isArray(row.galleryImages) && row.galleryImages.length) return row.galleryImages.length
  return row.imageUrl ? 1 : 0
}

function submitForm() {
  const product = selectedProduct.value
  if (!product) {
    ElMessage.warning('请选择关联产品')
    return
  }
  if (!String(formModel.imageType || '').trim()) {
    ElMessage.warning('请选择图片类型')
    return
  }
  if (!String(formModel.imageName || '').trim()) {
    ElMessage.warning('请输入图片名称')
    return
  }
  if (isGalleryType.value && !formModel.galleryImages.length) {
    ElMessage.warning('请上传图片图集')
    return
  }
  if (!isGalleryType.value && !String(formModel.imageUrl || '').trim()) {
    ElMessage.warning('请上传图片资源')
    return
  }
  const duplicate = productImageModule.snapshot().find(item =>
    String(item.productId) === String(formModel.productId) &&
    item.imageType === String(formModel.imageType || '').trim() &&
    item.imageName === String(formModel.imageName || '').trim() &&
    String(item.id) !== String(editingId.value)
  )
  if (duplicate) {
    ElMessage.warning('同一产品下该图片类型和图片名称已存在')
    return
  }

  const payload = {
    productId: product.id,
    productName: product.productName,
    productModel: product.productModel,
    imageType: String(formModel.imageType || '').trim(),
    imageName: String(formModel.imageName || '').trim(),
    imageUrl: isGalleryType.value ? String(formModel.galleryImages[0] || '').trim() : String(formModel.imageUrl || '').trim(),
    galleryImages: isGalleryType.value ? [...formModel.galleryImages] : [],
    appVisible: Boolean(formModel.appVisible),
    webVisible: Boolean(formModel.webVisible),
    sort: Number(formModel.sort || 1),
    status: formModel.status || 'enabled',
    updatedAt: nowString()
  }
  if (editingId.value) {
    productImageModule.update({ id: editingId.value, ...payload })
    ElMessage.success('图片已更新')
  } else {
    productImageModule.add(payload)
    ElMessage.success('图片已新增')
  }
  editDialogVisible.value = false
  loadTableData()
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `删除图片「${row.imageName}」后不可恢复，是否继续？`,
      '删除图片',
      buildBusinessConfirmOptions({ confirmButtonText: '确认删除', confirmType: 'danger' })
    )
  } catch {
    return
  }
  productImageModule.remove(row.id)
  ElMessage.success('图片已删除')
  loadTableData()
}

loadTableData()
</script>

<style scoped lang="scss">
.image-thumb {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  border: 1px solid var(--admin-border, #dfe5ec);
}

.table-image-cell {
  position: relative;
  display: inline-flex;
}

.table-image-cell__count {
  position: absolute;
  right: -8px;
  bottom: -6px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.82);
  color: #fff;
  font-size: 12px;
  line-height: 1.2;
}

.image-usage-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.image-usage-item {
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--admin-border, #dfe5ec);
  background: #fbfdff;
}

.image-usage-item__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--admin-text-primary, #111827);
}

.image-usage-item__desc {
  margin-top: 8px;
  color: var(--admin-text-muted, #64748b);
  line-height: 1.7;
}

.detail-preview-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 12px;
  background: var(--admin-surface-subtle, #f8fafc);
}

.detail-preview-image {
  width: 100%;
  max-width: 420px;
  height: 220px;
  border-radius: 12px;
  background: var(--admin-surface, #fff);
}

.detail-gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.detail-gallery-grid__item {
  width: 100%;
  height: 120px;
  border-radius: 10px;
  border: 1px solid var(--admin-border, #dfe5ec);
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
