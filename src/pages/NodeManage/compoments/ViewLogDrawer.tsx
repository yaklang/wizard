import { FC, forwardRef, ReactNode, useImperativeHandle, useRef } from 'react';

import { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import { WizardAceEditor, WizardDrawer } from '@/compoments';
import { useEventSource } from '@/hooks';
import { useSafeState } from 'ahooks';
import { message, Tooltip } from 'antd';
import LogIcon from '../Icon/LogIcon';

const LogIconNode: FC = () => {
    const ViewLogDrawerRef = useRef<UseDrawerRefType>(null);
    return (
        <div>
            <Tooltip title="日志">
                <div>
                    <LogIcon
                        style={{
                            width: '32px',
                            borderRight: '1px solid #EAECF3',
                        }}
                        onClick={() => {
                            ViewLogDrawerRef.current?.open();
                        }}
                    />
                </div>
            </Tooltip>
            <ViewLogDrawer ref={ViewLogDrawerRef} />
        </div>
    );
};

const ViewLogDrawer = forwardRef<UseDrawerRefType>((_, ref): ReactNode => {
    const [drawer] = WizardDrawer.useDrawer();
    const [value, setValue] = useSafeState('');

    const { disconnect, connect, loading } = useEventSource<{
        msg: { data: string };
    }>('events?stream_type=node_logs', {
        manual: true,
        onsuccess: (data) => {
            setValue((prev) => prev + data?.msg?.data + '\n');
        },
        onerror: (error) => {
            message.error(`连接失败: ${error.msg}`);
        },
    });

    useImperativeHandle(ref, () => ({
        async open() {
            connect();
            drawer.open();
        },
    }));

    return (
        <WizardDrawer
            footer={null}
            drawer={drawer}
            title={'节点-日志'}
            width={'75%'}
            onClose={() => {
                setValue('');
                disconnect();
            }}
        >
            <WizardAceEditor
                value={value}
                onChange={setValue}
                style={{ height: '100%' }}
                readOnly={true}
                loading={!loading}
            />
        </WizardDrawer>
    );
});

export { ViewLogDrawer, LogIconNode };
