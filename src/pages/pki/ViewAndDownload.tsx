import React, {useEffect, useState} from "react";
import {ViewTextAndDownload} from "../../components/utils/ViewTextAndDownload";
import {
    GetClientCAByUser,
    GetClientKeyByUser,
    GetDefaultRootCA,
    GetDefaultRootCRL,
    GetServerCaByCN,
    GetServerKeyByCN
} from "../../network/pkiAPI";
import {Divider, Spin} from "antd";

export interface ViewPkiServerCaNKeyProp {
    common_name: string
}

export const ViewPkiServerCaNKey: React.FC<ViewPkiServerCaNKeyProp> = (props) => {
    const [ca, setCa] = useState("");
    const [key, setKey] = useState("");

    useEffect(() => {
        GetServerCaByCN({common_name: props.common_name}, setCa);
        GetServerKeyByCN({common_name: props.common_name}, setKey);
    }, [])

    return <div>
        <Divider orientation={"left"}>CA</Divider>
        <ViewTextAndDownload text={ca} fileName={`${props.common_name}.server-ca.crt`}/>
        <Divider orientation={"left"}>PRIVATE KEY</Divider>
        <ViewTextAndDownload text={key} fileName={`${props.common_name}.server-pkey.key`}/>
    </div>
};

export interface ViewPkiClientCaNKeyProp {
    user: string
}

export const ViewPkiClientCaNKey: React.FC<ViewPkiClientCaNKeyProp> = (props) => {
    const [ca, setCa] = useState("");
    const [key, setKey] = useState("");

    useEffect(() => {
        GetClientCAByUser({user: props.user}, setCa);
        GetClientKeyByUser({user: props.user}, setKey);
    }, [])

    return <div>
        <Divider orientation={"left"}>CA</Divider>
        <ViewTextAndDownload text={ca} fileName={`${props.user}.client-ca.crt`}/>
        <Divider orientation={"left"}>PRIVATE KEY</Divider>
        <ViewTextAndDownload text={key} fileName={`${props.user}.client-pkey.key`}/>
    </div>
};

export interface ViewAndDownloadRootCAProp {

}

export const ViewAndDownloadRootCA: React.FC<ViewAndDownloadRootCAProp> = (props) => {
    const [loading, setLoading] = useState(false);
    const [ca, setCa] = useState("");

    useEffect(() => {
        setLoading(true)
        GetDefaultRootCA({}, setCa, () => setTimeout(() => setLoading(false), 300))
    }, []);

    return <Spin spinning={loading}>
        <ViewTextAndDownload text={ca} fileName={`palm.root-ca.crt`}/>
    </Spin>
};

export interface ViewAndDwonloadRootCRLProp {

}

export const ViewAndDwonloadRootCRL: React.FC<ViewAndDwonloadRootCRLProp> = (props) => {
    const [loading, setLoading] = useState(false);
    const [crl, setCRL] = useState("");

    useEffect(() => {
        setLoading(true)
        GetDefaultRootCRL({}, setCRL, () => setTimeout(() => setLoading(false), 300))
    }, []);

    return <Spin spinning={loading}>
        <ViewTextAndDownload text={crl} fileName={`palm-revoked-all.crl`}/>
    </Spin>
};