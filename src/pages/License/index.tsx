import type { FC } from 'react';
import { useEffect } from 'react';
import { Button, Form, Input, message } from 'antd';
import { showErrorMessage } from '@/utils/showErrorMessage';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { postLicense } from '@/apis/login';
import { copyToClipboard } from '@/utils';

const { Item } = Form;

const License: FC = () => {
    const [form] = Form.useForm();
    const location = useLocation();
    const navigate = useNavigate();

    const { loading, run } = useRequest(postLicense, {
        manual: true,
        onSuccess: () => {
            message.success('上传 License 成功');
            navigate('/');
        },
        onError: (error) => {
            message.destroy();
            showErrorMessage(error, '上传失败');
        },
    });

    useEffect(() => {
        const { license } = location.state || {}; // 获取传递的 record 数据
        license
            ? form.setFieldsValue({ fetch_license: license })
            : navigate('/'); // 设置表单数据
    }, []);

    const headCopy = () => {
        const fetch_license = form.getFieldValue('fetch_license');
        copyToClipboard(fetch_license)
            .then(() => {
                message.success('复制成功');
            })
            .catch(() => {
                message.info('复制失败，请重试');
            });
    };

    const handSumit = async () => {
        const result = await form.validateFields();
        await run({
            license: result.license,
        });
    };

    return (
        <div className="w-full flex justify-center items-center overflow-auto">
            <div className="w-3/5 pt-12">
                <h1 className="flex justify-center items-center my-4">
                    使用 License 注册您的产品
                </h1>
                <Form
                    form={form}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                >
                    <div className="border border-b-solid border-gray-200 mb-6 pb-4">
                        <Item
                            label="License申请码"
                            name="fetch_license"
                            rules={[
                                {
                                    required: true,
                                    message: '请填入License申请码',
                                },
                            ]}
                        >
                            <Input.TextArea
                                rows={6}
                                disabled={true}
                                placeholder="请输入"
                            />
                        </Item>
                        <div className="pl-44">
                            <Button
                                type="link"
                                className="pt-0"
                                onClick={headCopy}
                            >
                                点此复制该 License 请求码
                            </Button>
                            <div className="pl-4 pt-2">
                                在申请 license
                                时，请把这一串申请码给销售人员以便生成您专属的
                                License
                            </div>
                        </div>
                    </div>

                    <Item
                        label="您的许可证"
                        name="license"
                        rules={[
                            { required: true, message: '请输入您的许可证' },
                        ]}
                    >
                        <Input.TextArea rows={16} placeholder="请输入" />
                    </Item>

                    <div className="w-full flex items-center justify-end">
                        <Button
                            loading={loading}
                            className="my-4 w-[83.2%] py-7"
                            type="primary"
                            onClick={handSumit}
                        >
                            点此使用 License 激活您的产品
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default License;
