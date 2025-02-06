import type { DependencyList } from 'react';
import { useCallback, useRef } from 'react';

function useDependentCallback<T extends (...args: any[]) => Promise<any>>(
    callback: T,
    deps: DependencyList,
): any {
    const callbackRef = useRef<T>(callback);
    const abortRef = useRef<AbortController | null>(null);

    // 更新最新的回调函数引用
    callbackRef.current = callback;

    return useCallback(
        ((...args: Parameters<T>) => {
            // 每次调用前取消之前的操作
            if (abortRef.current) {
                abortRef.current.abort();
            }
            const abortController = new AbortController();
            abortRef.current = abortController;

            return callbackRef.current(...args).then((result) => {
                // 如果信号未被触发，返回结果
                if (!abortController.signal.aborted) {
                    abortRef.current = null; // 清理引用
                    return result;
                }
                // 请求被取消时，不处理结果
                return Promise.reject(new Error('Request aborted'));
            });
        }) as T,
        [deps],
    );
}

export { useDependentCallback };
