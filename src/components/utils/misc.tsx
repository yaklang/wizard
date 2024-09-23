import {PresetColorType} from "antd/lib/_util/colors";

export interface TaskFormCallbackProps {
    onSucceeded: (a?: any) => any
    onFailed?: () => any
    onFinally?: () => any
}

const DefaultTaskFormCallback: TaskFormCallbackProps = {
    onSucceeded: () => {
    },
    onFailed: () => {
    },
    onFinally: () => {
    },
}

export const wordToColor = (i: string): PresetColorType | string | undefined => {
    switch (i.toUpperCase()) {
        case "FINISHED":
        case "FINISH":
        case "SUCCESS":
        case "SUCCEEDED":
        case "SUCCEED":
            return "green";
        case "FAILED":
        case "FAIL":
        case "FAULT":
        case "FAILURE":
        case "ERROR":
        case "ERR":
        case "EXCEPTION":
        case "CRITICAL":
        case "FATAL":
            return "red";
        case "INFO":
        case "INFORMATION":
            return "green";
        case "WARN":
        case "WARNING":
            return "orange";
        case "TCP":
            return "green";
        case "UDP":
            return "default";
        case "UNKNOW":
        case "UNKNOWN":
            return "orange";
        case "OPEN":
        case "OPENED":
            return "green";
        case "CLOSED":
        case "CLOSE":
            return "gray";
        default:
            return "geekblue";
    }
}