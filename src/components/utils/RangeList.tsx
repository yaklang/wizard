import React, {FC} from "react";
import {List} from "antd";

interface RangeList {
    ranges: string[] | undefined
}

const RangeList: FC<RangeList> = (props: RangeList) => {
    if (props.ranges === undefined || props.ranges === null) {
        return <div/>
    }

    if (props.ranges.length && props.ranges.length <= 0) {
        return <div/>
    }

    return <List size={"small"}>
        {props.ranges.map((item, index) => <List.Item key={index}>
            {`${item}`}
        </List.Item>)}
    </List>
};

export default RangeList;
