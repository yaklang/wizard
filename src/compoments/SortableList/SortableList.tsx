import React, { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { Active, UniqueIdentifier } from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import './SortableList.css';

import { DragHandle, SortableItem, SortableOverlay } from './components';

interface BaseItem {
    id: UniqueIdentifier;
}

interface Props<T extends BaseItem> {
    value: T[];
    onChange: (items: T[]) => void;
    renderItem: (item: T) => ReactNode;
}

export function SortableList<T extends BaseItem>({
    value,
    onChange,
    renderItem,
}: Props<T>) {
    const [active, setActive] = useState<Active | null>(null);
    const activeItem = useMemo(
        () => value.find((item) => item.id === active?.id),
        [active, value],
    );
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    return (
        <DndContext
            sensors={sensors}
            onDragStart={({ active }) => {
                setActive(active);
            }}
            onDragEnd={({ active, over }) => {
                if (over && active.id !== over?.id) {
                    const activeIndex = value.findIndex(
                        ({ id }) => id === active.id,
                    );
                    const overIndex = value.findIndex(
                        ({ id }) => id === over.id,
                    );

                    onChange(arrayMove(value, activeIndex, overIndex));
                }
                setActive(null);
            }}
            onDragCancel={() => {
                setActive(null);
            }}
        >
            <SortableContext items={value}>
                <ul className="SortableList" role="application">
                    {value.map((item) => (
                        <React.Fragment key={item.id}>
                            {renderItem(item)}
                        </React.Fragment>
                    ))}
                </ul>
            </SortableContext>
            <SortableOverlay>
                {activeItem ? renderItem(activeItem) : null}
            </SortableOverlay>
        </DndContext>
    );
}

SortableList.Item = SortableItem;
SortableList.DragHandle = DragHandle;
