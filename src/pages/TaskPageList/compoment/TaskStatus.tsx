import type { TTaskListStatus } from '@/apis/task/types';
import { InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import { match, P } from 'ts-pattern';

export type TTaskListStatusType = `${TTaskListStatus}`; // 提取枚举值的联合类型

const TaskStatus = (status?: TTaskListStatusType) =>
    match(status)
        .with('failed', () => (
            <Tag color="error" className="cursor-default">
                失败 <InfoCircleOutlined />
            </Tag>
        ))
        .with('cancel', () => (
            <Tag className="cursor-default" color="default">
                取消
            </Tag>
        ))
        .with('running', () => (
            <Tag className="cursor-default" color="processing">
                <LoadingOutlined /> 执行中
            </Tag>
        ))
        .with('success', () => (
            <Tag className="cursor-default" color="success">
                成功
            </Tag>
        ))
        .with('waiting', () => (
            <Tag color="default" className="cursor-default">
                未开始
            </Tag>
        ))
        .with('disabled', () => (
            <Tag color="error" className="cursor-default">
                停用
            </Tag>
        ))
        .with('enabled', () => (
            <Tag color="success" className="cursor-default">
                启用
            </Tag>
        ))
        .with('finished', () => (
            <Tag color="default" className="cursor-default">
                结束
            </Tag>
        ))
        .with(P.string, () => '-')
        .with(P.nullish, () => '-')
        .exhaustive();

export { TaskStatus };
