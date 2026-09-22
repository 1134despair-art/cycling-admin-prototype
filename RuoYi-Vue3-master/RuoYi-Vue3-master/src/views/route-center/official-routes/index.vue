<template>
  <div class="app-container business-page"><div class="business-page-shell">
    <page-header-card title="官方路线管理" description="仅通过 GPX 或 FIT 文件导入生成官方路线，并维护难度、推荐、排序与上下线状态。">
      <template #extra><el-button type="primary" icon="Upload" @click="dialogVisible = true">导入路线</el-button></template>
    </page-header-card>
    <el-card shadow="never" class="business-query-card"><el-form :model="query" :inline="true" class="business-query-form">
      <el-form-item label="路线"><el-input v-model="query.keyword" placeholder="路线名称/源文件" clearable /></el-form-item>
      <el-form-item label="难度"><el-select v-model="query.difficulty" clearable><el-option v-for="item in difficultyOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
      <el-form-item label="状态"><el-select v-model="query.status" clearable><el-option v-for="item in routeStatusOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="search">搜索</el-button><el-button icon="Refresh" @click="reset">重置</el-button></el-form-item>
    </el-form></el-card>
    <el-card shadow="never" class="business-table-card">
      <div class="table-head"><h2>官方路线列表</h2><span>共 {{ total }} 条</span></div>
      <div class="business-table-wrap"><el-table :data="rows" stripe>
        <el-table-column prop="routeName" label="路线名称" min-width="180" />
        <el-table-column prop="sourceFile" label="导入文件" min-width="190" />
        <el-table-column prop="sourceFormat" label="格式" width="80" />
        <el-table-column prop="distance" label="距离(km)" width="110" />
        <el-table-column prop="elevationGain" label="累计爬升(m)" width="120" />
        <el-table-column prop="difficulty" label="难度" width="90" />
        <el-table-column label="推荐" width="90"><template #default="{ row }"><el-tag :type="row.recommended ? 'success' : 'info'">{{ row.recommended ? '推荐' : '普通' }}</el-tag></template></el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="状态" width="100"><template #default="{ row }"><status-tag :value="row.status" :options="routeStatusOptions" /></template></el-table-column>
        <el-table-column prop="importedAt" label="导入时间" min-width="170" />
        <el-table-column label="操作" fixed="right" width="130" align="right"><template #default="{ row }"><el-button link :type="row.status === 'online' ? 'warning' : 'success'" @click="toggleStatus(row)">{{ row.status === 'online' ? '下线' : '上线' }}</el-button></template></el-table-column>
      </el-table></div>
      <div class="business-pagination-wrap"><pagination v-show="total > 0" :total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="load" /></div>
    </el-card>
    <el-dialog v-model="dialogVisible" title="导入官方路线" width="560px" append-to-body>
      <el-form :model="form" label-width="88px">
        <el-form-item label="路线名称"><el-input v-model="form.routeName" /></el-form-item>
        <el-form-item label="路线文件"><el-input v-model="form.sourceFile" placeholder="请选择 .gpx 或 .fit 文件" /><div class="field-hint">Mock 环境中填写文件名，刷新后重置。</div></el-form-item>
        <el-form-item label="难度"><el-select v-model="form.difficulty" style="width: 100%"><el-option v-for="item in difficultyOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="submitImport">导入生成</el-button></template>
    </el-dialog>
  </div></div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageHeaderCard from '@/components/business/PageHeaderCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import { importOfficialRoute, officialRouteModule, routeStatusOptions } from '@/mock/routes'
const rows = ref([]); const total = ref(0); const dialogVisible = ref(false)
const difficultyOptions = ['轻松', '中等', '困难']
const query = reactive({ keyword: '', difficulty: '', status: '', pageNum: 1, pageSize: 10 })
const form = reactive({ routeName: '', sourceFile: '', difficulty: '中等' })
function load() { const result = officialRouteModule.list(query); rows.value = result.rows; total.value = result.total }
function search() { query.pageNum = 1; load() }
function reset() { Object.assign(query, { keyword: '', difficulty: '', status: '', pageNum: 1, pageSize: 10 }); load() }
function submitImport() { if (!form.routeName.trim() || !form.sourceFile.trim()) return ElMessage.warning('请填写路线名称和 GPX/FIT 文件名'); const result = importOfficialRoute(form); if (!result) return ElMessage.warning('仅支持 GPX 或 FIT 文件'); ElMessage.success('路线已从文件生成'); dialogVisible.value = false; Object.assign(form, { routeName: '', sourceFile: '', difficulty: '中等' }); load() }
function toggleStatus(row) { officialRouteModule.update({ ...row, status: row.status === 'online' ? 'offline' : 'online' }); ElMessage.success('路线状态已更新'); load() }
load()
</script>
<style scoped lang="scss">.table-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--admin-border-soft,#e9edf2)}.table-head h2{margin:0;font-size:15px;color:var(--admin-text-primary,#111827)}.table-head span,.field-hint{color:var(--admin-text-muted,#64748b);font-size:12px}.field-hint{margin-top:6px}</style>
