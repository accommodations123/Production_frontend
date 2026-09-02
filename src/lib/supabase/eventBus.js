/**
 * Lightweight Cache Invalidation Event Bus
 * Provides RTK Query-like tag invalidation without any external library or Redux dependencies.
 */
class CacheEventBus {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Subscribe to one or more cache tags
     * @param {string|string[]} tags 
     * @param {Function} callback 
     * @returns {Function} Unsubscribe function
     */
    subscribe(tags, callback) {
        const tagList = Array.isArray(tags) ? tags : [tags];
        
        tagList.forEach(tag => {
            if (!this.listeners.has(tag)) {
                this.listeners.set(tag, new Set());
            }
            this.listeners.get(tag).add(callback);
        });

        return () => {
            tagList.forEach(tag => {
                const set = this.listeners.get(tag);
                if (set) {
                    set.delete(callback);
                    if (set.size === 0) {
                        this.listeners.delete(tag);
                    }
                }
            });
        };
    }

    /**
     * Invalidate one or more cache tags, triggering subscribers to refetch
     * @param {string|string[]} tags 
     */
    invalidateTags(tags) {
        if (!tags) return;
        const tagList = Array.isArray(tags) ? tags : [tags];

        const notifiedCallbacks = new Set();

        tagList.forEach(tag => {
            const set = this.listeners.get(tag);
            if (set) {
                set.forEach(cb => notifiedCallbacks.add(cb));
            }
            // Also notify wildcard subscribers if any
            const wildcardSet = this.listeners.get('*');
            if (wildcardSet) {
                wildcardSet.forEach(cb => notifiedCallbacks.add(cb));
            }
        });

        notifiedCallbacks.forEach(cb => {
            try {
                cb();
            } catch (err) {
                console.error('Error in cache tag listener callback:', err);
            }
        });
    }

    /**
     * Reset all subscribers
     */
    resetAll() {
        const allCallbacks = new Set();
        this.listeners.forEach(set => {
            set.forEach(cb => allCallbacks.add(cb));
        });
        allCallbacks.forEach(cb => {
            try {
                cb();
            } catch (err) {
                console.error('Error in resetAll listener callback:', err);
            }
        });
    }
}

export const cacheEventBus = new CacheEventBus();
export const invalidateTags = (tags) => cacheEventBus.invalidateTags(tags);
export const subscribeTags = (tags, cb) => cacheEventBus.subscribe(tags, cb);
export default cacheEventBus;
