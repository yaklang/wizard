import type { FC } from 'react';
import { useRef } from 'react';
import OmitIcon from '../Icon/OmitIcon';
import {
    FormOutlined,
    // LineChartOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import { Button, Popover } from 'antd';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { EditNodeModal } from './EditNodeModal';
import type { Palm } from '@/gen/schema';
import type { UsePageRef } from '@/hooks/usePage';
import { useSafeState } from 'ahooks';
import { InsterNodeDataModal } from './InsterNodeDataModal';

const MoreNode: FC<{ record: Palm.Node; page: UsePageRef }> = ({
    record,
    page,
}) => {
    const EditNodeModalRef = useRef<UseModalRefType>(null);
    const InsterNodeDataModalRef = useRef<UseModalRefType>(null);
    const [open, setOpen] = useSafeState(false);
    return (
        <div>
            <Popover
                trigger="click"
                placement="right"
                open={open}
                onOpenChange={(newOpen) => setOpen(newOpen)}
                content={
                    <div className="flex flex-col">
                        <Button
                            color="primary"
                            variant="text"
                            icon={<FormOutlined />}
                            className="flex justify-start"
                            onClick={() => {
                                setOpen((open) => !open);
                                EditNodeModalRef.current?.open(record);
                            }}
                        >
                            编辑节点
                        </Button>
                        {/* <Button
                            color="primary"
                            variant="text"
                            className="flex justify-start"
                            icon={<LineChartOutlined />}
                        >
                            单节点任务
                        </Button> */}
                        <Button
                            color="primary"
                            variant="text"
                            icon={<SyncOutlined />}
                            onClick={() => {
                                setOpen((open) => !open);
                                InsterNodeDataModalRef.current?.open(record);
                            }}
                        >
                            更新节点数据
                        </Button>
                    </div>
                }
            >
                <div className="flex items-center justify-center cursor-pointer">
                    <OmitIcon
                        style={{
                            width: '24px',
                        }}
                    />
                </div>
            </Popover>
            <EditNodeModal ref={EditNodeModalRef} page={page} />
            <InsterNodeDataModal ref={InsterNodeDataModalRef} page={page} />
        </div>
    );
};

export { MoreNode };
