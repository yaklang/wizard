import type { FormLayout } from 'antd/es/form/Form';
import type { ThirdPartyApplicationConfig } from './ConfigNetworkPage';
import { YakitSelect } from '../YakitUI/YakitSelect/YakitSelect';
import { Form } from 'antd';
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import styles from './ConfigNetworkPage.module.scss';
import type { FormInstance } from 'antd/lib/form/Form';
import type { KVPair } from '@/pages/AIAgent/enums/external';
import type { SelectOptionsProps } from '@/pages/AIAgent/ai-agent/aiModelList/AIModelListType';
import { useGetSetState } from '@/hooks';
import { grpcGetAIThirdPartyAppConfigTemplate } from '@/pages/AIAgent/ai-agent/aiModelList/utils';
import { cloneDeep } from 'lodash';
import { AIModelTypeEnum } from '@/pages/AIAgent/ai-agent/defaultConstant';
import {
    useCreation,
    useDebounceEffect,
    useDebounceFn,
    useMemoizedFn,
    useUpdateEffect,
} from 'ahooks';
import { OutlineInformationcircleIcon } from '@/assets/icon/outline';
import { YakitInput } from '../YakitUI/YakitInput/YakitInput';
import { YakitSwitch } from '../YakitUI/YakitSwitch/YakitSwitch';
import { YakitButton } from '../YakitUI/YakitButton/YakitButton';
import { YakitAutoComplete } from '../YakitUI/YakitAutoComplete/YakitAutoComplete';
import { YakitSpin } from '../YakitUI/YakitSpin/YakitSpin';
import { AIConfigAPIKeyFormItem } from '@/pages/AIAgent/ai-agent/aiModelList/aiModelForm/AIModelForm';
import type { YakitSelectProps } from '../YakitUI/YakitSelect/YakitSelectType';

export interface ThirdPartyAppConfigItemTemplate {
    Required: boolean;
    Name: string;
    Verbose: string;
    Type: string;
    DefaultValue: string;
    Desc: string;
    Extra: string;
}

export interface GetThirdPartyAppConfigTemplate {
    Name: string;
    Verbose: string;
    Type: string;
    Items: ThirdPartyAppConfigItemTemplate[];
}

export interface GetThirdPartyAppConfigTemplateResponse {
    Templates: GetThirdPartyAppConfigTemplate[];
}

export interface ThirdPartyApplicationConfigProp {
    formValues?: ThirdPartyApplicationConfig;
    // 禁止类型改变
    disabledType?: boolean;
    // 是否可新增类型
    canAddType?: boolean;
    // 类型下拉是否只展示ai类型的
    isOnlyShowAiType?: boolean;
    onAdd: (i: ThirdPartyApplicationConfig) => void;
    onCancel: () => void;
    FormProps?: {
        layout: FormLayout;
        labelCol: number;
        wrapperCol: number;
    };

    footer?: React.ReactNode;
}

const defautFormValues = {
    Type: '',
    api_key: '',
    user_identifier: '',
    ExtraParams: [] as KVPair[],
};

interface NewThirdPartyApplicationConfigBaseProps
    extends Omit<ThirdPartyApplicationConfigProp, 'onAdd' | 'onCancel'> {
    ref?: React.ForwardedRef<{ form: FormInstance }>;
}

const aiModelTypeOptions: SelectOptionsProps[] = [
    { label: '高质模型:执行复杂任务', value: AIModelTypeEnum.TierIntelligent },
    {
        label: '轻量模型:用于执行简单任务和会话',
        value: AIModelTypeEnum.TierLightweight,
    },
    {
        label: '视觉模式:用于识别图片等,生成知识库和任务执行都会用到',
        value: AIModelTypeEnum.TierVision,
    },
];

const aiModelTypeItem: ThirdPartyAppConfigItemTemplate = {
    Name: 'model_type',
    Required: true,
    Type: 'list',
    DefaultValue: AIModelTypeEnum.TierIntelligent,
    Desc: '',
    Extra: `${JSON.stringify({
        options: aiModelTypeOptions,
    })}`,
    Verbose: '模型类型',
};

const defaultFormItemsOfAI: ThirdPartyAppConfigItemTemplate[] = [
    cloneDeep(aiModelTypeItem),
    {
        DefaultValue: '',
        Desc: 'APIKey / Token',
        Extra: '',
        Name: 'api_key',
        Required: true,
        Type: 'list',
        Verbose: 'ApiKey',
    },
    {
        DefaultValue: '',
        Desc: 'email / username',
        Extra: '',
        Name: 'user_identifier',
        Required: false,
        Type: 'string',
        Verbose: '用户信息',
    },
];

const aiOptionItems: ThirdPartyAppConfigItemTemplate[] = [
    cloneDeep(aiModelTypeItem),
];

const defaultFormItems: ThirdPartyAppConfigItemTemplate[] = [
    {
        DefaultValue: '',
        Desc: 'APIKey / Token',
        Extra: '',
        Name: 'api_key',
        Required: true,
        Type: 'string',
        Verbose: 'ApiKey',
    },
    {
        DefaultValue: '',
        Desc: 'email / username',
        Extra: '',
        Name: 'user_identifier',
        Required: false,
        Type: 'string',
        Verbose: '用户信息',
    },
];

export const NewThirdPartyApplicationConfigBase: React.FC<NewThirdPartyApplicationConfigBaseProps> =
    React.memo(
        forwardRef((props, ref) => {
            const {
                formValues = defautFormValues,
                disabledType = false,
                canAddType = true,
                isOnlyShowAiType = false,
                FormProps,
                footer,
            } = props;
            const [form] = Form.useForm();
            const typeVal = Form.useWatch('Type', form);
            const typeValRef = useRef<string>(typeVal);
            const [options, setOptions] = useState<SelectOptionsProps[]>([]);
            const [templates, setTemplates, getTemplates] = useGetSetState<
                GetThirdPartyAppConfigTemplate[]
            >([]);
            const [modelOptionLoading, setModelOptionLoading] =
                useState<boolean>(false);
            const [modelNameAllOptions, setModelNameAllOptions] = useState<
                SelectOptionsProps[]
            >([]);
            const apiKeyWatch = Form.useWatch('api_key', form);
            const execModelNameOption = useRef<boolean>(false);

            useImperativeHandle(
                ref,
                () => ({
                    form,
                }),
                [form],
            );

            // 获取类型
            useEffect(() => {
                if (isOnlyShowAiType) {
                    grpcGetAIThirdPartyAppConfigTemplate().then(
                        (res: GetThirdPartyAppConfigTemplateResponse) => {
                            const templates = res.Templates;
                            let newOptions: SelectOptionsProps[] = [];
                            setTemplates(
                                // eslint-disable-next-line max-nested-callbacks
                                templates.map((ele) => ({
                                    ...ele,
                                    Items: [...aiOptionItems, ...ele.Items],
                                })),
                            );
                            // eslint-disable-next-line max-nested-callbacks
                            newOptions = templates.map((item) => ({
                                label: item.Verbose,
                                value: item.Name,
                            }));
                            setOptions(newOptions);
                        },
                    );
                } else {
                    // ipcRenderer
                    //     .invoke('GetThirdPartyAppConfigTemplate')
                    //     .then((res: GetThirdPartyAppConfigTemplateResponse) => {
                    //         const templates = res.Templates;
                    //         let newOptions: SelectOptionsProps[] = [];
                    //         setTemplates(templates);
                    //         newOptions = templates
                    //             .filter((item) => item.Type !== 'ai')
                    //             .map((item) => ({
                    //                 label: item.Verbose,
                    //                 value: item.Name,
                    //             }));
                    //         setOptions(newOptions);
                    //     });
                }
            }, [isOnlyShowAiType]);

            useUpdateEffect(() => {
                const templatesobj = getTemplates().find(
                    (item) => item.Name === typeValRef.current,
                );
                const modelType = templatesobj?.Type;
                if (apiKeyWatch && modelType === 'ai') {
                    execModelNameOption.current = true;
                    getModelNameOption();
                } else {
                    handleDefaultModalNameOption();
                }
            }, [apiKeyWatch]);

            const { run: getModelNameOption, cancel: cancelModelNameOption } =
                useDebounceFn(
                    useMemoizedFn(() => {
                        if (!execModelNameOption.current) return;
                        setModelOptionLoading(true);
                        // const v = form.getFieldsValue();
                        // ipcRenderer
                        //     .invoke('ListAiModel', {
                        //         Config: JSON.stringify(v),
                        //     })
                        //     .then((res) => {
                        //         if (!execModelNameOption.current) return;
                        //         const modalNamelist: SelectOptionsProps[] =
                        //             res.ModelName.map((modelName: string) => ({
                        //                 label: modelName,
                        //                 value: modelName,
                        //             }));
                        //         const name = getModelNameDefaultName();
                        //         // 确保默认值在选项里
                        //         const hasDefault = modalNamelist.some(
                        //             (item) => item.value === name,
                        //         );
                        //         const newOptions = hasDefault
                        //             ? modalNamelist
                        //             : name
                        //               ? [
                        //                     { label: name, value: name },
                        //                     ...modalNamelist,
                        //                 ]
                        //               : modalNamelist;
                        //         setModelNameAllOptions(newOptions);
                        //         yakitNotify('success', '获取成功');
                        //     })
                        //     .catch((error) => {
                        //         if (!execModelNameOption.current) return;
                        //         yakitNotify('error', error + '');
                        //         handleDefaultModalNameOption();
                        //     })
                        //     .finally(() => {
                        //         setModelOptionLoading(false);
                        //     });
                    }),
                    { wait: 500 },
                );
            const getModelNameDefaultName = () => {
                const templatesobj = templates.find(
                    (item) => item.Name === typeVal,
                );
                const formItems = templatesobj?.Items || [];
                const modelType = templatesobj?.Type;
                const obj = formItems.find(
                    (item) =>
                        modelType === 'ai' &&
                        item.Type === 'list' &&
                        item.Name === 'model',
                );
                return obj?.DefaultValue;
            };
            const handleDefaultModalNameOption = () => {
                const name = getModelNameDefaultName();
                if (name) {
                    setModelNameAllOptions([{ label: name, value: name }]);
                } else {
                    setModelNameAllOptions([]);
                }
            };
            useDebounceEffect(
                () => {
                    handleDefaultModalNameOption();
                },
                [typeVal],
                { wait: 300 },
            );
            useEffect(() => {
                execModelNameOption.current = false;
                cancelModelNameOption();
                typeValRef.current = typeVal;
            }, [typeVal]);

            // 切换类型，渲染不同表单项（目前只有输入框、开关、下拉）
            const renderAllFormItems = useMemoizedFn(() => {
                const templatesobj = templates.find(
                    (item) => item.Name === typeVal,
                );
                const formItems = templatesobj?.Items || [];
                const modelType = templatesobj?.Type;
                return formItems.map((item, index) => (
                    <React.Fragment key={index}>
                        {renderSingleFormItem(item, modelType)}
                    </React.Fragment>
                ));
            });
            const renderSingleFormItem = (
                item: ThirdPartyAppConfigItemTemplate,
                modelType?: string,
            ) => {
                const formProps = {
                    rules: [
                        {
                            required: item.Required,
                            message: `请填写${item.Verbose}`,
                        },
                    ],
                    label: item.Verbose,
                    name: item.Name,
                    tooltip: item.Desc
                        ? {
                              icon: <OutlineInformationcircleIcon />,
                              title: item.Desc,
                          }
                        : null,
                };
                switch (item.Type) {
                    case 'string':
                        return (
                            <Form.Item {...formProps}>
                                <YakitInput />
                            </Form.Item>
                        );
                    case 'bool':
                        return (
                            <Form.Item {...formProps} valuePropName="checked">
                                <YakitSwitch />
                            </Form.Item>
                        );
                    case 'list':
                        if (modelType === 'ai' && item.Name === 'model') {
                            // 模型名称
                            return (
                                <Form.Item
                                    {...formProps}
                                    help={
                                        <div style={{ height: 30 }}>
                                            如无法自动获取，请
                                            <YakitButton
                                                type="text"
                                                onClick={() => {
                                                    execModelNameOption.current =
                                                        true;
                                                    getModelNameOption();
                                                }}
                                                style={{
                                                    padding: 0,
                                                    fontSize: 14,
                                                }}
                                            >
                                                点击刷新
                                            </YakitButton>
                                            重新获取
                                        </div>
                                    }
                                >
                                    <YakitAutoComplete
                                        options={modelNameAllOptions}
                                        onFocus={() => {
                                            execModelNameOption.current = true;
                                            getModelNameOption();
                                        }}
                                        // eslint-disable-next-line react/no-unstable-nested-components
                                        dropdownRender={(menu) => {
                                            return (
                                                // eslint-disable-next-line react/jsx-no-useless-fragment
                                                <>
                                                    <YakitSpin
                                                        spinning={
                                                            modelOptionLoading
                                                        }
                                                    >
                                                        {menu}
                                                    </YakitSpin>
                                                </>
                                            );
                                        }}
                                        filterOption={(inputValue, option) => {
                                            if (
                                                option?.value &&
                                                typeof option?.value ===
                                                    'string'
                                            ) {
                                                return (
                                                    option?.value
                                                        ?.toUpperCase()
                                                        .indexOf(
                                                            inputValue.toUpperCase(),
                                                        ) !== -1
                                                );
                                            }
                                            return false;
                                        }}
                                    />
                                </Form.Item>
                            );
                        }
                        if (
                            isOnlyShowAiType &&
                            modelType === 'ai' &&
                            item.Name === 'api_key'
                        ) {
                            return (
                                <AIConfigAPIKeyFormItem
                                    aiType={typeVal}
                                    formProps={formProps}
                                />
                            );
                        } else {
                            let selectProps: YakitSelectProps = {};
                            try {
                                selectProps.options = item.Extra
                                    ? JSON.parse(item.Extra)?.options
                                    : [];
                            } catch (error) {}
                            return (
                                <Form.Item {...formProps}>
                                    <YakitSelect {...selectProps} />
                                </Form.Item>
                            );
                        }
                    default:
                        // eslint-disable-next-line react/jsx-no-useless-fragment
                        return <></>;
                }
            };
            // 判断当前类型值是否在options存在
            const isInOptions = useMemo(() => {
                return (
                    options.findIndex((item) => item.value === typeVal) !== -1
                );
            }, [options, typeVal]);

            const initialValues = useMemo(() => {
                const copyFormValues: any = { ...formValues };
                Object.keys(copyFormValues).forEach((key) => {
                    if (copyFormValues[key] === 'true') {
                        copyFormValues[key] = true;
                    } else if (copyFormValues[key] === 'false') {
                        copyFormValues[key] = false;
                    }
                });
                return copyFormValues;
            }, [formValues]);

            const defaultFormList = useCreation(() => {
                // eslint-disable-next-line no-extra-boolean-cast
                if (!!isOnlyShowAiType) return [...defaultFormItemsOfAI];
                return [...defaultFormItems];
            }, [isOnlyShowAiType]);
            return (
                <div className={styles['config-form-wrapper']}>
                    <Form
                        form={form}
                        layout={FormProps?.layout ?? 'horizontal'}
                        labelCol={{ span: FormProps?.labelCol ?? 5 }}
                        wrapperCol={{ span: FormProps?.wrapperCol ?? 18 }}
                        initialValues={initialValues}
                        onValuesChange={(changedValues) => {
                            // 当类型改变时，表单项的值采用默认值
                            if (changedValues.Type !== undefined) {
                                const templatesobj = templates.find(
                                    (item) => item.Name === changedValues.Type,
                                );
                                const formItems = templatesobj?.Items || [];
                                formItems.forEach((item) => {
                                    form.setFieldsValue({
                                        [item.Name]: [
                                            'string',
                                            'list',
                                        ].includes(item.Type)
                                            ? item.DefaultValue
                                            : item.DefaultValue === 'true',
                                    });
                                });
                            }
                        }}
                        onSubmitCapture={(e) => {
                            e.preventDefault();
                        }}
                        className={styles['config-form']}
                    >
                        <Form.Item
                            label="厂商"
                            rules={[
                                {
                                    required: true,
                                    message: `请${canAddType ? '填写' : '选择'}类型`,
                                },
                            ]}
                            name="Type"
                        >
                            {canAddType ? (
                                <YakitAutoComplete
                                    options={options}
                                    disabled={disabledType}
                                    filterOption={(inputValue, option) => {
                                        if (
                                            option?.label &&
                                            typeof option?.label === 'string'
                                        ) {
                                            return (
                                                option?.label
                                                    ?.toUpperCase()
                                                    .indexOf(
                                                        inputValue.toUpperCase(),
                                                    ) !== -1
                                            );
                                        }
                                        return false;
                                    }}
                                />
                            ) : (
                                <YakitSelect
                                    disabled={disabledType}
                                    options={options}
                                    filterOption={(inputValue, option) => {
                                        if (
                                            option?.label &&
                                            typeof option?.label === 'string'
                                        ) {
                                            return (
                                                option?.label
                                                    ?.toUpperCase()
                                                    .indexOf(
                                                        inputValue.toUpperCase(),
                                                    ) !== -1
                                            );
                                        }
                                        return false;
                                    }}
                                />
                            )}
                        </Form.Item>
                        {isInOptions ? (
                            <>{renderAllFormItems()}</>
                        ) : (
                            <>
                                {defaultFormList.map(
                                    (item: any, index: number) => (
                                        <React.Fragment key={index}>
                                            {renderSingleFormItem(item)}
                                        </React.Fragment>
                                    ),
                                )}
                            </>
                        )}
                    </Form>
                    <div className={styles['config-footer']}>{footer}</div>
                </div>
            );
        }),
    );
