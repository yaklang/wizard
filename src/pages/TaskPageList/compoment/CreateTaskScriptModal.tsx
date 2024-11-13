import { forwardRef, useImperativeHandle, useRef } from 'react';

import { useRequest, useSafeState } from 'ahooks';

import { WizardModal } from '@/compoments';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import styles from '../../TaskScript/index.module.scss';
import { TaskScriptTags } from '@/pages/TaskScript/compoment/TaskScriptTags';
import { StartUpScriptModal } from '@/pages/TaskScript/compoment/StartUpScriptModal';

import { TGetAnalysisScriptReponse } from '@/apis/task/types';
import { getScriptTaskGroup } from '@/apis/task';

const CreateTaskScriptModal = forwardRef<
    UseModalRefType,
    { pageLoad: () => void }
>(({ pageLoad }, ref) => {
    const [model1] = WizardModal.useModal();
    const StartUpScriptModalRef = useRef<UseModalRefType>(null);

    const itemsRef = useRef();

    const [scriptData, setScriptData] = useSafeState<
        TGetAnalysisScriptReponse[]
    >([]);

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

    useImperativeHandle(ref, () => ({
        open(scriptData: TGetAnalysisScriptReponse[]) {
            setScriptData(scriptData);
            model1.open();
        },
    }));

    return (
        <>
            <WizardModal
                footer={null}
                width={'55%'}
                modal={model1}
                title="选择脚本"
            >
                <div className="pb-2 px-6 overflow-auto max-h-[75vh]">
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
                </div>
            </WizardModal>
            {/* 添加任务 */}
            <StartUpScriptModal
                ref={StartUpScriptModalRef}
                title={'创建任务'}
                pageLoad={pageLoad}
            />
        </>
    );
});

export { CreateTaskScriptModal };
