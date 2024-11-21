import { forwardRef, useImperativeHandle, useRef } from 'react';

import { useSafeState } from 'ahooks';

import { WizardModal } from '@/compoments';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { StartUpScriptModal } from '@/pages/TaskScript/compoment/StartUpScriptModal';

import { TGetAnalysisScriptReponse } from '@/apis/task/types';
import { CreateTaskScriptCard } from './CreateTaskScriptCard';

const CreateTaskScriptModal = forwardRef<
    UseModalRefType,
    { pageLoad: (arg: any) => void }
>(({ pageLoad }, ref) => {
    const [model1] = WizardModal.useModal();
    const StartUpScriptModalRef = useRef<UseModalRefType>(null);

    const [scriptData, setScriptData] = useSafeState<
        TGetAnalysisScriptReponse[]
    >([]);

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
                        {scriptData?.map((items) => (
                            <CreateTaskScriptCard
                                items={items}
                                StartUpScriptModalRef={StartUpScriptModalRef}
                                model1={model1}
                                key={items.script_name}
                            />
                        ))}
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
