import { useMemo, type FC } from 'react';

import { useRequest, useSafeState } from 'ahooks';
import { getAnalysisScript } from '@/apis/task';
import { Spin } from 'antd';
import { generateUniqueId } from '@/utils';
import { TaskScriptCard } from './TaskScirptCard';
import type { TaskScriptListItem } from '../TaskScript/types';

const CreateTask: FC = () => {
    const [taskScriptList, setTaskScriptList] = useSafeState<
        TaskScriptListItem[]
    >([]);

    // 获取脚本列表
    const { loading: scriptLoading, refreshAsync } = useRequest(
        async (script_name: string) => {
            const result = await getAnalysisScript({ script_name });
            const {
                data: { list },
            } = result;
            const resultList =
                list?.map((it) => ({ isCopy: false, ...it })) ?? [];
            setTaskScriptList(resultList);
            return resultList;
        },
    );

    const taskScriptRender = useMemo(() => {
        return (
            <div className="grid grid-cols-3 gap-4">
                {taskScriptList?.map((items) => {
                    return (
                        <TaskScriptCard
                            key={generateUniqueId()}
                            items={items}
                            refreshAsync={refreshAsync}
                        />
                    );
                })}
            </div>
        );
    }, [taskScriptList]);

    return (
        <div className="p-4">
            <Spin spinning={scriptLoading}>{taskScriptRender}</Spin>
        </div>
    );
};

export { CreateTask };
