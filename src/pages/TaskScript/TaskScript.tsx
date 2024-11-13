import { FC, useRef } from 'react';

import styles from './index.module.scss';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { StartUpScriptModal } from './compoment/StartUpScriptModal';
import { TaskScriptTags } from './compoment/TaskScriptTags';
import { useRequest } from 'ahooks';
import { getAnalysisScript, getScriptTaskGroup } from '@/apis/task';
import { WizardModal } from '@/compoments';
import { Spin } from 'antd';

const TaskScript: FC = () => {
    const [model1] = WizardModal.useModal();
    const StartUpScriptModalRef = useRef<UseModalRefType>(null);

    const itemsRef = useRef();

    // 获取 启动脚本任务 任务组参数
    const { run: runAsync } = useRequest(
        async (items) => {
            const result = await getScriptTaskGroup();
            const {
                data: { list },
            } = result;

            itemsRef.current = items;
            const resultList = list?.map((it) => ({
                value: it.name,
                label: it.name,
            }));
            return resultList;
        },
        {
            manual: true,
            onSuccess: async (values) => {
                await StartUpScriptModalRef.current?.open(
                    itemsRef.current,
                    values,
                );
                model1?.close && model1.close();
            },
        },
    );

    // 获取脚本列表
    const { loading: scriptLoading, data: scriptData } = useRequest(
        async () => {
            const result = await getAnalysisScript();
            const {
                data: { list },
            } = result;
            return list;
        },
    );

    return (
        <div className="p-4 h-full">
            <Spin spinning={scriptLoading}>
                <div className="grid grid-cols-3 gap-4">
                    {scriptData?.map((items) => {
                        return (
                            <div
                                key={items.script_name}
                                className={styles['wizard-card']}
                            >
                                <div className={styles['card-header']}>
                                    <div
                                        className={`text-clip ${styles['card-header-text']}`}
                                    >
                                        {items?.script_name}
                                    </div>
                                </div>

                                <div className={styles['card-content']}>
                                    <TaskScriptTags
                                        tags={items?.tags}
                                        script_name={items.script_name}
                                    />
                                    <div
                                        className={`text-clip2 ${styles['content-describe']}`}
                                    >
                                        {items?.description &&
                                        items.description?.length > 0
                                            ? items.description
                                            : '-'}
                                    </div>
                                </div>

                                <div
                                    className={styles['card-footer']}
                                    onClick={async () => {
                                        await runAsync(items);
                                    }}
                                >
                                    使用模版
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Spin>
            <StartUpScriptModal ref={StartUpScriptModalRef} title="创建任务" />
        </div>
    );
};

export { TaskScript };
