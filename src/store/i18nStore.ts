// ─── 第三方：状态管理 ─────────────────────────────────────────────────────────
import {create} from 'zustand'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {Language} from '@/types/prism'  // type-only import，编译后完全擦除

// localStorage 无记录时默认中文，面向国内用户的初始体验
function readLanguage(): Language {
    const language = localStorage.getItem('prism-lang') === 'en' ? 'en' : 'zh-CN'
    document.documentElement.lang = language
    return language;
}

interface I18nState {
    language: Language
    setLanguage: (language: Language) => void
}

export const useI18nStore = create<I18nState>((set) => ({
    // 初始值从 localStorage 读取，确保刷新页面后语言一致
    language: readLanguage(),
    setLanguage: (language) => {
        // 同步更新三处：DOM lang 属性（影响浏览器行为）、localStorage（持久化）、store（驱动重渲染）
        document.documentElement.lang = language
        localStorage.setItem('prism-lang', language)
        set({language})
    },
}))