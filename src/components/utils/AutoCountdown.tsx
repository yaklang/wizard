import React from "react";
import moment from "moment";
import {Statistic} from "antd";


interface AutoCountdown {
    title: string | undefined,
    value: number | undefined
}

export const shouldCountdown = (timeRaw: number | undefined) => {
    if (timeRaw === undefined) {
        return false
    }
    let currentTime = moment.unix(timeRaw);
    let duration = moment().diff(currentTime, "seconds");
    return duration <= 0;
};


const AutoCountdown: React.FC<AutoCountdown> = (props: AutoCountdown) => {
    let ddl: number = 0;
    if (props.value !== undefined) {
        ddl = props.value * 1000
    }
    return <div>{shouldCountdown(props.value) ?
        <Statistic.Countdown title={props.title} value={ddl}/> : ""}</div>
};

export default AutoCountdown
