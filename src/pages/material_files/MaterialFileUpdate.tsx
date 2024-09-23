import React, {useState} from "react";
import {Button, Form, Modal} from "antd";
import {InputItem} from "../../components/utils/InputUtils";
import {QueryMaterialFiles, UpdateMaterialFileDetail} from "../../network/materialFilesAPI";
import {Palm} from "../../gen/schema";

export interface MaterialFileUpdateFormProp {
    old_filename: string
    old_filetype: string
    description: string
}

export const MaterialFileUpdateForm: React.FC<MaterialFileUpdateFormProp> = (props) => {
    const [detail, setDetail] = useState<Palm.MaterialFileDetail>({
        description: props.description,
        new_filename: props.old_filename,
        new_filetype: props.old_filetype,
    });
    const [origin, setOrigin] = useState(props.old_filename);

    return <div style={{marginTop: 20}}>
        <Form layout={"vertical"} onSubmitCapture={e => {
            e.preventDefault();

            UpdateMaterialFileDetail({target_filename: origin, detail: {...detail}}, () => {
                Modal.info({title: "更新物料文件成功"})
            })
        }}>
            <InputItem label={"原始文件名"} value={origin} disable={true}/>
            <InputItem label={"新文件名"} value={detail.new_filename}
                       setValue={i => setDetail({...detail, new_filename: i})}
            />
            <InputItem
                label={"描述信息（Description）"}
                value={detail.description} setValue={i => setDetail({...detail, description: i})}
            />
            {!!props.old_filetype ? "" : <InputItem
                label={"文件类型"}
                value={detail.new_filetype} setValue={i => setDetail({...detail, new_filetype: i})}
            />}

            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>更新</Button>
            </Form.Item>
        </Form>
    </div>
};