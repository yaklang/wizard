import { useRef, type FC } from 'react';

import { Button, Form, Input, message, Radio, Spin } from 'antd';
import { ChunkUpload } from '@/compoments';
import { AddSelectSearch } from '../TaskScript/compoment/AddSelectSearch';
import { useRequest, useSafeState } from 'ahooks';
import {
    getAnalysisScript,
    getNodeList,
    getScriptTaskGroup,
    getTaskStream,
    postTaskStart,
} from '@/apis/task';
import type { TScriptGrounpList } from '../TaskScript/compoment/CreateTaskItems';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Item } = Form;
const scanList = [
    {
        targetScriptName: '端口漏洞威胁',
        label: 'IP扫描',
        value: 'ip',
        script_type: 'portAndVulScan',
    },
    {
        targetScriptName: '域名漏洞威胁',
        label: '域名扫描',
        value: 'domain',
        script_type: 'subdomain_scan',
    },
];

const CreateTask: FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const scriptGroupListRef = useRef<TScriptGrounpList>();
    const [targetPlaceholder, setTargetPlaceholder] = useSafeState('请输入');

    const onSubmit = async () => {
        const resultForm = await form.validateFields();
        const findTaskScriptItems: any = taskScriptList?.find(
            (items) => items.key === resultForm.scanMode,
        );
        const targetValues = {
            params: {
                report_name: resultForm.params.report_name,
                target: resultForm.params.target,
                execution_node: '1',
                mode: 'syn+tcp',
                'preset-protes': ['all'],
                ports: '1-65535',
                ...findTaskScriptItems?.prompt_args,
            },
            task_id: `[${resultForm.params.report_name}]-[${dayjs().format('M月DD日')}]`,
            task_group: resultForm.task_group,
            script_type: findTaskScriptItems?.script_type,
            script_name: findTaskScriptItems?.script_name,
            scanner: scannerDataList?.length
                ? [
                      scannerDataList.reduce((min, cur) =>
                          (cur?.size ?? Infinity) < (min?.size ?? Infinity)
                              ? cur
                              : min,
                      )?.name as string,
                  ]
                : [],
            sched_type: 1,
            concurrent: 20,
            task_type: 'batch-invoking-script',
            enable_sched: false,
        };

        await AddTaskRunAsync(targetValues);
    };

    const { run: TaskStearmRun } = useRequest(getTaskStream, {
        manual: true,
        onError: () => message.error('加入实时更新失败'),
    });

    const { runAsync: AddTaskRunAsync, loading: addLoading } = useRequest(
        postTaskStart,
        {
            manual: true,
            onSuccess: async ({ data }) => {
                message.success('创建成功');
                await TaskStearmRun(data.id);
                navigate('/task/task-list', { replace: true });
            },
            onError: (err) => {
                message.destroy();
                message.error(`错误: ${err.message}`);
            },
        },
    );

    // 获取脚本列表
    const { data: taskScriptList, loading } = useRequest(
        async () => {
            const result = await getAnalysisScript();
            const {
                data: { list },
            } = result;

            const scanMap = new Map(
                scanList.map((item) => [item.targetScriptName, item.value]),
            );

            const targetScriptNameList = list
                .filter(
                    (item): item is typeof item & { script_name: string } =>
                        typeof item.script_name === 'string' &&
                        [...scanMap.keys()].some((key) =>
                            item.script_name?.includes(key),
                        ),
                )
                .map((item) => {
                    const matchedKey = [...scanMap.keys()].find((key) =>
                        item.script_name.includes(key),
                    )!;

                    return {
                        ...item,
                        key: scanMap.get(matchedKey)!,
                    };
                });

            return targetScriptNameList;
        },
        {
            onSuccess: (val) => {
                const resultFormTargetPlaceholder =
                    val?.find((items) => items.key === 'ip')?.description ??
                    '请输入';
                setTargetPlaceholder(resultFormTargetPlaceholder);
            },
        },
    );

    // 获取 启动脚本任务 任务组参数
    const { data: scriptTaskGroupData, loading: scriptTaskGroupLoading } =
        useRequest(async () => {
            const result = await getScriptTaskGroup();
            const {
                data: { list },
            } = result;

            const resultList = list?.map((it) => ({
                value: it.name,
                label: it.name,
            }));
            return resultList ?? [];
        });

    // 获取节点 请求
    const { data: scannerDataList } = useRequest(async () => {
        const result = await getNodeList();
        const {
            data: { list },
        } = result;

        const targetNodeList = list?.map((it) => ({
            name: it?.node_id,
            size: it?.task_running,
            date: it?.updated_at
                ? dayjs(new Date().getTime()).unix() - it.updated_at
                : '-',
        }));
        return targetNodeList ?? [];
    });

    return (
        <Spin spinning={loading}>
            <div className="flex justify-center mt-10">
                <div className="flex items-center justify-center w-1/2">
                    <Form
                        form={form}
                        layout="vertical"
                        className="w-full"
                        initialValues={{ scanMode: 'ip' }}
                        onValuesChange={(changedValues) => {
                            if (changedValues.scanMode) {
                                const resultFormTargetPlaceholder =
                                    taskScriptList?.find(
                                        (items) =>
                                            items.key ===
                                            changedValues.scanMode,
                                    )?.description ?? '请输入';

                                setTargetPlaceholder(
                                    resultFormTargetPlaceholder,
                                );
                            }
                        }}
                    >
                        <Item
                            label="报告名称"
                            name={['params', 'report_name']}
                            rules={[
                                {
                                    message: '请输入报告名称',
                                    required: true,
                                },
                            ]}
                        >
                            <Input placeholder="请输入..." />
                        </Item>

                        <Item
                            label="所属任务组"
                            name="task_group"
                            rules={[
                                {
                                    message: '请选择所属任务组',
                                    required: true,
                                },
                            ]}
                        >
                            <AddSelectSearch
                                scriptGroupListRef={scriptGroupListRef}
                                scriptGroupList={scriptTaskGroupData}
                                loading={scriptTaskGroupLoading}
                            />
                        </Item>

                        <Item
                            name="scanMode"
                            label="扫描模式"
                            layout="horizontal"
                        >
                            <Radio.Group
                                optionType="button"
                                buttonStyle="solid"
                                options={scanList}
                            />
                        </Item>

                        <Item noStyle name="param_files" />

                        <Item noStyle dependencies={[]}>
                            {({ setFieldValue }) => {
                                return (
                                    <Item
                                        label="扫描目标"
                                        name={['params', 'target']}
                                        rules={[
                                            {
                                                required: true,
                                                message: '请输入或上传扫描目标',
                                            },
                                        ]}
                                        extra={
                                            <div className="flex items-center font-normal text-xs color-[#85899E]">
                                                可将TXT、Excel文件拖入框内或
                                                <ChunkUpload
                                                    url="/material/files"
                                                    chunkSize={2}
                                                    accept=".txt"
                                                    maxCount={1}
                                                    encryptionKey="param_files"
                                                    onChange={(fileName) => {
                                                        setFieldValue(
                                                            [
                                                                'params',
                                                                'target',
                                                            ],
                                                            fileName,
                                                        );
                                                        setFieldValue(
                                                            'param_files',
                                                            fileName,
                                                        );
                                                    }}
                                                >
                                                    <Button type="link">
                                                        点击此处
                                                    </Button>
                                                </ChunkUpload>
                                                上传
                                            </div>
                                        }
                                    >
                                        <ChunkUpload
                                            url="/material/files"
                                            chunkSize={2}
                                            accept=".txt"
                                            childrenType="textArea"
                                            encryptionKey="param_files"
                                            setFieldValue={setFieldValue}
                                            maxCount={1}
                                            placeholder={targetPlaceholder}
                                            onChange={(fileName) => {
                                                setFieldValue(
                                                    ['params', 'target'],
                                                    fileName,
                                                );
                                                setFieldValue(
                                                    'param_files',
                                                    fileName,
                                                );
                                            }}
                                        />
                                    </Item>
                                );
                            }}
                        </Item>
                        <div className="flex justify-center">
                            <Button
                                onClick={onSubmit}
                                type="primary"
                                loading={addLoading}
                            >
                                开始执行
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </Spin>
    );
};

export { CreateTask };
