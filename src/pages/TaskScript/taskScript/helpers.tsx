import { Input, InputNumber, Select, Switch, Form } from 'antd';
import type { YakScriptParamFull } from '@/apis/task/types';

export const getValueByType = (
    defaultValue: any,
    type: string,
): number | string | boolean | string[] => {
    let value: any;
    switch (type) {
        case 'uint':
            value = parseInt(defaultValue || '0', 10);
            break;
        case 'float':
            value = parseFloat(defaultValue || '0.0');
            break;
        case 'boolean':
            value = defaultValue === 'true' || defaultValue === true;
            break;
        case 'select':
            if (Array.isArray(defaultValue)) {
                value = defaultValue.length > 0 ? defaultValue : [];
            } else {
                const newVal = defaultValue
                    ? defaultValue.toString().split(',')
                    : [];
                value = newVal.length > 0 ? newVal : [];
            }
            break;
        default:
            value = defaultValue ? defaultValue : '';
            break;
    }
    return value;
};

/** group params by Group/group property */
export const ParamsToGroupByGroupName = (arr: (YakScriptParamFull | any)[]) => {
    const map: Record<string, any> = {};
    const paramsGroupList: {
        group: string;
        data: (YakScriptParamFull | any)[];
    }[] = [];
    for (const ai of arr) {
        const groupName = ai.Group || ai.group || 'default';
        if (!map[groupName]) {
            paramsGroupList.push({ group: groupName, data: [ai] });
            map[groupName] = true;
        } else {
            for (const dj of paramsGroupList) {
                if (dj.group === groupName) {
                    dj.data.push(ai);
                    break;
                }
            }
        }
    }
    return paramsGroupList || [];
};

/**
 * Render the appropriate input control for a single parameter descriptor.
 * This keeps rendering isolated and easier to test.
 */
export const renderParamInput = (p: YakScriptParamFull) => {
    const type = (p.typeVerbose || '').toLowerCase();
    const rawOptions =
        (p.extraSetting && p.extraSetting.toString()) ||
        (p.paramValue && p.paramValue.toString()) ||
        '';
    const optionList: string[] = rawOptions
        ? rawOptions
              .split(',')
              .map((it: string) => it.trim())
              .filter(Boolean)
        : [];

    if (type === 'boolean') {
        return <Switch />;
    }

    if (type === 'uint' || type === 'float') {
        return <InputNumber style={{ width: '100%' }} />;
    }

    if (type === 'select') {
        return (
            <Select
                mode="multiple"
                options={optionList.map((it: string) => ({
                    label: it,
                    value: it,
                }))}
                allowClear
            />
        );
    }

    return <Input />;
};

/**
 * Build a Form.Item for a parameter (label + name + input)
 */
export const buildParamFormItem = (p: YakScriptParamFull) => {
    const fieldKey = p.paramName || '';
    const label = p.fieldVerbose || p.paramName || '';
    const type = (p.typeVerbose || '').toLowerCase();

    return (
        <Form.Item
            key={fieldKey}
            label={label}
            name={['prompt_args', fieldKey]}
            valuePropName={type === 'boolean' ? 'checked' : 'value'}
        >
            {renderParamInput(p)}
        </Form.Item>
    );
};

export default {
    getValueByType,
    ParamsToGroupByGroupName,
    renderParamInput,
    buildParamFormItem,
};
