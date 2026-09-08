import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeTags } from '@/lib/supabase/eventBus';

// In-memory query cache for instant (0ms) data resolution across component mounts
const queryCache = new Map();

/**
 * Custom hook providing RTK Query-compatible data fetching semantics
 * using direct async service functions.
 *
 * @param {Function} queryFn - Async service function
 * @param {any} args - Query arguments
 * @param {Object} options - { skip, tags, select }
 * @returns {{ data: any, isLoading: boolean, isFetching: boolean, isSuccess: boolean, isError: boolean, error: any, refetch: Function }}
 */
export function useQuery(queryFn, args, options = {}) {
    const { skip = false, tags = [] } = options;

    // Stable string representation of arguments to prevent infinite fetch loops
    const argsKey = typeof args === 'object' && args !== null ? JSON.stringify(args) : String(args);
    const cacheKey = (queryFn.name || 'anon') + ':' + argsKey;

    const cachedEntry = !skip ? queryCache.get(cacheKey) : undefined;
    const initialData = cachedEntry ? cachedEntry.data : undefined;

    const [data, setData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(!skip && initialData === undefined);
    const [isFetching, setIsFetching] = useState(!skip);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(initialData !== undefined);

    const isMountedRef = useRef(true);
    const queryFnRef = useRef(queryFn);
    queryFnRef.current = queryFn;

    const execute = useCallback(async () => {
        if (skip) {
            setIsLoading(false);
            setIsFetching(false);
            return;
        }

        setIsFetching(true);
        if (data === undefined && !queryCache.has(cacheKey)) {
            setIsLoading(true);
        }

        try {
            const result = await queryFnRef.current(args);
            if (isMountedRef.current) {
                setData(result);
                setIsSuccess(true);
                setIsError(false);
                setError(null);
                queryCache.set(cacheKey, { data: result, tags, timestamp: Date.now() });
            }
        } catch (err) {
            if (isMountedRef.current) {
                setIsError(true);
                setError(err);
                setIsSuccess(false);
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
                setIsFetching(false);
            }
        }
    }, [skip, argsKey, cacheKey, data]);

    useEffect(() => {
        isMountedRef.current = true;
        execute();

        return () => {
            isMountedRef.current = false;
        };
    }, [execute]);

    // Invalidation subscriptions
    useEffect(() => {
        if (!tags || tags.length === 0 || skip) return;

        const unsubscribe = subscribeTags(tags, () => {
            queryCache.delete(cacheKey);
            if (isMountedRef.current && !skip) {
                execute();
            }
        });

        return unsubscribe;
    }, [tags, skip, execute, cacheKey]);

    return {
        data,
        isLoading,
        isFetching,
        isSuccess,
        isError,
        error,
        refetch: execute,
    };
}

/**
 * Lazy query hook for manual triggering (e.g. useLazySearchTripsQuery)
 */
export function useLazyQuery(queryFn, options = {}) {
    const [data, setData] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const queryFnRef = useRef(queryFn);
    queryFnRef.current = queryFn;

    const trigger = useCallback(async (args) => {
        setIsLoading(true);
        setIsFetching(true);
        try {
            const result = await queryFnRef.current(args);
            setData(result);
            setIsSuccess(true);
            setIsError(false);
            setError(null);
            return { data: result, error: null };
        } catch (err) {
            setIsError(true);
            setError(err);
            setIsSuccess(false);
            return { data: null, error: err };
        } finally {
            setIsLoading(false);
            setIsFetching(false);
        }
    }, []);

    return [
        trigger,
        {
            data,
            isLoading,
            isFetching,
            isSuccess,
            isError,
            error,
        },
    ];
}
