<template>
  <div class="local-image-upload">
    <el-upload action="#" :auto-upload="false" :show-file-list="false" accept="image/*" :on-change="handleChange">
      <el-button plain>选择图片</el-button>
    </el-upload>
    <div v-if="modelValue" class="local-image-upload__preview">
      <img :src="modelValue" alt="preview" />
      <el-button text type="danger" @click="emit('update:modelValue', '')">移除</el-button>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: String, default: '' },
  requiredWidth: { type: Number, default: 0 },
  requiredHeight: { type: Number, default: 0 }
})

const emit = defineEmits(['update:modelValue'])

function handleChange(file) {
  const requiredWidth = Number(props.requiredWidth) || 0
  const requiredHeight = Number(props.requiredHeight) || 0
  const shouldValidate = requiredWidth > 0 && requiredHeight > 0

  const rawFile = file?.raw
  if (!rawFile) return

  if (shouldValidate) {
    const objectUrl = URL.createObjectURL(rawFile)
    const image = new Image()
    image.onload = () => {
      const isValid = image.width === requiredWidth && image.height === requiredHeight
      URL.revokeObjectURL(objectUrl)
      if (!isValid) {
        ElMessage.warning(`图片尺寸需为 ${requiredWidth}×${requiredHeight}px，请重新上传`)
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        emit('update:modelValue', event.target?.result || '')
      }
      reader.readAsDataURL(rawFile)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      ElMessage.warning('图片读取失败，请重新上传')
    }
    image.src = objectUrl
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    emit('update:modelValue', event.target?.result || '')
  }
  reader.readAsDataURL(rawFile)
}
</script>
