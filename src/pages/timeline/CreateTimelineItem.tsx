import React, {useState} from "react";
import {Button, Col, Form, Input, Row} from "antd";
import {InputItem, SwitchItem} from "../../components/utils/InputUtils";
import {TimePoint} from "../../components/utils/TimeRange";
import moment from "moment";
import {CreateTimelineItemAPI} from "../../network/timelineAPI";

export interface CreateTimelineItemFormProp {
    defaultTitle?: string
    defaultAuthor?: string
    defaultContent?: string
    defaultTimestamp?: number
    freezeTitle?: boolean
    onSucceeded?: () => any
    onFailed?: () => any
    onFinally?: () => any
}

const {TextArea} = Input;

export const CreateTimelineItemForm: React.FC<CreateTimelineItemFormProp> = (props) => {
    const [notifyDing, setNotifyDing] = useState(true);
    const [title, setTitle] = useState<string>(props.defaultTitle || "");
    const [author, setAuthor] = useState<string>(props.defaultAuthor || "");
    const [content, setContent] = useState<string>(props.defaultContent || "");
    const [timestamp, setTimestamp] = useState<number>(props.defaultTimestamp || moment().unix());

    const submit = () => {
        CreateTimelineItemAPI({title, content, author, should_notify: !!notifyDing, timestamp}, () => {
            props.onSucceeded && props.onSucceeded()
        }, props.onFailed, props.onFinally)
    };

    return <div style={{marginTop: 50}}>
        <Row>
            <Col span={1}/>
            <Col span={21}>
                <Form layout={"vertical"} onSubmitCapture={e => {
                    e.preventDefault()

                    submit()
                }}>
                    <InputItem
                        label={"输入时间线事件标题"} value={title} setValue={setTitle} required={true}
                        disable={!!props.freezeTitle}
                    />
                    <Form.Item label={"设置事件在时间线上的事件"}>
                        <TimePoint value={timestamp} setValue={setTimestamp}/>
                    </Form.Item>
                    <SwitchItem label={"默认同步通知钉钉"} value={notifyDing} setValue={setNotifyDing}/>
                    <Form.Item label={"手动添加的事件内容"}>
                        <TextArea value={content} onSubmitCapture={e => {
                            e.preventDefault()
                        }} onChange={t => setContent(t.target.value)} rows={4}
                        />
                    </Form.Item>
                    <InputItem label={"Author"} value={author} setValue={setAuthor}/>
                    <Form.Item>
                        <Button type={"primary"} htmlType={"submit"}>创建事件</Button>
                    </Form.Item>
                </Form>
            </Col>
        </Row>
    </div>
};