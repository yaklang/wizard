import { useMemo, useRef, type FC } from 'react';

import {
    useDebounceEffect,
    useMemoizedFn,
    useRequest,
    useSafeState,
} from 'ahooks';
import { v4 as uuidv4 } from 'uuid';
import { getAllCodecMethods } from '@/apis/CodecApi';
import { groupedCodecs, headOperateCodecType } from './utils';

import { SiderClose, SiderOpen } from '@/assets/compoments';
import { Collapse, Input, Popover, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { CollapseProps } from 'antd/lib';
import type { TGetAllCodecMethodsResponse } from '@/apis/CodecApi/type';

import styles from './CodecType.module.scss';
import { SolidStar } from '../assets/SolidStar';
import { OutlineStar } from '../assets/OutlineStar';
import useListenHeight from '@/hooks/useListenHeight';
import { useTheme } from '../CodecEntry';

const CodecType: FC = () => {
    const { setCollectListContext } = useTheme();
    const typeContainerRef = useRef(null);
    const typeHeaderRef = useRef(null);

    const [collapsed, setCollapsed] = useSafeState(true);
    const [collapseActiveKey, setCollapseActiveKey] = useSafeState(['']);
    const [collectList, setCollectList] = useSafeState<
        TGetAllCodecMethodsResponse[]
    >([]);
    const [searchData, setSearchData] = useSafeState<
        TGetAllCodecMethodsResponse[]
    >([]);
    const [searchValue, setSearchValue] = useSafeState('');

    const [containerHeight, containerWidth] = useListenHeight(typeContainerRef);
    const [headerHeight, headerWidth] = useListenHeight(typeHeaderRef);

    // 获取 codec 类目
    const { data, loading } = useRequest(async () => {
        const { data } = await getAllCodecMethods();
        const { list } = data;
        // 因 web 端 无非解析 Yak 脚本， 所有祛除掉
        const reusltList = list.filter((it) => it.Tag !== 'Yak脚本');
        return { list: reusltList };
    });

    // 计算codec 类目所在节点高度
    const typeCollapseHeight = useMemoizedFn(
        () => containerHeight - headerHeight,
    );

    useDebounceEffect(
        () => {
            if (searchValue && searchValue.length) {
                const filterCodec =
                    data?.list?.filter((item) =>
                        item.CodecName.toLocaleLowerCase().includes(
                            searchValue.toLocaleLowerCase(),
                        ),
                    ) ?? [];
                setSearchData(filterCodec);
            } else {
                setSearchData([]);
            }
        },
        [searchValue],
        { leading: true, wait: 500 },
    );

    const headSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    // 取消 / 添加 收藏操作
    const handCollect = (
        event: React.MouseEvent<SVGSVGElement, MouseEvent>,
        item: TGetAllCodecMethodsResponse,
    ) => {
        event.stopPropagation();
        setCollectList((preValue) => headOperateCodecType(preValue, item));
    };

    // 取消/ 添加 codec 类目
    const headClick = (item: TGetAllCodecMethodsResponse) => {
        setCollectListContext((preValue) =>
            preValue.concat({
                ...item,
                id: uuidv4(),
                breakpoint: false,
                enable: false,
            }),
        );
    };

    // Collapse 展开渲染节点
    const CollapseChildren = useMemoizedFn(
        (list: TGetAllCodecMethodsResponse[]) => {
            console.log(containerWidth, headerWidth);
            return (
                <div>
                    {list?.map((item) => {
                        const checkedCollect = collectList.some(
                            (collect) => collect.CodecName === item.CodecName,
                        );
                        return (
                            <Popover
                                content={
                                    <div className="w-88 text-[#85899E] ">
                                        {item?.Desc}
                                    </div>
                                }
                                title={item.CodecName}
                                trigger="hover"
                                placement="right"
                                key={item.CodecMethod}
                            >
                                <div
                                    className="cursor-pointer pl-6 flex items-center bg-[#f8f8f8] border-b-[1px] border-[#eaecf3] border-b-solid px-2 py-3 justify-between flex-row 
                                hover:bg-[#c2dbff]"
                                    onClick={() => headClick(item)}
                                >
                                    <div>{item.CodecName}</div>
                                    {!checkedCollect ? (
                                        <OutlineStar
                                            className="h-4 text-[#85899E]"
                                            onClick={(e) =>
                                                handCollect(e, item)
                                            }
                                        />
                                    ) : (
                                        <SolidStar
                                            className="h-4 w-6 text-[#1677FF]"
                                            onClick={(e) =>
                                                handCollect(e, item)
                                            }
                                        />
                                    )}
                                </div>
                            </Popover>
                        );
                    })}
                </div>
            );
        },
    );

    // 转换编码方式数据 构建 Collapse 数据
    const transformUtilsDataMemo = useMemo((): CollapseProps['items'] => {
        // 转换数据格式
        const transformGroupedCodec = groupedCodecs(data?.list || []);
        // 查看是否存在 收藏类
        const tragetGroupedCoedc = collectList.length
            ? {
                  我收藏的工具: collectList,
                  ...transformGroupedCodec,
              }
            : transformGroupedCodec;
        // 获取转换的数据格式的key
        const groupKeys = Object.keys(tragetGroupedCoedc);
        // 将其他字段放置于最后
        const sortedArr = groupKeys.sort((cur, pre) =>
            cur === '其他' ? 1 : pre === '其他' ? -1 : 0,
        );

        const resuleData = sortedArr.map((key) => {
            return {
                key,
                label: (
                    <div
                        className="h-10 px-2 py-3 border-b-solid border-b-[#eaecf3] border-[1px] hover:bg-[#f8f8f8] flex justify-between items-center"
                        style={{
                            color: collapseActiveKey.includes(key)
                                ? '#1677FF'
                                : '#000',
                        }}
                    >
                        <div>{key}</div>
                        {key === '我收藏的工具' && (
                            <SolidStar className="h-4 w-6 text-[#16d0ff]" />
                        )}
                    </div>
                ),
                children: CollapseChildren(tragetGroupedCoedc[key]),
            };
        });
        return resuleData;
    }, [data, collapseActiveKey, collectList]);

    // 展开折叠框 callback
    const CollapseChange = (e: string[]) => {
        setCollapseActiveKey([e?.[e.length - 1]]);
    };

    return (
        <div
            className="h-full"
            style={{
                width: collapsed ? '360px' : '52px',
                transition: 'all 0.3s ease',
            }}
            ref={typeContainerRef}
        >
            <Spin spinning={loading}>
                <div ref={typeHeaderRef}>
                    <div className="flex justify-between py-2 px-4">
                        {collapsed ? (
                            <span className="whitespace-nowrap">Codec分类</span>
                        ) : null}
                        <span onClick={() => setCollapsed((val) => !val)}>
                            {collapsed ? (
                                <SiderClose className="hover:color-[#1677ff] cursor-pointer color-[#85899E]" />
                            ) : (
                                <SiderOpen className="hover:color-[#1677ff] cursor-pointer color-[#85899E]" />
                            )}
                        </span>
                    </div>
                    {collapsed && (
                        <div className="px-2 border-b-[1px] border-b-solid border-b-[#f8f8f8] pb-2">
                            <Input
                                placeholder="请输入关键词搜索"
                                prefix={<SearchOutlined />}
                                onChange={(e) => headSearch(e)}
                                value={searchValue}
                            />
                        </div>
                    )}
                </div>
                {collapsed && (
                    <div
                        style={{ height: `${typeCollapseHeight()}px` }}
                        className="overflow-auto"
                    >
                        {searchData.length > 0 &&
                            searchValue.length > 0 &&
                            CollapseChildren(searchData)}

                        {!(searchValue.length > 0) && (
                            <Collapse
                                ghost
                                activeKey={collapseActiveKey}
                                items={transformUtilsDataMemo}
                                destroyInactivePanel
                                expandIcon={() => null}
                                onChange={(e) => CollapseChange(e)}
                                className={styles['collapse-children']}
                            />
                        )}
                        <div className="w-full flex justify-center text-[#85899E] my-4">
                            已经到底啦～
                        </div>
                    </div>
                )}
            </Spin>
        </div>
    );
};

export { CodecType };
