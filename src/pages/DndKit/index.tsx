import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { SortableList } from '@/compoments';
import { DragHandleIcon } from './assets/DragHandleIcon';
import { mockList } from './compoments/utils';
import {
    CloseOutlined,
    PauseCircleOutlined,
    StopOutlined,
} from '@ant-design/icons';

const { DragHandle } = SortableList;

const DndKit = () => {
    const [items, setItems] = useState(mockList);

    return (
        <div
            className="max-w-100 h-full overflow-auto p-2"
            style={{
                borderBottom: '1px solid #EAECF3',
            }}
        >
            <SortableList
                value={items}
                onChange={setItems}
                renderItem={(item) => (
                    <SortableList.Item
                        id={item.id}
                        className="bg-[#DDF4E9] py-2 px-4"
                    >
                        <DragHandle className="w-full cursor-grab flex items-center pb-2">
                            <div className="w-full flex items-center justify-between">
                                <div>
                                    <DragHandleIcon />
                                    <span className="ml-1">{item?.title}</span>
                                </div>
                                <div className="cursor-pointer flex gap-3 text-3 color-[#85899e]">
                                    <StopOutlined />
                                    <PauseCircleOutlined />
                                    <CloseOutlined />
                                </div>
                            </div>
                        </DragHandle>
                        {item.node
                            ? item.node.map((node) => {
                                  return (
                                      <div className="bg-[#fff]" key={uuidv4()}>
                                          {node.name}
                                      </div>
                                  );
                              })
                            : null}
                    </SortableList.Item>
                )}
            />
        </div>
    );
};

export default DndKit;
