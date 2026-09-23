<template>
  <secondary-page-layout title="设备详情" description="查看设备绑定、使用、诊断、产品规则与图片、组件固件和升级历史。" @back="router.back()">
    <template #summary>
      <div class="device-summary">
        <div><span class="eyebrow">设备 SN</span><h2>{{ detail.sn || '--' }}</h2><p>{{ detail.productName || '--' }} · {{ detail.model || '--' }} · {{ detail.categoryName || '--' }}</p></div>
        <status-tag :value="detail.status" :options="deviceStatusOptions" />
      </div>
    </template>

    <div class="detail-metrics">
      <div><span>使用时长</span><strong>{{ detail.useHours || 0 }}</strong><small>小时</small></div>
      <div><span>当前固件</span><strong>{{ detail.firmwareVersion || '--' }}</strong></div>
      <div><span>最近同步</span><strong class="small-value">{{ detail.lastSyncTime || '--' }}</strong></div>
      <div><span>绑定用户</span><strong>{{ detail.userName || '未绑定' }}</strong></div>
    </div>

    <div class="detail-section-grid detail-section-grid--two">
      <section-card title="基础信息"><el-descriptions :column="1" border>
        <el-descriptions-item label="激活状态">{{ detail.activationStatus === 'activated' ? '已激活' : '未激活' }}</el-descriptions-item>
        <el-descriptions-item label="激活时间">{{ detail.activationTime || '--' }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{ detail.productName || '--' }}</el-descriptions-item>
        <el-descriptions-item label="设备型号">{{ detail.model || '--' }}</el-descriptions-item>
        <el-descriptions-item label="设备品类">{{ detail.categoryName || '--' }}</el-descriptions-item>
      </el-descriptions></section-card>
      <section-card title="绑定记录"><el-table :data="detail.bindings || []" stripe>
        <el-table-column prop="userName" label="用户" min-width="110" />
        <el-table-column prop="bindStatus" label="状态" min-width="90" />
        <el-table-column prop="bindTime" label="绑定时间" min-width="170" />
        <el-table-column prop="unbindTime" label="解绑时间" min-width="170" />
      </el-table></section-card>
    </div>

    <section-card title="组件固件" description="电子变速设备按整机、前拨、后拨和控制器独立展示当前版本。">
      <el-table :data="detail.componentFirmware || []" stripe>
        <el-table-column prop="componentType" label="升级部件" min-width="110" />
        <el-table-column prop="model" label="组件型号" min-width="150" />
        <el-table-column prop="version" label="当前版本" min-width="160" />
        <el-table-column prop="status" label="版本状态" min-width="100" />
      </el-table>
    </section-card>

    <section-card title="关联产品规则" description="直接引用产品中心启用且有值的规则字段。">
      <el-descriptions :column="3" border>
        <el-descriptions-item v-for="item in detail.product?.rules || []" :key="item.fieldKey" :label="item.fieldName">{{ item.value }}{{ item.unit || '' }}</el-descriptions-item>
      </el-descriptions>
      <div class="product-images">
        <el-image v-for="image in detail.product?.images || []" :key="image.id" :src="image.imageUrl" fit="cover" preview-teleported />
      </div>
    </section-card>

    <div class="detail-section-grid detail-section-grid--two">
      <section-card title="诊断记录"><el-table :data="detail.diagnostics || []" stripe>
        <el-table-column prop="time" label="时间" min-width="170" />
        <el-table-column prop="type" label="类型" min-width="110" />
        <el-table-column prop="result" label="结果" min-width="90" />
        <el-table-column prop="detail" label="说明" min-width="190" />
      </el-table></section-card>
      <section-card title="升级历史"><el-table :data="detail.upgradeHistory || []" stripe>
        <el-table-column prop="componentType" label="部件" min-width="90" />
        <el-table-column prop="fromVersion" label="原版本" min-width="110" />
        <el-table-column prop="toVersion" label="目标版本" min-width="140" />
        <el-table-column prop="result" label="结果" min-width="80" />
        <el-table-column prop="time" label="时间" min-width="170" />
      </el-table></section-card>
    </div>
  </secondary-page-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SecondaryPageLayout from '@/components/business/SecondaryPageLayout.vue'
import SectionCard from '@/components/business/SectionCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import { deviceStatusOptions, getDeviceDetail } from '@/mock/devices'
const route = useRoute()
const router = useRouter()
const detail = computed(() => getDeviceDetail(route.params.id) || {})
</script>

<style scoped lang="scss">
.device-summary { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 24px; border: 1px solid var(--admin-border, #dfe5ec); border-radius: 8px; background: var(--admin-surface, #fff); }
.eyebrow { color: #2563eb; font-size: 12px; font-weight: 600; }
.device-summary h2 { margin: 6px 0; color: var(--admin-text-primary, #111827); font-size: 20px; }
.device-summary p { margin: 0; color: var(--admin-text-muted, #64748b); font-size: 13px; }
.detail-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px; }
.detail-metrics > div { padding: 16px; border: 1px solid var(--admin-border, #dfe5ec); border-radius: 8px; background: var(--admin-surface, #fff); }
.detail-metrics span { display: block; color: var(--admin-text-muted, #64748b); font-size: 12px; }
.detail-metrics strong { display: inline-block; margin-top: 8px; color: var(--admin-text-primary, #111827); font-size: 20px; }
.detail-metrics small { margin-left: 5px; color: var(--admin-text-muted, #64748b); }
.detail-metrics .small-value { font-size: 14px; }
.product-images { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
.product-images :deep(.el-image) { width: 100%; aspect-ratio: 16 / 9; border: 1px solid var(--admin-border, #dfe5ec); border-radius: 6px; }
@media (max-width: 768px) { .detail-metrics, .product-images { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
