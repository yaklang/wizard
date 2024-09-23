import React, {useEffect, useState} from "react";
import {Button, Form, Spin} from "antd";
import {CodeBlockItem, InputItem, ManyMultiSelectForString, SwitchItem} from "../../components/utils/InputUtils";
import {Palm} from "../../gen/schema";
import {GetTimelineFeedbackByInspect, TimelineFeedbackByInspector} from "../../network/ticketAPI";

export interface FeedbackByInspectorFormProp {
    id: number
    onSucceeded: () => any
    onFailed?: () => any
    onFinally?: () => any
}

export const FeedbackByInspectorForm: React.FC<FeedbackByInspectorFormProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState<Palm.FeedbackByInspector>({
        report_id: props.id, is_legally: false,
        tags: [], content: "", title: "", assignee: "",
    } as Palm.FeedbackByInspector);

    useEffect(() => {
        GetTimelineFeedbackByInspect({report_id: props.id}, rsp => {
            setFeedback(rsp)
        }, () => setTimeout(() => setLoading(false), 300))
    }, [])

    return <Spin spinning={loading}>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                setLoading(true)
                TimelineFeedbackByInspector({...feedback}, props.onSucceeded, props.onFailed, () => {
                    setTimeout(() => setLoading(false), 300)
                    props.onFinally && props.onFinally()
                })
            }}
        >
            <InputItem label={"反馈标题"} value={feedback.title} setValue={i => {
                setFeedback({...feedback, title: i})
            }}/>
            <SwitchItem label={"是否合规"} value={feedback.is_legally}
                        setValue={i => setFeedback({...feedback, is_legally: i})}/>
            <CodeBlockItem label={"反馈内容"} value={feedback.content} mode={"textile"}
                           setValue={content => setFeedback({...feedback, content})}
                           width={"100%"}
            />
            <InputItem
                label={"安全部处理人"}
                value={feedback.assignee}
                setValue={i => setFeedback({...feedback, assignee: i})}
                autoComplete={["namiaoxin@meicai.cn", "xuzhangyi@meicai.cn"]}
            />
            {/*
"SSO",
"人力",
"BI",
"合规",
"不合规",
"权限不合规",
"权限未及时清理",
"账号不合规",
"账号借用",
"多设备登录",
"多IP登录",
            */}
            <ManyMultiSelectForString label={"标记"} data={[
                "SSO",
                "人力",
                "BI",
                "合规",
                "不合规",
                "权限不合规",
                "权限未及时清理",
                "账号不合规",
                "账号借用",
                "多设备登录",
                "多IP登录",
            ].map(i => {
                return {value: i, label: i}
            })} mode={"tags"} value={feedback.tags.join(",")}
                                      setValue={tags => setFeedback({...feedback, tags: tags.split(",")})}/>
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}> 提交反馈 </Button>
            </Form.Item>
        </Form>
    </Spin>
};