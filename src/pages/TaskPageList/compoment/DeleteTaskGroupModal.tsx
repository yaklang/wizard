import { deleteTaskGroup } from '@/apis/task';
import { FormInstance, Form, Radio, Select, Space } from 'antd';
import { FC } from 'react';

const { Item } = Form;

const WhetherRadio: FC<{ onChange?: (value: any) => void }> = ({
    onChange,
}) => {
    return (
        <Radio.Group onChange={(e) => onChange && onChange(e.target.value)}>
            <Space direction="vertical">
                <Radio value={1}>是</Radio>
                <Radio value={2}>否</Radio>
            </Space>
        </Radio.Group>
    );
};

const DeleteTaskGroupConfig = (
    form: FormInstance<any>,
    groupTaskList: Array<Record<string, string>>,
    name: string,
    refreshAsync: <T>() => Promise<T>,
) => {
    return {
        title: (
            <div>
                删除【
                <span>
                    {name.length > 10 ? name.slice(0, 10) + '...' : name}
                </span>
                】任务组的同时是否删除组内所有任务
            </div>
        ),
        cancelText: '取消',
        keyboard: false,
        destroyOnClose: true,
        afterClose: () => form.resetFields(),
        onOk: async () => {
            try {
                const result = await form.validateFields();
                const targetDeleteTaskGroupResponse = {
                    group_name: name,
                    new_group_name: result.group_task,
                };
                await deleteTaskGroup(targetDeleteTaskGroupResponse);
                await refreshAsync();
                form.resetFields();
            } catch (err) {
                console.error(err, 'err');
                return Promise.reject();
            }
        },

        content: (
            <div className="mt-2">
                <Form form={form} layout="vertical">
                    <Item
                        name="whether"
                        rules={[{ required: true, message: '请选择' }]}
                        noStyle
                    >
                        <WhetherRadio />
                    </Item>
                    <Form.Item noStyle dependencies={['whether']}>
                        {({ getFieldValue }) => {
                            const whetherValue = getFieldValue('whether');
                            return (
                                whetherValue === 2 && (
                                    <Item
                                        label="任务迁移到以下分组"
                                        name="group_task"
                                        style={{
                                            marginLeft: '20px',
                                            marginTop: '12px',
                                        }}
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    '请选择删除该任务组后需迁移到的任务组',
                                            },
                                        ]}
                                    >
                                        <Select
                                            options={groupTaskList.filter(
                                                (it) => it.value !== name,
                                            )}
                                            placeholder="请选择"
                                        />
                                    </Item>
                                )
                            );
                        }}
                    </Form.Item>
                </Form>
            </div>
        ),
    };
};

export { DeleteTaskGroupConfig };
