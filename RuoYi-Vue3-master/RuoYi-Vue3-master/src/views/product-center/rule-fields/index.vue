<template>
  <div class="app-container business-page">
    <div class="business-page-shell">
      <page-header-card title="产品规则字段管理" description="维护 41 个固定字段及分类自定义字段；固定字段键不可修改或删除。">
        <template #extra><el-button type="primary" icon="Plus" @click="openCreate">新增自定义字段</el-button></template>
      </page-header-card>
      <el-card shadow="never" class="business-query-card">
        <el-form :model="query" :inline="true" class="business-query-form" @submit.prevent>
          <el-form-item label="字段"><el-input v-model="query.keyword" placeholder="字段名称/字段键" clearable @keyup.enter="search" /></el-form-item>
          <el-form-item label="字段属性"><el-select v-model="query.fieldSource" placeholder="全部" clearable><el-option label="固定字段" value="fixed" /><el-option label="自定义字段" value="custom" /></el-select></el-form-item>
          <el-form-item label="状态"><el-select v-model="query.status" placeholder="全部" clearable><el-option v-for="item in productStatusOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
          <el-form-item><el-button type="primary" icon="Search" @click="search">搜索</el-button><el-button icon="Refresh" @click="reset">重置</el-button></el-form-item>
        </el-form>
      </el-card>
      <el-card shadow="never" class="business-table-card">
        <div class="table-head"><div><h2>字段定义</h2><p>固定字段 {{ fixedCount }} 个，自定义字段 {{ customCount }} 个</p></div></div>
        <div class="business-table-wrap">
          <el-table :data="rows" stripe>
            <el-table-column prop="sort" label="排序" width="80" align="center" />
            <el-table-column prop="fieldName" label="字段名称" min-width="150" />
            <el-table-column prop="fieldKey" label="字段键" min-width="180" />
            <el-table-column prop="categoryName" label="所属分类" min-width="130" />
            <el-table-column prop="dataType" label="数据类型" width="100" />
            <el-table-column label="字段属性" width="110"><template #default="{ row }"><el-tag :type="row.fieldSource === 'fixed' ? 'info' : 'primary'">{{ row.fieldSource === 'fixed' ? '固定字段' : '自定义字段' }}</el-tag></template></el-table-column>
            <el-table-column label="APP展示" width="100"><template #default="{ row }"><el-tag :type="row.appVisible ? 'success' : 'info'">{{ row.appVisible ? '展示' : '隐藏' }}</el-tag></template></el-table-column>
            <el-table-column label="状态" width="100"><template #default="{ row }"><status-tag :value="row.status" :options="productStatusOptions" /></template></el-table-column>
            <el-table-column label="操作" fixed="right" width="160" align="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
                <el-button v-if="row.fieldSource === 'custom'" link type="danger" @click="removeField(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="business-pagination-wrap"><pagination v-show="total > 0" :total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="load" /></div>
      </el-card>
      <el-dialog v-model="dialogVisible" :title="form.id ? '编辑字段' : '新增自定义字段'" width="680px" append-to-body>
        <el-form :model="form" label-width="96px" class="business-form-grid">
          <el-form-item label="所属分类"><el-select v-model="form.categoryId" style="width: 100%"><el-option label="全部分类" value="all" /><el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
          <el-form-item label="字段名称"><el-input v-model="form.fieldName" /></el-form-item>
          <el-form-item label="字段键"><el-input v-model="form.fieldKey" :disabled="form.fieldSource === 'fixed' || Boolean(form.id)" /></el-form-item>
          <el-form-item label="数据类型"><el-select v-model="form.dataType" style="width: 100%"><el-option v-for="item in ['text','number','textarea','image','link']" :key="item" :label="item" :value="item" /></el-select></el-form-item>
          <el-form-item label="单位"><el-input v-model="form.unit" /></el-form-item>
          <el-form-item label="是否必填"><el-switch v-model="form.required" /></el-form-item>
          <el-form-item label="APP展示"><el-switch v-model="form.appVisible" /></el-form-item>
          <el-form-item label="状态"><el-switch v-model="form.enabled" /></el-form-item>
          <el-form-item label="排序"><el-input-number v-model="form.sort" :min="1" style="width: 100%" /></el-form-item>
        </el-form>
        <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeaderCard from '@/components/business/PageHeaderCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import { productCategoryModule, productRuleFieldModule, productStatusOptions } from '@/mock/products'
import { buildBusinessConfirmOptions } from '@/plugins/modal'

const rows = ref([]); const total = ref(0); const dialogVisible = ref(false)
const query = reactive({ keyword: '', fieldSource: '', status: '', pageNum: 1, pageSize: 20 })
const form = reactive(emptyForm())
const categoryOptions = computed(() => productCategoryModule.snapshot().map(item => ({ label: item.categoryName, value: item.id })))
const fixedCount = computed(() => productRuleFieldModule.snapshot().filter(item => item.fieldSource === 'fixed').length)
const customCount = computed(() => productRuleFieldModule.snapshot().filter(item => item.fieldSource === 'custom').length)
function emptyForm() { return { id: '', categoryId: 'all', fieldName: '', fieldKey: '', dataType: 'text', unit: '', required: false, fieldSource: 'custom', appVisible: true, enabled: true, sort: 42 } }
function load() { const result = productRuleFieldModule.list(query); rows.value = result.rows; total.value = result.total }
function search() { query.pageNum = 1; load() }
function reset() { Object.assign(query, { keyword: '', fieldSource: '', status: '', pageNum: 1, pageSize: 20 }); load() }
function openCreate() { Object.assign(form, emptyForm(), { sort: productRuleFieldModule.snapshot().length + 1 }); dialogVisible.value = true }
function openEdit(row) { Object.assign(form, emptyForm(), row, { enabled: row.status === 'enabled' }); dialogVisible.value = true }
function save() {
  if (!form.fieldName.trim() || !form.fieldKey.trim()) return ElMessage.warning('请填写字段名称和字段键')
  const duplicate = productRuleFieldModule.snapshot().find(item => item.fieldKey === form.fieldKey.trim() && String(item.id) !== String(form.id))
  if (duplicate) return ElMessage.warning('字段键已存在')
  const category = form.categoryId === 'all' ? null : productCategoryModule.detail(form.categoryId)
  const payload = { ...form, fieldName: form.fieldName.trim(), fieldKey: form.fieldKey.trim(), categoryName: category?.categoryName || '全部分类', status: form.enabled ? 'enabled' : 'disabled', updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') }
  form.id ? productRuleFieldModule.update(payload) : productRuleFieldModule.add(payload)
  ElMessage.success('字段定义已保存'); dialogVisible.value = false; load()
}
async function removeField(row) { await ElMessageBox.confirm(`确认删除自定义字段「${row.fieldName}」？`, '删除字段', buildBusinessConfirmOptions({ confirmButtonText: '确认删除', confirmType: 'danger' })); productRuleFieldModule.remove(row.id); ElMessage.success('字段已删除'); load() }
load()
</script>

<style scoped lang="scss">
.table-head { padding: 14px 16px; border-bottom: 1px solid var(--admin-border-soft, #e9edf2); }
.table-head h2 { margin: 0; color: var(--admin-text-primary, #111827); font-size: 15px; }
.table-head p { margin: 5px 0 0; color: var(--admin-text-muted, #64748b); font-size: 12px; }
</style>
