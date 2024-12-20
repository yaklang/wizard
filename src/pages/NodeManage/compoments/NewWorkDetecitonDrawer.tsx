import { FC, forwardRef, ReactNode, useImperativeHandle, useRef } from 'react';

import { WizardDrawer, WizardTable } from '@/compoments';
import { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import NetWorkIcon from '../Icon/NetWorkIcon';
import { Button, Input } from 'antd';
import { postHostAliveDetectionRun } from '@/apis/NodeManageApi';
import { useSafeState } from 'ahooks';

const NetWorkIconNode: FC<{ node_ids: Array<string> }> = ({ node_ids }) => {
    const newWorkDetecitonDrawerRef = useRef<UseDrawerRefType>(null);
    return (
        <div>
            <NetWorkIcon
                onClick={() =>
                    newWorkDetecitonDrawerRef.current?.open(node_ids)
                }
                style={{
                    width: '32px',
                    borderRight: '1px solid #EAECF3',
                }}
            />
            <NewWorkDetecitonDrawer ref={newWorkDetecitonDrawerRef} />
        </div>
    );
};

const NewWorkDetecitonDrawer = forwardRef<UseDrawerRefType>(
    (_, ref): ReactNode => {
        const [drawer] = WizardDrawer.useDrawer();
        const [page] = WizardTable.usePage();

        const [nodeIds, setNodeIds] = useSafeState<string[]>([]);
        const [hosts, setHosts] = useSafeState('');

        useImperativeHandle(ref, () => ({
            async open(node_ids: Array<string>) {
                setNodeIds(node_ids);
                drawer.open();
            },
        }));

        return (
            <WizardDrawer
                footer={null}
                drawer={drawer}
                title={'网络探测'}
                width={'75%'}
            >
                <div>
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <Input.TextArea
                            rows={1}
                            value={hosts}
                            onChange={(e) => setHosts(e.target.value)}
                            placeholder="请输入要探测的目标"
                        />
                        <Button
                            type="primary"
                            onClick={() => {
                                page.onLoad({ hosts });
                            }}
                        >
                            测试
                        </Button>
                    </div>
                    <div className="color-[#B5B5B5] text-xs">
                        可批量检测，逗号或者换行进行分隔
                    </div>
                    <WizardTable
                        page={page}
                        columns={[]}
                        rowKey="aa"
                        request={async () => {
                            const data = await postHostAliveDetectionRun({
                                nodes_id: nodeIds,
                                hosts,
                                dns_timeout: 0.5,
                            });
                            console.log(data, 'data');
                            return {
                                list: [],
                                pagemeta: {
                                    limit: 10,
                                    page: 1,
                                    total: 10,
                                    total_page: 1,
                                },
                            };
                        }}
                    />
                </div>
            </WizardDrawer>
        );
    },
);

export { NewWorkDetecitonDrawer, NetWorkIconNode };
