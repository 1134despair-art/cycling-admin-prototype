<template>
  <div class="app-container business-page"><div class="business-page-shell">
    <page-header-card title="分享模板管理" description="维护普通图与路线长图模板；每种版式始终只有一个启用的默认模板。">
      <template #extra><el-button type="primary" icon="Plus" @click="openCreate">新增模板</el-button></template>
    </page-header-card>
    <div class="template-summary">
      <div v-for="item in layoutSummary" :key="item.value"><span>{{ item.label }}</span><strong>{{ item.defaultName }}</strong><small>启用 {{ item.enabledCount }} 个模板</small></div>
    </div>
    <el-card shadow="never" class="business-table-card">
      <div class="business-table-wrap"><el-table :data="rows" stripe>
        <el-table-column prop="templateName" label="模板名称" min-width="180" />
        <el-table-column label="版式" width="110"><template #default="{ row }">{{ layoutLabel(row.layoutType) }}</template></el-table-column>
        <el-table-column prop="ruleText" label="可配置规则" min-width="280" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="默认模板" width="110"><template #default="{ row }"><el-tag :type="row.isDefault && row.enabled ? 'success' : 'info'">{{ row.isDefault && row.enabled ? '默认' : '普通' }}</el-tag></template></el-table-column>
        <el-table-column label="启用状态" width="100"><template #default="{ row }"><el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '启用' : '停用' }}</el-tag></template></el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" min-width="175" />
        <el-table-column label="操作" fixed="right" width="190" align="right"><template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button v-if="row.enabled && !row.isDefault" link type="success" @click="makeDefault(row)">设为默认</el-button>
          <el-button v-if="!row.isDefault" link type="danger" @click="remove(row)">删除</el-button>
        </template></el-table-column>
      </el-table></div>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑分享模板' : '新增分享模板'" width="640px" append-to-body>
      <el-form :model="form" label-width="96px" class="business-form-grid">
        <el-form-item label="模板名称"><el-input v-model="form.templateName" /></el-form-item>
        <el-form-item label="版式类型"><el-select v-model="form.layoutType" :disabled="Boolean(form.id)" style="width: 100%"><el-option v-for="item in templateLayoutOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
        <el-form-item label="模板图片"><el-input v-model="form.imageUrl" placeholder="请输入模板图片地址" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="1" style="width: 100%" /></el-form-item>
        <el-form-item label="可配置规则" class="is-full"><el-input v-model="form.ruleText" type="textarea" :rows="3" placeholder="尺寸、格式与文件大小限制可在此配置" /></el-form-item>
        <el-form-item label="启用状态"><el-switch v-model="form.enabled" :disabled="form.isDefault" /></el-form-item>
        <el-form-item label="默认模板"><el-switch v-model="form.isDefault" :disabled="!form.enabled" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </div></div>
</template>
<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeaderCard from '@/components/business/PageHeaderCard.vue'
import { setDefaultTemplate, shareTemplateModule, templateLayoutOptions, validateDefaultTemplates } from '@/mock/routes'
import { buildBusinessConfirmOptions } from '@/plugins/modal'
const dialogVisible = ref(false)
const rows = ref([])
const form = reactive(emptyForm())
const layoutSummary = computed(() => templateLayoutOptions.map(option => {
  const enabled = rows.value.filter(item => item.layoutType === option.value && item.enabled)
  return { ...option, enabledCount: enabled.length, defaultName: enabled.find(item => item.isDefault)?.templateName || '未配置' }
}))
function emptyForm() { return { id: '', templateName: '', layoutType: 'standard', imageUrl: '', ruleText: '', sort: 1, enabled: true, isDefault: false } }
function load() { rows.value = shareTemplateModule.snapshot().sort((a, b) => a.layoutType.localeCompare(b.layoutType) || a.sort - b.sort) }
function layoutLabel(value) { return templateLayoutOptions.find(item => item.value === value)?.label || value }
function openCreate() { Object.assign(form, emptyForm(), { sort: rows.value.length + 1 }); dialogVisible.value = true }
function openEdit(row) { Object.assign(form, row); dialogVisible.value = true }
function save() {
  if (!form.templateName.trim()) return ElMessage.warning('请输入模板名称')
  if (form.isDefault) form.enabled = true
  const payload = { ...form, templateName: form.templateName.trim(), ruleText: form.ruleText.trim(), updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') }
  form.id ? shareTemplateModule.update(payload) : shareTemplateModule.add(payload)
  if (!validateDefaultTemplates()) return ElMessage.error('每种版式必须且只能有一个启用的默认模板')
  ElMessage.success('模板已保存'); dialogVisible.value = false; load()
}
function makeDefault(row) { setDefaultTemplate(row.id); ElMessage.success('默认模板已切换'); load() }
async function remove(row) { await ElMessageBox.confirm('确认删除模板「' + row.templateName + '」？', '删除模板', buildBusinessConfirmOptions({ confirmButtonText: '确认删除', confirmType: 'danger' })); shareTemplateModule.remove(row.id); ElMessage.success('模板已删除'); load() }
load()
</script>
<style scoped lang="scss">
.template-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.template-summary>div{display:flex;flex-direction:column;gap:6px;padding:16px;border:1px solid var(--admin-border,#dfe5ec);border-radius:8px;background:var(--admin-surface,#fff)}.template-summary span,.template-summary small{color:var(--admin-text-muted,#64748b);font-size:12px}.template-summary strong{color:var(--admin-text-primary,#111827);font-size:16px}@media(max-width:768px){.template-summary{grid-template-columns:1fr}}
</style>
