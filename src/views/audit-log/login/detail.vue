<template>
  <secondary-page-layout title="登录日志详情" description="查看登录账号、设备、浏览器环境与登录结果。" @back="router.back()">
    <template #summary>
      <div class="detail-overview">
        <div class="detail-overview__card detail-overview__card--primary">
          <div class="detail-overview__eyebrow">登录主体</div>
          <div class="detail-overview__title">{{ detail.userName || '--' }}</div>
          <div class="detail-overview__meta">
            <span>IP：{{ detail.ip || '--' }}</span>
            <span>地区：{{ detail.location || '--' }}</span>
          </div>
        </div>
        <div class="detail-overview__card">
          <div class="detail-overview__label">登录结果</div>
          <div class="detail-overview__value">
            <status-tag :value="detail.result" :options="resultOptions" />
          </div>
        </div>
        <div class="detail-overview__card">
          <div class="detail-overview__label">设备环境</div>
          <div class="detail-overview__value">{{ detail.device || '--' }}</div>
        </div>
        <div class="detail-overview__card">
          <div class="detail-overview__label">浏览器</div>
          <div class="detail-overview__value">{{ detail.browser || '--' }}</div>
        </div>
        <div class="detail-overview__card">
          <div class="detail-overview__label">登录时间</div>
          <div class="detail-overview__value">{{ detail.createTime || '--' }}</div>
        </div>
      </div>
    </template>

    <div class="detail-section-grid detail-section-grid--two">
      <section-card title="登录信息" description="展示账号、结果与时间信息。">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="管理员账号">{{ detail.userName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="登录结果">{{ resultTextMap[detail.result] || '--' }}</el-descriptions-item>
          <el-descriptions-item label="登录时间">{{ detail.createTime || '--' }}</el-descriptions-item>
        </el-descriptions>
      </section-card>

      <section-card title="环境信息" description="展示 IP、地区、设备、浏览器与记录编号。">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="IP地址">{{ detail.ip || '--' }}</el-descriptions-item>
          <el-descriptions-item label="登录地点">{{ detail.location || '--' }}</el-descriptions-item>
          <el-descriptions-item label="设备信息">{{ detail.device || '--' }}</el-descriptions-item>
          <el-descriptions-item label="浏览器">{{ detail.browser || '--' }}</el-descriptions-item>
          <el-descriptions-item label="记录编号">#{{ detail.id || '--' }}</el-descriptions-item>
        </el-descriptions>
      </section-card>
    </div>
  </secondary-page-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SecondaryPageLayout from '@/components/business/SecondaryPageLayout.vue'
import SectionCard from '@/components/business/SectionCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import { loginLogModule } from '@/mock/audit'

const route = useRoute()
const router = useRouter()

const resultOptions = [
  { label: '成功', value: 'success', type: 'success' },
  { label: '失败', value: 'failed', type: 'danger' }
]

const resultTextMap = {
  success: '登录成功',
  failed: '登录失败'
}

const detail = computed(() => loginLogModule.detail(route.params.id) || {})
</script>
