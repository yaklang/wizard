import { Button } from 'antd';
import type { ExportProps, ExportState } from './types';
import { LoadingOutlined } from '@ant-design/icons';
import { message, Modal, Spin } from 'antd';
import axios from '@/utils/axios';
import type { FC } from 'react';
import { useCallback, useReducer } from 'react';
import { saveFile } from '@/utils';
import type { AxiosRequestConfig } from 'axios';

const initialValue: ExportState = {
    controller: null,
    visible: false,
};
const reducer = (state: ExportState, payload: ExportState) => ({
    ...state,
    ...payload,
});

const ExportButton: FC<ExportProps> = ({
    title,
    params,
    method,
    url,
    fileName,
    msg = '导出成功',
    ...props
}) => {
    const [state, dispatch] = useReducer(reducer, initialValue);
    const { controller, visible } = state;

    const getParams = (p: any) => (typeof p === 'function' ? p() : p);
    // 获取文件流
    const request = useCallback(
        (callback: () => void) => {
            // 700ms内未下载完时提示
            const timer = setTimeout(() => {
                dispatch({ visible: true });
            }, 700);
            let _controller = new AbortController();
            dispatch({ controller: _controller });

            const config: AxiosRequestConfig = {
                signal: _controller.signal,
                // responseType 为blob，这里不能直接获取到code，所有结果都将为200
                transformResponse(data) {
                    return {
                        data,
                        message: data?.message,
                        code: data?.code ?? 200,
                    };
                },
                responseType: 'blob',
            };
            if (method === 'get') {
                axios
                    .get(url, { params: getParams(params), ...config })
                    .then((file) => {
                        saveFile(file.data, getParams(fileName));
                        callback();
                        clearTimeout(timer);
                    })
                    .catch(() => {
                        message.error('导出错误');
                    });
            } else if (method === 'post') {
                axios
                    .post(url, getParams(params), config)
                    .then((file) => {
                        saveFile(file.data, getParams(fileName));
                        callback();
                        clearTimeout(timer);
                    })
                    .catch(() => {
                        message.error('导出错误');
                    });
            }
        },
        [fileName, method, params, url],
    );

    return (
        <>
            <Button
                onClick={async () => {
                    request(() => {
                        dispatch({ visible: false });
                        message.success(msg);
                    });
                }}
                {...props}
            >
                {title}
            </Button>
            <Modal
                maskClosable={false}
                keyboard={false}
                closable={false}
                title="下载中"
                open={visible}
                okText="关闭"
                cancelText="取消下载"
                onOk={() => dispatch({ visible: false })}
                cancelButtonProps={{
                    onClick: () => {
                        controller.abort();
                        dispatch({ visible: false });
                    },
                }}
            >
                <p className="flex flex-center">
                    下载中，请耐心等待...
                    <Spin
                        spinning
                        className="ml-8"
                        indicator={
                            <LoadingOutlined spin style={{ fontSize: 18 }} />
                        }
                    />
                </p>
            </Modal>
        </>
    );
};
export default ExportButton;
