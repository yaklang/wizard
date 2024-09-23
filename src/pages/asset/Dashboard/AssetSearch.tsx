import React from "react";
import {Button, Input, Modal} from "antd";
import {AssetPortsTable} from "../AssetsPorts";
import {AssetsDomainsTable} from "../AssetsDomains";
import {AssetsHostsTable} from "../AssetsHosts";

export interface AssetSearchProp {
    size?: "small" | "middle" | "large" | undefined
    value: string
    setValue: (s: string) => any
    onSearch: (s: string) => any
}

export const AssetSearch: React.FC<AssetSearchProp> = (props) => {
    return <>
        {/*<Input.Search*/}
        {/*    placeholder="模糊搜索域名/IP地址/部分IP地址/任何你想要的结果"*/}
        {/*    size={props.size}*/}
        {/*    value={props.value}*/}
        {/*    enterButton={"搜索已知资产"} width={400}*/}
        {/*    onChange={e => props.setValue(e.target.value)}*/}
        {/*    onSearch={e => props.onSearch(e)}*/}
        {/*/>*/}
        {/*<br/>*/}
        {/*<div style={{*/}
        {/*    textAlign: "center"*/}
        {/*}}>*/}
        {/*    <Button type={"link"}*/}
        {/*            onClick={e => Modal.info({*/}
        {/*                width: "80%",*/}
        {/*                title: "查看端口",*/}
        {/*                content: <AssetPortsTable hosts={props.value}/>*/}
        {/*            })}*/}
        {/*    >按端口搜索服务</Button>*/}
        {/*    <Button type={"link"} onClick={e => Modal.info({*/}
        {/*        width: "80%",*/}
        {/*        title: "查看域名",*/}
        {/*        content: <AssetsDomainsTable hosts={props.value}/>*/}
        {/*    })}>按域名搜索服务</Button>*/}
        {/*    <Button type={"link"} onClick={e => Modal.info({*/}
        {/*        width: "80%",*/}
        {/*        title: "查看主机",*/}
        {/*        content: <AssetsHostsTable network={props.value}/>*/}
        {/*    })}>按主机搜索服务</Button>*/}
        {/*</div>*/}
    </>
};