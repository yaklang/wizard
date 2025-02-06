import type { MutableRefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useCreation, useDebounceFn, useMemoizedFn } from 'ahooks';

type TargetValue<T> = T | undefined | null;
type TargetType = HTMLElement | Element | Window | Document;
type BasicTarget<T extends TargetType = Element> =
    | string
    | TargetValue<T>
    | MutableRefObject<TargetValue<T>>;

interface TSize {
    height: number;
    width: number;
}

const useListenHeight = (target: BasicTarget): number[] => {
    const [size, setSize] = useState<TSize>({ height: 0, width: 0 });
    const oldSize = useRef<TSize>({ height: 0, width: 0 });

    const onSetWrapperHeight = useDebounceFn(
        useMemoizedFn((height: number, width: number) => {
            if (height === 0) return;
            if (
                oldSize.current.height === height &&
                oldSize.current.width === width
            )
                return;
            oldSize.current.height = height;
            oldSize.current.width = width;
            setSize({
                height,
                width,
            });
        }),
        { wait: 100 },
    ).run;

    const resizeObserver = useCreation(() => {
        return new ResizeObserver((entries: ResizeObserverEntry[]) => {
            for (let entry of entries) {
                const { clientHeight } = entry.target;
                const { clientWidth } = entry.target;
                onSetWrapperHeight(clientHeight, clientWidth);
            }
        });
    }, []);

    useEffect(() => {
        if (!target) return;
        if (typeof target === 'string') {
            const dom = document.getElementById(target);
            if (dom) resizeObserver.observe(dom);
        } else if ('current' in target) {
            if (target.current) resizeObserver.observe(target.current);
        } else {
            resizeObserver.observe(target);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [target]);

    return [size.height, size.width];
};

export default useListenHeight;
