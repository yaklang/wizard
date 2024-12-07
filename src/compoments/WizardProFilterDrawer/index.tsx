import { Dispatch, FC, memo, ReactNode } from 'react';
import { TRecudeInitiakValue } from '../WizardTable/types';
import { Form, Switch } from 'antd';
import { useUpdateEffect } from 'ahooks';
import { FormLayout } from 'antd/es/form/Form';

interface TWizardProFilterDrawerProps {
    status?: TRecudeInitiakValue;
    filterDispatch?: Dispatch<TRecudeInitiakValue>;
    trigger?: ReactNode;
    tableHeight: number;
    wizardScrollHeight: number;
    layout?: FormLayout;
}

const WizardProFilterDrawer: FC<TWizardProFilterDrawerProps> = memo(
    ({
        status: state,
        filterDispatch,
        trigger,
        tableHeight,
        wizardScrollHeight,
        layout = 'vertical',
    }) => {
        const [form] = Form.useForm();

        const headChange = (e: boolean): void => {
            filterDispatch &&
                filterDispatch({
                    proSwitchStatus: e,
                });
        };

        const headFieldsChange = () => {
            const fieldsValue = form.getFieldsValue();
            filterDispatch &&
                filterDispatch({
                    filter: { ...state?.filter, ...fieldsValue },
                    pagemeta: {
                        limit: state!.pagemeta!.limit,
                        total: state!.pagemeta!.total,
                        total_page: state!.pagemeta!.total_page,
                        page: 1,
                    },
                });
        };

        useUpdateEffect(() => {
            const fieldsValue = form.getFieldsValue();
            filterDispatch?.({
                params: {
                    page: 1,
                    limit: state!.params!.limit,
                    total: state!.pagemeta!.total,
                    total_page: state!.pagemeta!.total_page,
                },
                getExternal: { ...fieldsValue },
            });
            form.setFieldsValue(state?.filter);
            !state?.noResetFields && form.resetFields();
        }, [state?.filter, state?.noResetFields]);

        return (
            state && (
                <div
                    className={`h-full bg-white min-w-[300px] min-h-[${wizardScrollHeight}px] border-l-solid border-1 border-[#EAECF3]`}
                >
                    <div
                        className="h-11 py-8 px-4 flex items-center justify-between flex-nowrap"
                        style={{
                            borderBottom: '1px solid #EAECF3',
                        }}
                    >
                        <div className="text-nowrap">高级筛选</div>
                        <Switch
                            value={state?.proSwitchStatus}
                            onChange={headChange}
                        />
                    </div>
                    <Form
                        form={form}
                        onFieldsChange={headFieldsChange}
                        layout={layout}
                        className={`px-4 pt-4 overflow-auto`}
                        style={{
                            maxHeight: tableHeight + 74 + 'px',
                        }}
                    >
                        {trigger}
                    </Form>
                </div>
            )
        );
    },
);

export default WizardProFilterDrawer;
