import React, {useEffect, useState} from "react";
import '@ant-design/compatible/assets/index.css';
import {Input, Row, Slider, Switch} from "antd";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";

export interface RandomDelaySettingProps {
    enabled?: boolean
    min?: number
    max?: number
    probability?: number

    onDelaySettingChanged?(enabled: boolean, probability: number, delayMin: number, delayMax: number): any
}

const InputGroup = Input.Group;

const RandomDelaySetting: React.FC<RandomDelaySettingProps> = (props: RandomDelaySettingProps) => {
    const [enabled, setEnable] = useState(props.enabled)
    const [delayProbability, setDelayProbability] = useState(props.probability || 0);
    const [delayMin, setDelayMin] = useState(props.min || 0);
    const [delayMax, setDelayMax] = useState(props.max || 0);

    useEffect(() => {
        if (props.onDelaySettingChanged) {
            props.onDelaySettingChanged(!!enabled, delayProbability, delayMin, delayMax)
        }
    }, [enabled, delayProbability, delayMin, delayMax]);

    return <div className={"div-left"}>
        <Switch
            checkedChildren={<CheckOutlined/>}
            unCheckedChildren={<CloseOutlined/>}
            checked={enabled}
            onChange={() => setEnable(!enabled)}
        /><br/>
        {enabled ? <div style={{marginTop: 15,}}>
            <Input
                addonBefore={"随机延迟概率为"}
                style={{width: 300}}
                addonAfter={"%"}
                value={delayProbability}
                onChange={e => {
                    let percent = parseFloat(e.target.value)
                    setDelayProbability(percent ? percent : 0)
                }}
            />
            <Slider
                min={1} max={300}
                value={[delayMin, delayMax]}
                range={true}
                onChange={(e) => {
                    if (typeof e !== "number") {
                        setDelayMin(e[0])
                        setDelayMax(e[1])
                    }
                }}
                onAfterChange={(e) => {
                    if (typeof e !== "number") {
                        setDelayMin(e[0])
                        setDelayMax(e[1])
                    }
                }}
            />
            <InputGroup compact>
                <Input
                    style={{
                        width: 100,
                        pointerEvents: 'none',
                        backgroundColor: '#fff',
                    }}
                    placeholder="随即延迟"
                    disabled
                />
                <Input style={{width: 100, textAlign: 'center'}}
                       placeholder="delayMin"
                       value={`${delayMin}`}
                       onChange={e => {
                           let min = parseInt(e.target.value)
                           setDelayMin(min ? min : 0)
                       }}
                />
                <Input
                    style={{
                        width: 30,
                        borderLeft: 0,
                        pointerEvents: 'none',
                        backgroundColor: '#fff',
                    }}
                    placeholder="~"
                    disabled
                />
                <Input style={{width: 100, textAlign: 'center', borderLeft: 0}}
                       placeholder="delayMax"
                       value={`${delayMax}`}
                       onChange={e => {
                           let max = parseInt(e.target.value)
                           if (max && max > delayMin) {
                               setDelayMax(max ? max : 0)
                           }
                       }}
                />
                <Input
                    style={{
                        width: 50,
                        borderLeft: 0,
                        pointerEvents: 'none',
                        backgroundColor: '#fff',
                    }}
                    placeholder="秒"
                    disabled
                />
            </InputGroup>
        </div> : ""}
    </div>
};

export default RandomDelaySetting;
