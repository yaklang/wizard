import { forwardRef, ReactNode, useImperativeHandle } from 'react';
import { Form } from 'antd';

import { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import { WizardDrawer } from '@/compoments';
import { TGetAnalysisScriptReponse } from '@/apis/task/types';

const TaskScriptDrawer = forwardRef<
    UseDrawerRefType,
    {
        TaskScriptRefresh: () => Promise<TGetAnalysisScriptReponse[]>;
        title: string;
    }
>(({ title }, ref): ReactNode => {
    const [drawer] = WizardDrawer.useDrawer();
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
        async open() {
            drawer.open();
        },
    }));

    return (
        <WizardDrawer
            drawer={drawer}
            title={title}
            onClose={() => {
                form.resetFields();
            }}
        >
            <div>asd</div>
        </WizardDrawer>
    );
});

export { TaskScriptDrawer };
