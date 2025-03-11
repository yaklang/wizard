import type { FC } from 'react';

import { Checkbox, Input, message, Select } from 'antd';
import { match } from 'ts-pattern';

import type { TAllCodecMethodsParams } from '@/apis/CodecApi/type';
import styles from './CodecTypeItemStyle.module.scss';
import { WizardAceEditor } from '@/compoments';
// import { useTheme } from '../CodecEntry';

interface TCodecTypeItemProps {
    childrenItem: TAllCodecMethodsParams & { id: string };
}

export const CodecPluginTemplate = `# codec plugin

/*
Codec Plugin 可以支持在 Codec 中自定义编码解码，自定义 Bypass 与字符串处理函数

函数定义非常简单

func(i: string) string
*/

handle = func(origin /*string*/) {
    # handle your origin str
    return origin
}
`;

const ant_defualte_class =
    'border-0 p-0 shadow-none rounded-none  focus:shadow-[0_1px_0_#1677ff] focus:outline-0 transition-shadow pl-2';

const CodecTypeItem: FC<TCodecTypeItemProps> = ({ childrenItem }) => {
    // const { setCollectListContext, collectListContext } = useTheme();
    // console.log(childrenItem, collectListContext, 'sss');
    return match(childrenItem.Type)
        .with('input', () => {
            return (
                <div className="text-[#b4bbca] text-xs bg-[#fff] rounded-sm pt-2 mb-2">
                    <div className="flex gap-1 items-center pl-2 mb-1">
                        <div>{childrenItem?.Label}</div>
                        {childrenItem?.Required && (
                            <div className="text-[#f4736b]">*</div>
                        )}
                    </div>
                    <Input
                        placeholder="请输入..."
                        className={ant_defualte_class}
                    />
                </div>
            );
        })
        .with('text', () => {
            return (
                <div className="text-[#b4bbca] text-xs bg-[#fff] rounded-sm pt-2 mb-2">
                    <div className="flex gap-1 items-center pl-2">
                        <div>{childrenItem?.Label}</div>
                        {childrenItem?.Required && (
                            <div className="text-[#f4736b]">*</div>
                        )}
                    </div>
                    <Input.TextArea
                        placeholder="请输入..."
                        className={ant_defualte_class}
                    />
                </div>
            );
        })
        .with('select', () => {
            const options = childrenItem?.Options?.map((it) => ({
                lable: it,
                value: it,
            }));

            return (
                <div className="text-[#b4bbca] text-xs bg-[#fff] rounded-sm pt-2 mb-2">
                    <div className="flex gap-1 items-center pl-2">
                        <div>{childrenItem?.Label}</div>
                        {childrenItem?.Required && (
                            <div className="text-[#f4736b]">*</div>
                        )}
                    </div>
                    <div className={styles['ant-select-codec']}>
                        <Select
                            options={options}
                            variant="borderless"
                            defaultValue={childrenItem.DefaultValue}
                        />
                    </div>
                </div>
            );
        })
        .with('checkbox', () => {
            const options = [
                {
                    label: childrenItem.Label,
                    value: childrenItem.Name,
                },
            ];
            return (
                <div className="inline-block mt-1">
                    <Checkbox.Group options={options} />
                </div>
            );
        })
        .with('search', () => {
            const options = childrenItem?.Options?.map((it) => ({
                lable: it,
                value: it,
            }));
            return (
                <div className="text-[#b4bbca] text-xs bg-[#fff] rounded-sm pt-2 mb-2">
                    <div className="flex gap-1 items-center pl-2">
                        <div>{childrenItem?.Label}</div>
                        {childrenItem?.Required && (
                            <div className="text-[#f4736b]">*</div>
                        )}
                    </div>
                    <div className={styles['ant-select-codec']}>
                        <Select
                            variant="borderless"
                            showSearch
                            placeholder="请选择..."
                            optionFilterProp="label"
                            options={options}
                        />
                    </div>
                </div>
            );
        })
        .with('monaco', () => {
            return (
                <div className="text-[#b4bbca] text-xs bg-[#fff] rounded-sm p-2 mb-2">
                    <div className="flex gap-1 items-center pl-2 mb-2">
                        <div>{childrenItem?.Label}</div>
                        {childrenItem?.Required && (
                            <div className="text-[#f4736b]">*</div>
                        )}
                    </div>
                    <WizardAceEditor
                        style={{ height: '240px' }}
                        defaultValue={CodecPluginTemplate}
                        // value={scriptValue}
                        // onChange={setScriptValue}
                    />
                </div>
            );
        })
        .with('inputSelect', () => {
            const options = childrenItem?.Connector?.Options?.map((it) => ({
                lable: it,
                value: it,
            }));
            return (
                <div className="flex w-full rounded-sm ">
                    <div className="text-[#b4bbca] text-xs bg-[#fff] mb-2 w-2/3 border-r-[1px] border-r-solid border-r-[#EAECF3]">
                        <div className="flex gap-1 items-center mb-2 p-2">
                            <div>{childrenItem?.Label}</div>
                            {childrenItem?.Required && (
                                <div className="text-[#f4736b]">*</div>
                            )}
                        </div>
                        <Input
                            placeholder="请输入..."
                            className={ant_defualte_class}
                        />
                    </div>
                    <div className="text-[#b4bbca] text-xs bg-[#fff] mb-2 w-1/3">
                        <div className="flex gap-1 items-center p-2">
                            <div>{childrenItem?.Connector.Label}</div>
                            {childrenItem?.Connector?.Required && (
                                <div className="text-[#f4736b]">*</div>
                            )}
                        </div>
                        <div className={styles['ant-select-codec']}>
                            <Select
                                options={options}
                                variant="borderless"
                                defaultValue={
                                    childrenItem?.Connector?.DefaultValue
                                }
                            />
                        </div>
                    </div>
                </div>
            );
        })
        .otherwise(() => {
            message.info(
                `未获取到${childrenItem?.Type}类型，无法正常渲染，请联系管理员`,
            );
            return null;
        });
};

export { CodecTypeItem };
