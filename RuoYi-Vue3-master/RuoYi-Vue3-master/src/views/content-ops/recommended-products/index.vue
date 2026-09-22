<template>
  <business-table-page v-bind="pageConfig" />
</template>

<script setup>
import BusinessTablePage from '@/components/business/BusinessTablePage.vue'
import { recommendedProductModule, productStatusOptions } from '@/mock/content'
import { productModule } from '@/mock/products'

const statusFilterOptions = productStatusOptions.map(({ label, value }) => ({ label, value }))
const products = productModule.snapshot()
const productOptions = products.map(item => ({ label: item.productName, value: item.id }))
const categoryOptions = [...new Set(products.map(item => item.category))].map(item => ({ label: item, value: item }))

const pageConfig = {
  title: '推荐产品管理',
  description: '维护首页推荐产品卡片的封面标签、规格摘要、落地页与排序，确保推荐位内容统一。',
  module: recommendedProductModule,
  submitTransformer: form => {
    const product = productModule.detail(form.productId)
    return product ? { ...form, productName: product.productName, category: product.category, coverImage: product.imageUrl } : form
  },
  filters: [
    { key: 'keyword', label: '产品信息', type: 'input', placeholder: '请输入产品名称/标签/摘要' },
    { key: 'category', label: '产品分类', type: 'select', options: categoryOptions },
    { key: 'status', label: '状态', type: 'select', options: statusFilterOptions }
  ],
  columns: [
    { key: 'productName', label: '产品名称', width: 220 },
    { key: 'category', label: '产品分类', width: 140 },
    { key: 'coverImage', label: '封面图', type: 'image', width: 120 },
    { key: 'coverLabel', label: '封面标签', width: 120 },
    { key: 'specText', label: '规格摘要', width: 240 },
    { key: 'landingPage', label: '落地页', width: 140 },
    { key: 'sort', label: '排序', type: 'number', width: 80 },
    { key: 'status', label: '状态', type: 'status', options: productStatusOptions, width: 120 },
    { key: 'updatedAt', label: '更新时间', width: 180 }
  ],
  detailFields: [
    { key: 'productName', label: '产品名称' },
    { key: 'category', label: '产品分类' },
    { key: 'coverImage', label: '封面图', type: 'image' },
    { key: 'coverLabel', label: '封面标签' },
    { key: 'specText', label: '规格摘要' },
    { key: 'landingPage', label: '落地页' },
    { key: 'sort', label: '排序', type: 'number' },
    { key: 'status', label: '状态', type: 'status', options: productStatusOptions },
    { key: 'updatedAt', label: '更新时间' }
  ],
  formFields: [
    { key: 'productId', label: '引用产品', type: 'select', options: productOptions },
    { key: 'coverLabel', label: '封面标签' },
    { key: 'specText', label: '规格摘要', type: 'textarea', rows: 3, full: true },
    { key: 'landingPage', label: '落地页' },
    { key: 'sort', label: '排序', type: 'number' },
    { key: 'status', label: '状态', type: 'select', options: statusFilterOptions }
  ]
}
</script>
