<template>
  <div class="app-container business-page">
    <div class="business-page-shell">
      <page-header-card
        title="超管账号管理"
        description="新增、编辑、启用、禁用后台管理员账号，维护账号、部门、联系方式、角色与备注。"
      >
        <template #extra>
          <el-button type="primary" icon="Plus" @click="openCreateDialog">新增账号</el-button>
        </template>
      </page-header-card>

      <el-card shadow="never" class="business-query-card">
        <el-form :model="queryParams" :inline="true" label-width="76px" class="business-query-form" @submit.prevent>
          <el-form-item label="账号信息">
            <el-input v-model="queryParams.keyword" placeholder="请输入账号/姓名/邮箱" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="部门">
            <el-input v-model="queryParams.deptName" placeholder="请输入所在部门" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="queryParams.roleId" placeholder="请选择角色" clearable>
              <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
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

      <section-card title="账号列表" description="查看后台管理员账号、部门、角色、状态与最近登录信息。">
        <template #extra>
          <el-button plain icon="Refresh" @click="loadTableData">刷新</el-button>
        </template>

        <el-table :data="rows" stripe>
          <el-table-column prop="userName" label="管理员账号" min-width="150" />
          <el-table-column prop="name" label="姓名" min-width="120" />
          <el-table-column prop="deptName" label="所在部门" min-width="140" />
          <el-table-column label="角色" min-width="180">
            <template #default="{ row }">
              <div class="role-tag-list">
                <el-tag v-for="item in row.roleNames || []" :key="item" size="small" effect="light">{{ item }}</el-tag>
                <span v-if="!(row.roleNames || []).length">--</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" min-width="140" />
          <el-table-column prop="email" label="邮箱" min-width="200" />
          <el-table-column prop="lastLoginIp" label="最近登录IP" min-width="140" />
          <el-table-column label="状态" min-width="100" align="center">
            <template #default="{ row }">
              <status-tag :value="row.status" :options="statusOptions" />
            </template>
          </el-table-column>
          <el-table-column prop="lastLogin" label="最近登录时间" min-width="170" />
          <el-table-column prop="createTime" label="创建时间" min-width="170" />
          <el-table-column prop="updateTime" label="更新时间" min-width="170" />
          <el-table-column label="操作" fixed="right" min-width="250" align="right">
            <template #default="{ row }">
              <el-space wrap>
                <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
                <el-button link type="primary" @click="openRoleAssignDialog(row)">角色分配</el-button>
                <el-button link type="warning" @click="openResetDialog(row)">重置密码</el-button>
                <el-button link :type="row.status === 'enabled' ? 'warning' : 'success'" @click="handleToggleStatus(row)">
                  {{ row.status === 'enabled' ? '停用' : '启用' }}
                </el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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

      <el-dialog v-model="editDialogVisible" :title="editingId ? '编辑账号' : '新增账号'" width="860px" append-to-body>
        <el-form :model="formModel" label-width="96px" class="business-form-grid">
          <el-form-item label="管理员账号">
            <el-input v-model="formModel.userName" :disabled="Boolean(editingId)" placeholder="请输入管理员账号" />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="formModel.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="所在部门">
            <el-input v-model="formModel.deptName" placeholder="请输入所在部门" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="formModel.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="formModel.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item v-if="!editingId" label="初始密码">
            <el-input v-model="formModel.password" placeholder="请输入初始密码" show-password />
          </el-form-item>
          <el-form-item v-if="!editingId" label="确认密码">
            <el-input v-model="formModel.confirmPassword" placeholder="请再次输入密码" show-password />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="formModel.roleIds" multiple collapse-tags collapse-tags-tooltip placeholder="请选择角色" style="width: 100%">
              <el-option v-for="item in enabledRoleOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="formModel.status">
              <el-radio-button value="enabled">启用</el-radio-button>
              <el-radio-button value="disabled">停用</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注" class="is-full">
            <el-input v-model="formModel.remark" type="textarea" :rows="4" maxlength="120" show-word-limit />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="drawer-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitEdit">保存</el-button>
          </div>
        </template>
      </el-dialog>

      <el-dialog v-model="resetDialogVisible" title="重置密码" width="520px" append-to-body>
        <div class="business-tip-panel">
          <div class="business-tip-panel__title">确认将该账号密码重置为初始密码？</div>
          <div class="business-tip-panel__desc">账号：{{ currentRow.userName || '--' }}</div>
          <div class="business-tip-panel__desc">默认密码：{{ defaultPassword }}</div>
          <div class="business-tip-panel__desc">重置后会同步更新密码修改时间，管理员可直接使用新密码登录。</div>
        </div>
        <template #footer>
          <div class="drawer-footer">
            <el-button @click="resetDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitResetPassword">确认重置</el-button>
          </div>
        </template>
      </el-dialog>
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
import { adminModule, getEnabledRoleOptions } from '@/mock/settings'
import { roleModule } from '@/mock/system'

const currentUserName = ref('admin')
const defaultPassword = ref('Aa123456')
const showAdvanced = ref(false)
const rows = ref([])
const total = ref(0)
const editingId = ref('')
const currentRow = ref({})

const editDialogVisible = ref(false)
const resetDialogVisible = ref(false)

const statusOptions = [
  { label: '启用', value: 'enabled', type: 'success' },
  { label: '停用', value: 'disabled', type: 'danger' }
]

const queryParams = reactive({
  keyword: '',
  deptName: '',
  status: '',
  roleId: '',
  dateRange: [],
  pageNum: 1,
  pageSize: 10
})

const formModel = reactive(getDefaultForm())

const roleOptions = computed(() =>
  roleModule.rawList().map(item => ({
    label: item.roleName,
    value: item.id
  }))
)

const enabledRoleOptions = computed(() => getEnabledRoleOptions(roleModule.rawList()))

function getDefaultForm() {
  return {
    userName: '',
    name: '',
    deptName: '',
    phone: '',
    email: '',
    password: defaultPassword.value,
    confirmPassword: defaultPassword.value,
    roleIds: [],
    status: 'enabled',
    remark: ''
  }
}

function matchesDateRange(value, range) {
  if (!Array.isArray(range) || range.length !== 2 || !value) return true
  return String(value).slice(0, 10) >= String(range[0]) && String(value).slice(0, 10) <= String(range[1])
}

function getFilteredAdmins() {
  const keyword = String(queryParams.keyword || '').trim().toLowerCase()
  return adminModule
    .rawList()
    .filter(item => {
      if (!keyword) return true
      return [item.userName, item.name, item.phone, item.email, item.roleName].some(field => String(field || '').toLowerCase().includes(keyword))
    })
    .filter(item => !queryParams.deptName || String(item.deptName || '').includes(queryParams.deptName))
    .filter(item => !queryParams.status || item.status === queryParams.status)
    .filter(item => !queryParams.roleId || String(item.roleId) === String(queryParams.roleId))
    .filter(item => matchesDateRange(item.createTime, queryParams.dateRange))
}

function loadTableData() {
  const filtered = getFilteredAdmins()
  total.value = filtered.length
  const start = (queryParams.pageNum - 1) * queryParams.pageSize
  rows.value = filtered.slice(start, start + queryParams.pageSize)
}

function handleQuery() {
  queryParams.pageNum = 1
  loadTableData()
}

function handleReset() {
  Object.assign(queryParams, {
    keyword: '',
    deptName: '',
    status: '',
    roleId: '',
    dateRange: [],
    pageNum: 1,
    pageSize: 10
  })
  showAdvanced.value = false
  loadTableData()
}

function openCreateDialog() {
  editingId.value = ''
  Object.assign(formModel, getDefaultForm())
  editDialogVisible.value = true
}

function openEditDialog(row) {
  const detail = adminModule.detail(row.id)
  if (!detail) return
  editingId.value = detail.id
  Object.assign(formModel, {
    userName: detail.userName,
    name: detail.name,
    deptName: detail.deptName || '',
    phone: detail.phone,
    email: detail.email || '',
    password: defaultPassword.value,
    confirmPassword: defaultPassword.value,
    roleIds: Array.isArray(detail.roleIds) ? [...detail.roleIds] : (detail.roleId ? [detail.roleId] : []),
    status: detail.status,
    remark: detail.remark || ''
  })
  editDialogVisible.value = true
}

function openRoleAssignDialog(row) {
  openEditDialog(row)
}

function openResetDialog(row) {
  currentRow.value = adminModule.detail(row.id) || row
  resetDialogVisible.value = true
}

function syncRoleMembers(roleId) {
  if (!roleId) return
  const role = roleModule.detail(roleId)
  if (!role) return
  const roleAdmins = adminModule.rawList().filter(item => String(item.roleId) === String(roleId))
  roleModule.syncMembers(roleId, roleAdmins)
}

function buildRolePayload(roleIds = []) {
  const selectedRoles = roleModule.rawList().filter(item => roleIds.includes(item.id))
  return {
    roleIds,
    roleNames: selectedRoles.map(item => item.roleName),
    roleId: selectedRoles[0]?.id || '',
    roleName: selectedRoles[0]?.roleName || ''
  }
}

function submitEdit() {
  if (!formModel.userName.trim()) return ElMessage.warning('请输入管理员账号')
  if (!formModel.name.trim()) return ElMessage.warning('请输入姓名')
  if (!formModel.deptName.trim()) return ElMessage.warning('请输入所在部门')
  if (!formModel.phone.trim()) return ElMessage.warning('请输入手机号')
  if (!formModel.email.trim()) return ElMessage.warning('请输入邮箱')
  if (!editingId.value && !formModel.password.trim()) return ElMessage.warning('请输入初始密码')
  if (!editingId.value && formModel.password !== formModel.confirmPassword) return ElMessage.warning('两次输入密码不一致')
  if (!formModel.roleIds.length) return ElMessage.warning('请选择至少一个角色')
  if (adminModule.findByUserName(formModel.userName, editingId.value)) return ElMessage.warning('管理员账号已存在')
  if (adminModule.findByPhone(formModel.phone, editingId.value)) return ElMessage.warning('手机号已存在')
  if (adminModule.findByEmail(formModel.email, editingId.value)) return ElMessage.warning('邮箱已存在')

  const rolePayload = buildRolePayload(formModel.roleIds)
  if (!rolePayload.roleId) return ElMessage.warning('请选择启用中的角色')

  if (editingId.value) {
    const current = adminModule.detail(editingId.value)
    adminModule.update({
      id: editingId.value,
      name: formModel.name,
      deptName: formModel.deptName,
      phone: formModel.phone,
      email: formModel.email,
      status: formModel.status,
      remark: formModel.remark,
      updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updaterName: '超级管理员',
      ...rolePayload
    })
    if (current && String(current.roleId) !== String(rolePayload.roleId)) {
      syncRoleMembers(current.roleId)
      syncRoleMembers(rolePayload.roleId)
    } else {
      syncRoleMembers(rolePayload.roleId)
    }
    ElMessage.success('账号已更新')
  } else {
    const created = adminModule.create({
      userName: formModel.userName,
      name: formModel.name,
      deptName: formModel.deptName,
      phone: formModel.phone,
      email: formModel.email,
      status: formModel.status,
      remark: formModel.remark,
      passwordStatus: 'initial',
      passwordHint: `初始密码：${formModel.password}`,
      passwordUpdatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      isSuperAdmin: false,
      creatorName: '超级管理员',
      updaterName: '超级管理员',
      ...rolePayload
    })
    syncRoleMembers(created.roleId)
    ElMessage.success('账号已新增')
  }

  editDialogVisible.value = false
  loadTableData()
}

async function handleToggleStatus(row) {
  if (row.status === 'enabled') {
    const guard = adminModule.canDisable(row, currentUserName.value)
    if (!guard.ok) {
      adminModule.blockedLog(row.id, '停用账号', guard.message)
      loadTableData()
      return ElMessage.warning(guard.message)
    }
    try {
      await ElMessageBox.confirm(
        `停用账号「${row.userName}」后，该账号将无法继续登录后台。`,
        '停用账号',
        buildBusinessConfirmOptions({ confirmButtonText: '确认停用' })
      )
    } catch {
      return
    }
  }
  adminModule.updateStatus(row.id, row.status === 'enabled' ? 'disabled' : 'enabled')
  loadTableData()
  ElMessage.success('账号状态已更新')
}

function submitResetPassword() {
  adminModule.resetPassword(currentRow.value.id, defaultPassword.value)
  resetDialogVisible.value = false
  loadTableData()
  ElMessage.success('已重置为初始密码')
}

async function handleDelete(row) {
  const guard = adminModule.canDelete(row, currentUserName.value)
  if (!guard.ok) {
    adminModule.blockedLog(row.id, '删除账号', guard.message)
    loadTableData()
    return ElMessage.warning(guard.message)
  }
  try {
    await ElMessageBox.confirm(
      `删除账号「${row.userName}」后不可恢复，请确认是否继续。`,
      '删除账号',
      buildBusinessConfirmOptions({ confirmButtonText: '确认删除', confirmType: 'danger' })
    )
  } catch {
    return
  }
  const previousRoleId = row.roleId
  adminModule.remove(row.id)
  syncRoleMembers(previousRoleId)
  loadTableData()
  ElMessage.success('账号已删除')
}

loadTableData()
</script>

<style scoped lang="scss">
.role-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.business-tip-panel {
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid var(--admin-border, #dfe5ec);
  background: linear-gradient(180deg, var(--admin-surface-subtle, #f8fafc) 0%, color-mix(in srgb, var(--el-color-primary) 8%, var(--admin-surface, #fff)) 100%);
}

.business-tip-panel__title {
  color: var(--admin-text-primary, #111827);
  font-size: 16px;
  font-weight: 700;
}

.business-tip-panel__desc {
  margin-top: 10px;
  color: var(--admin-text-muted, #64748b);
  line-height: 1.7;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
