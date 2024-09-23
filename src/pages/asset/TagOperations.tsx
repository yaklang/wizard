import React, {useState} from "react";
import {Button, Form, Modal} from "antd";
import {ManyMultiSelectForString} from "../../components/utils/InputUtils";
import {CheckboxOptionType} from "antd/lib/checkbox";
import {
    createUpdateAssetsTagsFunc,
    QueryAssetsDomainParams,
    QueryAssetsHostParams,
    QueryAssetsPortParams
} from "../../network/assetsAPI";

export interface AppendTagProps {
    options: CheckboxOptionType[]
    type: "domain" | "host" | "port"
    mode?: "replace" | "" | "append"
    filter?: QueryAssetsDomainParams | QueryAssetsHostParams | QueryAssetsPortParams
    onSubmitting?: () => any
    onFinished?: () => any
    onFinally?: () => any
}

export const ModifyTags: React.FC<AppendTagProps> = (p) => {
    const [tags, setTags] = useState<string>("");
    return <div>
        <Form layout={"inline"} onSubmitCapture={e => {
            e.preventDefault();

            const submit = () => {
                const handler = createUpdateAssetsTagsFunc(`/assets/${p.type}/tags`)
                handler(-1, tags.split(","), () => {
                    p.onFinished && p.onFinished()
                }, p.onFinally, p.mode || "", p.filter)
            };

            switch (p.mode) {
                case "replace":
                    Modal.warn({
                        title: "危险操作",
                        content: <>
                            <p>将会批量替换/清除已有 Tags，确认操作吗？</p>
                        </>,
                        onOk: () => {
                            submit()
                        },
                        onCancel: () => {

                        }
                    })
                    return
                case "append":
                    Modal.info({
                        title: "追加标签",
                        content: <>
                            <p>追加在现有标签后</p>
                        </>,
                        onOk: () => {
                            submit()
                        },
                        onCancel: () => {

                        }
                    })
                    return;
            }
            submit();
            return;
        }}>
            <ManyMultiSelectForString
                label={"输入 Tags"} mode={"tags"} data={p.options}
                value={tags} setValue={setTags}
            />
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>更新</Button>
            </Form.Item>
        </Form>
    </div>
};