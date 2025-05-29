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

const ExportButton: FC<
    ExportProps & {
        onChange?: (status: any) => void;
    }
> = ({
    title,
    params,
    method,
    url,
    fileName,
    msg = '导出成功',
    onChange,
    ...props
}) => {
    const [state, dispatch] = useReducer(reducer, initialValue);
    const { controller, visible } = state;

    const getParams = (p: any) => (typeof p === 'function' ? p() : p);

    const request = useCallback(
        (callback: () => void) => {
            const timer = setTimeout(() => {
                dispatch({ visible: true });
            }, 700);
            let _controller = new AbortController();
            dispatch({ controller: _controller });

            const config: AxiosRequestConfig = {
                signal: _controller.signal,
                transformResponse(data) {
                    return {
                        data,
                        message: data?.message,
                        code: data?.code ?? 200,
                    };
                },
                responseType: 'blob',
            };

            const success = (file: any) => {
                saveFile(file.data, getParams(fileName));
                clearTimeout(timer);
                callback();
                onChange?.('success');
            };

            const failure = () => {
                message.error('导出错误');
                clearTimeout(timer);
                onChange?.('error');
            };

            if (method === 'get') {
                axios
                    .get(url, { params: getParams(params), ...config })
                    .then(success)
                    .catch(failure);
            } else if (method === 'post') {
                axios
                    .post(url, getParams(params), config)
                    .then(success)
                    .catch(failure);
            }
        },
        [fileName, method, params, url, onChange],
    );

    return (
        <>
            <Button
                onClick={async (e) => {
                    e.stopPropagation();
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
