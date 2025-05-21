import { type FC, useRef } from 'react';

import type { TGetAnalysisScriptReponse } from '@/apis/task/types';

import styles from '../TaskScript/index.module.scss';

import { Spin } from 'antd';
import { useRequest } from 'ahooks';
import { getScriptTaskGroup } from '@/apis/task';
import { WizardModal } from '@/compoments';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { StartUpScriptModal } from '../TaskScript/compoment/StartUpScriptModal';
import { TaskScriptTags } from './TaskScriptTags';

export interface TTaskScriptCard {
    items: { isCopy?: boolean } & TGetAnalysisScriptReponse;
    refreshAsync: () => Promise<Partial<TGetAnalysisScriptReponse>[]>;
}

const TaskScriptCard: FC<TTaskScriptCard> = ({ items, refreshAsync }) => {
    const itemsRef = useRef();
    const [model1] = WizardModal.useModal();

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
            onSuccess: (values) => {
                StartUpScriptModalRef.current?.open(itemsRef.current, values);
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
                        下发任务
                    </div>
                </Spin>
            </div>
            <StartUpScriptModal
                ref={StartUpScriptModalRef}
                title="下发任务"
                pageLoad={refreshAsync}
            />
        </>
    );
};

export { TaskScriptCard };
