<template>
  <secondary-page-layout title="用户详情" description="查看用户资料、身体参数、绑定设备、骑行与路线概览和通知偏好。" @back="router.back()">
    <template #summary>
      <div class="detail-summary">
        <div class="detail-avatar">{{ detail.nickName?.slice(0, 1) || 'U' }}</div>
        <div>
          <h2>{{ detail.nickName || '--' }}</h2>
          <p>{{ detail.userName || '--' }} · {{ detail.phone || '--' }} · {{ detail.accountType || '--' }}</p>
          <status-tag :value="detail.status" :options="userStatusOptions" />
        </div>
        <div class="detail-login"><span>最近登录</span><strong>{{ detail.lastLoginTime || '--' }}</strong></div>
      </div>
    </template>

    <div class="detail-metrics">
      <div><span>绑定设备</span><strong>{{ activeBindings.length }}</strong><small>台</small></div>
      <div><span>累计骑行</span><strong>{{ detail.rideCount || 0 }}</strong><small>次</small></div>
      <div><span>累计里程</span><strong>{{ detail.totalMileage || 0 }}</strong><small>km</small></div>
      <div><span>路线数量</span><strong>{{ detail.routeCount || 0 }}</strong><small>条</small></div>
    </div>

    <div class="detail-section-grid detail-section-grid--two">
      <section-card title="用户资料">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户ID">{{ detail.userId || '--' }}</el-descriptions-item>
          <el-descriptions-item label="账号">{{ detail.userName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ detail.nickName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ detail.gender || '--' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detail.phone || '--' }}</el-descriptions-item>
          <el-descriptions-item label="地区">{{ detail.region || '--' }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ detail.createTime || '--' }}</el-descriptions-item>
        </el-descriptions>
      </section-card>
      <section-card title="身体参数与通知">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="生日">{{ detail.birthday || '--' }}</el-descriptions-item>
          <el-descriptions-item label="身高">{{ detail.height ? detail.height + ' cm' : '--' }}</el-descriptions-item>
          <el-descriptions-item label="体重">{{ detail.weight ? detail.weight + ' kg' : '--' }}</el-descriptions-item>
          <el-descriptions-item label="通知偏好">{{ detail.noticePreference || '--' }}</el-descriptions-item>
        </el-descriptions>
      </section-card>
    </div>

    <section-card title="绑定设备" description="数据来自统一设备绑定关系，不在用户详情中维护副本。">
      <el-table :data="activeBindings" stripe>
        <el-table-column prop="deviceSn" label="设备SN" min-width="170" />
        <el-table-column prop="deviceName" label="设备名称" min-width="180" />
        <el-table-column prop="deviceType" label="设备类型" min-width="110" />
        <el-table-column prop="bindTime" label="绑定时间" min-width="170" />
        <el-table-column prop="lastSyncTime" label="最近同步" min-width="170" />
      </el-table>
    </section-card>

    <section-card title="用户行为记录" description="仅记录用户本人在 APP 内发起的登录、同步和设置行为。">
      <el-table :data="detail.behaviorLogs || []" stripe>
        <el-table-column prop="time" label="时间" min-width="170" />
        <el-table-column prop="type" label="行为类型" min-width="110" />
        <el-table-column prop="content" label="行为内容" min-width="260" />
      </el-table>
    </section-card>
  </secondary-page-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SecondaryPageLayout from '@/components/business/SecondaryPageLayout.vue'
import SectionCard from '@/components/business/SectionCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import { userModule, userStatusOptions } from '@/mock/users'
import { getBindingsForUser } from '@/mock/devices'

const route = useRoute()
const router = useRouter()
const detail = computed(() => userModule.detail(route.params.id) || {})
const activeBindings = computed(() => getBindingsForUser(route.params.id).filter(item => item.bindStatus === 'bound'))
</script>

<style scoped lang="scss">
.detail-summary { display: flex; align-items: center; gap: 16px; padding: 20px 24px; border: 1px solid var(--admin-border, #dfe5ec); border-radius: 8px; background: var(--admin-surface, #fff); }
.detail-avatar { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 8px; background: #2563eb; color: #fff; font-size: 24px; font-weight: 700; }
.detail-summary h2 { margin: 0 0 6px; font-size: 20px; color: var(--admin-text-primary, #111827); }
.detail-summary p { margin: 0 0 8px; color: var(--admin-text-muted, #64748b); font-size: 13px; }
.detail-login { display: flex; flex-direction: column; gap: 6px; margin-left: auto; text-align: right; }
.detail-login span { color: var(--admin-text-muted, #64748b); font-size: 12px; }
.detail-login strong { color: var(--admin-text-primary, #111827); font-size: 14px; }
.detail-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px; }
.detail-metrics > div { padding: 16px; border: 1px solid var(--admin-border, #dfe5ec); border-radius: 8px; background: var(--admin-surface, #fff); }
.detail-metrics span { display: block; color: var(--admin-text-muted, #64748b); font-size: 12px; }
.detail-metrics strong { display: inline-block; margin-top: 8px; color: var(--admin-text-primary, #111827); font-size: 24px; }
.detail-metrics small { margin-left: 5px; color: var(--admin-text-muted, #64748b); }
@media (max-width: 768px) { .detail-summary { align-items: flex-start; flex-wrap: wrap; } .detail-login { width: 100%; margin-left: 0; text-align: left; } .detail-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
