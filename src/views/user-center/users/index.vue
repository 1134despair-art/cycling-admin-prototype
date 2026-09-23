<template>
  <div class="app-container business-page">
    <div class="business-page-shell">
      <page-header-card title="用户列表" description="只读查询 APP 用户的账号、联系方式、注册和登录信息。" />

      <el-card shadow="never" class="business-query-card">
        <el-form :model="query" :inline="true" class="business-query-form" @submit.prevent>
          <el-form-item label="关键词">
            <el-input v-model="query.keyword" placeholder="账号/昵称/手机号/地区" clearable @keyup.enter="handleSearch" />
          </el-form-item>
          <el-form-item label="账号类型">
            <el-select v-model="query.accountType" placeholder="全部类型" clearable>
              <el-option v-for="item in accountTypes" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" placeholder="全部状态" clearable>
              <el-option v-for="item in userStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
            <el-button icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="never" class="business-table-card">
        <div class="business-table-card__head">
          <div>
            <h2>用户列表</h2>
            <p>共 {{ total }} 条记录</p>
          </div>
        </div>

        <div class="business-table-wrap">
          <el-table :data="rows" stripe>
            <el-table-column prop="userId" label="用户ID" width="90" align="center" />
            <el-table-column prop="userName" label="账号" min-width="130" />
            <el-table-column prop="nickName" label="昵称" min-width="110" />
            <el-table-column prop="gender" label="性别" width="80" align="center" />
            <el-table-column prop="phone" label="手机号" min-width="130" />
            <el-table-column prop="accountType" label="账号类型" min-width="100" />
            <el-table-column prop="region" label="地区" min-width="90" />
            <el-table-column prop="deviceCount" label="设备数" width="86" align="center" />
            <el-table-column prop="createTime" label="注册时间" min-width="170" />
            <el-table-column prop="lastLoginTime" label="最近登录" min-width="170" />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }"><status-tag :value="row.status" :options="userStatusOptions" /></template>
            </el-table-column>
          </el-table>
        </div>

        <div class="business-pagination-wrap">
          <pagination v-show="total > 0" :total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="loadData" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import PageHeaderCard from '@/components/business/PageHeaderCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import { userModule, userStatusOptions } from '@/mock/users'

const rows = ref([])
const total = ref(0)
const query = reactive({ keyword: '', accountType: '', status: '', pageNum: 1, pageSize: 10 })
const accountTypes = ['手机号', '微信', 'Apple', 'Google']

function loadData() {
  query.pageNum = Math.max(1, query.pageNum)
  const result = userModule.list(query)
  rows.value = result.rows
  total.value = result.total
}

function handleSearch() {
  query.pageNum = 1
  loadData()
}

function handleReset() {
  Object.assign(query, { keyword: '', accountType: '', status: '', pageNum: 1, pageSize: 10 })
  loadData()
}

loadData()
</script>

<style scoped lang="scss">
.business-table-card__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; border-bottom: 1px solid var(--admin-border-soft, #e9edf2); }
.business-table-card__head h2 { margin: 0; font-size: 15px; color: var(--admin-text-primary, #111827); }
.business-table-card__head p { margin: 5px 0 0; color: var(--admin-text-muted, #64748b); font-size: 12px; }
@media (max-width: 768px) { .business-table-card__head { align-items: flex-start; flex-direction: column; } }
</style>
