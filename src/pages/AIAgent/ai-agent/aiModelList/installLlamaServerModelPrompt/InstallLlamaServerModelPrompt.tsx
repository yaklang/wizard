import React from 'react';
import type { InstallLlamaServerModelPromptProps } from './InstallLlamaServerModelPromptType';
import { yakitNotify } from '@/utils/notification';
import { useMemoizedFn } from 'ahooks';
import { Form } from 'antd';
import { YakitInput } from '@/compoments/YakitUI/YakitInput/YakitInput';
import { YakitButton } from '@/compoments/YakitUI/YakitButton/YakitButton';
import styles from './InstallLlamaServerModelPrompt.module.scss';
import { grpcInstallLlamaServer } from '../utils';

export const InstallLlamaServerModelPrompt: React.FC<InstallLlamaServerModelPromptProps> =
    React.memo((props) => {
        const { onStart, token } = props;

        const startInstall = useMemoizedFn((value) => {
            grpcInstallLlamaServer({ Proxy: value.proxy, token }).then(() => {
                yakitNotify('success', '正在安装模型环境');
                onStart();
            });
        });

        return (
            <div className={styles['install-llama-server-model-prompt']}>
                <Form onFinish={startInstall} layout="vertical">
                    <Form.Item
                        label="代理设置"
                        help="非必填，用于下载加速，格式：http://proxy:port 或 socks5://proxyport"
                        name="proxy"
                    >
                        <YakitInput placeholder="留空则不使用代理" />
                    </Form.Item>

                    <div className={styles['button-group']}>
                        <YakitButton
                            type="primary"
                            htmlType="submit"
                            size="large"
                        >
                            下载并安装
                        </YakitButton>
                    </div>
                </Form>
            </div>
        );
    });
