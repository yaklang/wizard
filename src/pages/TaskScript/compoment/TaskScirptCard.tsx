import { FC, useRef } from 'react';

import { type TGetAnalysisScriptReponse } from '@/apis/task/types';

import styles from '../index.module.scss';

import FormOutlined from './svg/FormOutlined';
import CopyOutlined from './svg/CopyOutlined';
import { DeletePopover } from './DeletePopover';
import { TaskScriptTags } from './TaskScriptTags';
import { Spin } from 'antd';
import { useRequest } from 'ahooks';
import { getScriptTaskGroup } from '@/apis/task';
import { WizardModal } from '@/compoments';
import { StartUpScriptModal } from './StartUpScriptModal';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import { TaskScriptDrawer } from './TaskScriptDrawer';

type TTaskScriptCard = {
    items: TGetAnalysisScriptReponse;
    refreshAsync: () => Promise<Partial<TGetAnalysisScriptReponse>[]>;
};

const TaskScriptCard: FC<TTaskScriptCard> = ({ items, refreshAsync }) => {
    const itemsRef = useRef();
    const [model1] = WizardModal.useModal();

    const taskScriptDrawerRef = useRef<UseDrawerRefType>(null);
    const StartUpScriptModalRef = useRef<UseModalRefType>(null);

    // 获取 启动脚本任务 任务组参数
    const { run, loading } = useRequest(
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
    return (
        <>
            <div key={items.script_name} className={styles['wizard-card']}>
                <div className={styles['card-header']}>
                    <div className={`text-clip ${styles['card-header-text']}`}>
                        {items?.script_name}
                    </div>
                    <div className="flex gap-1">
                        <FormOutlined
                            onClick={() =>
                                taskScriptDrawerRef.current?.open(items)
                            }
                            style={{
                                borderRight: '1px solid #EAECF3',
                            }}
                        />
                        <CopyOutlined
                            style={{
                                borderRight: '1px solid #EAECF3',
                            }}
                        />
                        <DeletePopover
                            script_name={items.script_name}
                            refreshAsync={refreshAsync}
                        />
                    </div>
                </div>

                <div className={styles['card-content']}>
                    <TaskScriptTags
                        tags={items?.tags}
                        script_name={items.script_name}
                    />
                    <div className={`text-clip2 ${styles['content-describe']}`}>
                        {items?.description && items.description?.length > 0
                            ? items.description
                            : '-'}
                    </div>
                </div>

                <Spin spinning={loading}>
                    <div
                        className={styles['card-footer']}
                        onClick={async () => {
                            await run(items);
                        }}
                    >
                        使用模版
                    </div>
                </Spin>
            </div>
            <StartUpScriptModal
                ref={StartUpScriptModalRef}
                title="创建任务"
                pageLoad={refreshAsync}
            />
            <TaskScriptDrawer
                ref={taskScriptDrawerRef}
                title="编辑分布式任务脚本"
                TaskScriptRefresh={refreshAsync}
            />
        </>
    );
};

export { TaskScriptCard };
