import React from "react";
import {Markdown} from "../components/utils/Markdown";
import {Space, Tabs} from "antd";
import {QuakeMarkdown} from "./helperData/quake";
import {ShodanMarkdown} from "./helperData/shodan";
import {FofaMarkdown} from "./helperData/fofa";

export interface SpaceEngineHelperProp {

}

const helper = `# Fofa / Shodan / Quake 引擎特点以及配置简介

## 快速开始

#### 最常用：同时检查 Title 和 HTML 中的关键字

    # quake常用语法
    title:"国家电网" AND response:"系统"
    
    # shodan常用语法
    title:"国家电网" html:"系统"

    # fofa常用语法
    title="国家电网" && body="系统"
    
`

export const SpaceEngineHelper: React.FC<SpaceEngineHelperProp> = (props) => {
    return <div style={{margin: 12}}>
        <Space direction={"vertical"}>
            <Markdown children={helper} skipHtml={false} escapeHtml={false}/>
            <Tabs>
                <Tabs.TabPane tab={"Shodan"} key={"shodan"}>
                    <Markdown children={ShodanMarkdown} skipHtml={false} escapeHtml={false}/>
                </Tabs.TabPane>
                <Tabs.TabPane tab={"Fofa"} key={"Fofa"}>
                    <Markdown children={FofaMarkdown} skipHtml={false} escapeHtml={false}/>
                </Tabs.TabPane>
                <Tabs.TabPane tab={"Quake"} key={"quake"}>
                    <Markdown children={QuakeMarkdown} skipHtml={false} escapeHtml={false}/>
                </Tabs.TabPane>
            </Tabs>
        </Space>
    </div>
};