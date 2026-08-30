// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {SettingItem} from '@/components/account/SettingItem/SettingItem'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useI18nStore} from '@/store/i18nStore'
import {useThemeStore} from '@/store/themeStore'

export function AppearanceSection() {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()
    const {language, setLanguage} = useI18nStore()
    const {theme, setTheme} = useThemeStore()

    return (
        <div className="acct-sec active">
            <div className="acct-card">
                <div className="acct-card-head">
                    <h3>{t('外观与语言', 'Appearance & language')}</h3>
                    <p>{t('调整界面主题与显示语言', 'Adjust the interface theme and display language')}</p>
                </div>

                {/* ─── 主题切换行 ──────────────────────────────────────────── */}
                <SettingItem title={t('主题外观', 'Theme')} desc={t('选择浅色或深色界面', 'Choose a light or dark interface')}>
                    {/* segmented：双选切换器，'on' class 由 CSS 高亮当前选中项 */}
                    <div className="segmented">
                        <button className={theme === 'light' ? 'on' : ''}
                                onClick={() => setTheme('light')} type="button">
                            {t('浅色', 'Light')}
                        </button>
                        <button className={theme === 'dark' ? 'on' : ''}
                                onClick={() => setTheme('dark')} type="button">
                            {t('深色', 'Dark')}
                        </button>
                    </div>
                </SettingItem>

                {/* ─── 语言切换行 ──────────────────────────────────────────── */}
                <SettingItem title={t('界面语言', 'Language')} desc={t('切换界面显示语言', 'Switch the interface language')}>
                    {/* 语言标签直接写死中英文字面量，不经 t()，避免鸡生蛋问题 */}
                    <div className="segmented">
                        <button className={language === 'zh-CN' ? 'on' : ''}
                                onClick={() => setLanguage('zh-CN')} type="button">中文
                        </button>
                        <button className={language === 'en' ? 'on' : ''}
                                onClick={() => setLanguage('en')} type="button">English
                        </button>
                    </div>
                </SettingItem>
            </div>
        </div>
    )
}