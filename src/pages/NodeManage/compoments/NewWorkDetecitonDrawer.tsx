import type { FC, ReactNode } from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import { WizardDrawer, WizardTable } from '@/compoments';
import type { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import NetWorkIcon from '../Icon/NetWorkIcon';
import { Button, Input, Tooltip } from 'antd';
import { postHostAliveDetectionRun } from '@/apis/NodeManageApi';
import { useSafeState } from 'ahooks';
import type { CreateTableProps } from '@/compoments/WizardTable/types';
import type { PostHostAliveDetectionRunRequest } from '@/apis/NodeManageApi/type';

const NetWorkIconNode: FC<{ node_ids: Array<string> }> = ({ node_ids }) => {
    const newWorkDetecitonDrawerRef = useRef<UseDrawerRefType>(null);
    return (
        <div>
            <Tooltip title="网络探测">
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
                </div>
            </Tooltip>
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

        const columns: CreateTableProps<
            PostHostAliveDetectionRunRequest[]
        >['columns'] = [
            {
                dataIndex: 'node',
                title: '节点',
            },
            {
                dataIndex: 'result',
                title: '检测结果',
                render: (value) => (value.length > 0 ? value.join('\n') : '-'),
            },
        ];

        return (
            <WizardDrawer
                footer={null}
                drawer={drawer}
                title="网络探测"
                width="75%"
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
                        columns={columns}
                        rowKey="node"
                        request={async () => {
                            const { data } = await postHostAliveDetectionRun({
                                nodes_id: nodeIds,
                                hosts,
                                dns_timeout: 0.5,
                            });
                            return {
                                list: data?.list ?? [],
                                pagemeta: {
                                    limit: 1000,
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
