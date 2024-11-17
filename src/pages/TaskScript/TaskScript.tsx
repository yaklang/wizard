import { FC, useRef } from 'react';

import { useRequest } from 'ahooks';
import { getAnalysisScript } from '@/apis/task';
import { Button, Input, Spin } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import { TaskScriptDrawer } from './compoment/TaskScriptDrawer';
import { TaskScriptCard } from './compoment/TaskScirptCard';

const TaskScript: FC = () => {
    const taskScriptDrawerRef = useRef<UseDrawerRefType>(null);

    // 获取脚本列表
    const {
        loading: scriptLoading,
        data: scriptData,
        refreshAsync,
    } = useRequest(async () => {
        const result = await getAnalysisScript();
        const {
            data: { list },
        } = result;
        return list;
    });

    return (
        <div className="p-4 h-full">
            <Spin spinning={scriptLoading}>
                <div className="flex justify-end gap-2 mb-4">
                    <Input
                        placeholder="请输入关键词搜索"
                        prefix={<SearchOutlined />}
                        className="w-54"
                    />
                    <Button
                        type="primary"
                        onClick={() => taskScriptDrawerRef.current?.open()}
                    >
                        <PlusOutlined />
                        创建脚本
                    </Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {scriptData?.map((items) => {
                        return (
                            <TaskScriptCard
                                items={items}
                                refreshAsync={refreshAsync}
                            />
                        );
                    })}
                </div>
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
