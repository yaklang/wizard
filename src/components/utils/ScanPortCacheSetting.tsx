import React, {useEffect, useState} from "react";
import {Input, Switch} from "antd";

export interface ScanPortCacheSettingProps {
    defaultEnable?: boolean
    defaultCacheDurationDays?: number

    onCacheSettingChanged?(enable: boolean, durationDays: number): any
}

const ScanPortCacheSetting: React.FC<ScanPortCacheSettingProps> = (props: ScanPortCacheSettingProps) => {
    const [cacheDurationDays, setCacheDurationDays] = useState<number>(props.defaultCacheDurationDays ? props.defaultCacheDurationDays : 7);
    const [enabled, Enable] = useState<boolean>(!!props.defaultEnable);

    useEffect(() => {
        if (props.onCacheSettingChanged) {
            props.onCacheSettingChanged(enabled, cacheDurationDays)
        }
    }, [enabled, cacheDurationDays])

    return <div className={"div-left"}>
        <Switch
            checked={enabled}
            onChange={() => Enable(!enabled)}
        />
        {enabled ? <>
            <Input
                style={{width: 200, marginLeft: 15}}
                addonBefore={"使用"} addonAfter={"天内的缓存"}
                value={`${cacheDurationDays ? cacheDurationDays : 0}`}
                onChange={
                    e => {
                        let number = parseInt(e.target.value)
                        setCacheDurationDays(number ? number : 0)
                    }
                }/>
        </> : ""}
    </div>
};

export default ScanPortCacheSetting;
