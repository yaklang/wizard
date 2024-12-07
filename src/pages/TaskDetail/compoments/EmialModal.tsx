import { WizardModal } from '@/compoments';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { Palm } from '@/gen/schema';
import { useMemoizedFn, useRequest } from 'ahooks';
import { Button, Form, Input, message } from 'antd';
import html2pdf from 'html2pdf.js';
import { forwardRef, useImperativeHandle } from 'react';
import { opt } from './ScriptDetailButton';
import { critical, high, warning, low, security } from './reportImg';
import dayjs from 'dayjs';
import { PostSendEmailReportData } from '@/apis/taskDetail';

const { Item } = Form;
const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

const Cover_Img: { [key: string]: string } = {
    critical: critical,
    high: high,
    warning: warning,
    low: low,
    security: security,
};

const EmailMoadl = forwardRef<
    UseModalRefType,
    {
        title: string;
        cover: string;
        divRef: React.RefObject<HTMLDivElement>;
    }
>(({ title, cover, divRef }, ref) => {
    const [model] = WizardModal.useModal();
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
        open() {
            model.open();
        },
    }));

    const { runAsync, loading } = useRequest(
        async (RequestData: Palm.SendSmtp) => {
            const result = await PostSendEmailReportData(RequestData);
            const { data } = result;
            return data;
        },
        {
            manual: true,
            onSuccess: () => {
                message.success('发送成功');
                form.resetFields();
                model?.close();
            },
        },
    );

    const onOk = async () => {
        try {
            const formData = await form.validateFields();
            const transformData = {
                ...formData,
                toEmail: [
                    formData?.toEmail
                        ?.split(',')
                        ?.map((item?: string) => item?.split('\n')),
                ]
                    .flat(Infinity)
                    .filter((item) => !!item.replace(/\s*/g, '')),
                fileName: `${formData.fileName}.pdf`,
                name: 'smtp.exmail.qq.com',
            };
            UploadPdf(transformData);
        } catch (err) {
            console.error(err);
        }
    };

    const UploadPdf = useMemoizedFn((data: Palm.SendSmtp) => {
        if (!divRef || !divRef.current) return;
        const div = divRef.current;

        html2pdf()
            .from(div)
            .set(opt)
            .toPdf()
            .get('pdf')
            .then(async (pdf: any) => {
                let totalPages: number = 0;
                if (
                    ['critical', 'high', 'warning', 'low', 'security'].includes(
                        cover,
                    )
                ) {
                    pdf.addPage('a4');
                    pdf.addImage(Cover_Img[cover], 'JPEG', 5, 10, 200, 277);
                    pdf.setFontSize(10);
                    pdf.setTextColor(150);
                    pdf.text(
                        dayjs(new Date().getTime()).format('YYYY - MM'),
                        pdf.internal.pageSize.getWidth() - 110,
                        pdf.internal.pageSize.getHeight() - 15,
                    );
                    totalPages = pdf.internal.getNumberOfPages();
                    pdf.movePage(totalPages, 1);
                } else {
                    totalPages = pdf.internal.getNumberOfPages();
                }

                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(10);
                    pdf.setTextColor(150);
                    // 需要导入中文字体包
                    // pdf.text("网络安全评估报告", pdf.internal.pageSize.getWidth() - 85, 5);
                    if (i !== 1)
                        pdf.text(
                            '- ' + (i - 1) + ' -',
                            pdf.internal.pageSize.getWidth() - 105,
                            pdf.internal.pageSize.getHeight() - 5,
                        );
                }

                // 导出成base64模块
                const preBlob = pdf.output(
                    'datauristring',
                    data.fileName || '123.pdf',
                );

                await runAsync({ ...data, fileData: preBlob });
            });
    });

    return (
        <WizardModal
            footer={
                <>
                    <Button
                        key="link"
                        onClick={() => {
                            model.close();
                            form.resetFields();
                        }}
                    >
                        取消
                    </Button>
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => onOk()}
                        loading={loading}
                    >
                        确定
                    </Button>
                </>
            }
            width={500}
            modal={model}
            title={title}
        >
            <div className="pt-2 px-6">
                <Form
                    form={form}
                    layout="horizontal"
                    {...layout}
                    initialValues={{
                        fileData: '',
                        toEmail: '',
                        fileName: '网络安全风险评估报告',
                        name: 'smtp.exmail.qq.com',
                        subject: '网络风险评估报告',
                        text: '本次扫描的网络风险评估报告，请查收',
                    }}
                >
                    <Item
                        label="报告名称"
                        name="fileName"
                        rules={[{ required: true, message: '请输入报告名称!' }]}
                    >
                        <Input allowClear={true} placeholder="请输入报告名称" />
                    </Item>

                    <Item
                        label="收件人邮箱"
                        name="toEmail"
                        rules={[
                            { required: true, message: '邮箱不能为空' },
                            { type: 'email', message: '邮箱格式不正确' },
                        ]}
                    >
                        <Input.TextArea
                            className="post-dynamic-input"
                            placeholder="以英文逗号或换行分割邮箱"
                            autoSize={{ minRows: 1, maxRows: 4 }}
                            allowClear={true}
                        />
                    </Item>

                    <Item
                        label="邮件主题"
                        name="subject"
                        rules={[{ required: true, message: '请输入邮件主题!' }]}
                    >
                        <Input allowClear={true} placeholder="请输入邮件主题" />
                    </Item>

                    <Item
                        label="邮件内容"
                        name="text"
                        rules={[{ required: true, message: '请输入邮件内容!' }]}
                    >
                        <Input allowClear={true} placeholder="请输入邮件内容" />
                    </Item>
                </Form>
            </div>
        </WizardModal>
    );
});

export { EmailMoadl };
