import type { FC } from 'react';

import { match, P } from 'ts-pattern';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, message, Popover } from 'antd';
import { showErrorMessage } from '@/utils/showErrorMessage';

import { useRequest, useSafeState } from 'ahooks';

import DeleteOutlined from './svg/DeleteOutlined';
import { deleteAnalysisScript } from '@/apis/task';
import type { TaskScriptListItem } from '../types';

const DeletePopover: FC<{
    refreshAsync: () => Promise<TaskScriptListItem[]>;
    script_name?: string;
}> = ({ refreshAsync, script_name }) => {
    const [open, setOpen] = useSafeState(false);

    const { loading, run } = useRequest(deleteAnalysisScript, {
        manual: true,
        onSuccess: async () => {
            await refreshAsync();
            setOpen(false);
            message.success('删除成功');
        },
    });

    const headDelete = (): void => {
        match(script_name)
            .with(P.string, async (value) => {
                try {
                    await run(value);
                } catch (err) {
                    message.destroy();
                    showErrorMessage(err, '删除失败');
                }
            })
            .with(P.nullish, () => showErrorMessage('未获取当前脚本ID，请重试'))
            .exhaustive();
    };
    return (
        <Popover
            content={
                <div className="flex justify-end gap-2">
                    <Button
                        color="default"
                        style={{
                            fontSize: '12px',
                        }}
                        onClick={() => setOpen(false)}
                    >
                        取消
                    </Button>
                    <Button
                        type="primary"
                        style={{
                            fontSize: '12px',
                        }}
                        onClick={() => headDelete()}
                        loading={loading}
                    >
                        确定
                    </Button>
                </div>
            }
            title={
                <div>
                    <InfoCircleOutlined color="#faad14" />
                    <span className="ml-1 font-400">确认删除脚本？</span>
                </div>
            }
            trigger="click"
            open={open}
            onOpenChange={(newOpen) => setOpen(newOpen)}
        >
            <DeleteOutlined />
        </Popover>
    );
};

export { DeletePopover };
