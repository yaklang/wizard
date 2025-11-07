import type { ReactNode } from 'react';
import React, { isValidElement, useState } from 'react';
import { Button, Input, Upload, message } from 'antd';
import useLoginStore from '@/App/store/loginStore';
import axios from '@/utils/axios';
import type { UploadProps } from 'antd/lib';
import { match, P } from 'ts-pattern';
import { generateUniqueId } from '@/utils';

type ChunkUploadProps = UploadProps & {
    url: string;
    chunkSize?: number;
    onChange?: (value: any) => void;
    value?: any;
    children?: ReactNode;
    childrenType?: 'textArea';
    encryptionKey?: any;
    setFieldValue?: (name: any, value: any) => void;
    onlyNameBool?: boolean;
    placeholder?: string;
};

const ChunkUpload: React.FC<ChunkUploadProps> = ({
    url,
    chunkSize = 2,
    onChange,
    value,
    children,
    childrenType,
    encryptionKey,
    setFieldValue,
    onlyNameBool,
    placeholder,
    ...props
}) => {
    const { token } = useLoginStore((state) => state);
    const [loading, setLoading] = useState(false);

    const uploadChunk = async (
        file: File,
        chunkIndex: number,
        totalChunks: number,
        newFileName: string,
        // eslint-disable-next-line max-params
    ) => {
        const chunk = file.slice(
            chunkIndex * chunkSize * 1024 * 1024,
            (chunkIndex + 1) * chunkSize * 1024 * 1024,
        );

        const formData = new FormData();
        formData.append('file', chunk, newFileName);
        formData.append('file_name', newFileName);
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
        const newFileName = onlyNameBool
            ? file.name
            : `${generateUniqueId()}_${file.name}`;
        setLoading(true);

        const uploadNextChunk = (chunkIndex: number) => {
            if (chunkIndex >= totalChunks) {
                message.success('上传完成');
                setFieldValue?.(encryptionKey, generateUniqueId());
                onChange?.(newFileName);
                setLoading(false);
                return;
            }

            uploadChunk(file, chunkIndex, totalChunks, newFileName)
                .then(() => {
                    onChange?.(newFileName);
                    uploadNextChunk(chunkIndex + 1);
                })
                .catch(() => {
                    message.destroy();
                    message.error('上传失败');
                    setLoading(false);
                });
        };

        uploadNextChunk(0);
    };

    const isReactNode = (value: unknown): value is ReactNode =>
        typeof value === 'string' ||
        typeof value === 'number' ||
        isValidElement(value) ||
        (Array.isArray(value) && value.every(isReactNode));

    // 包装上传按钮（可选处理 loading）
    const chidrenNode = match([children, childrenType])
        .with([P.when(isReactNode), P.nullish], () =>
            React.cloneElement(children as React.ReactElement, {
                loading, // ✅ 给按钮添加 loading
                disabled: loading,
            }),
        )
        .with([P.nullish, P.nullish], () => (
            <Button loading={loading} disabled={loading}>
                上传文件
            </Button>
        ))
        .with([P.nullish, 'textArea'], () => (
            <Input.TextArea
                placeholder={placeholder ?? '请输入'}
                onClick={(e) => e.stopPropagation()}
                onPressEnter={(e) => e.stopPropagation()}
                onChange={(e) => onChange?.(e.target.value)}
                value={value}
                disabled={loading}
            />
        ))
        .with([P.when(isReactNode), P.any], () =>
            React.cloneElement(children as React.ReactElement, {
                loading,
                disabled: loading,
            }),
        )
        .otherwise(() => (
            <Button loading={loading} disabled={loading}>
                上传文件
            </Button>
        ));

    return (
        <Upload
            beforeUpload={(file) => {
                handleUpload(file);
                return false;
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
