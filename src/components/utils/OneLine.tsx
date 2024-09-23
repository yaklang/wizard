import React from "react";

export interface OneLineProp extends JSX.ElementChildrenAttribute {
    width?: string | number
    overflow?: string
}

export const OneLine: React.FC<OneLineProp> = (props) => {
    return <div style={{whiteSpace: "nowrap", width: props.width, overflow: props.overflow || "auto"}}>
        {props.children}
    </div>
};