import React, {useState} from "react";
import {Button, Form, Modal, Upload} from "antd";
import {LogoutOutlined, InboxOutlined} from "@ant-design/icons";
import {InputItem} from "../../components/utils/InputUtils";

import {getAuthTokenFromLocalStorage} from "../../components/auth/Protected";

export interface UploadMaterialFileFormProp {

}

const {Dragger} = Upload;

export const UploadMaterialFileForm: React.FC<UploadMaterialFileFormProp> = (props) => {
    const [fileName, setFileName] = useState("");

    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()
        }}>
            {/*<InputItem label={""} value={params.task_id}*/}
            {/*           setValue={*/}
            {/*               task_id => setParams({...params, task_id})*/}
            {/*           }/>*/}
            <InputItem label={"存储的文件名"} value={fileName} setValue={setFileName}/>
            <Form.Item>
                <Dragger
                    multiple={false}
                    name={"file"} action={("/material/files")}
                    headers={{
                        Authorization: getAuthTokenFromLocalStorage() || ""
                    }}
                    beforeUpload={(file, list) => {
                        if (!!fileName) {
                            return true
                        }

                        Modal.error({
                            title: `fileName is empty`
                        });

                        return false
                    }}
                    showUploadList={true}
                    data={{file_name: fileName}}
                    onChange={info => {
                        switch (info.file.status) {
                            case "success":
                                Modal.info({
                                    title: `Upload Done: ${info.file.fileName} as ${fileName}`
                                })
                            case "error":
                                Modal.error({
                                    title: `Upload Failed: ${JSON.stringify(info.file.error)} reason: ${JSON.stringify(info.file.response)}`
                                })
                        }
                    }}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined/>
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">
                        Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                        band files
                    </p>
                </Dragger>
            </Form.Item>
        </Form>
    </div>
};