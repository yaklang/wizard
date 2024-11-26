import { FC, useRef } from 'react';

import { useRequest, useSafeState } from 'ahooks';
import { getAnalysisScript } from '@/apis/task';
import { Button, Input, Spin } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import { TaskScriptDrawer } from './compoment/TaskScriptDrawer';
import { TaskScriptCard, TTaskScriptCard } from './compoment/TaskScirptCard';
// import { EmptyBox } from '@/compoments';

const TaskScript: FC = () => {
    const taskScriptDrawerRef = useRef<UseDrawerRefType>(null);

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
        <div className="p-4 h-full">
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
                        onClick={() => taskScriptDrawerRef.current?.open()}
                    >
                        <PlusOutlined />
                        创建脚本
                    </Button>
                </div>
                {/* {Array.isArray(taskScriptList) &&
                !!(taskScriptList.length > 0) &&
                !scriptLoading ? ( */}
                <div className="grid grid-cols-3 gap-4">
                    {taskScriptList?.map((items) => {
                        return (
                            <TaskScriptCard
                                items={items}
                                setTaskScriptList={setTaskScriptList}
                                taskScriptList={taskScriptList}
                                refreshAsync={refreshAsync}
                            />
                        );
                    })}
                </div>
                {/* ) : (
                    <EmptyBox />
                )} */}
            </Spin>
            <TaskScriptDrawer
                ref={taskScriptDrawerRef}
                title="创建分布式任务脚本"
                TaskScriptRefresh={refreshAsync}
            />
        </div>
    );
};

export { TaskScript };
