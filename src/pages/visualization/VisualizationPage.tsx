import React from "react";
import {Button, Modal, PageHeader} from "antd";
import {GraphBasicInfoTable} from "./GraphBasicInfoTable";
import {CreateDrawScriptTask} from "./CreateDrawScriptTask";

export const VisualizationPage: React.FC = () => {
    return <div>
        <PageHeader title={"数据可视化"} subTitle={"数据可视化的统一接口，所有的可以看到的图都在这里有记录和展示"}>
            <div className={"div-left"}>
                <Button.Group>
                    {/*<Button*/}
                    {/*    onClick={e => {*/}
                    {/*        Modal.info({*/}
                    {/*            content: <div>*/}

                    {/*            </div>*/}
                    {/*        })*/}
                    {/*    }}*/}
                    {/*>查看绘图脚本教程</Button>*/}
                    <Button
                        type={"primary"}
                        onClick={e => {
                            Modal.info({
                                width: "50%",
                                title: "创建绘图脚本",
                                content: <div>
                                    <CreateDrawScriptTask/>
                                </div>
                            })
                        }}>创建绘图脚本</Button>
                </Button.Group>
            </div>
        </PageHeader>
        <GraphBasicInfoTable/>
    </div>
};