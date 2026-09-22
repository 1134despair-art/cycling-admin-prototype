export function deepClone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function createId(list, key = 'id') {
  return list.length ? Math.max(...list.map(item => Number(item[key]) || 0)) + 1 : 1
}

export function paginate(list, pageNum = 1, pageSize = 10) {
  const current = Number(pageNum) || 1
  const size = Number(pageSize) || 10
  const start = (current - 1) * size
  return {
    rows: deepClone(list.slice(start, start + size)),
    total: list.length
  }
}

function isEmptyValue(value) {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
}

function matchDateRange(rowValue, range) {
  if (!Array.isArray(range) || range.length !== 2 || !rowValue) return true
  return String(rowValue) >= String(range[0]) && String(rowValue) <= String(range[1])
}

export function createMockModule(seed, options = {}) {
  const { idKey = 'id', searchFields = [], dateRangeKey, defaultSort = null } = options
  let records = deepClone(seed)

  return {
    list(params = {}) {
      let rows = deepClone(records)
      const keyword = String(params.keyword || '').trim().toLowerCase()
      if (keyword && searchFields.length) {
        rows = rows.filter(item => searchFields.some(field => String(item[field] ?? '').toLowerCase().includes(keyword)))
      }
      Object.entries(params).forEach(([key, value]) => {
        if (['keyword', 'pageNum', 'pageSize'].includes(key) || isEmptyValue(value)) return
        if (key === 'dateRange' && dateRangeKey) {
          rows = rows.filter(item => matchDateRange(item[dateRangeKey], value))
          return
        }
        rows = rows.filter(item => String(item[key] ?? '') === String(value))
      })
      if (defaultSort) {
        const [sortKey, order] = defaultSort.split(':')
        rows.sort((a, b) => order === 'desc' ? String(b[sortKey]).localeCompare(String(a[sortKey])) : String(a[sortKey]).localeCompare(String(b[sortKey])))
      }
      return paginate(rows, params.pageNum, params.pageSize)
    },
    detail(id) {
      const row = records.find(item => String(item[idKey]) === String(id))
      return row ? deepClone(row) : null
    },
    add(payload) {
      const row = { [idKey]: createId(records, idKey), ...deepClone(payload) }
      records.unshift(row)
      return deepClone(row)
    },
    update(payload) {
      const index = records.findIndex(item => String(item[idKey]) === String(payload[idKey]))
      if (index > -1) {
        records[index] = { ...records[index], ...deepClone(payload) }
        return deepClone(records[index])
      }
      return null
    },
    remove(id) {
      records = records.filter(item => String(item[idKey]) !== String(id))
    },
    batchRemove(ids = []) {
      const set = new Set(ids.map(id => String(id)))
      records = records.filter(item => !set.has(String(item[idKey])))
    },
    snapshot() {
      return deepClone(records)
    }
  }
}

export function formatNumber(value, digits = 0) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
}
