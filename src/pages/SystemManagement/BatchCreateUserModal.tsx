import { ChunkUpload, ExportButton, WizardModal } from '@/compoments';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import type { UsePageRef } from '@/hooks/usePage';
import { Button } from 'antd';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import CreateUpload from './CreateUpload';

const BatchCreateUserModal = forwardRef<
    UseModalRefType,
    {
        title: string;
        page: UsePageRef;
    }
>(({ title, page }, ref) => {
    const [model] = WizardModal.useModal();
    const uploadCreateUserModalRef = useRef<UseModalRefType>(null);

    useImperativeHandle(ref, () => ({
        open() {
            model.open();
        },
    }));

    return (
        <div>
            <WizardModal
                footer={
                    <Button
                        key="link"
                        onClick={() => {
                            model.close();
                        }}
                    >
                        取消
                    </Button>
                }
                width={550}
                modal={model}
                title={title}
            >
                <div className="pt-2 px-6">
                    <ChunkUpload
                        url="/user/import"
                        chunkSize={2}
                        accept=".csv,.xlsx,"
                        maxCount={1}
                        onlyNameBool
                        onChange={() => {
                            page.onLoad();
                            uploadCreateUserModalRef.current?.open();
                            model.close();
                        }}
                    >
                        <div className="flex justify-center items-center flex-col gap-2">
                            <CreateUpload style={{ width: 200 }} />
                            <div className="flex justify-center items-center flex-col mt-4 mb-2">
                                <div>
                                    可将文件拖入框内，或
                                    <Button type="link" className="p-0">
                                        点击此处导入
                                    </Button>
                                    <span className="text-[#85899E] ml-2">
                                        格式为.cxv，.xlsx格式
                                    </span>
                                </div>
                                <div className="text-[#85899E]">
                                    上传成功后默认自动下载当前上传文件所对应用户信息
                                </div>
                            </div>
                            <ExportButton
                                url="/user/import"
                                fileName="批量创建用户模版.csv"
                                method="get"
                                title="下载模版"
                                type="primary"
                                icon={null}
                                style={{ width: 200, marginTop: 8 }}
                            />
                        </div>
                    </ChunkUpload>
                </div>
            </WizardModal>
            <UploadCreateUserModal
                title="创建成功"
                ref={uploadCreateUserModalRef}
            />
        </div>
    );
});

export { BatchCreateUserModal };

const UploadCreateUserModal = forwardRef<
    UseModalRefType,
    {
        title: string;
    }
>(({ title }, ref) => {
    const [model] = WizardModal.useModal();

    useImperativeHandle(ref, () => ({
        open() {
            model.open();
        },
    }));

    return (
        <WizardModal
            footer={
                <div className="flex justify-end items-center gap-4">
                    <Button
                        key="link"
                        onClick={() => {
                            model.close();
                        }}
                    >
                        取消
                    </Button>
                    <ExportButton
                        url="/user/export"
                        fileName="批量创建用户信息.csv"
                        method="get"
                        title="确定"
                        type="primary"
                        icon={null}
                        onChange={(status) => {
                            if (status === 'success') {
                                model.close();
                            }
                        }}
                    />
                </div>
            }
            width={550}
            modal={model}
            title={title}
        >
            <div className="flex justify-center items-center h-32">
                批量创建成功，点击确定即可下载用户列表查看密码
            </div>
        </WizardModal>
    );
});
