import { useState } from 'react';

import { SortableList } from '@/compoments';

const { DragHandle } = SortableList;

function createRange<T>(
    length: number,
    initializer: (index: number) => T,
): T[] {
    return [...new Array(length)].map((_, index) => initializer(index));
}

function getMockItems() {
    return createRange(50, (index) => ({ id: index + 1 }));
}

const DndKit = () => {
    const [items, setItems] = useState(getMockItems);

    return (
        <div
            style={{
                maxWidth: 400,
                height: '50%',
                overflow: 'auto',
                padding: 18,
                paddingRight: 2,
                borderBottom: '1px solid #EAECF3',
            }}
        >
            <SortableList
                value={items}
                onChange={setItems}
                renderItem={(item) => (
                    <SortableList.Item id={item.id}>
                        <DragHandle className="w-full cursor-grab flex items-center border-b-solid border-[#EAECF3] border-b-[1px] pb-2 mb-2">
                            <svg viewBox="0 0 20 20" width="12">
                                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                            </svg>
                            SM4对称加密
                        </DragHandle>
                        {item.id}
                        <div>asd</div>
                    </SortableList.Item>
                )}
            />
        </div>
    );
};

export default DndKit;
