import { Dispatch, FC, memo, ReactNode } from 'react';
import { TRecudeInitiakValue } from '../WizardTable/types';
import { Form, Switch } from 'antd';
import { useUpdateEffect } from 'ahooks';

interface TWizardProFilterDrawerProps {
    status?: TRecudeInitiakValue;
    filterDispatch?: Dispatch<TRecudeInitiakValue>;
    trigger?: ReactNode;
    tableHeight: number;
}

const WizardProFilterDrawer: FC<TWizardProFilterDrawerProps> = memo(
    ({ status: state, filterDispatch, trigger, tableHeight }) => {
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
                    // params: {
                    //     limit: state!.params!.limit,
                    //     page: 1,
                    // },
                    pagemeta: {
                        limit: state!.pagemeta!.limit,
                        total: state!.pagemeta!.total,
                        total_page: state!.pagemeta!.total_page,
                        page: 1,
                    },
                });
        };

        useUpdateEffect(() => {
            form.resetFields();
        }, [state?.getExternal]);

        return (
            state && (
                <div className="h-full pt-4 bg-white min-w-[300px]">
                    <div
                        className="h-11 p-4 flex items-center justify-between"
                        style={{
                            borderBottom: '1px solid #EAECF3',
                        }}
                    >
                        <div>高级筛选</div>
                        <Switch
                            value={state.proSwitchStatus}
                            onChange={headChange}
                        />
                    </div>
                    <Form
                        form={form}
                        onFieldsChange={headFieldsChange}
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
