import type { ReactNode } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { useSafeState } from 'ahooks';
import { Badge, Button, Empty, Input, Spin, Table } from 'antd';
import { WizardDrawer } from '@/compoments';
import type { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import { postHostAliveDetectionRun } from '@/apis/NodeManageApi';
import type { PostHostAliveDetectionRunRequest } from '@/apis/NodeManageApi/type';
import showErrorMessage from '@/utils/showErrorMessage';

type ProbeStatus = 'testing' | 'success' | 'error';

interface ProbeRow {
    key: string;
    target: string;
    status: ProbeStatus;
    text: string;
}

const parseTargetsInput = (raw: string): string[] => {
    return raw
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const toRecord = (raw: string): Record<string, any> => {
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
};

const readByKeys = (
    source: Record<string, any>,
    keys: string[],
): any | undefined => {
    for (const key of keys) {
        if (source[key] !== undefined && source[key] !== null) {
            return source[key];
        }
        const found = Object.keys(source).find(
            (k) => k.toLowerCase() === key.toLowerCase(),
        );
        if (found && source[found] !== undefined && source[found] !== null) {
            return source[found];
        }
    }
    return undefined;
};

const parseProbeResult = (
    raw: string,
    fallbackTarget = '-',
): Omit<ProbeRow, 'key'> => {
    const payload = toRecord(raw);
    const target = String(
        readByKeys(payload, ['IP', 'ip', 'host', 'target', 'domain', 'url']) ||
            fallbackTarget,
    );
    const okRaw = readByKeys(payload, ['Ok', 'ok', 'alive', 'success']);
    const ok = okRaw === true || okRaw === 'true' || okRaw === 1;
    const rtt = readByKeys(payload, [
        'RTT',
        'rtt',
        'latency',
        'elapsed',
        'cost',
        'time',
    ]);
    const reason = readByKeys(payload, [
        'Reason',
        'reason',
        'error',
        'msg',
        'message',
    ]);
    if (ok) {
        const rttText =
            rtt !== undefined && rtt !== null && String(rtt).trim() !== ''
                ? `${String(rtt).trim()} ms`
                : '';
        return {
            target,
            status: 'success',
            text: rttText ? `连通 (${rttText})` : '连通',
        };
    }
    return {
        target,
        status: 'error',
        text: `失败${reason ? ` (${String(reason)})` : ''}`,
    };
};

const IRifyNetworkDetectionDrawer = forwardRef<UseDrawerRefType>(
    (_, ref): ReactNode => {
        const [drawer] = WizardDrawer.useDrawer();
        const [nodeIds, setNodeIds] = useSafeState<string[]>([]);
        const [currentNodeName, setCurrentNodeName] = useSafeState<string>('-');
        const [hosts, setHosts] = useSafeState('');
        const [testing, setTesting] = useSafeState(false);
        const [rows, setRows] = useSafeState<ProbeRow[]>([]);

        useImperativeHandle(ref, () => ({
            async open(ids?: string[]) {
                const safeIds = Array.isArray(ids) ? ids : [];
                setNodeIds(safeIds);
                setCurrentNodeName(
                    safeIds.length <= 1
                        ? safeIds[0] || '-'
                        : safeIds.join(', '),
                );
                setRows([]);
                setHosts('');
                setTesting(false);
                drawer.open();
            },
        }));

        const startProbe = async () => {
            const safeHosts = hosts.trim();
            if (!safeHosts) {
                showErrorMessage('请输入要探测的目标');
                return;
            }
            if (!nodeIds.length) {
                showErrorMessage('未找到可用节点');
                return;
            }

            const targetList = parseTargetsInput(safeHosts);
            setRows(
                nodeIds.flatMap((node) =>
                    (targetList.length ? targetList : ['-']).map((target) => ({
                        key: `${node}-${target}`,
                        target,
                        status: 'testing',
                        text: '探测中...',
                    })),
                ),
            );
            setTesting(true);
            try {
                const { data } = await postHostAliveDetectionRun({
                    nodes_id: nodeIds,
                    hosts: safeHosts,
                    dns_timeout: 0.5,
                });
                const list: PostHostAliveDetectionRunRequest[] =
                    data?.list ?? [];
                const mapped: ProbeRow[] = list.flatMap((item, nodeIdx) => {
                    const resultList = item.result || [];
                    if (!resultList.length) {
                        return [
                            {
                                key: `${item.node || currentNodeName}-empty-${nodeIdx}`,
                                target: targetList[nodeIdx] || '-',
                                status: 'error',
                                text: '失败 (超时/失败)',
                            },
                        ];
                    }
                    return resultList.map((raw: string, idx: number) => {
                        const parsed = parseProbeResult(
                            raw,
                            targetList[idx] || '-',
                        );
                        return {
                            key: `${item.node || currentNodeName}-${parsed.target}-${idx}`,
                            ...parsed,
                        };
                    });
                });
                setRows(mapped);
            } catch (err: any) {
                showErrorMessage(err?.msg || err?.message || '网络探测失败');
                setRows(
                    targetList.map((target, idx) => ({
                        key: `${currentNodeName}-${target}-${idx}-error`,
                        target,
                        status: 'error',
                        text: '失败 (超时/失败)',
                    })),
                );
            } finally {
                setTesting(false);
            }
        };

        return (
            <WizardDrawer
                footer={null}
                drawer={drawer}
                title={
                    <>
                        网络探测
                        <span className="text-sm text-gray-400 font-normal ml-2">
                            (执行节点: {currentNodeName})
                        </span>
                    </>
                }
                width="75%"
            >
                <div className="space-y-3">
                    <Input.TextArea
                        rows={3}
                        value={hosts}
                        onChange={(e) => setHosts(e.target.value)}
                        placeholder="请输入要探测的目标"
                    />
                    <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500">
                            可批量检测，逗号或者换行进行分隔
                        </div>
                        <Button
                            type="primary"
                            loading={testing}
                            onClick={startProbe}
                        >
                            开始探测
                        </Button>
                    </div>
                    <Table<ProbeRow>
                        rowKey="key"
                        dataSource={rows}
                        pagination={false}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="暂无数据"
                                />
                            ),
                        }}
                        columns={[
                            {
                                title: '探测目标',
                                dataIndex: 'target',
                                key: 'target',
                                width: 300,
                            },
                            {
                                title: '检测结果',
                                dataIndex: 'text',
                                key: 'text',
                                render: (_, record) => {
                                    if (record.status === 'testing') {
                                        return (
                                            <span className="inline-flex items-center gap-2">
                                                <Spin size="small" />
                                                <span>探测中...</span>
                                            </span>
                                        );
                                    }
                                    if (record.status === 'success') {
                                        return (
                                            <Badge
                                                status="success"
                                                text={record.text || '连通'}
                                            />
                                        );
                                    }
                                    return (
                                        <Badge
                                            status="error"
                                            text={record.text || '超时/失败'}
                                        />
                                    );
                                },
                            },
                        ]}
                    />
                </div>
            </WizardDrawer>
        );
    },
);

export { IRifyNetworkDetectionDrawer };
