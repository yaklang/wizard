import { useEffect, useRef } from 'react';
import cloneDeep from 'lodash/cloneDeep';

const usePreviousDeep = <T,>(value: T): T | undefined => {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = cloneDeep(value); // 存一份深拷贝
    }, [value]);

    return ref.current;
};

export default usePreviousDeep;
