export type APIFunc<T = any, R = any> = (
    params: T,
    hiddenError?: boolean,
) => Promise<R>;
