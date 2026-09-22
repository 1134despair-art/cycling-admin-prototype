<template>
  <div class="app-container business-page">
    <div class="business-page-shell">
      <page-header-card title="TOC 消息通知推送" description="维护系统通知模板，并只读查询消息推送内容、范围、接收人、发送时间与已读状态。">
        <template #extra>
          <el-button v-if="activeTab === 'templates'" type="primary" icon="Plus" @click="openCreate">新增模板</el-button>
        </template>
      </page-header-card>

      <el-card shadow="never" class="business-tabs-card">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="通知模板" name="templates" />
          <el-tab-pane label="推送记录" name="records" />
        </el-tabs>
      </el-card>

      <el-card shadow="never" class="business-query-card">
        <el-form :model="query" :inline="true" class="business-query-form" @submit.prevent>
          <el-form-item label="关键词">
            <el-input v-model="query.keyword" :placeholder="activeTab === 'templates' ? '模板编码/名称/内容' : '标题/内容/接收人'" clearable @keyup.enter="search" />
          </el-form-item>
          <el-form-item v-if="activeTab === 'templates'" label="通知类型">
            <el-select v-model="query.messageType" placeholder="全部类型" clearable>
              <el-option v-for="item in messageTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="activeTab === 'templates'" label="状态">
            <el-select v-model="query.status" placeholder="全部状态" clearable>
              <el-option v-for="item in templateStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item v-else label="已读状态">
            <el-select v-model="query.readStatus" placeholder="全部状态" clearable>
              <el-option v-for="item in readStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="search">搜索</el-button>
            <el-button icon="Refresh" @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="never" class="business-table-card">
        <div class="table-head">
          <div><h2>{{ activeTab === 'templates' ? '通知模板' : '推送记录' }}</h2><p>共 {{ total }} 条记录</p></div>
          <span v-if="activeTab === 'records'" class="readonly-tip">推送记录只读</span>
        </div>
        <div class="business-table-wrap">
          <el-table v-if="activeTab === 'templates'" :data="rows" stripe>
            <el-table-column prop="templateCode" label="模板编码" min-width="120" />
            <el-table-column prop="templateName" label="模板名称" min-width="170" />
            <el-table-column prop="messageType" label="通知类型" min-width="110" />
            <el-table-column prop="title" label="消息标题" min-width="170" />
            <el-table-column prop="content" label="模板内容" min-width="300" />
            <el-table-column prop="channel" label="发送渠道" min-width="140" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }"><status-tag :value="row.status" :options="templateStatusOptions" /></template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" min-width="175" />
            <el-table-column label="操作" fixed="right" width="150" align="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
                <el-button link type="danger" @click="removeTemplate(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-table v-else :data="rows" stripe>
            <el-table-column prop="title" label="消息标题" min-width="190" />
            <el-table-column prop="content" label="推送内容" min-width="320" />
            <el-table-column prop="scope" label="推送范围" min-width="140" />
            <el-table-column prop="recipient" label="接收人" min-width="220" />
            <el-table-column prop="sendTime" label="发送时间" min-width="175" />
            <el-table-column label="已读状态" width="110">
              <template #default="{ row }"><status-tag :value="row.readStatus" :options="readStatusOptions" /></template>
            </el-table-column>
          </el-table>
        </div>
        <div class="business-pagination-wrap">
          <pagination v-show="total > 0" :total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="load" />
        </div>
      </el-card>

      <el-dialog v-model="dialogVisible" :title="form.id ? '编辑通知模板' : '新增通知模板'" width="720px" append-to-body>
        <el-form :model="form" label-width="92px" class="business-form-grid">
          <el-form-item label="模板编码"><el-input v-model="form.templateCode" /></el-form-item>
          <el-form-item label="模板名称"><el-input v-model="form.templateName" /></el-form-item>
          <el-form-item label="通知类型"><el-select v-model="form.messageType" style="width: 100%"><el-option v-for="item in messageTypeOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
          <el-form-item label="消息标题"><el-input v-model="form.title" /></el-form-item>
          <el-form-item label="发送渠道"><el-input v-model="form.channel" /></el-form-item>
          <el-form-item label="状态"><el-switch v-model="form.enabled" /></el-form-item>
          <el-form-item label="模板内容" class="is-full"><el-input v-model="form.content" type="textarea" :rows="5" placeholder="可使用 {{variable}} 形式的模板变量" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTemplate">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeaderCard from '@/components/business/PageHeaderCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import { buildBusinessConfirmOptions } from '@/plugins/modal'
import {
  messageTypeOptions,
  notificationTemplateModule,
  pushRecordModule,
  readStatusOptions,
  templateStatusOptions
} from '@/mock/message'

const activeTab = ref('templates')
const dialogVisible = ref(false)
const rows = ref([])
const total = ref(0)
const query = reactive({ keyword: '', messageType: '', status: '', readStatus: '', pageNum: 1, pageSize: 10 })
const form = reactive(emptyForm())

function emptyForm() {
  return { id: '', templateCode: '', templateName: '', messageType: '系统通知', title: '', content: '', channel: 'APP站内 + Push', enabled: true }
}

function currentModule() {
  return activeTab.value === 'templates' ? notificationTemplateModule : pushRecordModule
}

function load() {
  const result = currentModule().list({
    keyword: query.keyword,
    messageType: activeTab.value === 'templates' ? query.messageType : '',
    status: activeTab.value === 'templates' ? query.status : '',
    readStatus: activeTab.value === 'records' ? query.readStatus : '',
    pageNum: query.pageNum,
    pageSize: query.pageSize
  })
  rows.value = result.rows
  total.value = result.total
}

function search() {
  query.pageNum = 1
  load()
}

function reset() {
  Object.assign(query, { keyword: '', messageType: '', status: '', readStatus: '', pageNum: 1, pageSize: 10 })
  load()
}

function handleTabChange() {
  reset()
}

function openCreate() {
  Object.assign(form, emptyForm(), { templateCode: 'TPL-' + String(notificationTemplateModule.snapshot().length + 1).padStart(3, '0') })
  dialogVisible.value = true
}

function openEdit(row) {
  Object.assign(form, emptyForm(), row, { enabled: row.status === 'enabled' })
  dialogVisible.value = true
}

function saveTemplate() {
  if (!form.templateCode.trim() || !form.templateName.trim() || !form.title.trim() || !form.content.trim()) {
    return ElMessage.warning('请完整填写模板编码、名称、标题和内容')
  }
  const duplicate = notificationTemplateModule.snapshot().find(item => item.templateCode === form.templateCode.trim() && String(item.id) !== String(form.id))
  if (duplicate) return ElMessage.warning('模板编码已存在')
  const payload = {
    ...form,
    templateCode: form.templateCode.trim(),
    templateName: form.templateName.trim(),
    title: form.title.trim(),
    content: form.content.trim(),
    channel: form.channel.trim(),
    status: form.enabled ? 'enabled' : 'disabled',
    updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
  form.id ? notificationTemplateModule.update(payload) : notificationTemplateModule.add(payload)
  ElMessage.success('通知模板已保存')
  dialogVisible.value = false
  load()
}

async function removeTemplate(row) {
  await ElMessageBox.confirm('确认删除模板「' + row.templateName + '」？', '删除模板', buildBusinessConfirmOptions({ confirmButtonText: '确认删除', confirmType: 'danger' }))
  notificationTemplateModule.remove(row.id)
  ElMessage.success('模板已删除')
  load()
}

load()
</script>

<style scoped lang="scss">
.business-tabs-card :deep(.el-card__body) { padding: 0 16px; }
.business-tabs-card :deep(.el-tabs__header) { margin: 0; }
.table-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; border-bottom: 1px solid var(--admin-border-soft, #e9edf2); }
.table-head h2 { margin: 0; color: var(--admin-text-primary, #111827); font-size: 15px; }
.table-head p, .readonly-tip { margin: 5px 0 0; color: var(--admin-text-muted, #64748b); font-size: 12px; }
.readonly-tip { margin: 0; padding: 5px 9px; border-radius: 4px; background: var(--admin-surface-subtle, #f8fafc); }
</style>
