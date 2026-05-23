import { useState, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

const LOCAL_STORAGE_KEY = 'venus_favorites';
const LOCAL_STORAGE_META_KEY = 'venus_favorites_meta';
const FAVORITES_EVENT = 'favorites_updated';

export interface FavoriteMeta {
    id: number;
    name: string;
    price: number;
    image?: string;
}

/**
 * Reusable hook for managing product favorites.
 * - Guest users: persisted in localStorage
 * - Logged-in users: persisted in database via API
 * - Auto-merges localStorage favorites to DB upon login
 * - Cross-component sync via custom event (same pattern as cart_updated)
 */
export function useFavorites() {
    const { auth } = usePage<any>().props;
    const user = auth?.user;
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
    const [favoriteMeta, setFavoriteMeta] = useState<Record<number, FavoriteMeta>>({});
    const [isLoading, setIsLoading] = useState(true);

    // ── Sync helper — reads current state from localStorage/API ────────────────
    const syncFromSource = useCallback(() => {
        if (user) {
            axios.get('/api/favorites')
                .then(res => {
                    setFavoriteIds(res.data.favorites);
                    // Also load cached meta from localStorage
                    setFavoriteMeta(getLocalFavoriteMeta());
                })
                .catch(() => {})
                .finally(() => setIsLoading(false));
        } else {
            setFavoriteIds(getLocalFavorites());
            setFavoriteMeta(getLocalFavoriteMeta());
            setIsLoading(false);
        }
    }, [user?.id]);

    // ── Load favorites on mount / auth change ──────────────────────────────────
    useEffect(() => {
        if (user) {
            const localFavs = getLocalFavorites();
            if (localFavs.length > 0) {
                axios.post('/api/favorites/merge', { product_ids: localFavs })
                    .then(res => {
                        setFavoriteIds(res.data.favorites);
                        const localMeta = getLocalFavoriteMeta();
                        setFavoriteMeta(prev => ({ ...prev, ...localMeta }));
                        clearLocalFavoriteIds();
                    })
                    .catch(() => {
                        syncFromSource();
                    })
                    .finally(() => setIsLoading(false));
            } else {
                syncFromSource();
            }
        } else {
            setFavoriteIds(getLocalFavorites());
            setFavoriteMeta(getLocalFavoriteMeta());
            setIsLoading(false);
        }
    }, [user?.id]);

    // ── Listen for cross-component sync events ─────────────────────────────────
    useEffect(() => {
        const handleFavoritesUpdated = () => {
            // Re-read from localStorage (always has cached data)
            setFavoriteIds(getLocalFavorites());
            setFavoriteMeta(getLocalFavoriteMeta());
        };

        window.addEventListener(FAVORITES_EVENT, handleFavoritesUpdated);
        return () => window.removeEventListener(FAVORITES_EVENT, handleFavoritesUpdated);
    }, []);

    // ── Broadcast change to other component instances ──────────────────────────
    const broadcastUpdate = useCallback(() => {
        window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
    }, []);

    // ── Toggle favorite ────────────────────────────────────────────────────────
    const toggleFavorite = useCallback((productId: number, meta?: Omit<FavoriteMeta, 'id'>): { action: 'added' | 'removed' } => {
        const currentlyFavorited = favoriteIds.includes(productId);
        const action: 'added' | 'removed' = currentlyFavorited ? 'removed' : 'added';

        if (currentlyFavorited) {
            // Optimistic remove
            const newIds = favoriteIds.filter(id => id !== productId);
            setFavoriteIds(newIds);

            // Remove meta from state
            setFavoriteMeta(prev => {
                const next = { ...prev };
                delete next[productId];
                return next;
            });

            // Always update localStorage (acts as cross-component cache)
            saveLocalFavorites(newIds);
            removeLocalFavoriteMeta(productId);

            if (user) {
                axios.post('/api/favorites/toggle', { product_id: productId }).catch(() => {
                    setFavoriteIds(prev => [...prev, productId]);
                });
            }

            // Broadcast to other components (e.g. Navbar)
            broadcastUpdate();
        } else {
            // Optimistic add
            const newIds = [...favoriteIds, productId];
            setFavoriteIds(newIds);

            // Save meta
            const fullMeta: FavoriteMeta = { id: productId, name: meta?.name || `Produk #${productId}`, price: meta?.price || 0, image: meta?.image };
            setFavoriteMeta(prev => ({ ...prev, [productId]: fullMeta }));

            // Always update localStorage (acts as cross-component cache)
            saveLocalFavorites(newIds);
            saveLocalFavoriteMeta(productId, fullMeta);

            if (user) {
                axios.post('/api/favorites/toggle', { product_id: productId }).catch(() => {
                    setFavoriteIds(prev => prev.filter(id => id !== productId));
                });
            }

            // Broadcast to other components (e.g. Navbar)
            broadcastUpdate();
        }

        return { action };
    }, [favoriteIds, user, broadcastUpdate]);

    // ── Check if a product is favorited ────────────────────────────────────────
    const isFavorited = useCallback((productId: number): boolean => {
        return favoriteIds.includes(productId);
    }, [favoriteIds]);

    // ── Get meta for a product ─────────────────────────────────────────────────
    const getMeta = useCallback((productId: number): FavoriteMeta | undefined => {
        return favoriteMeta[productId];
    }, [favoriteMeta]);

    return { favoriteIds, favoriteMeta, isFavorited, toggleFavorite, getMeta, isLoading };
}

// ── localStorage helpers ───────────────────────────────────────────────────────

function getLocalFavorites(): number[] {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveLocalFavorites(ids: number[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
}

function clearLocalFavoriteIds(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}

function getLocalFavoriteMeta(): Record<number, FavoriteMeta> {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_META_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveLocalFavoriteMeta(productId: number, meta: FavoriteMeta): void {
    const existing = getLocalFavoriteMeta();
    existing[productId] = meta;
    localStorage.setItem(LOCAL_STORAGE_META_KEY, JSON.stringify(existing));
}

function removeLocalFavoriteMeta(productId: number): void {
    const existing = getLocalFavoriteMeta();
    delete existing[productId];
    localStorage.setItem(LOCAL_STORAGE_META_KEY, JSON.stringify(existing));
}
