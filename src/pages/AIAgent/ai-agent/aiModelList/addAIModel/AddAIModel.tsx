import React, { useEffect, useState } from 'react';
import styles from './AddAIModel.module.scss';
import { Form } from 'antd';
import { YakitInput } from '@/compoments/YakitUI/YakitInput/YakitInput';
import { useCreation, useMemoizedFn } from 'ahooks';
import { YakitButton } from '@/compoments/YakitUI/YakitButton/YakitButton';
import { YakitFormDragger } from '@/compoments/YakitUI/YakitForm/YakitForm';
import type { AddLocalModelRequest } from '../../type/aiModel';
import { YakitSelect } from '@/compoments/YakitUI/YakitSelect/YakitSelect';
import type { YakitSelectProps } from '@/compoments/YakitUI/YakitSelect/YakitSelectType';
import { grpcAddLocalModel, grpcUpdateLocalModel } from '../utils';
import { AILocalModelTypeEnum } from '../../defaultConstant';
import type { AddAIModelProps } from './AddAIModelType';
export const AddAIModel: React.FC<AddAIModelProps> = React.memo((props) => {
    const { onCancel, defaultValues } = props;
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm<AddLocalModelRequest>();
    useEffect(() => {
        if (defaultValues) {
            form.setFieldsValue({
                Name: defaultValues.Name || '',
                ModelType:
                    defaultValues.ModelType || AILocalModelTypeEnum.AIChat,
                Path: defaultValues.Path || '',
                Description: defaultValues.Description || '',
            });
        }
    }, [defaultValues]);
    const modelTypeOptions: YakitSelectProps['options'] = useCreation(() => {
        return [
            { label: 'aichat', value: AILocalModelTypeEnum.AIChat },
            { label: 'embedding', value: AILocalModelTypeEnum.Embedding },
            // {label: "speech-to-text", value: AILocalModelTypeEnum.SpeechToText}
        ];
    }, []);

    const stopLoading = useMemoizedFn(() => {
        setTimeout(() => {
            setLoading(false);
        }, 200);
    });

    const handleSubmit = useMemoizedFn(() => {
        form.validateFields().then((value: AddLocalModelRequest) => {
            setLoading(true);
            if (defaultValues?.Name) {
                // 更新
                grpcUpdateLocalModel(value).then(onCancel).finally(stopLoading);
            } else {
                // 新增
                grpcAddLocalModel(value).then(onCancel).finally(stopLoading);
            }
        });
    });
    return (
        <div>
            <Form
                form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                className={styles['ai-start-model-form']}
            >
                <Form.Item
                    label="模型名称"
                    name="Name"
                    rules={[{ required: true, message: '请输入模型名称' }]}
                >
                    <YakitInput disabled={!!defaultValues?.Name} />
                </Form.Item>
                <Form.Item
                    label="模型类型"
                    name="ModelType"
                    rules={[{ required: true, message: '请输入模型类型' }]}
                    initialValue={AILocalModelTypeEnum.AIChat}
                >
                    <YakitSelect options={modelTypeOptions} />
                </Form.Item>
                <YakitFormDragger
                    formItemProps={{
                        name: 'Path',
                        label: '文件地址',
                        rules: [{ required: true, message: '请输入文件地址' }],
                    }}
                />

                <Form.Item label="模型描述" name="Description">
                    <YakitInput.TextArea rows={3} />
                </Form.Item>
            </Form>
            <div className={styles['button-group']}>
                <YakitButton type="outline2" size="large" onClick={onCancel}>
                    取消
                </YakitButton>
                <YakitButton
                    type="primary"
                    size="large"
                    loading={loading}
                    onClick={handleSubmit}
                >
                    确定
                </YakitButton>
            </div>
        </div>
    );
});
