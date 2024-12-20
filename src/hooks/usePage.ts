import { useRef } from 'react';

interface UsePageRef {
    onLoad: (...arg: any[]) => void;
    getParams: () => any;
    clear: (...arg: any[]) => void;
    refresh: () => void;
    editFilter: (...arg: any[]) => void;
    localRefrech: <T extends Record<string, any>>(
        args:
            | { operate: 'edit'; oldObj: T; newObj: T }
            | { operate: 'delete'; oldObj: T },
    ) => void;
    getDataSource: () => any[];
}

const usePage = () => {
    const page = useRef<UsePageRef>({
        onLoad: () => {},
        getParams: () => {},
        clear: () => {},
        refresh: () => {},
        localRefrech: () => {},
        editFilter: () => {},
        getDataSource: () => [],
    });
    return [page.current];
};

export type { UsePageRef };
export default usePage;
