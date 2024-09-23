import React, {useEffect, useState} from "react";
import {PageHeader, Tabs} from "antd";
import {FalconMonitorGroupTable} from "./MonitorGroupTable";
import {FalconBlacklistKeywordTable} from "./BlacklistKeywordTable";
import {FalconMonitorTaskTable} from "./MonitorTaskTable";
import {FalconCenterConfigPage} from "./CenterConfig";
import {FalconWeightConfigTable} from "./FalconWeightConfig";
import {FalconGitMonitorTaskPage} from "./gitleak/FalconGitMonitorTaskPage";
import {Palm} from "../gen/schema";
import {QueryCurrentPalmUser} from "../network/palmUserAPI";

export interface FalconConfigPageProp {
    onlyConfig?: boolean
}

export const FalconConfigPage: React.FC<FalconConfigPageProp> = (props) => {
    const [currentUser, setCurrentUser] = useState<Palm.PalmUser>();

    useEffect(()=>{
        QueryCurrentPalmUser({}, rsp => setCurrentUser({
            email: rsp.email || "",
            roles: rsp.role, username: rsp.username})
        )
    }, [])

    return <div>
        <Tabs>
            {props.onlyConfig ? <>

            </> : <>
                <Tabs.TabPane key={"task"} tab={"网络空间引擎监控任务配置"}>
                    <FalconMonitorTaskTable/>
                </Tabs.TabPane>
                {/*<Tabs.TabPane key={"github"} tab={"Github 监控任务配置"}>*/}
                {/*    <FalconGitMonitorTaskPage/>*/}
                {/*</Tabs.TabPane>*/}
            </>}
            <Tabs.TabPane key={"group"} tab={"监控组 / 调度任务组"}>
                <FalconMonitorGroupTable/>
            </Tabs.TabPane>
            <Tabs.TabPane key={"blacklist"} tab={"黑名单配置"}>
                <FalconBlacklistKeywordTable/>
            </Tabs.TabPane>
            <Tabs.TabPane key={"weight"} tab={"权重/打分配置"}>
                <FalconWeightConfigTable/>
            </Tabs.TabPane>
            {currentUser && currentUser.username == "root" ? <>
                <Tabs.TabPane key={"system"} tab={"系统配置"}>
                    <FalconCenterConfigPage/>
                </Tabs.TabPane>
            </> : <>
                
            </>}
        </Tabs>
    </div>
};
