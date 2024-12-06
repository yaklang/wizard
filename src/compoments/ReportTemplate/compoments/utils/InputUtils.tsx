import {
    AutoComplete,
    CheckboxOptionType,
    Form,
    Input,
    InputNumber,
    Radio,
    Select,
} from 'antd';
import { FormItemProps } from 'antd/lib';
import { CSSProperties } from 'react';
import TimeRange from '../TimeRange';

const { Item } = Form;

export declare type LiteralUnion<T extends U, U> = T | (U & {});
export interface InputBase {
    label: string;

    formItemStyle?: CSSProperties;
}

export interface InputItemProps {
    label: string;
    value?: string;
    placeholder?: string;
    disable?: boolean;
    required?: boolean;
    help?: string;

    setValue?(s: string): any;

    autoComplete?: string[];
    type?: LiteralUnion<
        | 'button'
        | 'checkbox'
        | 'color'
        | 'date'
        | 'datetime-local'
        | 'email'
        | 'file'
        | 'hidden'
        | 'image'
        | 'month'
        | 'number'
        | 'password'
        | 'radio'
        | 'range'
        | 'reset'
        | 'search'
        | 'submit'
        | 'tel'
        | 'text'
        | 'time'
        | 'url'
        | 'week',
        string
    >;
    width?: string | number;
    style?: React.CSSProperties;
    extraFormItemProps?: FormItemProps;
    textarea?: boolean;
    textareaRow?: number;
    textareaCol?: number;
}

export const InputItem: React.FC<InputItemProps> = (props) => {
    const { Item } = Form;
    return (
        <Item
            label={props.label}
            required={!!props.required}
            style={props.style}
            {...props.extraFormItemProps}
            help={props.help}
        >
            {props.autoComplete ? (
                <AutoComplete
                    style={{ width: props.width || 200 }}
                    dropdownMatchSelectWidth={400}
                    disabled={!!props.disable}
                    placeholder={props.placeholder}
                    allowClear={true}
                    value={props.value}
                    onChange={(e) => props.setValue && props.setValue(e)}
                    options={(props.autoComplete || []).map((i) => {
                        return { value: i };
                    })}
                />
            ) : props.textarea ? (
                <>
                    <Input.TextArea
                        style={{ width: props.width }}
                        rows={props.textareaRow}
                        cols={props.textareaCol}
                        required={!!props.required}
                        disabled={!!props.disable}
                        placeholder={props.placeholder}
                        allowClear={true}
                        value={props.value}
                        onChange={(e) =>
                            props.setValue && props.setValue(e.target.value)
                        }
                    />
                </>
            ) : (
                <Input
                    style={{ width: props.width }}
                    type={props.type}
                    required={!!props.required}
                    disabled={!!props.disable}
                    placeholder={props.placeholder}
                    allowClear={true}
                    value={props.value}
                    onChange={(e) =>
                        props.setValue && props.setValue(e.target.value)
                    }
                />
            )}
        </Item>
    );
};

export interface InputTimeRangeProps extends InputBase {
    start?: number;
    end?: number;
    style?: CSSProperties;
    setStart: (start: number) => any;
    setEnd: (start: number) => any;
}

export const InputTimeRange: React.FC<InputTimeRangeProps> = (p) => {
    return (
        <Item label={p.label}>
            <div style={{ marginRight: 8, ...p.style }}>
                <TimeRange
                    onStart={p.setStart}
                    onEnd={p.setEnd}
                    start={p.start}
                    end={p.end}
                />
            </div>
        </Item>
    );
};

export interface MultiSelectForStringProps extends InputBase {
    value?: string;
    mode?: 'multiple' | 'tags';
    help?: string;

    defaultSep?: string;

    setValue(s: string): any;

    maxTagTextLength?: number;
    placeholder?: string;

    data: CheckboxOptionType[];
}

export const ManyMultiSelectForString: React.FC<MultiSelectForStringProps> = (
    p,
) => {
    let sep = p.defaultSep || ',';
    let value: string[];
    if (!p.value) {
        value = [];
    } else {
        value = p.value?.split(sep) || [];
    }
    return (
        <Item label={p.label} help={p.help}>
            <Select
                style={{ width: '200' }}
                allowClear={true}
                autoClearSearchValue={true}
                dropdownMatchSelectWidth={200}
                mode={p.mode || 'multiple'}
                value={value}
                maxTagTextLength={20}
                onChange={(value, _) => {
                    p.setValue(value.join(sep) || '');
                }}
                placeholder={p.placeholder}
            >
                {p.data.map((i) => {
                    return (
                        <Select.Option value={i.value.toString()}>
                            {i?.label?.toString()}
                        </Select.Option>
                    );
                })}
            </Select>
        </Item>
    );
};

export interface SelectOneItemProps {
    value: any;
    text: string;
    disabled?: boolean;
}

export interface SelectOneProps extends InputBase {
    disabled?: boolean;
    value?: any;
    help?: string;
    colon?: boolean;
    placeholder?: string;
    setValue?(a: any): any;

    data: SelectOneItemProps[];
    formItemStyle?: CSSProperties;
}

export const SelectOne: React.FC<SelectOneProps> = (p) => {
    // const [current, setCurrent] = useState<any>();
    return (
        <Item
            label={p.label}
            help={p.help}
            colon={p.colon}
            style={{ ...p.formItemStyle }}
        >
            <Radio.Group
                onChange={(e) => {
                    // setCurrent(e.target.value)
                    p.setValue && p.setValue(e.target.value);
                }}
                value={p.value}
                buttonStyle="solid"
            >
                {p.data.map((e) => (
                    <Radio.Button
                        // type={current == e.value ? "primary" : undefined}
                        disabled={
                            (p.value === e.value ? false : !!p.disabled) ||
                            e.disabled
                        }
                        value={e.value}
                    >
                        {e.text}
                    </Radio.Button>
                ))}
            </Radio.Group>
        </Item>
    );
};

export interface InputNumberProps extends InputBase {
    min?: number;
    max?: number;

    value?: number;
    disable?: boolean;

    setValue(value: number): any;
}

export const InputInteger: React.FC<InputNumberProps> = (p) => {
    return (
        <Item label={p.label}>
            <InputNumber
                size={'middle'}
                width={'100%'}
                disabled={p.disable}
                min={p.min}
                max={p.max}
                step={1}
                value={p.value}
                onChange={(e) => p.setValue(e as number)}
            />
        </Item>
    );
};
