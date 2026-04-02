import type { Editor } from '@milkdown/kit/core'

interface KVPair {
  Key: string
  Value: string
}

interface KnowledgeBaseEntry {
  ID: number
  KnowledgeBaseId: number
  HiddenIndex: string
  KnowledgeTitle: string
  KnowledgeType: string
  ImportanceScore: number
  Keywords: string[]
  KnowledgeDetails: string
  Summary: string
  SourcePage: number
  PotentialQuestions: string[]
  PotentialQuestionsVector: number[]
  CreatedAt?: string
  UpdatedAt?: string
}

interface CustomPluginExecuteFormValue {
  [key: string]: number | string | boolean | string[] | Uint8Array | KVPair[] | number[]
}

interface FileMonitorItemProps {
  // 是否为文件夹
  IsDir: boolean
  // 操作
  Op: 'delete' | 'create'
  // 路径
  Path: string
}

export interface FileMonitorProps {
  Id: string
  ChangeEvents: FileMonitorItemProps[]
  CreateEvents: FileMonitorItemProps[]
  DeleteEvents: FileMonitorItemProps[]
}

export type EditorMilkdownProps = Editor

export interface MilkdownCollabProps {
  /** 文档标题 */
  title: string
  /** 启用协作文档 默认不启用 */
  enableCollab: boolean
  /** enableCollab为true，该字段必传,协作文档得唯一标识 */
  milkdownHash: string
  /** 编辑器使用的页面,enableCollab为true，该字段必传 */
  routeInfo: { pageId: string; route: YakitRoute | null }
  /** 是否开启保存历史  开启后默认间隔 1s */
  enableSaveHistory?: boolean | { enable: boolean; interval: number }
  /** 文档链接状态变化 */
  onChangeWSLinkStatus: (v: CollabStatus) => void
  /** 在线用户数据变化 */
  onChangeOnlineUser: (v: CollabUserInfo[]) => void
  /** 同步标题 */
  onSetTitle: (s: string) => void
}
export interface CustomMilkdownProps {
  /** 编辑器使用的模块名称，目前只有记事本(企业版叫云文档)中使用 */
  type: 'notepad'
  /** 设置为只读 */
  readonly?: boolean
  /** 编辑器默认值 */
  defaultValue?: string
  /** 编辑器是否传入type */
  isControlEditorType?: boolean
  editor?: EditorMilkdownProps
  setEditor?: (s: EditorMilkdownProps) => void
  /** 自定义插件 */
  customPlugin?: MilkdownPlugin | MilkdownPlugin[]

  /** 协作文档相关参数 */
  collabProps?: MilkdownCollabProps
  /** 编辑器内容的变化 tip:在线协作时，A本地触发内容的变化，B编辑器会同步内容，但listener.markdownUpdated监听不到 */
  onMarkdownUpdated?: (next: string, per: string) => void
  /** 卸载前，抛出去最新的内容 */
  onSaveContentBeforeDestroy?: (value: string) => void
  /** 定位 dom元素id */
  positionElementId?: string
}
export type MilkdownEditorProps = CustomMilkdownProps

export interface DeleteOSSFileItem {
  fileName: string
  time: number
}

import type { MilkdownPlugin, TimerType } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import { ctxCallOutOfScope } from '@milkdown/exception'
import type { Parser } from '@milkdown/transformer'
import { ParserState } from '@milkdown/transformer'

import { withMeta } from '../__internal__'
import { remarkCtx } from './atoms'
import { SchemaReady, schemaCtx } from './schema'

/// The timer which will be resolved when the parser plugin is ready.
export const ParserReady = createTimer('ParserReady')

const outOfScope = (() => {
  throw ctxCallOutOfScope()
}) as Parser

/// A slice which contains the parser.
export const parserCtx = createSlice(outOfScope, 'parser')

/// A slice which stores timers that need to be waited for before starting to run the plugin.
/// By default, it's `[SchemaReady]`.
export const parserTimerCtx = createSlice([] as TimerType[], 'parserTimer')

/// The parser plugin.
/// This plugin will create a parser.
///
/// This plugin will wait for the schema plugin.
export const parser: MilkdownPlugin = (ctx) => {
  ctx.inject(parserCtx, outOfScope).inject(parserTimerCtx, [SchemaReady]).record(ParserReady)

  return async () => {
    await ctx.waitTimers(parserTimerCtx)
    const remark = ctx.get(remarkCtx)
    const schema = ctx.get(schemaCtx)

    ctx.set(parserCtx, ParserState.create(schema, remark))
    ctx.done(ParserReady)
    return () => {
      ctx.remove(parserCtx).remove(parserTimerCtx).clearTimer(ParserReady)
    }
  }
}

withMeta(parser, {
  displayName: 'Parser',
})

export interface ReportItem {
  type: string
  content: string
  direction?: boolean
}

export {
  KVPair,
  KnowledgeBaseEntry,
  CustomPluginExecuteFormValue,
  FileMonitorItemProps,
  FileMonitorProps,
  EditorMilkdownProps,
}
