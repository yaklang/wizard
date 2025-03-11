import React, { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import type { Active, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

import './SortableList.css';

import { DragHandle, SortableItem, SortableOverlay } from './components';

interface BaseItem {
    id: UniqueIdentifier;
}

type DefaultRowKey<T> = 'id' extends keyof T ? 'id' : keyof T;

interface Props<T, K extends keyof T = DefaultRowKey<T>> {
    value: T[];
    onChange: (items: T[]) => void;
    renderItem: (item: T) => ReactNode;
    rowKey?: K;
}

const SortableList = <T extends BaseItem, K extends keyof T>({
    value,
    onChange,
    renderItem,
}: Props<T, K>) => {
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

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            onChange(
                arrayMove(
                    value,
                    value.findIndex((item) => item.id === active.id),
                    value.findIndex((item) => item.id === over?.id),
                ),
            );
        }
    };

    return (
        <DndContext
            collisionDetection={closestCorners}
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
            onDragOver={handleDragOver}
            onDragCancel={() => {
                setActive(null);
            }}
        >
            <SortableContext items={value} strategy={rectSortingStrategy}>
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
};

SortableList.Item = SortableItem;
SortableList.DragHandle = DragHandle;

export { SortableList };
