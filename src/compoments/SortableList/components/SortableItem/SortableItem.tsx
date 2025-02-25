import { createContext, useContext, useMemo } from 'react';
import type { CSSProperties, FC, PropsWithChildren } from 'react';
import type {
    DraggableSyntheticListeners,
    UniqueIdentifier,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import './SortableItem.css';

interface Props {
    id: UniqueIdentifier;
}

interface Context {
    attributes: Record<string, any>;
    listeners: DraggableSyntheticListeners;
    ref: (node: HTMLElement | null) => void;
}

type SortableItemProps = Omit<React.ComponentPropsWithoutRef<'div'>, 'id'> &
    PropsWithChildren<Props>;

type DragHandleProps = {
    children?: PropsWithChildren['children'];
} & React.ComponentPropsWithoutRef<'div'>;

const SortableItemContext = createContext<Context>({
    attributes: {},
    listeners: undefined,
    ref() {},
});

const SortableItem: FC<SortableItemProps> = ({
    children,
    id,
    className,
    ...props
}) => {
    const {
        attributes,
        isDragging,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
    } = useSortable({ id });
    const context = useMemo(
        () => ({
            attributes,
            listeners,
            ref: setActivatorNodeRef,
        }),
        [attributes, listeners, setActivatorNodeRef],
    );

    const style: CSSProperties = {
        opacity: isDragging ? 0.4 : undefined,
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <SortableItemContext.Provider value={context}>
            <div
                {...props}
                className={`SortableItem ${className}`}
                ref={setNodeRef}
                style={style}
                data-id={id}
            >
                {children}
            </div>
        </SortableItemContext.Provider>
    );
};

const DragHandle: FC<DragHandleProps> = ({ children, className, ...props }) => {
    const { attributes, listeners, ref } = useContext(SortableItemContext);

    return (
        <div
            {...attributes}
            {...listeners}
            ref={ref}
            className={className}
            {...props}
        >
            {children ?? (
                <button
                    className="DragHandle"
                    {...attributes}
                    {...listeners}
                    ref={ref}
                >
                    <svg viewBox="0 0 20 20" width="12">
                        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export { DragHandle, SortableItem };
