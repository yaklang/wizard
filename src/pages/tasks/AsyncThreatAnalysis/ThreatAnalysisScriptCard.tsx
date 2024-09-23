import {Palm} from "../../../gen/schema";
import React from "react";
import {Button, Card, Tooltip, Modal, Popconfirm, Popover, Space, notification} from "antd";
import {CreateThreatAnalysisScript} from "./CreateThreatAnalysisScript";
import {CreateThreatAnalysisTask} from "./CreateThreatAnalysisTask";
import {
    DeleteThreatAnalysisScript,
    UpdateThreatAnalysisScriptTags,
} from "../../../network/threatAnalysisAPI";
import {OneLine} from "../../../components/utils/OneLine";
import {EditableTagsGroup} from "../../../components/utils/InputUtils";
import {LimitedTextBox} from "../../../components/utils/LimitedTextBox";
import {showDrawer, showModal} from "../../../yaklang/utils";
import {
    SettingOutlined,
    EditOutlined,
    CopyOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import {CreateNewDistributedScriptForm} from "../../batchInvokingScript/BatchInvokingScriptPage";
import "./ThreatAnalysisScriptCard.css"

export interface ThreatAnalysisScriptCardProp
    extends Palm.ThreatAnalysisScript {
    onlyStartTask?: boolean;
    noAction?: boolean;
    distributedMode?: boolean;
    onClick?: (i: Palm.ThreatAnalysisScript) => any;
    onScriptTableUpdated?: () => any;
    // 是否屏蔽部分操作项
    shieldOperate?: boolean;
    // 是否简洁化卡片操作面板
    simpleAutoCardOpt?: boolean;
}

export const ThreatAnalysisScriptCard: React.FC<ThreatAnalysisScriptCardProp> = (item) => {
    const {shieldOperate = false, simpleAutoCardOpt = false} = item;
    const optArray = [
        {noCopyNew: true, verbose: "修改", type: "primary"},
        {noCopyNew: false, verbose: "复制", type: "link"},
    ];

    const btnClick = (e: any) => {
        let m = showDrawer({
            title: "复制 / 更新该插件脚本",
            width: "60%",
            content: (
                <>
                    {item.distributedMode ? (
                        <CreateNewDistributedScriptForm
                            onCreated={() => {
                                item.onScriptTableUpdated && item.onScriptTableUpdated();
                            }}
                            name={item.type}
                            noCopyNew={e.noCopyNew}
                            setPluginFlag={false}
                        />
                    ) : (
                        <CreateThreatAnalysisScript
                            templateType={item.type}
                            noCopyNew={e.noCopyNew}
                            onCreated={() => {
                                m.destroy();
                                item.onScriptTableUpdated && item.onScriptTableUpdated();
                            }}
                        />
                    )}
                </>
            ),
        });
    };

    const confirmClick = () => {
        DeleteThreatAnalysisScript(
            {type: item.type},
            () => {
            },
            () => {
                item.onScriptTableUpdated && item.onScriptTableUpdated();
            }
        );
    };

    const deleteItem = () => {
        return (
            <Popconfirm title={"确认删除？不可恢复"} onConfirm={confirmClick}>
                <Button
                    hidden={item.onlyStartTask}
                    size={"small"}
                    type={"dashed"}
                    danger={true}
                >
                    删除
                </Button>
            </Popconfirm>
        );
    };

    const modifiedItem = () => {
        return (
            <>
                <Button.Group>
                    {optArray.map((e) => {
                        return (
                            <Button
                                type={e.type as any}
                                size={"small"}
                                hidden={item.onlyStartTask}
                                onClick={() => btnClick(e)}
                            >
                                {e.verbose}
                            </Button>
                        );
                    })}
                </Button.Group>
            </>
        );
    };

    let actions = [
        modifiedItem(),
        <Button
            size={"small"}
            type={"primary"}
            onClick={() => {
                let m = Modal.info({
                    width: "70%",
                    okText: "关闭 / ESC",
                    okType: "danger",
                    icon: false,
                    content: (
                        <>
                            <CreateThreatAnalysisTask
                                disallowChangeScriptType={true}
                                defaultTask={
                                    {data: item.example_params || ""} as Palm.ThreatAnalysisTask
                                }
                                defaultScriptType={item.type}
                                hideType={true}
                                onCreated={(task_id, sched) => {
                                    m.destroy();
                                }}
                                onFailed={() => {
                                    Modal.error({title: "创建任务失败，可能是参数问题"});
                                }}
                            />
                        </>
                    ),
                });
            }}
        >
            启动任务
        </Button>,
        deleteItem(),
    ];

    if (item.onlyStartTask) {
        actions = [
            <Button
                style={{width: "60%"}}
                type={"primary"}
                onClick={() => {
                    let m = Modal.info({
                        width: "60%",
                        icon: false,
                        content: (
                            <>
                                <CreateThreatAnalysisTask
                                    disallowChangeScriptType={true}
                                    defaultTask={
                                        {
                                            data: item.example_params || "",
                                        } as Palm.ThreatAnalysisTask
                                    }
                                    defaultScriptType={item.type}
                                    hideType={true}
                                    onCreated={() => {
                                        m.destroy();
                                    }}
                                />
                            </>
                        ),
                        okButtonProps: {hidden: true},
                    });
                }}
            >
                启动任务
            </Button>,
        ];
    }

    if (item.noAction) {
        actions = [];
    }

    if (!!item.onClick) {
        actions.splice(
            0,
            2,
            <Popconfirm
                title={"确认使用该脚本吗？"}
                onConfirm={() => {
                    if (item.onClick) {
                        item.onClick(item as Palm.ThreatAnalysisScript);
                    }
                }}
            >
                <Button type={"primary"} size={"small"}>
                    使用该脚本
                </Button>
            </Popconfirm>
        );
    }

    const simpleButtonList = () => {
        return (
            <Space direction={"horizontal"} className="simple-button-list-space">
                {optArray.map((e) => {
                    if (e.verbose === "修改") {
                        return <Tooltip title="编辑"><EditOutlined className="opt-hover"
                                                                 onClick={() => btnClick(e)}/></Tooltip>;
                    } else {
                        return <Tooltip title="复制 / 更新"><CopyOutlined className="opt-hover"
                                                                      onClick={() => btnClick(e)}/></Tooltip>;
                    }
                })}
                <Popconfirm title={"确认删除？不可恢复"} onConfirm={confirmClick}>
                    <DeleteOutlined className="del-hover"/>
                </Popconfirm>
            </Space>
        );
    };

    return (
        <>
            <Card
                title={<>{item.type}</>}
                size={"small"}
                actions={actions}
                hoverable={!!item.onClick}
                extra={
                    <>
                        {!shieldOperate ? (
                            <>
                                {simpleAutoCardOpt ? (
                                    <>{simpleButtonList()}</>
                                ) : (
                                    <Popover
                                        title={"配置"}
                                        content={
                                            <Space direction={"vertical"}>
                                                {modifiedItem()}
                                                {deleteItem()}
                                            </Space>
                                        }
                                    >
                                        <Button
                                            type={"link"}
                                            size={"small"}
                                            icon={<SettingOutlined/>}
                                        />
                                    </Popover>
                                )}
                            </>
                        ):<a style={{fontSize:12}} onClick={() => btnClick(optArray[0])}>修改</a>}
                    </>
                }
            >
                <OneLine width={"100%"}>
                    <div>
                        <EditableTagsGroup
                            noOperations={true}
                            tags={item.tags}
                            randomColor={true}
                            onTags={(tags) => {
                                UpdateThreatAnalysisScriptTags(
                                    {
                                        script_type: item.type,
                                        op: "set",
                                        tags: tags.join(","),
                                    },
                                    () => {
                                        notification["info"]({message: "更新 Tag 成功"});
                                    },
                                    () => {
                                        notification["error"]({message: "更新 Tag 失败"});
                                    }
                                );
                            }}
                        />
                    </div>
                </OneLine>
                <br/>
                <LimitedTextBox text={item.description} width={"100%"} height={80}/>
            </Card>
        </>
    );
};
