import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

interface Serializer<T> {
    serialize: (value: T) => string;
    deserialize: (raw: string) => T;
}

const stringSerializer: Serializer<string> = {
    serialize: (v) => v,
    deserialize: (v) => v,
};

const numberSerializer: Serializer<number> = {
    serialize: (v) => String(v),
    deserialize: (v) => Number(v),
};

export const serializers = {
    string: stringSerializer,
    number: numberSerializer,
} as const;

interface UseUrlStateOptions<T> {
    serializer?: Serializer<T>;
}

/**
 * Syncs a single URL search param with component state.
 * Uses `replace` navigation to avoid polluting browser history.
 *
 * Works with HashRouter — reads/writes the query string after the hash fragment.
 */
export function useUrlState(
    key: string,
    defaultValue: string,
    options?: UseUrlStateOptions<string>,
): [string, (value: string | undefined) => void] {
    const [searchParams, setSearchParams] = useSearchParams();
    const ser = (options?.serializer ?? stringSerializer) as Serializer<string>;

    const value = useMemo(() => {
        const raw = searchParams.get(key);
        if (raw === null || raw === '') return defaultValue;
        return ser.deserialize(raw);
    }, [searchParams, key, defaultValue, ser]);

    const setValue = useCallback(
        (next: string | undefined) => {
            setSearchParams(
                (prev) => {
                    const updated = new URLSearchParams(prev);
                    if (
                        next === undefined ||
                        next === defaultValue ||
                        next === ''
                    ) {
                        updated.delete(key);
                    } else {
                        updated.set(key, ser.serialize(next));
                    }
                    return updated;
                },
                { replace: true },
            );
        },
        [setSearchParams, key, defaultValue, ser],
    );

    return [value, setValue];
}
