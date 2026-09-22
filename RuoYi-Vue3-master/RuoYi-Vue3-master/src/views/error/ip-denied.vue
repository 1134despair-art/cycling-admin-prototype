<template>
  <main class="ip-denied-page">
    <section class="ip-denied-content" aria-labelledby="ip-denied-title">
      <div class="ip-denied-icon" aria-hidden="true">
        <el-icon><Lock /></el-icon>
      </div>
      <div class="ip-denied-code">ACCESS DENIED</div>
      <h1 id="ip-denied-title">当前 IP 无法访问系统</h1>
      <p>当前访问地址未加入系统白名单，请联系系统管理员添加后重试。</p>

      <div class="ip-denied-address">
        <span>当前访问 IP</span>
        <strong>{{ currentIp }}</strong>
      </div>

      <el-button type="primary" icon="Refresh" @click="reloadPage">重新检测</el-button>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Lock } from '@element-plus/icons-vue'
import { ipAccessModule } from '@/mock/ipAccess'

const route = useRoute()
const currentIp = computed(() => String(route.query.ip || ipAccessModule.getCurrentClientIp()))

function reloadPage() {
  window.location.reload()
}
</script>

<style lang="scss" scoped>
.ip-denied-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 20px;
  background: var(--admin-page-bg, #f4f7fb);
  color: var(--admin-text-primary, #111827);
}

.ip-denied-content {
  width: min(520px, 100%);
  text-align: center;
}

.ip-denied-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 22px;
  display: grid;
  place-items: center;
  border: 1px solid var(--el-color-danger-light-7, #fab6b6);
  border-radius: 50%;
  background: var(--el-color-danger-light-9, #fef0f0);
  color: var(--el-color-danger, #f56c6c);
  font-size: 27px;
}

.ip-denied-code {
  color: var(--el-color-danger, #f56c6c);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
}

.ip-denied-content h1 {
  margin: 10px 0 0;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0;
}

.ip-denied-content p {
  margin: 12px auto 0;
  color: var(--admin-text-secondary, #64748b);
  font-size: 14px;
  line-height: 1.7;
}

.ip-denied-address {
  margin: 26px 0 22px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid var(--admin-border, #dfe7f0);
  border-bottom: 1px solid var(--admin-border, #dfe7f0);
  color: var(--admin-text-secondary, #64748b);
  font-size: 13px;
}

.ip-denied-address strong {
  color: var(--admin-text-primary, #111827);
  font-family: Consolas, 'Courier New', monospace;
  font-size: 14px;
  letter-spacing: 0;
  word-break: break-all;
}

@media (max-width: 480px) {
  .ip-denied-content h1 {
    font-size: 25px;
  }

  .ip-denied-address {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
