// 导入所有自定义图标
const iconModules = import.meta.glob('@/assets/icons/*.svg', { eager: true })

// 图标映射表
export const customIcons = new Map<string, string>()

// 处理图标数据
Object.entries(iconModules).forEach(([path, module]) => {
  const fileName = path.split('/').pop()?.replace('.svg', '') || ''
  if (module && typeof module === 'object' && 'default' in module) {
    customIcons.set(fileName, module.default as string)
  }
})

// 获取图标URL
export function getIconUrl(iconName: string): string {
  return customIcons.get(iconName) || ''
}

// 获取所有可用图标名称
export function getAvailableIcons(): string[] {
  return Array.from(customIcons.keys())
} 