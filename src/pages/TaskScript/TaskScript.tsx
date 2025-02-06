import type { FC } from 'react';

import { useRequest, useSafeState } from 'ahooks';
import { getAnalysisScript } from '@/apis/task';
import { Button, Input, Spin } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { TTaskScriptCard } from './compoment/TaskScirptCard';
import { TaskScriptCard } from './compoment/TaskScirptCard';
import { useNavigate } from 'react-router-dom';

const TaskScript: FC = () => {
    const navigate = useNavigate();

    const [searchName, setSearchName] = useSafeState('');
    const [taskScriptList, setTaskScriptList] = useSafeState<
        TTaskScriptCard['items'][]
    >([]);

    // 获取脚本列表
    const {
        loading: scriptLoading,
        runAsync,
        refreshAsync,
    } = useRequest(async (script_name: string) => {
        const result = await getAnalysisScript({ script_name });
        const {
            data: { list },
        } = result;
        const resultList = list?.map((it) => ({ isCopy: false, ...it })) ?? [];
        setTaskScriptList(resultList);
        return resultList;
    });

    const heanSearch = () => {
        runAsync(searchName);
    };

    return (
        <div className="p-4">
            <Spin spinning={scriptLoading}>
                <div className="flex justify-end gap-2 mb-4">
                    <Input
                        placeholder="请输入关键词搜索"
                        prefix={<SearchOutlined />}
                        className="w-54"
                        onChange={(e) => setSearchName(e.target.value)}
                        onPressEnter={heanSearch}
                    />
                    <Button
                        type="primary"
                        onClick={() =>
                            navigate('modify-task-script', {
                                state: {
                                    type: 'add',
                                },
                            })
                        }
                    >
                        <PlusOutlined />
                        创建脚本
                    </Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {taskScriptList?.map((items) => {
                        return (
                            <TaskScriptCard
                                key={items.script_name}
                                items={items}
                                setTaskScriptList={setTaskScriptList}
                                taskScriptList={taskScriptList}
                                refreshAsync={refreshAsync}
                            />
                        );
                    })}
                </div>
            </Spin>
        </div>
    );
};

export { TaskScript };
