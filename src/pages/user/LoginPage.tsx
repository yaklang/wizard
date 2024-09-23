import React, {useEffect, useState} from "react";
import '@ant-design/compatible/assets/index.css';
import {Button, Col, Form, Input, Layout, Row, Spin} from "antd";
import {Route, RouteComponentProps, Switch, withRouter} from "react-router-dom";
import {login, setAxiosBackendPalmPort} from "../../components/auth/Protected";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {TicketEventConfirm} from "../tickets/TicketConfirm";
import {getFrontendProjectName, PROJECT_NAME} from "../../routers/map";


const FormItem = Form.Item;

const LoginForm: React.FC<LoginFormProps> = (props: LoginFormProps) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(username, password, props.onLogin)
    };

    useEffect(() => {
        if (props.autoLogin) {
            let id = setInterval(() => {
                login(props.defaultUsername || "root", props.defaultPassword || "root", props.onLogin)
            }, 2000)
            return () => clearInterval(id)
        }
        return () => {
        }
    })

    if (props.autoLogin) {
        return <div style={{marginTop: 40}}>
            <Spin spinning={true} tip={"自动授权登录，你不需要控制这个步骤，但是第一次执行会初始化数据库以及迁移一些基础数据进去，第一次打开需要额外等待若干秒"}/>
        </div>
    }

    return <Form onSubmitCapture={onSubmit}>
        <Form.Item>
            <Input
                placeholder={"用户名"} value={username} onChange={e => setUsername(e.target.value)}
                prefix={<UserOutlined style={{color: "rgba(0,0,0,.25)"}}/>}
            />
        </Form.Item>
        <FormItem>
            <Input
                type={"password"}
                placeholder={"密码"} value={password} onChange={e => setPassword(e.target.value)}
                prefix={<LockOutlined style={{color: "rgba(0,0,0,.25)"}}/>}
            />
        </FormItem>
        <FormItem>
            <div style={{width: "100%", textAlign: "left"}}>
                <a className="login-form-forgot" aria-disabled={"true"}>
                    忘记密码请联系安全团队
                </a>
                <Button
                    style={{width: "100%"}}
                    type="primary" htmlType="submit"
                >
                    登录
                </Button>
            </div>
        </FormItem>
    </Form>
};

interface LoginFormProps {
    autoLogin?: boolean
    defaultUsername?: string
    defaultPassword?: string
    onLogin: (token: string) => any
    onLicenseAuth: () => any
}

export interface LoginPageProps extends LoginFormProps, RouteComponentProps {
}

const LoginPage: React.FC<LoginPageProps> = (p) => {
    if (getFrontendProjectName() == PROJECT_NAME.ELECTRON) {
        if (!!process.env.REACT_APP_BACKEND_PALM_PORT) {
            setAxiosBackendPalmPort(parseInt(process.env.REACT_APP_BACKEND_PALM_PORT))
        } else {
            setAxiosBackendPalmPort(8082)
        }
        return <LoginForm
            onLogin={p.onLogin} autoLogin={true} defaultUsername={"root"} defaultPassword={"toor"}
            onLicenseAuth={p.onLicenseAuth}
        />
    }

    return <div>
        <Layout style={{backgroundColor: "#fff"}}>
            <Switch>
                <Route path={"/ticket/confirm/:key"} children={props => {
                    return <div>
                        <TicketEventConfirm event_key={props.match?.params.key}/>
                    </div>
                }}/>
                <Route path={"/"} children={<div>
                    <Row>
                        <Col span={8}/>
                        <Col span={8}>
                            <div style={{marginTop: "30%"}}>
                                <h1>{(() => {
                                    switch (getFrontendProjectName()) {
                                        case PROJECT_NAME.FALCON:
                                            return "网络空间暴露面分析系统"
                                        case PROJECT_NAME.AWD:
                                            return "AWD 攻防平台"
                                        case PROJECT_NAME.PKI:
                                            return "Public Key Infrastructure"
                                        default:
                                            return "SIEM Professional Edition"
                                    }
                                })()}</h1>
                                <div style={{marginTop: 50}}>
                                    <LoginForm onLogin={p.onLogin} onLicenseAuth={p.onLicenseAuth}/>
                                </div>
                            </div>
                        </Col>
                        <Col span={8}/>
                    </Row>
                </div>}/>
            </Switch>

        </Layout>
    </div>
};


export default withRouter(LoginPage);
