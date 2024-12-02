import { DependencyList, useCallback, useRef } from 'react';

function useDependentCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: DependencyList,
): T {
    const callbackRef = useRef<T>(callback);
    callbackRef.current = callback;

    return useCallback(
        ((...args: Parameters<T>) => {
            return callbackRef.current(...args);
        }) as T,
        deps,
    );
}

export { useDependentCallback };
