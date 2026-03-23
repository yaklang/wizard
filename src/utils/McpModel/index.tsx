import { WizardModal } from '@/compoments';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { Button, Input } from 'antd';
import { forwardRef, useImperativeHandle, useState } from 'react';

// 启用MCP模型弹窗
const McpModal = forwardRef<UseModalRefType, object>((_, ref) => {
    const [model] = WizardModal.useModal();
    const [enabled, setEnabled] = useState(false);
    const [address, setAddress] = useState('127.0.0.1:11432');

    useImperativeHandle(ref, () => ({
        async open() {
            model.open();
        },
    }));

    return (
        <WizardModal
            footer={
                <>
                    <Button
                        key="link"
                        onClick={async () => {
                            model.close();
                        }}
                    >
                        取消
                    </Button>
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => setEnabled(true)}
                    >
                        启用
                    </Button>
                </>
            }
            width={550}
            modal={model}
            title="MCP模型"
        >
            <div className="min-h-[200px] bg-white px-6 pb-6 pt-5 text-[#262626]">
                <div className="mb-5 rounded bg-[#FFF1F0] px-4 py-2">
                    <span className="text-gray-700">当前状态：</span>
                    <span
                        className={
                            enabled ? 'text-green-600' : 'text-[#F5222D]'
                        }
                    >
                        {enabled ? '已启用' : '未启用'}
                    </span>
                </div>

                <div className="mb-2 text-gray-800">启动地址：</div>

                <div>
                    <Input
                        addonBefore="http://"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="127.0.0.1:端口"
                    />
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[#8C8C8C]">
                    以SSE方式启动mcp，在需要使用mcp的地方填入启动地址即可
                </p>
            </div>
        </WizardModal>
    );
});

McpModal.displayName = 'McpModal';

export { McpModal };
