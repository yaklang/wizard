import { FC, useRef } from 'react';
import { Button, message } from 'antd';

import { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';

import { ScriptDetailButton } from './ScriptDetailButton';
import { useRequest } from 'ahooks';
import { getTimelinRuntimeId } from '@/apis/taskDetail';

const ViewReportDrawer: FC<{ runtime_id: string }> = ({ runtime_id }) => {
    const scriptDetailDrawerRef = useRef<UseDrawerRefType>(null);

    const { run, loading } = useRequest(getTimelinRuntimeId, {
        manual: true,
        onSuccess: async (value) => {
            const blocks = value?.data?.data?.data ?? [];
            scriptDetailDrawerRef.current?.open(blocks);
        },
        onError: async (err) => {
            message.destroy();
            message.error(err?.message ?? '请求失败');
        },
    });

    const headViewReport = async () => {
        await run(runtime_id);
    };

    return (
        <>
            <Button
                type="link"
                className="p-0"
                loading={loading}
                onClick={() => {
                    headViewReport();
                }}
            >
                查看报告
            </Button>
            <ScriptDetailButton ref={scriptDetailDrawerRef} title="查看报告" />
        </>
    );
};

export { ViewReportDrawer };
