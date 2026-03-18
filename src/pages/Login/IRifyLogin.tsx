import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, message, Modal, Spin } from 'antd';
import { showErrorMessage } from '@/utils/showErrorMessage';
import { useRequest, useSafeState } from 'ahooks';
import useLoginStore from '@/App/store/loginStore';
import permissionsSliceFn from '@/App/store/powerStore';
import { getAuth, getCaptcha, getLicense } from '@/apis/login';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import TechFlowAnimation from './components/TechFlowAnimation';
import IRifyLogo from './components/IRifyLogo';
import './styles/IRifyLogin.scss';

interface FieldType {
    username: string;
    password: string;
    verificationCode: string;
    code: string;
}

const { Item } = Form;
const { Password } = Input;

const IRifyLogin = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [modal, contextHolder] = Modal.useModal();
    const [buttonLoading, setButtonLoading] = useSafeState(false);

    const { login, token } = useLoginStore((state) => state);
    const { updatePower } = permissionsSliceFn();

    const { runAsync } = useRequest(
        async () => {
            const { data } = await getLicense();
            const { license } = data;
            return license?.length > 0 ? license : undefined;
        },
        {
            manual: true,
            onSuccess: (license) => {
                if (license) {
                    return navigate('/license', { state: { license } });
                }
                if (token) {
                    return navigate('/');
                }
                run();
            },
        },
    );

    const { data, run, loading } = useRequest(
        async () => {
            const { data } = await getCaptcha();
            return data;
        },
        { manual: true, onSuccess: () => setButtonLoading(false) },
    );

    const { run: authRun } = useRequest(getAuth, {
        manual: true,
        onSuccess: async (res) => {
            if (res.data.status) {
                confirm();
            } else {
                const formValues = await form.validateFields();
                const verificationCode = formValues?.verificationCode;
                const toLowerCaseVerificationCode =
                    verificationCode &&
                    verificationCode.replace(/[A-Za-z]/g, (char: string) =>
                        char.toLowerCase(),
                    );
                loginFn({
                    ...formValues,
                    code: toLowerCaseVerificationCode,
                    captcha_id: data?.captcha_id,
                    verificationCode: undefined,
                });
            }
        },
        onError: () => {
            message.destroy();
            showErrorMessage('登录失败');
        },
    });

    useEffect(() => {
        runAsync();
    }, []);

    const confirm = () => {
        modal.confirm({
            title: '提示',
            icon: <ExclamationCircleOutlined />,
            content: '当前账号已登录，是否强制登录？',
            okText: '确认',
            cancelText: '取消',
            async onOk() {
                const formValues = form.getFieldsValue();
                const verificationCode = formValues?.verificationCode;
                const toLowerCaseVerificationCode =
                    verificationCode &&
                    verificationCode.replace(/[A-Za-z]/g, (char: string) =>
                        char.toLowerCase(),
                    );
                await loginFn({
                    ...formValues,
                    code: toLowerCaseVerificationCode,
                    captcha_id: data?.captcha_id,
                    verificationCode: undefined,
                });
                setButtonLoading(false);
            },
            onCancel() {
                setButtonLoading(false);
            },
        });
    };

    const loginFn = async (values: FieldType) => {
        try {
            await login(values)
                .then(() => {
                    updatePower();
                    navigate('/');
                })
                .catch((err) => {
                    form.setFieldValue('verificationCode', undefined);
                    message.destroy();
                    showErrorMessage(err);
                    run();
                });
        } catch {
            setButtonLoading(false);
        } finally {
            setButtonLoading(false);
        }
    };

    const onFinish = async (): Promise<void> => {
        try {
            setButtonLoading(true);
            await authRun(form.getFieldValue('username'));
        } catch (err) {
            setButtonLoading(false);
            console.error(err);
        }
    };

    return (
        <div className="irify-login-container">
            <div className="irify-login-left">
                <div className="irify-login-content">
                    <div className="irify-login-header">
                        <IRifyLogo />
                    </div>
                    <TechFlowAnimation />
                </div>
            </div>

            <div className="irify-login-right">
                <Card className="irify-login-card">
                    <div className="irify-login-card-title">
                        <span>登录</span>
                    </div>
                    <div className="irify-login-subtitle">
                        Welcome to IRify
                    </div>
                    <div className="irify-tech-brief">
                        基于 SSA IR 的数据流分析 · Phi 指令控制流 · Use-Def 链追踪
                    </div>

                    <Form form={form} onFinish={onFinish}>
                        <Item<FieldType>
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入用户名',
                                },
                            ]}
                        >
                            <Input
                                placeholder="请输入用户名"
                                className="irify-input"
                            />
                        </Item>

                        <Item<FieldType>
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入密码',
                                },
                            ]}
                        >
                            <Password
                                placeholder="请输入密码"
                                className="irify-input"
                            />
                        </Item>

                        <div className="irify-verification-wrapper">
                            <Item<FieldType>
                                name="verificationCode"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入验证码',
                                    },
                                    {
                                        min: 4,
                                        message: '验证码格式不正确',
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="请输入验证码"
                                    className="irify-input"
                                    maxLength={4}
                                />
                            </Item>
                            <div className="irify-captcha-wrapper">
                                {!loading ? (
                                    <img
                                        className="irify-captcha-image"
                                        onClick={() => run()}
                                        src={`data:image/png;base64,${data?.master_image_base64}`}
                                        alt="验证码"
                                    />
                                ) : (
                                    <Spin spinning={loading} />
                                )}
                            </div>
                        </div>

                        <Item noStyle>
                            <Button
                                type="primary"
                                className="irify-login-button"
                                htmlType="submit"
                                loading={buttonLoading}
                            >
                                登录
                            </Button>
                        </Item>
                    </Form>
                </Card>
            </div>

            {contextHolder}
        </div>
    );
};

export default IRifyLogin;
