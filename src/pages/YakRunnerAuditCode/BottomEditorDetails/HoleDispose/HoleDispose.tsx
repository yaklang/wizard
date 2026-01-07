import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useControllableValue, useMemoizedFn } from 'ahooks';
import {
    apiCreateSSARiskDisposals,
    apiDeleteSSARiskDisposals,
    apiGetSSARiskDisposal,
    type CreateSSARiskDisposalsRequest,
    type SSARiskDisposalData,
} from '../../utils';

import styles from './HoleDispose.module.scss';
import emiter from '@/utils/eventBus/eventBus';
import { RightBugAuditResultHeader } from '../BottomEditorDetails';
import { YakitButton } from '@/compoments/YakitUI/YakitButton/YakitButton';
import { Input } from 'antd';
import { YakitSelect } from '@/compoments/YakitUI/YakitSelect/YakitSelect';
import type { SSARisk } from '../../YakRunnerAuditCodeType';
import { yakitNotify } from '@/utils/notification';
import { PopoverArrowIcon } from '../../icon';
import classNames from 'classnames';
import type { TextAreaRef } from 'antd/lib/input/TextArea';
import { formatTimestamp } from '@/utils/timeUtil';
import { YakitTag } from '@/compoments/YakitUI/YakitTag/YakitTag';
import { YakitPopconfirm } from '@/compoments/YakitUI/YakitPopconfirm/YakitPopconfirm';
import { YakitEmpty } from '@/compoments/YakitUI/YakitEmpty/YakitEmpty';
import { SolidPaperairplaneIcon } from '@/assets/icon/solid';
import { LogNodeStatusModifyIcon } from '@/assets/icon/colors';

export interface AuditResultHistoryProps {
    info: SSARisk;
    disposalData: SSARiskDisposalData[];
    setDisposalData: (data: SSARiskDisposalData[]) => void;
    setLatestDisposalStatus?: (info: SSARisk, status: string) => void;
    style?: React.CSSProperties;
    getSSARiskDisposal?: (info: SSARisk) => void;
    refreshFileOrRuleTree?: () => void;
}

const defaultTags = [
    {
        label: '有问题',
        value: 'is_issue',
    },
    {
        label: '不是问题',
        value: 'not_issue',
    },
    {
        label: '存疑',
        value: 'suspicious',
    },
    {
        label: '未处置',
        value: 'not_set',
    },
];

export const AuditResultHistory: React.FC<AuditResultHistoryProps> = React.memo(
    (props) => {
        const {
            info,
            setLatestDisposalStatus,
            style,
            getSSARiskDisposal,
            refreshFileOrRuleTree,
        } = props;
        const [disposalData, setDisposalData] = useControllableValue<
            SSARiskDisposalData[]
        >(props, {
            defaultValue: [],
            valuePropName: 'disposalData',
            trigger: 'setDisposalData',
        });
        // 文本内容相关
        const textAreaRef = useRef<TextAreaRef>(null);
        const [value, setValue] = useState<string>('');
        const [loading, setLoading] = useState<boolean>(false);
        const [selectValue, setSelectValue] = useState<string>('');
        const disabled = useMemo(() => {
            return value.length === 0 || selectValue.length === 0;
        }, [value, selectValue]);
        const onDeleteSSARiskDisposals = useMemoizedFn((id: number) => {
            apiDeleteSSARiskDisposals({ Filter: { ID: [id] } })
                .then(() => {
                    const newDisposalData = disposalData.filter(
                        // eslint-disable-next-line max-nested-callbacks
                        (item: any) => item.Id !== id,
                    );
                    setLatestDisposalStatus &&
                        setLatestDisposalStatus(
                            info,
                            newDisposalData.length > 0
                                ? newDisposalData[0].Status
                                : 'not_set',
                        );
                    setDisposalData(newDisposalData);
                    refreshFileOrRuleTree?.();
                    yakitNotify('success', '删除成功');
                })
                .catch((e) => {
                    yakitNotify('error', `删除失败: ${e}`);
                });
        });

        const AuditResultHistoryItem = useMemoizedFn(
            (info: SSARiskDisposalData, index: number) => {
                const getLabelByValue = (value: string) => {
                    // 使用 find 方法查找匹配的 value
                    const option = defaultTags.find(
                        (option) => option.value === value,
                    );

                    // 如果找到匹配的 value，返回对应的 label，否则返回 null
                    return option ? option.label : '未识别状态';
                };
                return (
                    <div className={classNames(styles['audit-result-history'])}>
                        <div className={styles['audit-result-history-opt']}>
                            <PopoverArrowIcon
                                className={styles['arrow-icon']}
                            />
                            <div className={styles['icon-wrapper']}>
                                <LogNodeStatusModifyIcon />
                            </div>
                            <div
                                className={classNames(styles['line-tail'], {
                                    [styles['hidden-line-tail']]:
                                        index + 1 === disposalData.length,
                                })}
                            >
                                <div className={styles['line-wrapper']}>
                                    <div className={styles['line-top-dot']} />
                                    <div className={styles['line-style']} />
                                    <div
                                        className={styles['line-bottom-dot']}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles['audit-result-history-info']}>
                            <div className={styles['info-body']}>
                                {/* 头部信息 */}
                                <div
                                    className={classNames(
                                        styles['info-header'],
                                        {
                                            [styles[
                                                'info-header-line-additional'
                                            ]]: true,
                                        },
                                    )}
                                >
                                    <div className={styles['header-content']}>
                                        {/* <AuthorImg src={info.headImg || UnLogin} wrapperClassName={styles["img-style"]} /> */}
                                        <div className={styles['author-name']}>
                                            处置状态：
                                            {getLabelByValue(info.Status)}
                                        </div>
                                        {/* <div className={styles["log-content"]}>content</div> */}
                                        <div className={styles['log-time']}>
                                            {formatTimestamp(info.UpdatedAt)}
                                        </div>
                                        {info.TaskName && (
                                            <YakitTag color="info">
                                                {info.TaskName}
                                            </YakitTag>
                                        )}
                                        <div className={styles['option']}>
                                            <YakitPopconfirm
                                                title="确认删除此处置记录吗？"
                                                onConfirm={(e) => {
                                                    e?.stopPropagation();
                                                    onDeleteSSARiskDisposals(
                                                        info.Id,
                                                    );
                                                }}
                                                placement="left"
                                            >
                                                <YakitButton
                                                    danger
                                                    type="text"
                                                    size="small"
                                                >
                                                    删除
                                                </YakitButton>
                                            </YakitPopconfirm>
                                        </div>
                                    </div>
                                </div>
                                {/* 附加信息 */}
                                <div className={styles['info-additional']}>
                                    <div
                                        className={classNames(
                                            styles['description-style'],
                                            'yakit-content-multiLine-ellipsis',
                                        )}
                                    >
                                        {info.Comment || '暂无处置说明'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            },
        );

        const onSubmit = useMemoizedFn(() => {
            setLoading(true);
            const params: CreateSSARiskDisposalsRequest = {
                RiskIds: [info.Id],
                Status: selectValue,
                Comment: value,
            };
            apiCreateSSARiskDisposals(params).then(() => {
                setLatestDisposalStatus &&
                    setLatestDisposalStatus(info, selectValue);
                getSSARiskDisposal && getSSARiskDisposal(info);
                setValue('');
                setSelectValue('');
                setLoading(false);
                yakitNotify('success', '处置成功');
                refreshFileOrRuleTree?.();
            });
        });
        /** ----------  操作相关 Start ---------- */
        const [textareaFocus, setTextareaFocus] = useState<boolean>(false);
        // 文本区域聚焦状态
        const handleFocus = useMemoizedFn(() => {
            setTextareaFocus(true);
            textAreaRef.current!.focus({ cursor: 'end' });
        });
        // 文本区域失焦状态
        const handleBlur = useMemoizedFn(() => {
            setTextareaFocus(false);
        });
        // 文本区域聚焦后光标设置到文本内容最后
        const handleTextareaFocus = useMemoizedFn(() => {
            textAreaRef.current!.focus({ cursor: 'end' });
        });
        /** ---------- 操作相关 End ---------- */
        return (
            <div
                className={styles['audit-result-history-wrapper']}
                style={style}
            >
                <div className={styles['audit-result-history-list']}>
                    {disposalData.length > 0 ? (
                        <>
                            {disposalData.map((item: any, index: any) =>
                                AuditResultHistoryItem(item, index),
                            )}
                        </>
                    ) : (
                        <YakitEmpty title="暂无漏洞处置信息" />
                    )}
                </div>

                <div
                    className={classNames(styles['footer-textarea'], {
                        [styles['footer-textarea-focus']]: textareaFocus,
                    })}
                    onClick={handleTextareaFocus}
                >
                    <div className={styles['select-wrapper']}>
                        <div className={styles['label']}>处置状态：</div>
                        <div
                            className={styles['option']}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <YakitSelect
                                allowClear
                                value={selectValue}
                                onChange={(v) => {
                                    setSelectValue(v || '');
                                }}
                                size="small"
                            >
                                {defaultTags.map((item) => {
                                    return (
                                        <YakitSelect.Option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </YakitSelect.Option>
                                    );
                                })}
                            </YakitSelect>
                        </div>
                    </div>

                    <Input.TextArea
                        ref={textAreaRef}
                        className={styles['textarea-body']}
                        value={value}
                        bordered={false}
                        autoSize={{ minRows: 1, maxRows: 3 }}
                        placeholder="请留下对处置的说明..."
                        spellCheck={false}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={(e) => setValue(e.target.value)}
                        size="small"
                    />
                    <div className={styles['right-footer']}>
                        <YakitButton
                            size="small"
                            loading={loading}
                            disabled={disabled}
                            onClick={onSubmit}
                        >
                            <SolidPaperairplaneIcon />
                            发布处置
                        </YakitButton>
                    </div>
                </div>
            </div>
        );
    },
);

export interface HoleDisposeProps {
    RiskHash: string;
    info?: any;
}
export const HoleDispose: React.FC<HoleDisposeProps> = (props) => {
    const { RiskHash, info } = props;
    const [disposalData, setDisposalData] = useState<SSARiskDisposalData[]>();
    const getSSARiskDisposal = useMemoizedFn(() => {
        apiGetSSARiskDisposal({ RiskHash }).then((data: any) => {
            setDisposalData(data.Data || []);
        });
    });

    useEffect(() => {
        setDisposalData(undefined);
        getSSARiskDisposal();
    }, [RiskHash]);

    return (
        <div className={styles['hole-dispose-container']}>
            {info && disposalData && (
                <>
                    <RightBugAuditResultHeader info={info} />

                    <AuditResultHistory
                        info={info}
                        disposalData={disposalData}
                        setDisposalData={setDisposalData}
                        style={{ padding: 12 }}
                        getSSARiskDisposal={getSSARiskDisposal}
                        refreshFileOrRuleTree={() => {
                            emiter.emit('onRefreshFileOrRuleTree');
                        }}
                    />
                </>
            )}
        </div>
    );
};
