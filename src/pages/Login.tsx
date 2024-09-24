import useLoginStore from "@/App/store/loginStore";
import { useCountDown } from "@/hooks";
import { Button, Card, Form, Input, message } from "antd";
import { useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
// import { getCode } from "@/apis/login/login";
import permissionsSliceFn from "@/App/store/powerStore";

interface LoginStateType {
  loading: boolean;
}
interface FieldType {
  mobile: string;
  verificationCode: string;
}

const initialValue: LoginStateType = {
  loading: false,
};
const reducer = (state: LoginStateType, payload: LoginStateType) => ({
  ...state,
  ...payload,
});

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [state, dispatch] = useReducer(reducer, initialValue);
  const { loading } = state;

  const { login, token } = useLoginStore((state) => state);
  const { updatePower } = permissionsSliceFn();

  useEffect(() => {
    // 登录限制，如果有token，并且token未过期，就不能打开login页
    if (token) {
      navigate("/projectManagement");
    }
  }, []);

  // 倒计时 获取验证码
  const [countdown, start, clear] = useCountDown(60);
  const handleStart = async (): Promise<void> => {
    const { mobile } = form.getFieldsValue();
    if (!mobile) {
      message.error("请先输入手机号");
      return;
    }
    // await getCode(mobile);
    start();
  };

  // 登录
  const submit = async (): Promise<void> => {
    dispatch({ loading: true });
    try {
      const values = form.getFieldsValue();
      await login(values);
      await updatePower();
      clear();
      navigate("/");
    } finally {
      dispatch({ loading: false });
    }
  };

  return (
    <div className="flex h-full relative">
      <div className="w-5/8 bg-[#F8FAFC] relative">
        1
        <div className="flex items-center h-full">
          {/* pt-64 */}
          <div className="flex flex-col items-center justify-center w-5/7 translate-y-[-16px]">
            2 3
            <div className="text-sm text-center">
              <div className="mb-2 mt-6">占位</div>
              <div
                className=" flex items-center justify-center"
                style={{ color: "rgba(0, 0, 0, 0.25)" }}
              >
                占位
                <span
                  className="hover:text-[#1677FF] login-record-number"
                  onClick={() => window.open("https://beian.miit.gov.cn/")}
                >
                  占位
                </span>
              </div>
            </div>
          </div>
        </div>
        4
      </div>
      <div className="flex-1 bg-[#1677FF] relative">5</div>
      <Card
        className="flex flex-col gap-6 w-110 h-[440px] pt-[72px] px-[53px] absolute top-0 left-26/100 right-0 bottom-0 m-auto"
        style={{
          boxShadow: "0px 0px 32px 0px rgba(0,0,0,0.05)",
          transform: "translateY(-44px)",
        }}
      >
        <div className="text-[20px] mb-6 font-bold">账号登录</div>
        <Form form={form}>
          <Form.Item<FieldType>
            name="mobile"
            rules={[
              {
                required: true,
                message: "请输入手机号",
              },
              {
                max: 11,
                message: "请输入正确的手机号",
              },
              {
                min: 11,
                message: "请输入正确的手机号",
              },
            ]}
          >
            <Input placeholder="请输入手机号" style={{ height: "48px" }} />
          </Form.Item>
          <div className="relative">
            <Form.Item<FieldType>
              name="verificationCode"
              rules={[
                {
                  required: true,
                  message: "请输入短信验证码",
                },
                { pattern: /^\d{6}$/, message: "请输入正确的短信验证码" },
              ]}
            >
              <Input placeholder="请输入验证码" style={{ height: "48px" }} />
            </Form.Item>
            <Button
              className="absolute right-0 top-2"
              type="link"
              disabled={countdown !== 0}
              onClick={handleStart}
            >
              {countdown === 0 ? "" : `${countdown}s`} 获取验证码
            </Button>
          </div>
        </Form>
        <Button
          type="primary"
          className="w-full h-12"
          onClick={submit}
          loading={loading}
        >
          登录
        </Button>
      </Card>
    </div>
  );
};
export default Login;
