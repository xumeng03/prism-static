// 导航项的数据结构，NavItem 只在本文件内使用，无需导出
type NavItem = {
    // React Router <NavLink> 的 to 属性，即目标路由路径
    to: string
    // 中文导航文字
    zh: string
    // 英文导航文字
    en: string
    // 传给 <NavLink end> 属性：true 时只有路径精确匹配才高亮
    // 根路由 "/" 必须设为 true，否则所有子路由（/library、/album 等）都会同时高亮根路由
    end?: boolean
}

// 顶部导航栏的菜单项列表，顺序即 UI 从左到右的排列顺序
export const NAVS: NavItem[] = [
    {to: '/',        zh: '探索', en: 'Explore', end: true},
    {to: '/library', zh: '图库', en: 'Library'},
    {to: '/album',   zh: '相册', en: 'Albums'},
    {to: '/api',     zh: 'API',  en: 'API'},
]
