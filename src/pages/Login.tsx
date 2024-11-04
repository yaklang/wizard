import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, message, Spin } from 'antd';
import { useRequest } from 'ahooks';
import useLoginStore from '@/App/store/loginStore';
import permissionsSliceFn from '@/App/store/powerStore';
import { LoginIcon } from '@/assets/menu';
import login_logo from '@/assets/compoments/login_logo.png';
import login_background from '@/assets/login/login_background.png';
import { getCaptcha, postVerifyCaptcha } from '@/apis/login';
interface FieldType {
    username: string;
    password: string;
    verificationCode: string;
}

const { Item } = Form;
const { Password } = Input;

const Login = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const { login, token } = useLoginStore((state) => state);
    const { updatePower } = permissionsSliceFn();

    // 获取验证码
    const { data, run, loading } = useRequest(
        async () => {
            const { data } = await getCaptcha();
            return data;
        },
        { manual: true },
    );

    // 校验验证码
    const { run: verifyCaptchaRun } = useRequest(postVerifyCaptcha, {
        manual: true,
        onError: () => {
            message.destroy();
            message.error('验证码错误');
            form.setFieldValue('verificationCode', undefined);
            run();
        },
        onSuccess: async () => {
            const formValues = form.getFieldsValue();
            loginFn(formValues);
        },
    });

    useEffect(() => {
        // 登录限制，如果有token，并且token未过期，就不能打开login页
        if (token) {
            navigate('/');
        } else {
            run();
        }
    }, []);

    const loginFn = async (values: FieldType) => {
        await login(values);
        await updatePower();
        navigate('/');
        message.success('登陆成功');
    };

    // 登录
    const onFinish = async (values: FieldType): Promise<void> => {
        try {
            const verificationCode = values?.verificationCode;

            // 将输入验证码全转为小写
            const toLowerCaseVerificationCode =
                verificationCode &&
                verificationCode.replace(/[A-Za-z]/g, (char) =>
                    char.toLowerCase(),
                );
            await verifyCaptchaRun({
                captcha_id: data!.captcha_id,
                code: toLowerCaseVerificationCode,
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex h-full relative w-full">
            <div
                className="z-0 absolute top-0 left-0 z-0 h-full w-full "
                style={{
                    background: `url(${login_background}) lightgray 50% / cover no-repeat`,
                }}
            />
            <div className="flex h-full relative w-full z-1">
                <div className="relative pt-4 pl-4">
                    <div className="flex items-center gap-1">
                        <img src={login_logo} className="w-10 h-10" />
                        <div className="font-YouSheBiaoTiHei text-[25px] font-normal color=[#31343F]">
                            分布式平台
                            <div></div>
                        </div>
                    </div>
                </div>
                <Card
                    className="flex flex-col gap-6 w-102 pt-[16px]  m-auto rounded-5"
                    style={{
                        boxShadow: '0px 0px 32px 0px rgba(0,0,0,0.05)',
                        transform: 'translate(-88px, -44px)',
                    }}
                >
                    <div className="text-[20px] mb-6 font-bold relative flex content-center left-38/100">
                        <LoginIcon />
                        <div className="absolute top--2 left-2.5">登录</div>
                    </div>
                    <Form form={form} onFinish={onFinish}>
                        <Item<FieldType>
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入用户名字',
                                },
                            ]}
                        >
                            <Input
                                placeholder="请输入用户名字"
                                className="h-[52px] rounded-[12px] bg-[#F8F8F8]"
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
                            extra={
                                <Button
                                    className="p-0 mt-1 color-[#4A94F8]"
                                    type="link"
                                >
                                    忘记密码请联系管理员
                                </Button>
                            }
                        >
                            <Password
                                placeholder="请输入密码"
                                className="h-[52px] rounded-[12px] bg-[#F8F8F8]"
                            />
                        </Item>
                        <div className="relative">
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
                                    className="h-[52px] rounded-[12px] bg-[#F8F8F8]"
                                    maxLength={4}
                                />
                            </Item>
                            <div className="absolute right-3 top-2.5">
                                {!loading ? (
                                    <img
                                        className="cursor-pointer"
                                        onClick={() => run()}
                                        src={`data:image/png;base64,${data?.master_image_base64}`}
                                    />
                                ) : (
                                    <Spin
                                        spinning={loading}
                                        className="translate-y-1"
                                    ></Spin>
                                )}
                            </div>
                        </div>
                        <Item noStyle>
                            <Button
                                type="primary"
                                className="w-full h-[52px] rounded-[89px] text-5 font-medium mb-4"
                                style={{
                                    background:
                                        'linear-gradient(90deg, #68A6FA 0%, #4A94F8 100%)',
                                    fontFamily: 'PingFang HK',
                                }}
                                htmlType="submit"
                            >
                                登录
                            </Button>
                        </Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};
export default Login;
