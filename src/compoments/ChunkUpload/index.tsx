import type { ReactNode } from 'react';
import React, { isValidElement } from 'react';
import { Button, Input, Upload, message } from 'antd';
import useLoginStore from '@/App/store/loginStore';
import axios from '@/utils/axios';
import type { UploadProps } from 'antd/lib';
import { match, P } from 'ts-pattern';
import { generateUniqueId } from '@/utils';

type ChunkUploadProps = UploadProps & {
    url: string; // 上传服务器地址
    chunkSize?: number; // 分片大小，单位为MB
    onChange?: (value: any) => void;
    value?: any;
    children?: ReactNode; // 自定义渲染上传按钮
    childrenType?: 'textArea';
    encryptionKey?: any;
    setFieldValue?: (name: any, value: any) => void;
};

const ChunkUpload: React.FC<ChunkUploadProps> = ({
    url,
    chunkSize = 2, // 默认每个分片为2MB
    onChange,
    value,
    children,
    childrenType,
    encryptionKey,
    setFieldValue,
    ...props // 如果有其他额外的 props
}) => {
    const { token } = useLoginStore((state) => state);

    const uploadChunk = async (
        file: File,
        chunkIndex: number,
        totalChunks: number,
    ) => {
        const chunk = file.slice(
            chunkIndex * chunkSize * 1024 * 1024,
            (chunkIndex + 1) * chunkSize * 1024 * 1024,
        );

        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('file_name', file.name);
        formData.append('chunkIndex', `${chunkIndex}`);
        formData.append('totalChunks', `${totalChunks}`);

        try {
            await axios.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } catch (error) {
            message.destroy();
            message.error('上传失败');
            throw error;
        }
    };

    const handleUpload = (file: File) => {
        const totalChunks = Math.ceil(file.size / (chunkSize * 1024 * 1024));

        const uploadNextChunk = (chunkIndex: number) => {
            if (chunkIndex >= totalChunks) {
                message.success('上传完成');
                setFieldValue?.(encryptionKey, generateUniqueId());
                onChange?.(file.name);
                return;
            }

            uploadChunk(file, chunkIndex, totalChunks)
                .then(() => {
                    onChange?.(file.name);
                    uploadNextChunk(chunkIndex + 1);
                })
                .catch(() => {
                    message.destroy();
                    message.error('上传失败');
                });
        };

        uploadNextChunk(0);
    };

    // 判断是否为ReactNode节点
    const isReactNode = (value: unknown): value is ReactNode =>
        typeof value === 'string' ||
        typeof value === 'number' ||
        isValidElement(value) ||
        (Array.isArray(value) && value.every(isReactNode));

    // 根据 props 渲染组件
    const chidrenNode = match([children, childrenType])
        .with([P.when(isReactNode), P.nullish], () => children)
        .with([P.nullish, P.nullish], () => <Button>上传文件</Button>)
        .with([P.nullish, 'textArea'], () => (
            <Input.TextArea
                placeholder="请输入"
                onClick={(e) => e.stopPropagation()}
                onPressEnter={(e) => e.stopPropagation()}
                onChange={(e) => {
                    const value = e.target.value;
                    onChange?.(value);
                }}
                value={value}
            />
        ))
        // 容错
        .with([P.when(isReactNode), P.any], () => children)
        .otherwise(() => <Button>上传文件</Button>);

    return (
        <Upload
            beforeUpload={(file) => {
                handleUpload(file);
                return false; // 阻止默认的上传行为
            }}
            showUploadList={false}
            action={token}
            {...props}
        >
            {chidrenNode}
        </Upload>
    );
};

export default ChunkUpload;
