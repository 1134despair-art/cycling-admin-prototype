<template>
  <el-dialog
    v-model="dialogVisible"
    title="修改密码"
    width="min(520px, 94vw)"
    append-to-body
    :close-on-click-modal="false"
    @closed="resetForm"
  >
    <el-form ref="pwdRef" :model="form" :rules="rules" label-width="84px" class="change-password-form">
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="form.oldPassword"
          type="password"
          show-password
          autocomplete="current-password"
          placeholder="请输入旧密码"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          show-password
          autocomplete="new-password"
          placeholder="请输入新密码"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          show-password
          autocomplete="new-password"
          placeholder="请再次输入新密码"
          @keyup.enter="submit"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">保存修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { updateUserPwd } from '@/api/system/user'
import { usePasswordRule } from '@/utils/passwordRule'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'success'])
const pwdRef = ref()
const submitting = ref(false)
const form = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const { infoPwdValidator } = usePasswordRule()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

function equalToPassword(_rule, value, callback) {
  if (form.newPassword !== value) return callback(new Error('两次输入的密码不一致'))
  callback()
}

function differentFromOldPassword(_rule, value, callback) {
  if (value && value === form.oldPassword) return callback(new Error('新密码不能与旧密码相同'))
  callback()
}

const rules = {
  oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
  newPassword: [...infoPwdValidator.value, { validator: differentFromOldPassword, trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { validator: equalToPassword, trigger: 'blur' }
  ]
}

async function submit() {
  if (submitting.value || !pwdRef.value) return
  try {
    await pwdRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const response = await updateUserPwd(form.oldPassword, form.newPassword)
    ElMessage.success(response.msg || '密码修改成功')
    emit('success')
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(error?.message || '密码修改失败')
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  pwdRef.value?.resetFields()
  Object.assign(form, { oldPassword: '', newPassword: '', confirmPassword: '' })
}
</script>

<style scoped lang="scss">
.change-password-form { padding-top: 6px; }

@media (max-width: 600px) {
  .change-password-form :deep(.el-form-item) { display: block; }
  .change-password-form :deep(.el-form-item__label) { width: auto !important; justify-content: flex-start; }
  .change-password-form :deep(.el-form-item__content) { margin-left: 0 !important; }
}
</style>
