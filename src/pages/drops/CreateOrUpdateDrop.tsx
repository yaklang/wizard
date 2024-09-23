import React, {useEffect, useState} from "react";
import {Palm} from "../../gen/schema";
import {Button, Form, Modal, notification, Spin} from "antd";
import {InputItem} from "../../components/utils/InputUtils";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
// import style manually
import 'react-markdown-editor-lite/lib/index.css';
import {queryDrop, updateOrCreateDrop} from "../../network/dropsAPI";

export interface CreateOrUpdateDropByIdProp {
    id?: number
}

export const CreateOrUpdateDropById: React.FC<CreateOrUpdateDropByIdProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [drop, setDrop] = useState({} as Palm.Drop);

    useEffect(() => {
        if (props.id && props.id > 0) {
            queryDrop(props.id, setDrop, () => setTimeout(() => setLoading(false), 300))
        } else {
            setTimeout(() => setLoading(false), 200)
        }
    }, [props.id])

    return <Spin spinning={loading}>
        <CreateOrUpdateDrop drop={drop}/>
    </Spin>
};

const mdParser = new MarkdownIt();

export interface CreateOrUpdateDropProps {
    drop?: Palm.Drop
}

export const CreateOrUpdateDrop: React.FC<CreateOrUpdateDropProps> = (p) => {
    const [newDrop, setNewDrop] = useState<Palm.NewDrop>({
        title: "", markdown: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setNewDrop({
            title: p?.drop?.title || "",
            author: p?.drop?.author,
            markdown: p?.drop?.markdown || "",
            id: p?.drop?.id || 0,
        })
    }, [p.drop]);

    return <Spin spinning={loading}>
        <br/>
        <Form
            layout={"vertical"}
            onSubmitCapture={e => {
                e.preventDefault()

                setLoading(true)

                updateOrCreateDrop(newDrop, () => {
                    Modal.info({title: `文章 ${newDrop.title} 已经更新到服务器`})
                }, () => setTimeout(() => setLoading(false), 300))
            }}
        >
            <InputItem label={"文章标题"} value={newDrop?.title}
                       setValue={value => setNewDrop({...newDrop, title: value || ""})}/>
            <InputItem label={"文章作者"} value={newDrop?.author}
                       setValue={author => setNewDrop({...newDrop, author})}
            />
            <Form.Item label={"文章内容"}>
                <MdEditor
                    canView={{
                        menu: true,
                        md: true,
                        html: true,
                        both: true,
                        fullScreen: true,
                        hideMenu: false,
                    }}
                    value={newDrop.markdown}
                    renderHTML={(text) => mdParser.render(text)}
                    onChange={({html, text}) => {
                        setNewDrop({...newDrop, markdown: text})
                    }}
                />

            </Form.Item>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>创建/更新文章</Button>
            </Form.Item>
        </Form>
    </Spin>
}