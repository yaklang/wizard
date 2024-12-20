import { WizardModal } from '@/compoments';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { SyncOutlined } from '@ant-design/icons';
import { useSafeState } from 'ahooks';
import { Button, Input } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';

const CveUpdateModal = forwardRef<
    UseModalRefType,
    {
        refresh: () => void;
    }
>((_, ref) => {
    const [model] = WizardModal.useModal();
    const [data, setData] = useSafeState<{
        title: string;
        type: string;
    }>();

    const [value, setValue] = useSafeState<string | undefined>();

    useImperativeHandle(ref, () => ({
        open(data) {
            setData(data);
            model.open();
        },
    }));

    return (
        <WizardModal
            footer={
                <>
                    <Button
                        key="link"
                        onClick={() => {
                            model.close();
                            setValue(undefined);
                        }}
                    >
                        取消
                    </Button>
                    <Button key="submit" type="primary">
                        更新
                    </Button>
                </>
            }
            width={550}
            modal={model}
            title={data?.title}
            afterClose={() => console.log(111)}
        >
            <div className="pt-2 px-6">
                <div className="flex gap-2">
                    <SyncOutlined className="text-8 flex items-start" />
                    {data?.type === 'lack' ? (
                        <div className="w-full color-[#B5B5B5]">
                            <div className="flex justify-center items-center w-full mb-2">
                                <div className="whitespace-nowrap">
                                    设置代理：
                                </div>
                                <Input
                                    placeholder="设置代理"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                />
                            </div>
                            <div className="leading-6">
                                差量更新数据库仅更新最新数据
                                <br />
                                差量更新数据仅更新最新数据 （OpenAI
                                可能暂未翻译）
                                <br />
                                被拒绝的 CVE 将不会更新
                                <br />
                            </div>
                        </div>
                    ) : (
                        <div className="w-full color-[#B5B5B5] mt-1">
                            点击“强制更新”，可更新本地CVE数据库
                        </div>
                    )}
                </div>
            </div>
        </WizardModal>
    );
});

export { CveUpdateModal };
