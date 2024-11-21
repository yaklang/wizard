import { FC, useRef } from 'react';

import styles from '../../TaskScript/index.module.scss';
import { TGetAnalysisScriptReponse } from '@/apis/task/types';
import { TaskScriptTags } from '@/pages/TaskScript/compoment/TaskScriptTags';
import { Spin } from 'antd';
import { useRequest } from 'ahooks';
import { getScriptTaskGroup } from '@/apis/task';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';

type TCreateTaskScriptCard = {
    items: TGetAnalysisScriptReponse;
    StartUpScriptModalRef: React.RefObject<UseModalRefType>;
    model1: any;
};

const CreateTaskScriptCard: FC<TCreateTaskScriptCard> = ({
    items,
    StartUpScriptModalRef,
    model1,
}) => {
    const itemsRef = useRef();

    // 获取 启动脚本任务 任务组参数
    const { run: runAsync, loading } = useRequest(
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
        <div className={styles['wizard-card']}>
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
                        await runAsync(items);
                    }}
                >
                    使用模版
                </div>
            </Spin>
        </div>
    );
};

export { CreateTaskScriptCard };
