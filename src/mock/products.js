import { createMockModule } from './_helpers'

export const productStatusOptions = [
  { label: '启用', value: 'enabled', type: 'success' },
  { label: '停用', value: 'disabled', type: 'info' }
]

export const displayToggleOptions = [
  { label: '展示', value: true, type: 'success' },
  { label: '隐藏', value: false, type: 'info' }
]

export const productImageTypeOptions = ['产品主图', '列表图', '详情横幅', '详情图集', '规格图', '安装示意图', '视频封面']

export const fixedProductRuleFields = [
  ['型号', 'model'], ['速别', 'speedLevel'], ['安装方式', 'installationMethod'], ['拉线方式', 'cableRouting'],
  ['兼容齿数', 'compatibleTeeth'], ['齿容量', 'totalCapacity'], ['链线', 'chainline'], ['颜色', 'color'],
  ['重量', 'weight'], ['主体材料', 'bodyMaterial'], ['导板材料', 'cageMaterial'], ['导板长度', 'cageLength'],
  ['安装位置', 'mountingPosition'], ['拨杆材料', 'leverMaterial'], ['外导板材料', 'outerCageMaterial'],
  ['内导板材料', 'innerCageMaterial'], ['线长', 'cableLength'], ['变速线长', 'shiftCableLength'],
  ['视窗指示', 'gearIndicator'], ['变径套', 'reducerSleeve'], ['安装角度', 'installationAngle'],
  ['刹车类型', 'brakeType'], ['刹车杆材料', 'brakeLeverMaterial'], ['制动方式', 'brakingMethod'],
  ['长度', 'length'], ['线直径', 'cableDiameter'], ['插头直径', 'plugDiameter'], ['端口', 'port'],
  ['直径', 'diameter'], ['额定电压', 'ratedVoltage'], ['充电电压', 'chargingVoltage'],
  ['最大充电电流', 'maxChargingCurrent'], ['额定容量', 'ratedCapacity'], ['厚度', 'thickness'],
  ['导轮材料', 'pulleyMaterial'], ['上导轮T数', 'upperPulleyTeeth'], ['下导轮T数', 'lowerPulleyTeeth'],
  ['兼容性', 'compatibility'], ['控制方式', 'controlMethod'], ['按键角度', 'buttonAngle'], ['备注', 'remarks']
]

const categorySeed = [
  { id: 1, categoryCode: 'ROAD', categoryName: 'ROAD 公路', icon: 'Road', appVisible: true, webVisible: true, sort: 1, status: 'enabled', description: '公路车变速与制动产品', updatedAt: '2026-07-28 09:00:00' },
  { id: 2, categoryCode: 'GRAVEL', categoryName: 'GRAVEL 砾石', icon: 'Compass', appVisible: true, webVisible: true, sort: 2, status: 'enabled', description: '砾石与长途骑行产品', updatedAt: '2026-07-28 09:00:00' },
  { id: 3, categoryCode: 'MTB', categoryName: 'MTB 山地', icon: 'Mountain', appVisible: true, webVisible: true, sort: 3, status: 'enabled', description: '山地车变速与控制产品', updatedAt: '2026-07-28 09:00:00' },
  { id: 4, categoryCode: 'L-TWOO', categoryName: 'L-TWOO 其他', icon: 'Grid', appVisible: true, webVisible: true, sort: 4, status: 'enabled', description: '配件及其他产品', updatedAt: '2026-07-28 09:00:00' }
]

const productSeed = [
  product(1, 'eRX 无线电子变速套件', 'ROAD 公路', 'ERX-12S', '12S', '电子变速器', 'ERX-COMPLETE', '无线连接，组件独立升级', {
    installationMethod: '直装式', color: '曜石黑', weight: '612 g', bodyMaterial: '铝合金 / 碳纤维',
    compatibleTeeth: '最大 36T', ratedVoltage: '7.4 V', controlMethod: '无线电子控制', remarks: '支持 APP 参数配置'
  }, [
    { title: '稳定无线链路', description: '低延迟无线变速与电量状态同步。', image: '', sort: 1, status: 'enabled' },
    { title: '组件独立升级', description: '前拨、后拨和控制器可分别获取固件。', image: '', sort: 2, status: 'enabled' }
  ]),
  product(2, 'eGR 砾石电子变速套件', 'GRAVEL 砾石', 'EGR-12S', '12S', '电子变速器', 'EGR-COMPLETE', '宽齿比与复杂路况适配', {
    installationMethod: '直装式', color: '岩灰', weight: '648 g', compatibleTeeth: '最大 46T',
    totalCapacity: '42T', controlMethod: '无线电子控制', compatibility: 'GRAVEL 12 速系统'
  }, [{ title: '宽齿比适配', description: '面向砾石与长距离路线。', image: '', sort: 1, status: 'enabled' }]),
  product(3, 'AX 山地后拨', 'MTB 山地', 'AX-12R', '12S', '后拨', 'AX-RD', '耐冲击山地变速', {
    installationMethod: '标准尾钩', color: '黑色', weight: '312 g', compatibleTeeth: '最大 52T',
    cageMaterial: '增强尼龙', cageLength: '长腿', controlMethod: '机械拉线'
  }, []),
  product(4, 'C1 GPS 智能码表', 'L-TWOO 其他', 'C1-GPS', '-', '码表', 'C1', '多星定位与路线导航', {
    color: '黑色', weight: '68 g', ratedVoltage: '3.7 V', chargingVoltage: '5 V', ratedCapacity: '1100 mAh',
    port: 'USB-C', compatibility: 'BLE / ANT+', remarks: '支持 GPX / FIT 路线'
  }, [{ title: '路线导航', description: '支持官方路线与 APP 路线下发。', image: '', sort: 1, status: 'enabled' }])
]

function product(id, productName, category, productModel, speedLevel, deviceType, deviceModel, coverTag, ruleValues, technicalFeatures) {
  return {
    id, productName, category, productModel, speedLevel, deviceType, deviceModel, coverTag,
    listSummary: coverTag, parameters: `${productModel} / ${speedLevel}`, sellingPoint: coverTag,
    appDetailContent: `${productName} APP 产品详情。`, webDetailContent: `${productName} 官网产品详情。`, mediaAssets: '',
    relatedTutorials: [], imageUrl: 'https://dummyimage.com/640x360/e8eef8/334155&text=BLT+Product',
    detailBanner: 'https://dummyimage.com/1200x420/dbeafe/1e3a8a&text=Product+Banner',
    appVisible: true, webVisible: true, recommendStatus: id <= 2 ? 'recommended' : 'normal', status: 'enabled', sort: id,
    ruleValues: { model: productModel, speedLevel, ...ruleValues }, technicalFeatures,
    updatedAt: '2026-07-28 09:00:00'
  }
}

const ruleFieldSeed = fixedProductRuleFields.map(([fieldName, fieldKey], index) => ({
  id: index + 1,
  categoryId: 'all',
  categoryName: '全部分类',
  fieldName,
  fieldKey,
  dataType: fieldKey === 'remarks' ? 'textarea' : 'text',
  unit: '',
  required: false,
  fieldSource: 'fixed',
  appVisible: true,
  sort: index + 1,
  status: 'enabled',
  updatedAt: '2026-07-28 09:00:00'
}))

const imageSeed = productSeed.flatMap(item => [
  { id: item.id * 10 + 1, productId: item.id, productName: item.productName, productModel: item.productModel, imageType: '产品主图', imageName: `${item.productModel}-main`, imageUrl: item.imageUrl, galleryImages: [], altText: item.productName, appVisible: true, webVisible: true, sort: 1, status: 'enabled', updatedAt: item.updatedAt },
  { id: item.id * 10 + 2, productId: item.id, productName: item.productName, productModel: item.productModel, imageType: '详情横幅', imageName: `${item.productModel}-banner`, imageUrl: item.detailBanner, galleryImages: [], altText: `${item.productName}详情横幅`, appVisible: true, webVisible: true, sort: 2, status: 'enabled', updatedAt: item.updatedAt }
])

export const productCategoryModule = createMockModule(categorySeed, { searchFields: ['categoryCode', 'categoryName', 'description'], defaultSort: 'sort:asc' })
export const productModule = createMockModule(productSeed, { searchFields: ['productName', 'productModel', 'coverTag', 'listSummary'], defaultSort: 'sort:asc' })
export const productImageModule = createMockModule(imageSeed, { searchFields: ['productName', 'productModel', 'imageName'], defaultSort: 'sort:asc' })

const baseRuleModule = createMockModule(ruleFieldSeed, { searchFields: ['fieldName', 'fieldKey', 'categoryName'], defaultSort: 'sort:asc' })
export const productRuleFieldModule = {
  ...baseRuleModule,
  update(payload) {
    const current = baseRuleModule.detail(payload.id)
    if (!current) return null
    if (current.fieldSource === 'fixed') {
      return baseRuleModule.update({ ...payload, fieldKey: current.fieldKey, fieldSource: 'fixed' })
    }
    return baseRuleModule.update(payload)
  },
  remove(id) {
    const current = baseRuleModule.detail(id)
    if (current?.fieldSource === 'fixed') return false
    baseRuleModule.remove(id)
    return true
  }
}

export function getProductDetailPayload(productId) {
  const product = productModule.detail(productId)
  if (!product) return null
  const enabledFields = productRuleFieldModule.snapshot().filter(item => item.status === 'enabled')
  const rules = enabledFields
    .filter(item => product.ruleValues?.[item.fieldKey] !== undefined && product.ruleValues?.[item.fieldKey] !== '')
    .map(item => ({ ...item, value: product.ruleValues[item.fieldKey] }))
  const images = productImageModule.snapshot().filter(item => String(item.productId) === String(productId) && item.status === 'enabled')
  const technicalFeatures = (product.technicalFeatures || []).filter(item => item.status === 'enabled').sort((a, b) => a.sort - b.sort)
  return { ...product, rules, images, technicalFeatures }
}
