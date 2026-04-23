import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type {
  AIChatMentionListRefProps,
  AIChatMentionProps,
  AIMentionSelectItemProps,
  // FileSystemTreeOfMentionProps,
  FocusModeOfMentionProps,
  ForgeNameListOfMentionProps,
  // ToolListOfMentionProps,
} from './type'
import styles from './AIChatMention.module.scss'
import { useCreation, useDebounceEffect, useDebounceFn, useInViewport, useKeyPress, useMemoizedFn } from 'ahooks'
import { AIMentionTabsEnum, AIMentionTabs, AIForgeListDefaultPagination } from '../../defaultConstant'
import type {
  AIFocus,
  AIForge,
  QueryAIFocusResponse,
  QueryAIForgeRequest,
  QueryAIForgeResponse,
} from '../../type/forge'
// import type { AITool, GetAIToolListRequest, GetAIToolListResponse } from '../../type/aiTool'
// import { genDefaultPagination } from '@/pages/invoker/schema'
// import { grpcGetAIToolList } from '../../aiToolList/utils'
import useSwitchSelectByKeyboard from './useSwitchSelectByKeyboard'
import classNames from 'classnames'
import type { InputRef } from 'antd'
import { YakitInput } from '@/compoments/yakitUI/YakitInput/YakitInput'
import { YakitSideTab } from '@/compoments/yakitSideTab/YakitSideTab'
import { YakitSpin } from '@/compoments/yakitUI/YakitSpin/YakitSpin'
import { useGetSetState } from '@/hooks'
import type { RollingLoadListRef } from '@/compoments/RollingLoadList/RollingLoadList'
import { RollingLoadList } from '@/compoments/RollingLoadList/RollingLoadList'
import { postAiforgeQuery, postSettingAifocusGet } from '@/apis/AiEventApi'

const defaultRef: AIChatMentionListRefProps = {
  onRefresh: () => {},
}
// 所有字母和数字的键代码
const alphanumericKeys = [
  ...Array.from({ length: 26 }, (_, i) => `${String.fromCharCode(65 + i)}`),
  ...Array.from({ length: 10 }, (_, i) => `${i}`),
  ...Array.from({ length: 10 }, (_, i) => `numpad${i}`), // 小键盘数字键
]
export const AIChatMention: React.FC<AIChatMentionProps> = React.memo((props) => {
  const { onSelect, defaultActiveTab, filterMode } = props
  const [activeKey, setActiveKey, getActiveKey] = useGetSetState<AIMentionTabsEnum>(
    defaultActiveTab || AIMentionTabsEnum.Forge_Name,
  )
  const [keyWord, setKeyWord] = useState<string>('')
  const [focus, setFocus] = useState<boolean>(false)

  const forgeRef = useRef<AIChatMentionListRefProps>(defaultRef)
  //   const toolRef = useRef<AIChatMentionListRefProps>(defaultRef)
  //   const knowledgeBaseRef = useRef<AIChatMentionListRefProps>(defaultRef)
  const focusModeRef = useRef<AIChatMentionListRefProps>(defaultRef)
  const skipInitialSearchRef = useRef(true)

  const searchRef = useRef<InputRef>(null)

  const mentionRef = useRef<HTMLDivElement>(null)
  const [inViewport = true] = useInViewport(mentionRef)

  useEffect(() => {
    if (inViewport) mentionFocus()
  }, [inViewport])
  //   useEffect(() => {
  // if (activeKey === AIMentionTabsEnum.File_System) {
  // 文件系统没有输入框 当焦点聚焦在输入框中的时候切换tab，在这个情况下需要把焦点聚焦在提及的容器上
  //       setFocus(false)
  //       mentionFocus()
  //     }
  //   }, [activeKey])
  useDebounceEffect(
    () => {
      if (skipInitialSearchRef.current) {
        skipInitialSearchRef.current = false
        return
      }
      onSearch()
    },
    [keyWord],
    { wait: 300 },
  )
  useKeyPress(
    'leftarrow',
    (e) => {
      e.stopPropagation()
      e.preventDefault()
      onLeftArrow()
    },
    {
      target: mentionRef,
      exactMatch: true,
      useCapture: true,
    },
  )
  useKeyPress(
    'rightarrow',
    (e) => {
      e.stopPropagation()
      e.preventDefault()
      onRightArrow()
    },
    {
      target: mentionRef,
      exactMatch: true,
      useCapture: true,
    },
  )
  useKeyPress(
    focus ? () => false : alphanumericKeys, // A-Z 0-9
    (e) => {
      e.stopPropagation()
      e.preventDefault()
      onFocusSearchInput()
    },
    {
      target: mentionRef,
      exactMatch: true,
      useCapture: true,
    },
  )
  const onLeftArrow = useDebounceFn(
    () => {
      if (!inViewport) return
      let newValue = getActiveKey()
      const index = getActiveIndex()
      if (index >= 0 && index < mentionTabs.length) {
        newValue = (mentionTabs[index - 1]?.value as AIMentionTabsEnum) || getActiveKey()
      }
      setActiveKey(newValue)
    },
    { wait: 100, leading: true },
  ).run

  const onRightArrow = useDebounceFn(
    () => {
      if (!inViewport) return
      let newValue = getActiveKey()
      const index = getActiveIndex()
      if (index >= 0 && index < mentionTabs.length) {
        newValue = (mentionTabs[index + 1]?.value as AIMentionTabsEnum) || getActiveKey()
      }
      setActiveKey(newValue)
    },
    { wait: 100, leading: true },
  ).run
  const getActiveIndex = useMemoizedFn(() => {
    return mentionTabs.findIndex((ele) => ele.value === getActiveKey())
  })
  const onActiveKey = useMemoizedFn((k) => {
    setKeyWord('')
    setActiveKey(k as AIMentionTabsEnum)
  })
  const onSelectForge = useMemoizedFn((forgeItem: AIForge) => {
    onSelect('forge', {
      id: `${forgeItem.Id}`,
      name: forgeItem.ForgeVerboseName || forgeItem.ForgeName,
    })
  })
  // const onSelectTool = useMemoizedFn((toolItem: AITool) => {
  //   onSelect('tool', {
  //     id: `${toolItem.ID}`,
  //     name: toolItem.VerboseName || toolItem.Name,
  //   })
  // })
  // const onSelectFile = useMemoizedFn((path: string, isFolder: boolean) => {
  //   onSelect(isFolder ? 'folder' : 'file', {
  //     id: path,
  //     name: path,
  //   })
  // })
  const onSelectFocusMode = useMemoizedFn((focusMode: AIFocus) => {
    onSelect('focusMode', {
      id: `${focusMode.Name}`,
      name: focusMode.Name || '',
    })
  })
  const renderTabContent = useMemoizedFn((key: AIMentionTabsEnum) => {
    switch (key) {
      case AIMentionTabsEnum.Forge_Name:
        return (
          <ForgeNameListOfMention
            ref={forgeRef}
            keyWord={keyWord}
            onSelect={onSelectForge}
            getContainer={getContainer}
          />
        )
      //   case AIMentionTabsEnum.Tool:
      //     return <ToolListOfMention ref={toolRef} keyWord={keyWord} onSelect={onSelectTool} getContainer={getContainer} />
      //   case AIMentionTabsEnum.File_System:
      //     return <FileSystemTreeOfMention onSelect={onSelectFile} />
      case AIMentionTabsEnum.FocusMode:
        return (
          <FocusModeOfMention
            ref={focusModeRef}
            keyWord={keyWord}
            onSelect={onSelectFocusMode}
            getContainer={getContainer}
          />
        )
      default:
        return null
    }
  })
  const onSearch = useMemoizedFn(() => {
    switch (activeKey) {
      case AIMentionTabsEnum.Forge_Name:
        forgeRef.current.onRefresh()
        break
      //   case AIMentionTabsEnum.Tool:
      //     toolRef.current.onRefresh()
      //     break
      //   case AIMentionTabsEnum.KnowledgeBase:
      //     knowledgeBaseRef.current.onRefresh()
      //     break
      case AIMentionTabsEnum.FocusMode:
        focusModeRef.current.onRefresh()
        break
      default:
        return null
    }
  })
  const onSearchInputChange = useMemoizedFn(() => {
    onSearch()
  })
  const onFocusSearchInput = useMemoizedFn(() => {
    if (!focus) {
      searchRef.current?.focus()
    }
    setFocus(true)
  })

  const onSearchBlur = useMemoizedFn((e) => {
    e.stopPropagation()
    e.preventDefault()
    setFocus(false)
  })
  const onSearchFocus = useMemoizedFn((e) => {
    e.stopPropagation()
    e.preventDefault()
    setFocus(true)
  })
  const getContainer = useMemoizedFn(() => {
    return mentionRef.current
  })

  const mentionFocus = useMemoizedFn(() => {
    mentionRef.current?.focus()
  })

  // 用户文件夹
  const mentionTabs = useCreation(() => {
    let tabs = AIMentionTabs

    // 处理 filterMode
    if (filterMode?.length) {
      tabs = tabs.filter((item) => !filterMode.includes(item.value as `${AIMentionTabsEnum}`))
    }

    return tabs
  }, [filterMode])

  return (
    <div className={styles['ai-chat-mention']} tabIndex={0} ref={mentionRef} onClick={(e) => e.stopPropagation()}>
      <YakitSideTab
        className={styles['tab-wrapper']}
        type="horizontal"
        activeKey={activeKey}
        yakitTabs={mentionTabs}
        onActiveKey={onActiveKey}
      >
        {activeKey && ( // !== AIMentionTabsEnum.File_System
          <YakitInput.Search
            ref={searchRef}
            wrapperClassName={styles['mention-search']}
            value={keyWord}
            onChange={(e) => setKeyWord(e.target.value)}
            onSearch={onSearchInputChange}
            allowClear={true}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
          />
        )}
        <div className={styles['list-body']}>{renderTabContent(activeKey)}</div>
      </YakitSideTab>
    </div>
  )
})

const ForgeNameListOfMention: React.FC<ForgeNameListOfMentionProps> = React.memo(
  forwardRef((props, ref) => {
    const { keyWord, onSelect, getContainer } = props
    const [loading, setLoading] = useState<boolean>(false)
    const [spinning, setSpinning] = useState<boolean>(false)
    const [isRef, setIsRef] = useState<boolean>(false)
    const [hasMore, setHasMore] = useState<boolean>(true)
    const [response, setResponse] = useState<QueryAIForgeResponse>({
      Pagination: { ...AIForgeListDefaultPagination },
      Data: [],
      Total: 0,
    })
    const [selected, setSelected] = useState<AIForge>()

    const forgeListRef = useRef<HTMLDivElement>(null)
    const [inViewport = true] = useInViewport(forgeListRef)

    const listRef = useRef<RollingLoadListRef>({
      containerRef: null,
      scrollTo: () => {},
    })

    useImperativeHandle(
      ref,
      () => ({
        onRefresh: () => {
          getList()
        },
      }),
      [],
    )
    useEffect(() => {
      // 获取模板列表
      getList()
    }, [])
    const onKeyboardSelect = useMemoizedFn((value: number, isScroll: boolean) => {
      if (value >= 0 && value < response.Data.length) {
        setSelected(response.Data[value])
        if (isScroll) {
          listRef.current.scrollTo(value)
        }
      }
    })
    useSwitchSelectByKeyboard<AIForge>(listRef.current.containerRef, {
      data: response.Data,
      selected,
      rowKey: (item) => `AIMentionSelectItem-${item.Id}`,
      onSelectNumber: onKeyboardSelect,
      onEnter: () => onEnter(),
      getContainer,
    })

    const onEnter = useMemoizedFn(() => {
      if (selected && inViewport) onSelect(selected)
    })
    const getList = useMemoizedFn(async (page?: number) => {
      setLoading(true)
      const newQuery: QueryAIForgeRequest = {
        Pagination: {
          ...response.Pagination,
          Page: page || 1,
        },
        Filter: {
          Keyword: keyWord,
        },
      }
      if (newQuery.Pagination.Page === 1) {
        setSpinning(true)
      }
      try {
        const res = await postAiforgeQuery(newQuery)
        if (!res.Data) res.Data = []
        const newPage = Number(res.Pagination.Page)
        const responsePagination = {
          ...AIForgeListDefaultPagination,
          ...res.Pagination,
          Page: newPage,
          Limit: Number(res.Pagination?.Limit) || AIForgeListDefaultPagination.Limit,
        }
        const length = newPage === 1 ? res.Data.length : res.Data.length + response.Data.length
        setHasMore(length < Number(res.Total))
        let newRes: QueryAIForgeResponse = {
          Data: newPage === 1 ? res?.Data : [...response.Data, ...(res?.Data || [])],
          Pagination: responsePagination,
          Total: res.Total,
        }
        setResponse(newRes)
        if (newPage === 1) {
          setIsRef(!isRef)
        }
      } catch (error) {}
      setTimeout(() => {
        setLoading(false)
        setSpinning(false)
      }, 300)
    })
    /** @description 列表加载更多 */
    const loadMoreData = useMemoizedFn(() => {
      getList(Number(response.Pagination.Page) + 1)
    })

    return (
      <div className={styles['forge-name-list-of-mention']} ref={forgeListRef} tabIndex={0}>
        <YakitSpin spinning={spinning}>
          <RollingLoadList<AIForge>
            ref={listRef}
            data={response.Data}
            loadMoreData={loadMoreData}
            renderRow={(rowData: AIForge) => {
              return (
                <AIMentionSelectItem
                  item={{
                    id: `${rowData.Id}`,
                    name: rowData.ForgeVerboseName || rowData.ForgeName,
                  }}
                  onSelect={() => onSelect(rowData)}
                  isActive={selected?.Id === rowData.Id}
                />
              )
            }}
            classNameRow={styles['ai-forge-list-row']}
            classNameList={styles['ai-forge-list']}
            page={Number(response.Pagination.Page)}
            hasMore={hasMore}
            loading={loading}
            defItemHeight={24}
            rowKey="Id"
            isRef={isRef}
          />
        </YakitSpin>
      </div>
    )
  }),
)

// const ToolListOfMention: React.FC<ToolListOfMentionProps> = React.memo(
//   forwardRef((props, ref) => {
//     const { keyWord, onSelect, getContainer } = props
//     const [loading, setLoading] = useState<boolean>(false)
//     const [spinning, setSpinning] = useState<boolean>(false)
//     const [hasMore, setHasMore] = useState<boolean>(false)
//     const [isRef, setIsRef] = useState<boolean>(false)
//     const [response, setResponse] = useState<GetAIToolListResponse>({
//       Tools: [],
//       Pagination: genDefaultPagination(20),
//       Total: 0,
//     })
//     const [selected, setSelected] = useState<AITool>()
//     const toolListRef = useRef<HTMLDivElement>(null)
//     const [inViewport = true] = useInViewport(toolListRef)

//     const listRef = useRef<RollingLoadListRef>({
//       containerRef: null,
//       scrollTo: () => {},
//     })

//     useImperativeHandle(
//       ref,
//       () => ({
//         onRefresh: () => {
//           getList()
//         },
//       }),
//       [],
//     )
//     useEffect(() => {
//       getList()
//     }, [])
//     const onKeyboardSelect = useMemoizedFn((value: number, isScroll: boolean) => {
//       if (value >= 0 && value < response.Tools.length) {
//         setSelected(response.Tools[value])
//         if (isScroll) {
//           listRef.current.scrollTo(value)
//         }
//       }
//     })
//     useSwitchSelectByKeyboard<AITool>(listRef.current.containerRef, {
//       data: response.Tools,
//       selected,
//       rowKey: (item) => `AIMentionSelectItem-${item.ID}`,
//       onSelectNumber: onKeyboardSelect,
//       onEnter: () => onEnter(),
//       getContainer,
//     })

//     const onEnter = useMemoizedFn(() => {
//       if (selected && inViewport) onSelect(selected)
//     })
//     const getList = useMemoizedFn(async (page?: number) => {
//       setLoading(true)
//       const newQuery: GetAIToolListRequest = {
//         Query: keyWord,
//         ToolName: '',
//         Pagination: {
//           ...genDefaultPagination(20),
//           OrderBy: 'created_at',
//           Page: page || 1,
//         },
//         OnlyFavorites: false,
//       }
//       if (newQuery.Pagination.Page === 1) {
//         setSpinning(true)
//       }
//       try {
//         const res = await grpcGetAIToolList(newQuery)
//         if (!res.Tools) res.Tools = []
//         const newPage = Number(res.Pagination.Page)
//         const length = newPage === 1 ? res.Tools.length : res.Tools.length + response.Tools.length
//         setHasMore(length < Number(res.Total))
//         let newRes: GetAIToolListResponse = {
//           Tools: newPage === 1 ? res?.Tools : [...response.Tools, ...(res?.Tools || [])],
//           Pagination: res?.Pagination || {
//             ...genDefaultPagination(20),
//           },
//           Total: res.Total,
//         }
//         setResponse(newRes)
//         if (newPage === 1) {
//           setIsRef(!isRef)
//         }
//       } catch (error) {}
//       setTimeout(() => {
//         setLoading(false)
//         setSpinning(false)
//       }, 300)
//     })
//     const loadMoreData = useMemoizedFn(() => {
//       getList(Number(response.Pagination.Page) + 1)
//     })
//     return (
//       <div className={styles['tool-list-of-mention']} ref={toolListRef}>
//         <YakitSpin spinning={spinning}>
//           <RollingLoadList<AITool>
//             ref={listRef}
//             data={response.Tools}
//             loadMoreData={loadMoreData}
//             renderRow={(rowData: AITool) => {
//               return (
//                 <AIMentionSelectItem
//                   item={{
//                     id: `${rowData.ID}`,
//                     name: rowData.VerboseName || rowData.Name,
//                   }}
//                   onSelect={() => onSelect(rowData)}
//                   isActive={selected?.ID === rowData.ID}
//                 />
//               )
//             }}
//             classNameRow={styles['ai-tool-list-row']}
//             classNameList={styles['ai-tool-list']}
//             page={Number(response.Pagination.Page)}
//             hasMore={hasMore}
//             loading={loading}
//             defItemHeight={24}
//             rowKey="ID"
//             isRef={isRef}
//           />
//         </YakitSpin>
//       </div>
//     )
//   }),
// )

const AIMentionSelectItem: React.FC<AIMentionSelectItemProps> = React.memo((props) => {
  const { item, isActive, onSelect } = props
  return (
    <div
      className={classNames(styles['row-item'], {
        [styles['row-item-active']]: isActive,
      })}
      onClick={onSelect}
      id={`AIMentionSelectItem-${item.id}`}
    >
      <span className="content-ellipsis">{item.name}</span>
    </div>
  )
})

// const FileSystemTreeOfMention: React.FC<FileSystemTreeOfMentionProps> = React.memo(() => {
//   return <div className={styles['file-system-tree-of-mention']} />
// })

const FocusModeOfMention: React.FC<FocusModeOfMentionProps> = React.memo(
  forwardRef((props, ref) => {
    const { keyWord, onSelect, getContainer } = props
    const [spinning, setSpinning] = useState<boolean>(false)
    const [response, setResponse] = useState<QueryAIFocusResponse>({
      Data: [],
    })
    const [selected, setSelected] = useState<AIFocus>()
    const toolListRef = useRef<HTMLDivElement>(null)
    const [inViewport = true] = useInViewport(toolListRef)

    const listRef = useRef<RollingLoadListRef>({
      containerRef: null,
      scrollTo: () => {},
    })

    useImperativeHandle(
      ref,
      () => ({
        onRefresh: () => {
          getList()
        },
      }),
      [],
    )
    useEffect(() => {
      getList()
    }, [])
    const onKeyboardSelect = useMemoizedFn((value: number, isScroll: boolean) => {
      if (value >= 0 && value < response.Data.length) {
        setSelected(response.Data[value])
        if (isScroll) {
          listRef.current.scrollTo(value)
        }
      }
    })
    useSwitchSelectByKeyboard<AIFocus>(listRef.current.containerRef, {
      data: response.Data,
      selected,
      rowKey: (item) => `AIMentionSelectItem-${item.Name}`,
      onSelectNumber: onKeyboardSelect,
      onEnter: () => onEnter(),
      getContainer,
    })

    const onEnter = useMemoizedFn(() => {
      if (selected && inViewport) onSelect(selected)
    })
    const getList = useMemoizedFn(async () => {
      setSpinning(true)
      try {
        const res = await postSettingAifocusGet()
        let newRes: QueryAIFocusResponse = {
          Data: (res?.Data || []).filter((it) => it?.Name?.toLowerCase().includes(keyWord.toLowerCase())),
        }
        setResponse(newRes)
      } catch (error) {}
      setTimeout(() => {
        setSpinning(false)
      }, 300)
    })
    return (
      <div className={styles['focus-mode-list-of-mention']} ref={toolListRef}>
        <YakitSpin spinning={spinning}>
          <RollingLoadList<AIFocus>
            ref={listRef}
            data={response.Data}
            loadMoreData={() => {}}
            renderRow={(rowData: AIFocus) => {
              return (
                <AIMentionSelectItem
                  item={{
                    id: `${rowData.Name}`,
                    name: rowData.Name || '',
                  }}
                  onSelect={() => onSelect(rowData)}
                  isActive={selected?.Name === rowData.Name}
                />
              )
            }}
            classNameRow={styles['ai-focus-mode-list-row']}
            classNameList={styles['ai-focus-mode-list']}
            page={1}
            hasMore={false}
            loading={false}
            defItemHeight={24}
            rowKey="Name"
          />
        </YakitSpin>
      </div>
    )
  }),
)
