import request from '@/utils/request'
import { getRuntimeDicts } from '@/mock/systemRuntime'

// 查询字典数据列表
export function listData(query) {
  return request({
    url: '/system/dict/data/list',
    method: 'get',
    params: query
  })
}

// 查询字典数据详细
export function getData(dictCode) {
  return request({
    url: '/system/dict/data/' + dictCode,
    method: 'get'
  })
}

// 根据字典类型查询字典数据信息
export function getDicts(dictType) {
  if (import.meta.env.VITE_FRONTEND_ONLY !== 'false') {
    return Promise.resolve({ code: 200, data: getRuntimeDicts(dictType) })
  }
  return request({
    url: '/system/dict/data/type/' + dictType,
    method: 'get'
  }).catch(() => {
    return Promise.resolve({
      code: 200,
      data: getRuntimeDicts(dictType)
    })
  })
}

// 新增字典数据
export function addData(data) {
  return request({
    url: '/system/dict/data',
    method: 'post',
    data: data
  })
}

// 修改字典数据
export function updateData(data) {
  return request({
    url: '/system/dict/data',
    method: 'put',
    data: data
  })
}

// 删除字典数据
export function delData(dictCode) {
  return request({
    url: '/system/dict/data/' + dictCode,
    method: 'delete'
  })
}
