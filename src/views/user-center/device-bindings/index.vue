<template>
  <div class="app-container business-page">
    <div class="business-page-shell">
      <page-header-card title="用户绑定设备" description="按用户查看设备绑定情况，一个用户可绑定多台设备。">
        <template #extra><el-button type="primary" icon="Link" @click="openBind">新增绑定</el-button></template>
      </page-header-card>

      <el-card shadow="never" class="business-query-card">
        <el-form :model="query" :inline="true" class="business-query-form" @submit.prevent>
          <el-form-item label="用户信息"><el-input v-model="query.keyword" placeholder="账号/昵称/手机号/设备SN" clearable @keyup.enter="search" /></el-form-item>
          <el-form-item label="绑定状态"><el-select v-model="query.bindStatus" placeholder="全部状态" clearable><el-option v-for="item in bindingStatusOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
          <el-form-item><el-button type="primary" icon="Search" @click="search">搜索</el-button><el-button icon="Refresh" @click="reset">重置</el-button></el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="never" class="business-table-card">
        <div class="table-head"><div><h2>绑定用户</h2><p>共 {{ total }} 位用户，点击“查看设备”进入设备明细</p></div></div>
        <div class="business-table-wrap">
          <el-table :data="rows" stripe>
            <el-table-column prop="userName" label="用户账号" min-width="120" />
            <el-table-column prop="nickName" label="昵称" min-width="100" />
            <el-table-column prop="phone" label="手机号" min-width="130" />
            <el-table-column label="已绑定设备" width="120" align="center">
              <template #default="{ row }"><span class="device-count">{{ row.boundDeviceCount }}</span> 台</template>
            </el-table-column>
            <el-table-column prop="lastBindTime" label="最近绑定时间" min-width="170" />
            <el-table-column prop="lastSyncTime" label="最近同步" min-width="170" />
            <el-table-column label="操作" fixed="right" width="120" align="right">
              <template #default="{ row }">
                <el-button link type="primary" icon="View" @click="viewDevices(row)">查看设备</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="business-pagination-wrap"><pagination v-show="total > 0" :total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="load" /></div>
      </el-card>

      <el-dialog v-model="dialogVisible" title="新增设备绑定" width="560px" append-to-body>
        <el-form :model="form" label-width="88px">
          <el-form-item label="用户"><el-select v-model="form.userId" filterable placeholder="请选择用户" style="width: 100%"><el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
          <el-form-item label="设备"><el-select v-model="form.deviceId" filterable placeholder="请选择未绑定设备" style="width: 100%"><el-option v-for="item in deviceOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
        </el-form>
        <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="submit">保存绑定</el-button></template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import PageHeaderCard from '@/components/business/PageHeaderCard.vue'
import { userModule } from '@/mock/users'
import { bindDevice, bindingStatusOptions, deviceModule, listUserBindingSummaries } from '@/mock/devices'

const router = useRouter()
const rows = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const query = reactive({ keyword: '', bindStatus: '', pageNum: 1, pageSize: 10 })
const form = reactive({ userId: '', deviceId: '' })
const userOptions = computed(() => userModule.snapshot().filter(item => item.status === 'enabled').map(item => ({ value: item.userId, label: `${item.nickName} / ${item.userName} / ${item.phone}` })))
const deviceOptions = computed(() => deviceModule.snapshot().filter(item => !item.userId).map(item => ({ value: item.id, label: `${item.sn} / ${item.productName}` })))

function load() { const result = listUserBindingSummaries(query); rows.value = result.rows; total.value = result.total }
function search() { query.pageNum = 1; load() }
function reset() { Object.assign(query, { keyword: '', bindStatus: '', pageNum: 1, pageSize: 10 }); load() }
function openBind() { Object.assign(form, { userId: '', deviceId: '' }); dialogVisible.value = true }
function submit() {
  if (!form.userId || !form.deviceId) return ElMessage.warning('请选择用户和设备')
  const ok = bindDevice(form)
  if (!ok) return ElMessage.warning('绑定失败，请检查设备当前归属')
  ElMessage.success('绑定关系已更新'); dialogVisible.value = false; load()
}
function viewDevices(row) { router.push(`/user-center/device-bindings/detail/${row.userId}`) }
load()
</script>

<style scoped lang="scss">
.table-head { padding: 14px 16px; border-bottom: 1px solid var(--admin-border-soft, #e9edf2); }
.table-head h2 { margin: 0; font-size: 15px; color: var(--admin-text-primary, #111827); }
.table-head p { margin: 5px 0 0; color: var(--admin-text-muted, #64748b); font-size: 12px; }
.device-count { color: var(--el-color-primary); font-size: 16px; font-weight: 700; }
</style>
