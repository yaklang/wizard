import { useRef } from 'react';

export interface UseDrawerRefType {
    open: (...args: any[]) => void;
    close?: () => void;
}

const useDrawer = () => {
    const drawer = useRef<UseDrawerRefType>({
        open: () => {},
        close: () => {},
    });

    return [drawer.current];
};

export default useDrawer;
