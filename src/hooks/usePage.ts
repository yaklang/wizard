import { useRef } from 'react';

export interface UsePageRef {
    onLoad: (...arg: any[]) => void;
    getParams: () => void;
    clear: (...arg: any[]) => void;
    refresh: () => void;
}

const usePage = () => {
    const page = useRef<UsePageRef>({
        onLoad: () => {},
        getParams: () => {},
        clear: () => {},
        refresh: () => {},
    });
    return [page.current];
};

export default usePage;
