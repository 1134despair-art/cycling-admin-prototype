<template>
  <div class="app-container business-page">
    <div class="business-page-shell">
      <page-header-card
        title="角色管理"
        description="维护超级管理员、运营管理员、售后管理员、设备管理员、内容管理员等角色，并支持菜单、按钮、接口和数据范围权限配置。"
      >
        <template #extra>
          <el-button type="primary" icon="Plus" @click="openCreateDrawer">新增角色</el-button>
        </template>
      </page-header-card>

      <el-card shadow="never" class="business-query-card">
        <el-form :model="queryParams" :inline="true" label-width="76px" class="business-query-form" @submit.prevent>
          <el-form-item label="角色编号">
            <el-input v-model="queryParams.roleCode" placeholder="请输入角色编号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="角色名称">
            <el-input v-model="queryParams.keyword" placeholder="请输入角色名称/权限标识" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option v-for="option in roleStatusOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </el-form-item>
          <template v-if="showAdvanced">
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="queryParams.dateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
          </template>
          <el-form-item class="business-query-form__actions">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="handleReset">重置</el-button>
            <el-button link type="primary" @click="showAdvanced = !showAdvanced">{{ showAdvanced ? '收起' : '展开' }}</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <section-card title="角色列表" description="支持查看角色编号、默认角色、权限数量、数据范围和分配成员。">
        <template #extra>
          <el-button plain icon="Refresh" @click="loadTableData">刷新</el-button>
        </template>

        <el-table :data="rows" stripe>
          <el-table-column prop="roleCode" label="角色编号" min-width="110" />
          <el-table-column prop="roleName" label="角色名称" min-width="160" />
          <el-table-column prop="roleKey" label="权限标识" min-width="160" />
          <el-table-column label="默认角色" min-width="100" align="center">
            <template #default="{ row }">{{ row.isDefaultRole ? '是' : '否' }}</template>
          </el-table-column>
          <el-table-column prop="dataScope" label="数据范围" min-width="120" />
          <el-table-column prop="permissionCount" label="权限数" min-width="90" align="center" />
          <el-table-column prop="memberCount" label="成员数量" min-width="100" align="center" />
          <el-table-column label="状态" min-width="100" align="center">
            <template #default="{ row }">
              <status-tag :value="row.status" :options="roleStatusOptions" />
            </template>
          </el-table-column>
          <el-table-column prop="createdBy" label="创建人" min-width="100" />
          <el-table-column prop="createdAt" label="创建时间" min-width="180" />
          <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
          <el-table-column label="权限摘要" min-width="220">
            <template #default="{ row }">
              <div class="permission-inline">
                <el-tag v-for="item in (row.permissions || []).slice(0, 3)" :key="item" size="small" effect="light">{{ item }}</el-tag>
                <span v-if="(row.permissions || []).length > 3" class="permission-inline__more">+{{ row.permissions.length - 3 }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" min-width="280" align="right">
            <template #default="{ row }">
              <el-space wrap>
                <el-button link type="primary" @click="openDetailDrawer(row)">详情</el-button>
                <el-button link type="primary" @click="openEditDrawer(row)">编辑</el-button>
                <el-button link type="warning" @click="toggleRoleStatus(row)">{{ row.status === 'enabled' ? '停用' : '启用' }}</el-button>
                <el-button link type="success" @click="openPermissionDrawer(row)">权限配置</el-button>
                <el-button link type="info" @click="openMemberDrawer(row)">分配成员</el-button>
                <el-button link type="danger" @click="handleDeleteRole(row)">删除</el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>

        <div class="business-pagination-wrap">
          <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="loadTableData"
          />
        </div>
      </section-card>

      <el-drawer v-model="editDrawerVisible" :title="editingId ? '编辑角色' : '新增角色'" size="640px" append-to-body destroy-on-close>
        <el-form :model="editForm" label-width="90px">
          <el-form-item label="角色编号">
            <el-input v-model="editForm.roleCode" placeholder="请输入角色编号" />
          </el-form-item>
          <el-form-item label="角色名称">
            <el-input v-model="editForm.roleName" placeholder="请输入角色名称" />
          </el-form-item>
          <el-form-item label="权限标识">
            <el-input v-model="editForm.roleKey" placeholder="请输入权限标识" />
          </el-form-item>
          <el-form-item label="数据范围">
            <el-select v-model="editForm.dataScope" placeholder="请选择数据范围">
              <el-option label="全部数据" value="全部数据" />
              <el-option label="本部门" value="本部门" />
              <el-option label="仅本人" value="仅本人" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="editForm.status">
              <el-radio-button value="enabled">启用</el-radio-button>
              <el-radio-button value="disabled">停用</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="默认角色">
            <el-switch v-model="editForm.isDefaultRole" inline-prompt active-text="是" inactive-text="否" />
          </el-form-item>
          <el-form-item label="权限配置">
            <el-checkbox-group v-model="editForm.permissions" class="checkbox-group">
              <el-checkbox v-for="item in rolePermissionOptions" :key="item" :label="item">{{ item }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="editForm.remark" type="textarea" :rows="4" maxlength="120" show-word-limit />
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="drawer-footer">
            <el-button @click="editDrawerVisible = false">取消</el-button>
            <el-button type="primary" @click="submitEdit">保存</el-button>
          </div>
        </template>
      </el-drawer>

      <el-drawer v-model="detailDrawerVisible" title="角色详情" size="520px" append-to-body destroy-on-close>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="角色ID">{{ currentRow.id || '--' }}</el-descriptions-item>
          <el-descriptions-item label="角色编号名称">{{ currentRow.roleCode ? `${currentRow.roleCode} / ${currentRow.roleName || '--'}` : '--' }}</el-descriptions-item>
          <el-descriptions-item label="角色编号">{{ currentRow.roleCode || '--' }}</el-descriptions-item>
          <el-descriptions-item label="角色名称">{{ currentRow.roleName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="权限标识">{{ currentRow.roleKey || '--' }}</el-descriptions-item>
          <el-descriptions-item label="默认角色">{{ currentRow.isDefaultRole ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="数据范围">{{ currentRow.dataScope || '--' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <status-tag :value="currentRow.status" :options="roleStatusOptions" />
          </el-descriptions-item>
          <el-descriptions-item label="权限数量">{{ currentRow.permissionCount ?? '--' }}</el-descriptions-item>
          <el-descriptions-item label="成员数量">{{ currentRow.memberCount ?? '--' }}</el-descriptions-item>
          <el-descriptions-item label="创建用户">{{ currentRow.createdBy || '--' }}</el-descriptions-item>
          <el-descriptions-item label="更新用户">{{ currentRow.updatedBy || '--' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentRow.createdAt || '--' }}</el-descriptions-item>
          <el-descriptions-item label="最后修改">{{ currentRow.updatedAt || '--' }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentRow.remark || '--' }}</el-descriptions-item>
        </el-descriptions>

        <section-card title="变更记录" description="展示当前角色最近发生的关键变更和规则拦截记录。">
          <div v-if="(currentRow.changeLogs || []).length" class="drawer-log-list">
            <div v-for="item in currentRow.changeLogs" :key="item.id" class="drawer-log-list__item">
              <div class="drawer-log-list__head">
                <div class="drawer-log-list__title">{{ item.actionLabel }}</div>
                <el-tag size="small" effect="light" :type="logResultMap[item.result]?.type || 'info'">
                  {{ logResultMap[item.result]?.label || '未知' }}
                </el-tag>
              </div>
              <div class="drawer-log-list__meta">{{ item.operator || '--' }} · {{ item.time || '--' }}</div>
              <div class="drawer-log-list__detail">{{ item.detail || '--' }}</div>
            </div>
          </div>
          <el-empty v-else description="暂无变更记录" :image-size="72" />
        </section-card>
      </el-drawer>

      <el-drawer v-model="permissionDrawerVisible" title="权限配置摘要" size="560px" append-to-body destroy-on-close>
        <section-card title="菜单与按钮权限" description="展示当前角色勾选的菜单、按钮与接口权限。">
          <div class="tag-panel">
            <el-tag v-for="item in currentRow.permissions || []" :key="item" effect="light" class="tag-panel__item">{{ item }}</el-tag>
          </div>
        </section-card>
        <section-card title="数据权限说明" description="按角色数据范围控制组织或业务范围可见数据。">
          <div class="permission-text">{{ currentRow.dataScope || '--' }}</div>
        </section-card>
        <section-card title="变更说明" description="展示最近一次权限调整的说明记录。">
          <div class="permission-text">{{ currentRow.changeLogs?.[0]?.detail || '暂无最近变更说明' }}</div>
        </section-card>
      </el-drawer>

      <el-drawer v-model="memberDrawerVisible" title="分配成员" size="520px" append-to-body destroy-on-close>
        <el-form label-width="90px">
          <el-form-item label="角色名称">
            <span>{{ currentRow.roleName || '--' }}</span>
          </el-form-item>
          <el-form-item label="成员列表">
            <el-select v-model="memberSelection" multiple filterable placeholder="请选择成员" style="width: 100%">
              <el-option v-for="item in memberOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="drawer-footer">
            <el-button @click="memberDrawerVisible = false">取消</el-button>
            <el-button type="primary" @click="submitMembers">保存</el-button>
          </div>
        </template>
      </el-drawer>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeaderCard from '@/components/business/PageHeaderCard.vue'
import SectionCard from '@/components/business/SectionCard.vue'
import StatusTag from '@/components/business/StatusTag.vue'
import { buildBusinessConfirmOptions } from '@/plugins/modal'
import { adminModule } from '@/mock/settings'
import {
  roleModule,
  rolePermissionOptions,
  roleStatusOptions
} from '@/mock/system'

const showAdvanced = ref(false)
const rows = ref([])
const total = ref(0)
const editingId = ref('')
const currentRow = ref({})
const memberSelection = ref([])

const editDrawerVisible = ref(false)
const detailDrawerVisible = ref(false)
const permissionDrawerVisible = ref(false)
const memberDrawerVisible = ref(false)

const logResultMap = {
  success: { label: '成功', type: 'success' },
  warning: { label: '提醒', type: 'warning' },
  blocked: { label: '已拦截', type: 'danger' }
}

const queryParams = reactive({
  roleCode: '',
  keyword: '',
  status: '',
  dateRange: [],
  pageNum: 1,
  pageSize: 10
})

const editForm = reactive(getDefaultForm())

const memberOptions = computed(() =>
  adminModule.rawList().map(item => ({
    label: `${item.userName} / ${item.name}`,
    value: item.id
  }))
)

function getDefaultForm() {
  return {
    roleCode: '',
    roleName: '',
    roleKey: '',
    dataScope: '本部门',
    status: 'enabled',
    isDefaultRole: false,
    permissions: [],
    remark: ''
  }
}

function nowString() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function loadTableData() {
  const result = roleModule.list({
    keyword: [queryParams.roleCode, queryParams.keyword].filter(Boolean).join(' '),
    status: queryParams.status,
    dateRange: queryParams.dateRange,
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize
  })
  rows.value = result.rows
  total.value = result.total
}

function handleQuery() {
  queryParams.pageNum = 1
  loadTableData()
}

function handleReset() {
  Object.assign(queryParams, {
    keyword: '',
    roleCode: '',
    status: '',
    dateRange: [],
    pageNum: 1,
    pageSize: 10
  })
  showAdvanced.value = false
  loadTableData()
}

function openCreateDrawer() {
  editingId.value = ''
  Object.assign(editForm, getDefaultForm())
  editDrawerVisible.value = true
}

function openEditDrawer(row) {
  const detail = roleModule.detail(row.id)
  if (!detail) return
  editingId.value = detail.id
  Object.assign(editForm, {
    roleCode: detail.roleCode || '',
    roleName: detail.roleName,
    roleKey: detail.roleKey,
    dataScope: detail.dataScope,
    status: detail.status,
    isDefaultRole: Boolean(detail.isDefaultRole),
    permissions: [...(detail.permissions || [])],
    remark: detail.remark || ''
  })
  editDrawerVisible.value = true
}

function openDetailDrawer(row) {
  currentRow.value = roleModule.detail(row.id) || row
  detailDrawerVisible.value = true
}

function refreshCurrentRole(id) {
  if (String(currentRow.value.id || '') === String(id)) {
    currentRow.value = roleModule.detail(id) || {}
  }
}

function openPermissionDrawer(row) {
  currentRow.value = roleModule.detail(row.id) || row
  permissionDrawerVisible.value = true
}

function openMemberDrawer(row) {
  currentRow.value = roleModule.detail(row.id) || row
  memberSelection.value = [...(currentRow.value.memberIds || [])]
  memberDrawerVisible.value = true
}

function submitEdit() {
  if (!editForm.roleCode.trim()) {
    ElMessage.warning('请输入角色编号')
    return
  }
  if (!editForm.roleName.trim()) {
    ElMessage.warning('请输入角色名称')
    return
  }
  if (!editForm.roleKey.trim()) {
    ElMessage.warning('请输入权限标识')
    return
  }
  if (roleModule.findByRoleName(editForm.roleName.trim(), editingId.value)) {
    ElMessage.warning('角色名称已存在')
    return
  }
  if (roleModule.findByRoleKey(editForm.roleKey.trim(), editingId.value)) {
    ElMessage.warning('权限标识已存在')
    return
  }
  const current = editingId.value ? roleModule.detail(editingId.value) : null
  if (current?.isSystemRole && current.roleKey !== editForm.roleKey.trim()) {
    ElMessage.warning('系统核心角色不可修改权限标识')
    return
  }

  const payload = {
    roleCode: editForm.roleCode.trim(),
    roleName: editForm.roleName.trim(),
    roleKey: editForm.roleKey.trim(),
    dataScope: editForm.dataScope,
    status: editForm.status,
    isDefaultRole: editForm.isDefaultRole,
    permissions: [...editForm.permissions],
    permissionCount: editForm.permissions.length,
    memberCount: editingId.value ? roleModule.detail(editingId.value)?.memberCount || 0 : 0,
    members: editingId.value ? roleModule.detail(editingId.value)?.members || [] : [],
    memberIds: editingId.value ? roleModule.detail(editingId.value)?.memberIds || [] : [],
    remark: editForm.remark.trim(),
    updatedAt: nowString(),
    updatedBy: '超级管理员',
    createdAt: editingId.value ? roleModule.detail(editingId.value)?.createdAt || nowString() : nowString(),
    createdBy: editingId.value ? roleModule.detail(editingId.value)?.createdBy || '超级管理员' : '超级管理员'
  }

  if (editingId.value) {
    roleModule.update({ id: editingId.value, ...payload })
    refreshCurrentRole(editingId.value)
    ElMessage.success('角色已更新')
  } else {
    roleModule.create(payload)
    ElMessage.success('角色已新增')
  }

  editDrawerVisible.value = false
  loadTableData()
}

async function toggleRoleStatus(row) {
  const detail = roleModule.detail(row.id)
  if (!detail) return
  if (detail.status === 'enabled') {
    const guard = roleModule.canDisable(detail)
    if (!guard.ok) {
      roleModule.blockedLog(detail.id, '停用角色', guard.message)
      refreshCurrentRole(detail.id)
      loadTableData()
      ElMessage.warning(guard.message)
      return
    }
    if (detail.memberCount > 0) {
      try {
        await ElMessageBox.confirm(
          `停用角色「${detail.roleName}」后，已绑定该角色的账号将进入受限状态提示。`,
          '停用角色',
          buildBusinessConfirmOptions({ confirmButtonText: '确认停用' })
        )
      } catch {
        return
      }
    }
  }
  roleModule.updateStatus(row.id, row.status === 'enabled' ? 'disabled' : 'enabled')
  refreshCurrentRole(row.id)
  loadTableData()
  ElMessage.success('角色状态已更新')
}

function submitMembers() {
  if (!currentRow.value.id) return
  const selectedAdmins = adminModule.rawList().filter(item => memberSelection.value.includes(item.id))
  adminModule.rawList().forEach(item => {
    if (item.roleId === currentRow.value.id && !memberSelection.value.includes(item.id)) {
      adminModule.update({ id: item.id, roleId: '', roleName: '' })
    }
  })
  selectedAdmins.forEach(item => {
    const previousRoleId = item.roleId
    if (previousRoleId && previousRoleId !== currentRow.value.id) {
      const previousRoleMembers = adminModule.rawList().filter(admin => admin.roleId === previousRoleId && admin.id !== item.id)
      roleModule.syncMembers(previousRoleId, previousRoleMembers)
      refreshCurrentRole(previousRoleId)
    }
    adminModule.assignRole(item.id, currentRow.value)
  })
  roleModule.syncMembers(currentRow.value.id, adminModule.rawList().filter(item => item.roleId === currentRow.value.id))
  refreshCurrentRole(currentRow.value.id)
  memberDrawerVisible.value = false
  loadTableData()
  ElMessage.success('成员分配已更新')
}

async function handleDeleteRole(row) {
  const detail = roleModule.detail(row.id)
  const guard = roleModule.canDelete(detail)
  if (!guard.ok) {
    roleModule.blockedLog(detail.id, '删除角色', guard.message)
    refreshCurrentRole(detail.id)
    loadTableData()
    ElMessage.warning(guard.message)
    return
  }
  try {
    await ElMessageBox.confirm(
      `删除角色「${detail.roleName}」后不可恢复，请确认是否继续。`,
      '删除角色',
      buildBusinessConfirmOptions({ confirmButtonText: '确认删除', confirmType: 'danger' })
    )
  } catch {
    return
  }
  roleModule.remove(row.id)
  refreshCurrentRole(row.id)
  loadTableData()
  ElMessage.success('角色已删除')
}

loadTableData()
</script>

<style scoped lang="scss">
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  padding: 18px 20px;
  border-radius: 14px;
  background: linear-gradient(180deg, var(--admin-surface-subtle, #f8fafc) 0%, color-mix(in srgb, var(--el-color-primary) 8%, var(--admin-surface, #fff)) 100%);
  border: 1px solid #dbeafe;
}

.summary-card__label {
  font-size: 12px;
  color: var(--admin-text-muted, #64748b);
}

.summary-card__value {
  margin-top: 10px;
  font-size: 24px;
  font-weight: 700;
  color: var(--admin-text-primary, #111827);
}

.summary-card__value span {
  margin-left: 6px;
  font-size: 12px;
  color: var(--admin-text-muted, #64748b);
  font-weight: 500;
}

.permission-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.permission-inline__more {
  font-size: 12px;
  color: var(--admin-text-muted, #64748b);
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
}

.tag-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-panel__item {
  margin-right: 0;
}

.drawer-log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.drawer-log-list__item {
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--admin-border, #dfe5ec);
  background: var(--admin-surface-subtle, #f8fafc);
}

.drawer-log-list__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.drawer-log-list__title {
  color: var(--admin-text-primary, #111827);
  font-size: 14px;
  font-weight: 700;
}

.drawer-log-list__meta {
  margin-top: 6px;
  color: var(--admin-text-muted, #64748b);
  font-size: 12px;
}

.drawer-log-list__detail {
  margin-top: 8px;
  color: #334155;
  line-height: 1.7;
  font-size: 13px;
}

@media (max-width: 1280px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
