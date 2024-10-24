import { WizardModal } from '@/compoments';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { PlusOutlined } from '@ant-design/icons';
import {
    Button,
    Space,
    Collapse,
    DatePicker,
    Form,
    Input,
    Radio,
    Select,
} from 'antd';
import { CollapseProps } from 'antd/lib';
import { forwardRef, useImperativeHandle } from 'react';
import { match } from 'ts-pattern';
import { NodeCard } from './NodeCard';

const { Item } = Form;
const { RangePicker } = DatePicker;
const { Compact } = Space;

export const CardList = [
    {
        name: '节点一',
        size: 10,
        date: '2',
    },
    {
        name: '节点二',
        size: 10,
        date: '2',
    },
    {
        name: '节点三',
        size: 10,
        date: '2',
    },
    {
        name: '节点四',
        size: 10,
        date: '2',
    },
    {
        name: '节点五',
        size: 10,
        date: '2',
    },
    {
        name: '节点六',
        size: 10,
        date: '2',
    },
    {
        name: '节点七',
        size: 10,
        date: '2',
    },
];

const schedulingTypeFn = (type: 1 | 2 | 3) => {
    const ExecutionNodeItems = (
        <>
            <Item
                name="execution_node"
                label={<div className="min-w-[112px]">执行节点</div>}
                initialValue={1}
            >
                <Radio.Group
                    className="h-8 flex items-center"
                    options={[
                        { value: 1, label: '手动分配' },
                        { value: 2, label: '智能分配' },
                    ]}
                />
            </Item>
            <Item dependencies={['execution_node']}>
                {({ getFieldValue }) => {
                    const executionNodeValue = getFieldValue('execution_node');
                    return executionNodeValue === 1 && CardList.length <= 6 ? (
                        <Item name="node_card" noStyle>
                            <NodeCard list={CardList} />
                        </Item>
                    ) : (
                        <Item
                            name="node_card"
                            label={
                                <div className="min-w-[112px]">节点选择</div>
                            }
                        >
                            <Select
                                mode="multiple"
                                allowClear
                                style={{ width: '100%' }}
                                placeholder="请选择节点"
                                optionRender={(option) => {
                                    return (
                                        <Space>
                                            {option.data.value}
                                            （当前任务量{option.data.size}）
                                        </Space>
                                    );
                                }}
                                options={CardList.map((it) => ({
                                    label: it.name,
                                    value: it.name,
                                    size: it.size,
                                }))}
                            />
                        </Item>
                    );
                }}
            </Item>
        </>
    );
    return match(type)
        .with(1, () => {
            return <>{ExecutionNodeItems}</>;
        })
        .with(2, () => {
            return (
                <>
                    <Item
                        name="execution_date"
                        label={<div className="min-w-[112px]">执行时间</div>}
                    >
                        <DatePicker
                            className="w-full"
                            format={'YYYY-MM-DD HH:mm'}
                        />
                    </Item>
                    {ExecutionNodeItems}
                </>
            );
        })
        .with(3, () => {
            return (
                <>
                    <Item name="date_scope" label="设定周期时间范围">
                        <RangePicker
                            className="w-full"
                            showTime={{ format: 'HH:mm' }}
                            format="YYYY-MM-DD HH:mm"
                        />
                    </Item>
                    <Item label={<div className="min-w-[112px]">执行周期</div>}>
                        <Compact block={true}>
                            <Item name={['address', 'province']} noStyle>
                                <Input
                                    placeholder="请输入..."
                                    style={{ width: '150%' }}
                                />
                            </Item>
                            <Item name={['address', 'street']} noStyle>
                                <Select
                                    placeholder="请选择"
                                    options={[
                                        { label: 'Second', value: 1 },
                                        { label: 'Day', value: 2 },
                                        { label: 'Hour', value: 3 },
                                        { label: 'Minute', value: 4 },
                                    ]}
                                />
                            </Item>
                        </Compact>
                    </Item>
                </>
            );
        })
        .exhaustive();
};

const items: CollapseProps['items'] = [
    {
        key: '1',
        label: '基本信息',
        style: {
            borderBottom: '1px solid #EAECF3',
            borderRadius: '0px',
            marginBottom: '8px',
        },
        children: (
            <div>
                <Item
                    label={<div className="min-w-[112px]">任务名称</div>}
                    name={'name'}
                >
                    <Input placeholder="请输入..." />
                </Item>
                <Item
                    label={<div className="min-w-[112px]">任务组</div>}
                    name={'group_task'}
                >
                    <Select placeholder="请选择..." />
                </Item>
            </div>
        ),
        extra: (
            <Button
                color="danger"
                variant="link"
                onClick={(e) => {
                    e.stopPropagation();
                    console.log(111);
                }}
            >
                重置
            </Button>
        ),
    },
    {
        key: '2',
        label: '设置参数',
        style: {
            borderBottom: '1px solid #EAECF3',
            borderRadius: '0px',
            marginBottom: '8px',
        },
        children: (
            <div>
                <Item
                    label={<div className="min-w-[112px]">扫描目标</div>}
                    name={'name'}
                    extra={
                        <div className="font-normal text-xs color-[#85899E]">
                            可将TXT、Excel文件拖入框内或
                            <Button type="link">点击此处</Button>上传
                        </div>
                    }
                >
                    <Input.TextArea
                        placeholder="请输入扫描目标，多个目标用“英文逗号”或换行分割"
                        rows={4}
                    />
                </Item>
                <Item
                    label={<div className="min-w-[112px]">额外参数</div>}
                    name={'group_task'}
                >
                    <Select placeholder="请选择..." />
                </Item>
                <Item
                    label={<div className="min-w-[112px]">设置插件</div>}
                    name={'group_task'}
                >
                    <Button type="link" style={{ padding: '4px 0' }}>
                        <PlusOutlined /> 添加插件
                    </Button>
                </Item>
            </div>
        ),
        extra: (
            <Button
                color="danger"
                variant="link"
                onClick={(e) => {
                    e.stopPropagation();
                    console.log(111);
                }}
            >
                重置
            </Button>
        ),
    },
    {
        key: '3',
        label: '设置调度',
        style: {
            borderBottom: '1px solid #EAECF3',
            borderRadius: '0px',
            marginBottom: '8px',
        },
        extra: (
            <Button
                color="danger"
                variant="link"
                onClick={(e) => {
                    e.stopPropagation();
                    console.log(111);
                }}
            >
                重置
            </Button>
        ),
        children: (
            <div>
                <Item
                    label={<div className="min-w-[112px]">调度类型</div>}
                    name={'type'}
                    initialValue={1}
                >
                    <Select
                        options={[
                            { label: '无', value: 1 },
                            { label: '定时任务', value: 2 },
                            { label: '周期任务', value: 3 },
                        ]}
                    />
                </Item>
                <Item dependencies={['type']}>
                    {({ getFieldValue }) => {
                        const formType = getFieldValue('type');
                        return schedulingTypeFn(formType);
                    }}
                </Item>
            </div>
        ),
    },
];

const StartUpScriptModal = forwardRef<
    UseModalRefType,
    { runAsync: () => void }
>(({}, ref) => {
    const [model] = WizardModal.useModal();
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
        open() {
            model.open();
        },
    }));

    const onOk = () => {
        const values = form.getFieldsValue();
        console.log(values, 'values');
    };

    return (
        <WizardModal
            footer={
                <>
                    <Button
                        key="link"
                        onClick={() => {
                            model.close();
                            form.resetFields();
                        }}
                    >
                        取消
                    </Button>
                    <Button key="submit" type="primary" onClick={() => onOk()}>
                        确定
                    </Button>
                </>
            }
            width={640}
            modal={model}
            title="启动分布式脚本任务"
        >
            <div className="pb-2 px-6 overflow-auto max-h-[65vh]">
                <Form form={form} layout="horizontal">
                    <Collapse
                        defaultActiveKey={['1', '2', '3']}
                        bordered={true}
                        ghost
                        items={items}
                    />
                </Form>
            </div>
        </WizardModal>
    );
});

export { StartUpScriptModal };
