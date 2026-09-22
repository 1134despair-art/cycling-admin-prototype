<template>
  <secondary-page-layout title="操作日志详情" description="查看操作日志名称、权限标识、请求信息、请求参数与执行结果。" @back="router.back()">
    <template #summary>
      <div class="detail-overview">
        <div class="detail-overview__card detail-overview__card--primary">
          <div class="detail-overview__eyebrow">操作主体</div>
          <div class="detail-overview__title">{{ detail.logName || '--' }}</div>
          <div class="detail-overview__meta">
            <span>操作人：{{ detail.operator || '--' }}</span>
            <span>权限标识：{{ detail.permissionKey || '--' }}</span>
            <span>记录时间：{{ detail.createTime || '--' }}</span>
          </div>
        </div>
        <div class="detail-overview__card">
          <div class="detail-overview__label">操作结果</div>
          <div class="detail-overview__value">
            <status-tag :value="detail.result" :options="resultOptions" />
          </div>
        </div>
        <div class="detail-overview__card">
          <div class="detail-overview__label">执行耗时</div>
          <div class="detail-overview__value">{{ detail.cost ?? '--' }} ms</div>
        </div>
        <div class="detail-overview__card">
          <div class="detail-overview__label">请求方式</div>
          <div class="detail-overview__value">{{ detail.requestMethod || '--' }}</div>
        </div>
      </div>
    </template>

    <div class="detail-section-grid detail-section-grid--two">
      <section-card title="操作信息" description="展示关键操作模块、动作、权限标识与操作者。">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="日志名称">{{ detail.logName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="操作模块">{{ detail.moduleName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="操作动作">{{ detail.action || '--' }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ detail.operator || '--' }}</el-descriptions-item>
          <el-descriptions-item label="权限标识">{{ detail.permissionKey || '--' }}</el-descriptions-item>
        </el-descriptions>
      </section-card>

      <section-card title="请求信息" description="展示请求方式、地址、来源设备与浏览器。">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="请求方式">{{ detail.requestMethod || '--' }}</el-descriptions-item>
          <el-descriptions-item label="请求地址">{{ detail.requestUrl || '--' }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ detail.ip || '--' }}</el-descriptions-item>
          <el-descriptions-item label="设备">{{ detail.device || '--' }}</el-descriptions-item>
          <el-descriptions-item label="浏览器">{{ detail.browser || '--' }}</el-descriptions-item>
        </el-descriptions>
      </section-card>
    </div>

    <section-card title="执行结果" description="展示请求参数、结果状态、耗时与记录编号。">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="结果状态">{{ resultTextMap[detail.result] || '--' }}</el-descriptions-item>
        <el-descriptions-item label="耗时">{{ detail.cost ?? '--' }} ms</el-descriptions-item>
        <el-descriptions-item label="发生时间">{{ detail.createTime || '--' }}</el-descriptions-item>
        <el-descriptions-item label="记录编号">#{{ detail.id || '--' }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <div class="request-params-block">{{ detail.requestParams || '--' }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </section-card>
  </secondary-page-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SecondaryPageLayout from '@/components/business/SecondaryPageLayout.vue'
import SectionCard from '@/components/business/SectionCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import { operateLogModule } from '@/mock/audit'

const route = useRoute()
const router = useRouter()

const resultOptions = [
  { label: '成功', value: 'success', type: 'success' },
  { label: '失败', value: 'failed', type: 'danger' }
]

const resultTextMap = {
  success: '执行成功',
  failed: '执行失败'
}

const detail = computed(() => operateLogModule.detail(route.params.id) || {})
</script>

<style scoped lang="scss">
.request-params-block {
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--admin-surface-subtle, #f8fafc);
  border: 1px solid var(--admin-border, #dfe5ec);
  color: #334155;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
