import { useState, useCallback, useRef } from 'react';
import { invalidateTags } from '@/lib/supabase/eventBus';

/**
 * Custom hook providing RTK Query-compatible mutation semantics
 * with unwrap() support and tag invalidation.
 *
 * @param {Function} mutationFn - Async service mutation function
 * @param {Object} options - { invalidatesTags, onSuccess, onError }
 * @returns {[Function, { isLoading: boolean, isSuccess: boolean, isError: boolean, error: any, data: any, reset: Function }]}
 */
export function useMutation(mutationFn, options = {}) {
    const { invalidatesTags: defaultTags = [], onSuccess, onError } = options;

    const [data, setData] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState(null);

    const mutationFnRef = useRef(mutationFn);
    mutationFnRef.current = mutationFn;

    const reset = useCallback(() => {
        setData(undefined);
        setIsLoading(false);
        setIsSuccess(false);
        setIsError(false);
        setError(null);
    }, []);

    const mutate = useCallback((args, callOptions = {}) => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        setIsSuccess(false);

        let resolvedResult;
        let caughtError;

        const promise = (async () => {
            try {
                const res = await mutationFnRef.current(args);
                resolvedResult = res;
                setData(res);
                setIsSuccess(true);
                setIsLoading(false);

                const tagsToInvalidate = callOptions.invalidatesTags || defaultTags;
                if (tagsToInvalidate && tagsToInvalidate.length > 0) {
                    invalidateTags(tagsToInvalidate);
                }

                if (onSuccess) onSuccess(res, args);
                if (callOptions.onSuccess) callOptions.onSuccess(res);

                return { data: res, error: null };
            } catch (err) {
                caughtError = err;
                setError(err);
                setIsError(true);
                setIsLoading(false);

                if (onError) onError(err, args);
                if (callOptions.onError) callOptions.onError(err);

                return { data: null, error: err };
            }
        })();

        // Provide RTK Query .unwrap() method on the returned promise
        promise.unwrap = async () => {
            const outcome = await promise;
            if (outcome.error) {
                throw outcome.error;
            }
            return outcome.data;
        };

        return promise;
    }, [defaultTags, onSuccess, onError]);

    return [
        mutate,
        {
            isLoading,
            isSuccess,
            isError,
            error,
            data,
            reset,
        },
    ];
}
