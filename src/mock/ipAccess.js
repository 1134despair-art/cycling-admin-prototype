import { createMockModule } from './_helpers'

export const ipRuleTypeOptions = [
  { label: '单个 IP', value: 'single', type: 'primary' },
  { label: 'CIDR 网段', value: 'cidr', type: 'info' }
]

export const ipRuleStatusOptions = [
  { label: '启用', value: 'enabled', type: 'success' },
  { label: '停用', value: 'disabled', type: 'info' }
]

const timestamp = '2026-08-03 09:00:00'
const ipRuleSeed = [
  createRule(1, '本机 IPv4', 'single', '127.0.0.1', '本机开发与运维访问'),
  createRule(2, '本机 IPv6', 'single', '::1', '本机 IPv6 回环访问'),
  createRule(3, '办公网络', 'cidr', '192.168.0.0/16', '办公局域网访问')
]

const ipRuleStore = createMockModule(ipRuleSeed, {
  searchFields: ['ruleName', 'address', 'remark', 'updatedBy'],
  defaultSort: 'updatedAt:desc'
})

let accessControlEnabled = true
let settingsUpdatedAt = timestamp
let settingsUpdatedBy = '系统初始化'
let mockClientIp = ''

export const ipAccessModule = {
  list(params = {}) {
    return ipRuleStore.list(params)
  },
  detail(id) {
    return ipRuleStore.detail(id)
  },
  rawList() {
    return ipRuleStore.snapshot()
  },
  getCurrentClientIp() {
    return resolveCurrentClientIp()
  },
  getSettings() {
    const rules = this.rawList()
    const enabledRules = rules.filter(item => item.status === 'enabled')
    const access = this.checkAccess()
    return {
      enabled: accessControlEnabled,
      currentIp: access.clientIp,
      currentIpAllowed: access.allowed,
      matchedRuleName: access.matchedRule?.ruleName || '',
      totalRuleCount: rules.length,
      enabledRuleCount: enabledRules.length,
      updatedAt: settingsUpdatedAt,
      updatedBy: settingsUpdatedBy
    }
  },
  validateAddress(address, ruleType = 'single') {
    return validateRuleAddress(address, ruleType)
  },
  findByAddress(address, excludeId = '') {
    const normalized = normalizeRuleAddress(address)
    return this.rawList().find(item => (
      normalizeRuleAddress(item.address) === normalized && String(item.id) !== String(excludeId)
    ))
  },
  create(payload = {}) {
    const normalized = normalizePayload(payload)
    assertValidPayload(normalized)
    const now = nowString()
    const row = ipRuleStore.add({
      ...normalized,
      createdAt: now,
      createdBy: 'admin',
      updatedAt: now,
      updatedBy: 'admin'
    })
    touchSettings()
    return row
  },
  update(payload = {}) {
    const current = ipRuleStore.detail(payload.id)
    if (!current) throw new Error('IP 规则不存在')

    const normalized = normalizePayload({ ...current, ...payload })
    assertValidPayload(normalized, payload.id)
    assertCurrentIpRemainsAllowed(payload.id, normalized)

    const row = ipRuleStore.update({
      ...normalized,
      id: payload.id,
      updatedAt: nowString(),
      updatedBy: 'admin'
    })
    touchSettings()
    return row
  },
  updateStatus(id, status) {
    const current = ipRuleStore.detail(id)
    if (!current) throw new Error('IP 规则不存在')
    return this.update({ ...current, status })
  },
  remove(id) {
    const current = ipRuleStore.detail(id)
    if (!current) throw new Error('IP 规则不存在')
    assertCurrentIpRemainsAllowed(id, null)
    ipRuleStore.remove(id)
    touchSettings()
    return true
  },
  setEnabled(enabled) {
    const nextValue = Boolean(enabled)
    if (nextValue && !hasEnabledRuleForIp(resolveCurrentClientIp())) {
      throw new Error('请先添加并启用覆盖当前访问 IP 的规则')
    }
    accessControlEnabled = nextValue
    touchSettings()
    return this.getSettings()
  },
  checkAccess(ip = resolveCurrentClientIp()) {
    const clientIp = normalizeIp(ip) || '127.0.0.1'
    if (!accessControlEnabled) {
      return { allowed: true, clientIp, matchedRule: null, reason: 'disabled' }
    }

    const matchedRule = this.rawList().find(item => (
      item.status === 'enabled' && matchesRule(clientIp, item)
    ))

    return {
      allowed: Boolean(matchedRule),
      clientIp,
      matchedRule: matchedRule || null,
      reason: matchedRule ? 'matched' : 'not-listed'
    }
  }
}

export function checkIpAccess(ip) {
  return ipAccessModule.checkAccess(ip)
}

export function setMockClientIp(ip = '') {
  mockClientIp = normalizeIp(ip)
}

function createRule(id, ruleName, ruleType, address, remark) {
  return {
    id,
    ruleName,
    ruleType,
    address,
    status: 'enabled',
    remark,
    createdAt: timestamp,
    createdBy: '系统初始化',
    updatedAt: timestamp,
    updatedBy: '系统初始化'
  }
}

function normalizePayload(payload = {}) {
  return {
    ...payload,
    ruleName: String(payload.ruleName || '').trim(),
    ruleType: payload.ruleType === 'cidr' ? 'cidr' : 'single',
    address: normalizeRuleAddress(payload.address),
    status: payload.status === 'disabled' ? 'disabled' : 'enabled',
    remark: String(payload.remark || '').trim()
  }
}

function assertValidPayload(payload, excludeId = '') {
  if (!payload.ruleName) throw new Error('请输入规则名称')
  const validation = validateRuleAddress(payload.address, payload.ruleType)
  if (!validation.ok) throw new Error(validation.message)
  if (ipAccessModule.findByAddress(payload.address, excludeId)) {
    throw new Error('该 IP 地址或网段已存在')
  }
}

function assertCurrentIpRemainsAllowed(changedId, replacement) {
  if (!accessControlEnabled) return
  const currentIp = resolveCurrentClientIp()
  const nextRules = ipAccessModule.rawList()
    .filter(item => String(item.id) !== String(changedId))

  if (replacement) nextRules.push(replacement)

  const remainsAllowed = nextRules.some(item => (
    item.status === 'enabled' && matchesRule(currentIp, item)
  ))
  if (!remainsAllowed) {
    throw new Error('该操作会阻断当前 IP，请先启用其他可用规则')
  }
}

function hasEnabledRuleForIp(ip) {
  return ipAccessModule.rawList().some(item => (
    item.status === 'enabled' && matchesRule(ip, item)
  ))
}

function validateRuleAddress(address, ruleType) {
  const value = normalizeRuleAddress(address)
  if (!value) return { ok: false, message: '请输入 IP 地址或网段' }

  if (ruleType === 'cidr') {
    const parts = value.split('/')
    if (parts.length !== 2) return { ok: false, message: '请输入有效的 CIDR 网段，例如 192.168.1.0/24' }
    const [baseAddress, prefixValue] = parts
    const prefix = Number(prefixValue)
    const maxPrefix = parseIpv4(baseAddress) ? 32 : parseIpv6(baseAddress) ? 128 : -1
    if (maxPrefix < 0 || !/^\d+$/.test(prefixValue) || prefix < 0 || prefix > maxPrefix) {
      return { ok: false, message: '请输入有效的 CIDR 网段，例如 192.168.1.0/24' }
    }
    return { ok: true, message: '' }
  }

  if (value.includes('/') || (!parseIpv4(value) && !parseIpv6(value))) {
    return { ok: false, message: '请输入有效的 IPv4 或 IPv6 地址' }
  }
  return { ok: true, message: '' }
}

function matchesRule(ip, rule) {
  if (rule.ruleType === 'cidr') return matchesCidr(ip, rule.address)
  return normalizeIp(ip).toLowerCase() === normalizeIp(rule.address).toLowerCase()
}

function matchesCidr(ip, cidr) {
  const [baseAddress, prefixText] = String(cidr || '').split('/')
  const prefix = Number(prefixText)
  const ipV4 = parseIpv4(ip)
  const baseV4 = parseIpv4(baseAddress)

  if (ipV4 && baseV4 && prefix >= 0 && prefix <= 32) {
    return applyPrefix(ipv4ToBigInt(ipV4), prefix, 32) === applyPrefix(ipv4ToBigInt(baseV4), prefix, 32)
  }

  const ipV6 = parseIpv6(ip)
  const baseV6 = parseIpv6(baseAddress)
  if (ipV6 && baseV6 && prefix >= 0 && prefix <= 128) {
    return applyPrefix(ipv6ToBigInt(ipV6), prefix, 128) === applyPrefix(ipv6ToBigInt(baseV6), prefix, 128)
  }

  return false
}

function applyPrefix(value, prefix, totalBits) {
  if (prefix === 0) return 0n
  const shift = BigInt(totalBits - prefix)
  return (value >> shift) << shift
}

function ipv4ToBigInt(parts) {
  return parts.reduce((value, part) => (value << 8n) + BigInt(part), 0n)
}

function ipv6ToBigInt(parts) {
  return parts.reduce((value, part) => (value << 16n) + BigInt(part), 0n)
}

function parseIpv4(value) {
  const parts = String(value || '').split('.')
  if (parts.length !== 4) return null
  if (parts.some(part => !/^\d{1,3}$/.test(part) || Number(part) > 255)) return null
  return parts.map(Number)
}

function parseIpv6(value) {
  let address = normalizeIp(value).split('%')[0]
  if (!address.includes(':')) return null

  if (address.includes('.')) {
    const lastColon = address.lastIndexOf(':')
    const ipv4Parts = parseIpv4(address.slice(lastColon + 1))
    if (!ipv4Parts) return null
    const high = ((ipv4Parts[0] << 8) | ipv4Parts[1]).toString(16)
    const low = ((ipv4Parts[2] << 8) | ipv4Parts[3]).toString(16)
    address = `${address.slice(0, lastColon)}:${high}:${low}`
  }

  if ((address.match(/::/g) || []).length > 1) return null
  const hasCompression = address.includes('::')
  const [leftText = '', rightText = ''] = hasCompression ? address.split('::') : [address, '']
  const left = leftText ? leftText.split(':') : []
  const right = rightText ? rightText.split(':') : []
  const isValidPart = part => /^[0-9a-f]{1,4}$/i.test(part)

  if ([...left, ...right].some(part => !isValidPart(part))) return null
  if ((!hasCompression && left.length !== 8) || (hasCompression && left.length + right.length >= 8)) return null

  const missing = hasCompression ? 8 - left.length - right.length : 0
  return [...left, ...Array(missing).fill('0'), ...right].map(part => Number.parseInt(part, 16))
}

function normalizeRuleAddress(value) {
  const input = String(value || '').trim()
  const slashIndex = input.indexOf('/')
  if (slashIndex < 0) return normalizeIp(input)
  return `${normalizeIp(input.slice(0, slashIndex))}/${input.slice(slashIndex + 1).trim()}`
}

function normalizeIp(value) {
  return String(value || '').trim().replace(/^\[|\]$/g, '')
}

function resolveCurrentClientIp() {
  if (mockClientIp) return mockClientIp
  if (typeof globalThis !== 'undefined' && globalThis.__BLT_ADMIN_CLIENT_IP__) {
    return normalizeIp(globalThis.__BLT_ADMIN_CLIENT_IP__)
  }
  if (typeof window !== 'undefined') {
    const hostname = normalizeIp(window.location?.hostname)
    if (hostname === 'localhost' || !hostname) return '127.0.0.1'
    if (parseIpv4(hostname) || parseIpv6(hostname)) return hostname
  }
  return '127.0.0.1'
}

function touchSettings() {
  settingsUpdatedAt = nowString()
  settingsUpdatedBy = 'admin'
}

function nowString() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}
