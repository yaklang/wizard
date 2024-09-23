import React from "react";
import {Button, Modal, PageHeader, Popover} from "antd";
import {MaterialFileTable} from "./MaterialFileTable";
import {UploadMaterialFileForm} from "../asset/UploadMaterialFile";
import {CheckGeoLite2Available, InitGeoLite2, ResetGeoLite2} from "../../network/materialFilesAPI";

export interface MaterialFilesPageAPI {
    state: MaterialFilesPageState
    dispatch: React.Dispatch<MaterialFilesPageAction>
}

export type MaterialFilesPageAction =
    | { type: "unimplemented" }
    ;

export interface MaterialFilesPageState {

}

const MaterialFilesPageInitState = {}
export const MaterialFilesPageContext = React.createContext<MaterialFilesPageAPI>(null as unknown as MaterialFilesPageAPI);
const reducer: React.Reducer<MaterialFilesPageState, MaterialFilesPageAction> = (state, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

export interface MaterialFilesPageProp {

}

export const MaterialFilesPage: React.FC<MaterialFilesPageProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer, MaterialFilesPageInitState);

    return <MaterialFilesPageContext.Provider value={{state, dispatch}}>
        <PageHeader
            title={"资料交换网盘"} extra={[
            <Button type={"primary"}
                    onClick={e => {
                        Modal.info({
                            title: "上传文件",
                            width: "50%",
                            content: <div style={{marginTop: 20}}>
                                <UploadMaterialFileForm/>
                            </div>
                        })
                    }}
            >上传文件/暂存文件</Button>
        ]} subTitle={"存储文件，管理已经存在的文件，甚至你可以在特殊脚本中使用特定类型的文件"}
        >
            {/*<div className={"div-left"}>*/}
            {/*    <Button.Group>*/}
            {/*        <Popover title={"GeoLite2 操作"}*/}
            {/*                 content={<div>*/}
            {/*                     <Button size={"small"}*/}
            {/*                             onClick={e => {*/}
            {/*                                 CheckGeoLite2Available({}, e => {*/}
            {/*                                     Modal.info({*/}
            {/*                                         title: "GeoLite2 当前可用",*/}
            {/*                                     })*/}
            {/*                                 })*/}
            {/*                             }}*/}
            {/*                     >检查是否可用</Button>*/}
            {/*                     <Button*/}
            {/*                         size={"small"}*/}
            {/*                         onClick={e => {*/}
            {/*                             InitGeoLite2({}, e => {*/}
            {/*                                 Modal.info({*/}
            {/*                                     title: "GeoLite2 当前可用",*/}
            {/*                                 })*/}
            {/*                             }, () => {*/}
            {/*                                 Modal.error({title: "GeoGeioLite2 初始化失败，物料错误"})*/}
            {/*                             })*/}
            {/*                         }}*/}
            {/*                     >初始化 GeoLite2</Button>*/}
            {/*                     <Button size={"small"}*/}
            {/*                             onClick={e => {*/}
            {/*                                 ResetGeoLite2({}, e => {*/}
            {/*                                     Modal.info({*/}
            {/*                                         title: "GeoLite2 当前可用",*/}
            {/*                                     })*/}
            {/*                                 }, () => {*/}
            {/*                                     Modal.error({title: "GeoGeioLite2 初始化失败，物料错误"})*/}
            {/*                                 })*/}
            {/*                             }}*/}
            {/*                     >重置 GeoLite2</Button>*/}
            {/*                 </div>}*/}
            {/*        >*/}
            {/*            <Button type={"primary"}>GeoLite2 Operations</Button>*/}
            {/*        </Popover>*/}
            {/*    </Button.Group>*/}
            {/*</div>*/}
        </PageHeader>

        <MaterialFileTable/>
    </MaterialFilesPageContext.Provider>
};
