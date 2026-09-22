<template>
  <div class="local-image-gallery-upload">
    <el-upload action="#" :auto-upload="false" :show-file-list="false" accept="image/*" multiple :on-change="handleChange">
      <el-button plain>选择图片</el-button>
    </el-upload>
    <div v-if="list.length" class="local-image-gallery-upload__grid">
      <div v-for="(item, index) in list" :key="`${item}-${index}`" class="local-image-gallery-upload__item">
        <img :src="item" alt="preview" />
        <el-button text type="danger" @click="removeAt(index)">移除</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const list = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))

function handleChange(file) {
  const rawFile = file?.raw
  if (!rawFile) return
  const reader = new FileReader()
  reader.onload = event => {
    emit('update:modelValue', [...list.value, event.target?.result || ''].filter(Boolean))
  }
  reader.readAsDataURL(rawFile)
}

function removeAt(index) {
  emit('update:modelValue', list.value.filter((_, currentIndex) => currentIndex !== index))
}
</script>

<style scoped lang="scss">
.local-image-gallery-upload__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.local-image-gallery-upload__item {
  padding: 10px;
  border: 1px solid var(--admin-border, #dfe5ec);
  border-radius: 10px;
  background: var(--admin-surface, #fff);
}

.local-image-gallery-upload__item img {
  width: 100%;
  height: 108px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}
</style>
