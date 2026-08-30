// ─── 第三方：状态管理 ─────────────────────────────────────────────────────────
import {create} from 'zustand'

// ─── API ──────────────────────────────────────────────────────────────────────
import {likeImage, unlikeImage} from '@/api/libraryApi'  // fire-and-forget：同步服务端的点赞数据

interface FavoritesState {
    favorites: Set<number>          // 已收藏图片的 id 集合；Set 提供 O(1) 查询
    initFavorites: (ids: number[]) => void  // 登录/刷新后从服务端初始化
    isFavorite: (id: number) => boolean
    // 只收 id，不接收整个对象——prop 不应被 store 修改
    toggleFavorite: (id: number) => Promise<void>
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    // 初始空 Set；登录态恢复后由 AppShell 调用 initFavorites 填充
    favorites: new Set(),
    initFavorites: (ids) => set({favorites: new Set(ids)}),
    // 直接用 get() 读取当前 Set，供组件在 selector 之外调用
    isFavorite: (id) => get().favorites.has(id),
    toggleFavorite: async (id) => {
        const state = get()
        const next = new Set(state.favorites)
        if (next.has(id)) {
            next.delete(id)
            await unlikeImage(id)
        } else {
            next.add(id)
            await likeImage(id)
        }
        set({favorites: next})
    },
}))