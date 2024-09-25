import { useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Card, Form, Input, message } from "antd";

import { useSafeState } from "ahooks";

import useLoginStore from "@/App/store/loginStore";
import permissionsSliceFn from "@/App/store/powerStore";
import { LoginIcon } from "@/assets/menu";
import { Captcha } from "@/compoments";

import login_logo from "@/assets/compoments/login_logo.png";
import login_background from "@/assets/login/login_background.png";
import header_text from "@/assets/login/header_text.png";

interface FieldType {
  user: string;
  password: string;
  verificationCode: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [captcha, setCaptcha] = useSafeState<string>("");

  const { login, token } = useLoginStore((state) => state);
  const { updatePower } = permissionsSliceFn();

  useEffect(() => {
    // 登录限制，如果有token，并且token未过期，就不能打开login页
    if (token) {
      navigate("/projectManagement");
    }
  }, []);

  // 登录
  const submit = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      console.log(values, "values");
      const { verificationCode } = values;
      if (verificationCode === captcha) {
        await login(values);
        await updatePower();
        navigate("/");
      } else {
        message.error("验证码错误");
      }
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
            <img src={header_text} className="h-[22px]" />
          </div>
        </div>
        <Card
          className="flex flex-col gap-6 w-102 pt-[16px]  m-auto rounded-5"
          style={{
            boxShadow: "0px 0px 32px 0px rgba(0,0,0,0.05)",
            transform: "translate(-88px, -44px)",
          }}
        >
          <div className="text-[20px] mb-6 font-bold relative flex content-center left-38/100">
            <LoginIcon />
            <div className="absolute top--2 left-2.5">登录</div>
          </div>
          <Form form={form}>
            <Form.Item<FieldType>
              name="user"
              rules={[
                {
                  required: true,
                  message: "请输入用户名字",
                },
              ]}
            >
              <Input
                placeholder="请输入用户名字"
                className="h-[52px] rounded-[12px] bg-[#F8F8F8]"
              />
            </Form.Item>
            <Form.Item<FieldType>
              name="password"
              rules={[
                {
                  required: true,
                  message: "请输入密码",
                },
              ]}
              extra={
                <Button className="p-0 mt-1 color-[#4A94F8]" type="link">
                  忘记密码请联系管理员
                </Button>
              }
            >
              <Input
                placeholder="请输入密码"
                className="h-[52px] rounded-[12px] bg-[#F8F8F8]"
              />
            </Form.Item>
            <div className="relative">
              <Form.Item<FieldType>
                name="verificationCode"
                rules={[
                  {
                    required: true,
                    message: "请输入验证码",
                  },
                ]}
              >
                <Input
                  placeholder="请输入验证码"
                  className="h-[52px] rounded-[12px] bg-[#F8F8F8]"
                  maxLength={4}
                />
              </Form.Item>
              <div className="absolute right-3 top-2.5">
                <Captcha
                  onChange={(e) => {
                    setCaptcha(e);
                  }}
                />
              </div>
            </div>
          </Form>
          <Button
            type="primary"
            className="w-full h-[52px] rounded-[89px] text-5 font-medium mb-4"
            style={{
              background: "linear-gradient(90deg, #68A6FA 0%, #4A94F8 100%)",
              fontFamily: "PingFang HK",
            }}
            onClick={submit}
          >
            登录
          </Button>
        </Card>
      </div>
    </div>
  );
};
export default Login;
