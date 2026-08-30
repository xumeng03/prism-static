// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useCallback} from 'react'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useI18nStore} from '@/store/i18nStore'

// 提供一个翻译函数：调用方传入中英文两个字符串，hook 根据当前语言选择返回哪一个
// 这种"双参数选一"的设计避免了维护翻译 key 映射表，适合小型项目快速迭代
export function useTranslation() {
    // 细粒度订阅：只取 language 字段，store 内其他状态变化不会触发此组件重渲染
    const language = useI18nStore((s) => s.language)

    // useCallback + [language]：
    // 语言未切换时返回的 translation 函数引用保持不变，
    // 调用方无需把 translation 排除在 useEffect / useMemo 依赖之外
    return useCallback(
        (zh: string, en: string) => language === 'zh-CN' ? zh : en,
        [language]
    )
}
