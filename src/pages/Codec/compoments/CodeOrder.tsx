import { SortableList } from '@/compoments';
import { DragHandleIcon } from '../assets/DragHandleIcon';
import {
    CloseOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    StopOutlined,
} from '@ant-design/icons';
import { useTheme } from '../CodecEntry';
import type { TGetAllCodecMethodsResponseWithId } from '../type';
import { useMemo, useRef } from 'react';
import useListenHeight from '@/hooks/useListenHeight';
import { useMemoizedFn, useRequest, useSafeState } from 'ahooks';

import EmptyImages from '@/assets/compoments/Empty.png';
import { Button, Checkbox, message, Popover, Tooltip } from 'antd';
import { OutlineStorage } from '../assets/OutlineStorage';
import { OutlineClock } from '../assets/OutlineClock';
import { CodecTypeItem } from './CodecTypeItem';
import { codecBgColorFn, transformData } from './utils';
import { postRunCodec } from '@/apis/CodecApi';

const { DragHandle } = SortableList;

const mockHistoryList: Array<string> = [];

const CodeOrder = () => {
    const { collectListContext, setCollectListContext } = useTheme();

    const [historyStorageOpen, setHistoryStorageOpen] = useSafeState(false);

    const typeHeaderRef = useRef(null);
    const typeContainerRef = useRef(null);

    const [containerHeight] = useListenHeight(typeContainerRef);
    const [headerHeight] = useListenHeight(typeHeaderRef);

    const { loading, runAsync } = useRequest(postRunCodec, {
        manual: true,
        onSuccess: (value) => {
            const {
                data: { rawResult },
            } = value;
            console.log(rawResult, 'rawResult');
            setCollectListContext((preValue) => ({
                ...preValue,
                rowResult: rawResult,
            }));
        },
        onError: (error) => {
            message.destroy();
            message.error(error.message);
        },
    });

    // 计算codec 类目所在节点高度
    const typeCollapseHeight = useMemoizedFn(() => {
        return containerHeight - headerHeight - 64;
    });

    const disableStatus = useMemo(() => {
        return collectListContext.workflow.length > 0 &&
            collectListContext.text.length > 0
            ? false
            : true;
    }, [collectListContext.workflow, collectListContext.text]);

    // 清空逻辑
    const headClear = () =>
        setCollectListContext((preValue) => ({ ...preValue, workflow: [] }));

    // 单个删除逻辑
    const headClose = (id: string) => {
        setCollectListContext((preValue) => {
            return {
                ...preValue,
                workflow: preValue.workflow.filter((it) => it.id !== id),
            };
        });
    };

    // 启动 / 禁用逻辑
    const handEnable = (id: string) => {
        const result = collectListContext.workflow.map((it) =>
            id === it.id
                ? {
                      ...it,
                      enable: !it.enable,
                      breakpoint:
                          it.breakpoint && !it.enable ? false : it.breakpoint,
                  }
                : { ...it },
        );
        setCollectListContext((preValue) => ({
            ...preValue,
            workflow: result,
        }));
    };

    const handBreakpoint = (id: string) => {
        const result = collectListContext.workflow.map((it) =>
            id === it.id
                ? {
                      ...it,
                      breakpoint: !it.breakpoint,
                      enable: !it.breakpoint && it.enable ? false : it.enable,
                  }
                : { ...it },
        );
        setCollectListContext((preValue) => ({
            ...preValue,
            workflow: result,
        }));
    };

    // 打开关闭 历史存储 气泡卡片
    const handleOpenHistoryStorageOpen = (e: boolean) => {
        setHistoryStorageOpen(e);
    };

    // 历史存储 卡片 展示内容
    const historyStorageContext = useMemo(() => {
        return (
            <div className="w-xs">
                {mockHistoryList.length > 0 ? (
                    <div>asd</div>
                ) : (
                    <div className="text-xs text-[#85899e] flex items-center justify-center">
                        暂无数据
                    </div>
                )}
            </div>
        );
    }, [mockHistoryList]);

    // 立即执行
    const onSubmit = async () => {
        const tragetValue = transformData(collectListContext.workflow);
        await runAsync({
            ...collectListContext,
            workflow: tragetValue,
        });
    };

    return (
        <div
            ref={typeContainerRef}
            className="h-full w-[480px] border-x-solid border-[1px] border-x-[#eaecf3]"
            style={{
                borderBottom: '1px solid #EAECF3',
            }}
        >
            <div ref={typeHeaderRef}>
                <div className="flex justify-between py-2 px-4 border-b-solid border-b-[1px] border-b-[#eaecf3]">
                    <span className="whitespace-nowrap flex items-center gap-1">
                        编解码顺序
                        <div className="bg-[#f0f1f3] text-[#85899e] px-2 rounded-lg">
                            {collectListContext.workflow.length}
                        </div>
                    </span>
                    <div className="flex items-center justify-center gap-2">
                        <Tooltip title="保存">
                            <OutlineStorage className="text-[#85899e] w-4 hover:color-[#1677ff] cursor-pointer" />
                        </Tooltip>
                        <Popover
                            content={historyStorageContext}
                            title="历史存储"
                            trigger="click"
                            open={historyStorageOpen}
                            onOpenChange={handleOpenHistoryStorageOpen}
                        >
                            <Tooltip title="历史存储">
                                <OutlineClock className="text-[#85899e] w-4 hover:color-[#1677ff] cursor-pointer" />
                            </Tooltip>
                        </Popover>
                        <Button
                            type="link"
                            danger
                            className="p-0 border-l-[1px] border-l-solid border-l-[#f0f1f3] rounded-[0px] pl-2 h-4"
                            onClick={headClear}
                        >
                            清空
                        </Button>
                    </div>
                </div>
            </div>

            {collectListContext.workflow &&
            collectListContext.workflow.length > 0 ? (
                <div
                    className="overflow-auto pb-4"
                    style={{
                        height: `${typeCollapseHeight()}px`,
                    }}
                >
                    <SortableList<
                        TGetAllCodecMethodsResponseWithId,
                        'CodecMethod'
                    >
                        rowKey="CodecMethod"
                        value={collectListContext.workflow}
                        onChange={(e) =>
                            setCollectListContext((preValue) => ({
                                ...preValue,
                                workflow: e,
                            }))
                        }
                        renderItem={(item) => (
                            <SortableList.Item
                                id={item.id}
                                className=" py-2 px-4"
                                style={{
                                    background: `${codecBgColorFn(item).background}`,
                                    borderBottom: `1px solid ${codecBgColorFn(item).borderBottom}`,
                                }}
                            >
                                <div className="flex justify-between items-center">
                                    <DragHandle className="w-full cursor-grab flex items-center pb-2">
                                        <div className="w-full flex items-center justify-between">
                                            <div>
                                                <DragHandleIcon className="text-[#b4bbca] h-[12px]" />
                                                <span className="ml-1">
                                                    {item?.CodecName}
                                                </span>
                                            </div>
                                        </div>
                                    </DragHandle>
                                    <div className="cursor-pointer flex gap-3 text-3 color-[#85899e]">
                                        <Tooltip
                                            title={
                                                item.enable ? '启用' : '禁用'
                                            }
                                        >
                                            <StopOutlined
                                                className="hover:text-[#ff4d4f]"
                                                style={{
                                                    color: `${item.enable ? '#f6544a' : '#85899e'}`,
                                                }}
                                                onClick={() =>
                                                    handEnable(item.id)
                                                }
                                            />
                                        </Tooltip>
                                        <Tooltip
                                            title={
                                                item.breakpoint
                                                    ? '开启断点'
                                                    : '关闭断点'
                                            }
                                        >
                                            <div>
                                                {item.breakpoint ? (
                                                    <PlayCircleOutlined
                                                        className="text-[#f6544a] hover:text-[#ff4d4f]"
                                                        onClick={() =>
                                                            handBreakpoint(
                                                                item.id,
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <PauseCircleOutlined
                                                        className="hover:text-[#ff4d4f]"
                                                        onClick={() =>
                                                            handBreakpoint(
                                                                item.id,
                                                            )
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </Tooltip>
                                        <CloseOutlined
                                            className="hover:text-[#ff4d4f]"
                                            onClick={() => headClose(item.id)}
                                        />
                                    </div>
                                </div>
                                {item.Params
                                    ? item.Params.map((node) => {
                                          return (
                                              <CodecTypeItem
                                                  key={node.id}
                                                  childrenItem={{
                                                      ...node,
                                                      id: item.id,
                                                  }}
                                              />
                                          );
                                      })
                                    : null}
                            </SortableList.Item>
                        )}
                    />
                </div>
            ) : (
                <div
                    className="flex items-center justify-center flex-col gap-8"
                    style={{
                        height: `${typeCollapseHeight()}px`,
                    }}
                >
                    <img src={EmptyImages} className="w-[128px]" />
                    <div className="text-[#85899E]">
                        请从左侧列表选择要使用的 Codec 工具
                    </div>
                </div>
            )}

            <div className="h-14 border-t-solid border-t-[1px] border-t-[#eaecf3] p-4 flex items-center">
                <Checkbox
                    disabled={disableStatus}
                    value={collectListContext.auto}
                    onChange={(event) =>
                        setCollectListContext((preValue) => ({
                            ...preValue,
                            auto: event.target.checked,
                        }))
                    }
                >
                    <div className="whitespace-nowrap mr-2">自动执行</div>
                </Checkbox>
                <Button
                    type="primary"
                    className="w-full"
                    onClick={onSubmit}
                    loading={loading}
                    disabled={disableStatus}
                >
                    立即执行
                </Button>
            </div>
        </div>
    );
};

export { CodeOrder };
