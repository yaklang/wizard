import { useRef } from 'react';

interface UsePageRef {
    onLoad: (...arg: any[]) => void;
    getParams: () => void;
    clear: (...arg: any[]) => void;
    refresh: () => void;
    localRefrech: <T extends Record<string, any>>(
        args:
            | { operate: 'edit'; oldObj: T; newObj: T }
            | { operate: 'delete'; oldObj: T },
    ) => void;
}

const usePage = () => {
    const page = useRef<UsePageRef>({
        onLoad: () => {},
        getParams: () => {},
        clear: () => {},
        refresh: () => {},
        localRefrech: () => {},
    });
    return [page.current];
};

export type { UsePageRef };
export default usePage;
