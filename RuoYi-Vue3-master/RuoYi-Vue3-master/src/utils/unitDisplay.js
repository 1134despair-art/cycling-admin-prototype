function formatBaseNumber(value, precision = 2) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  })
}

export function formatMoneyUnit(value, unit = '元', precision = 2) {
  if (value === undefined || value === null || value === '') return '--'
  return `${formatBaseNumber(value, precision)} ${unit}`
}

export function formatPercentUnit(value, precision = 2) {
  if (value === undefined || value === null || value === '') return '--'
  return `${formatBaseNumber(value, precision)} %`
}

export function formatCountUnit(value, unit = '台', precision = 0) {
  if (value === undefined || value === null || value === '') return '--'
  return `${formatBaseNumber(value, precision)} ${unit}`
}
