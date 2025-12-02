import { Input, InputNumber, Select, Switch, Form } from 'antd';
import type { YakScriptParamFull } from '@/apis/task/types';

type OptionValue = string | number | boolean;

interface ExtraSettingItem {
    key: string;
    value: OptionValue;
}

interface ParsedExtraSetting {
    data: ExtraSettingItem[];
    double?: boolean;
}

type ScriptParamLike = Partial<YakScriptParamFull> & {
    Group?: string;
    group?: string;
    paramName?: string;
    fieldVerbose?: string;
    typeVerbose?: string;
    extraSetting?: string | ParsedExtraSetting;
    paramValue?: string | string[] | number;
};

export const getValueByType = (
    defaultValue: string | string[] | number | boolean | null | undefined,
    type: string,
): number | string | boolean | string[] => {
    let value: number | string | boolean | string[] = '';
    switch (type) {
        case 'uint':
            value = parseInt(String(defaultValue ?? '0'), 10);
            break;
        case 'float':
            value = parseFloat(String(defaultValue ?? '0.0'));
            break;
        case 'boolean':
            value = defaultValue === 'true' || defaultValue === true;
            break;
        case 'select':
            if (Array.isArray(defaultValue)) {
                value = defaultValue.length > 0 ? defaultValue : [];
            } else if (typeof defaultValue === 'string') {
                const newVal = defaultValue
                    ? defaultValue
                          .toString()
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : [];
                // Return array if multiple values, otherwise return single string
                value = newVal.length > 1 ? newVal : (newVal[0] ?? '');
            } else if (defaultValue === undefined || defaultValue === null) {
                value = '';
            } else {
                value = String(defaultValue);
            }
            break;
        default:
            value =
                defaultValue !== null && defaultValue !== undefined
                    ? String(defaultValue)
                    : '';
            break;
    }
    return value;
};

/** group params by Group/group property */
export const ParamsToGroupByGroupName = (arr: ScriptParamLike[]) => {
    const map: Record<string, boolean> = {};
    const paramsGroupList: {
        group: string;
        data: ScriptParamLike[];
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
    // console.log('parameter: ', p);

    const type = (p.typeVerbose || '').toLowerCase();

    // Try to parse `extraSetting` which may be a JSON string like:
    // { data: [{ key: 'Java', value: 'java' }, ...], double: false }
    let selectOptions: { label: string; value: OptionValue }[] = [];
    let multiple = false;

    if (p.extraSetting) {
        try {
            const parsed =
                typeof p.extraSetting === 'string'
                    ? (JSON.parse(p.extraSetting) as ParsedExtraSetting)
                    : (p.extraSetting as ParsedExtraSetting);
            if (parsed && Array.isArray(parsed.data)) {
                const validOptions: { label: string; value: OptionValue }[] =
                    [];
                for (const it of parsed.data) {
                    if (!it || it.key === undefined || it.value === undefined) {
                        // Report malformed entry to console but continue processing
                        console.error(
                            '[TaskScript] malformed extraSetting item, expected {key,value}:',
                            it,
                            'paramName:',
                            p.paramName,
                        );
                        continue;
                    }
                    validOptions.push({
                        label: String(it.key),
                        value: it.value,
                    });
                }
                if (validOptions.length) {
                    selectOptions = validOptions;
                    multiple = !!parsed.double;
                } else {
                    // If all entries invalid, log it so devs can inspect
                    console.error(
                        '[TaskScript] extraSetting parsed but no valid data entries found for param',
                        p.paramName,
                    );
                }
            }
        } catch (e) {
            console.error(
                '[TaskScript] failed to parse extraSetting for param',
                p.paramName,
                e,
            );
            // ignore parse errors and fall back to other sources
        }
    }

    // Fallback: if no structured extraSetting, try to build simple options
    if (!selectOptions.length && p.paramValue) {
        const raw = p.paramValue.toString();
        const arr = raw
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
        selectOptions = arr.map((it: string) => ({ label: it, value: it }));
        multiple = arr.length > 1;
    }

    if (type === 'boolean') return <Switch />;
    if (type === 'uint' || type === 'float')
        return <InputNumber style={{ width: '100%' }} />;

    if (type === 'select') {
        return (
            <Select
                mode={multiple ? 'multiple' : undefined}
                options={selectOptions}
                allowClear
            />
        );
    }

    return <Input />;
};

/**
 * Build a Form.Item for a parameter (label + name + input)
 */
export const buildParamFormItem = (
    p: YakScriptParamFull,
    namePrefix: Array<string | number> = ['prompt_args'],
    keyPrefix?: string,
) => {
    const fieldKey = p.paramName || '';
    const label = p.fieldVerbose || p.paramName || '';
    const type = (p.typeVerbose || '').toLowerCase();
    const itemKey = keyPrefix ? `${keyPrefix}-${fieldKey}` : fieldKey;
    // If there's no paramName, hide the field and report an error.
    if (!fieldKey) {
        console.error('[TaskScript] missing paramName; skipping form item', p);
        return null;
    }

    return (
        <Form.Item
            key={itemKey}
            label={label}
            name={[...namePrefix, fieldKey]}
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
