import React from "react";
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input } from "antd";

const {Item} = Form;

export interface FilterTextInputProps {
    title: string
    value: string
    setter: (value: string) => any
}

const FilterTextInput: React.FC<FilterTextInputProps> = ({title, value, setter}) => {
    return <Item label={title}>
        <Input value={value} onChange={e => setter(e.target.value)}/>
    </Item>
};

export default FilterTextInput;
