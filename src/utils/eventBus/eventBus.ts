import mitt from 'mitt'
import type { MitmEventProps } from './events/mitm'
import type { WebFuzzerEventProps } from './events/webFuzzer'
import type { SimpleDetectEventProps } from './events/simpleDetect'
import type { EditorEventProps } from './events/editor'
import type { HistoryEventProps } from './events/history'
import type { PluginsEventProps } from './events/plugins'
import type { MainOperatorEventProps } from './events/main'
import type { PayLoadEventProps } from './events/payload'
import type { ProjectMagEventProps } from './events/projectMag'
import type { WebShellEventProps } from './events/webShell'
import type { RefreshDataEventProps } from './events/refreshData'
import type { UpdateYakitYaklangEventProps } from './events/updateYakitYaklang'
import type { GlobalEventProps } from './events/global'
import type { PluginBatchExecutorProps } from './events/pluginBatchExecutor'
import type { YakitRiskProps } from './events/yakitRisk'
import type { YakRunnerEventProps } from './events/yakRunner'
import type { YakRunnerAuditEventProps } from './events/yakRunnerAudit'
import type { YakRunnerCodeScanEventProps } from './events/yakRunnerCodeScan'
import type { yakJavaDecompilerEventProps } from './events/yakJavaDecompiler'
import type { NotepadEventProps } from './events/notepad'
import type { ShortcutKeyEventProps } from './events/shortcutKey'
import type { AIAgentEventProps } from './events/aiAgent'
import type { YakRunnerScanHistoryEventProps } from './events/yakRunnerScanHistory'
import type { AIReActEventProps } from './events/aiReAct'
import type { ReportPageEventProps } from './events/reportPage'
import type { YakKnowledgeRepositoryEventProps } from './events/aiRepository'
import type { MainWinOperatorEventProps } from './events/mainWin'
import type { RuleManagementEventProps } from './events/ruleManagement'

/**
 * T 与 E 是否存在同名键（事件名）。有交集则为 string 表示冲突。
 */
type Contrast<T extends object, E extends object> = [keyof T & keyof E] extends [never] ? never : string

/**
 * 将当前对象 T 与元组中剩余每一项两两比较键名；任一重复则结果为 string，否则为 number。
 */
type OneToArr<T extends object, E extends object[]> = E extends [infer X extends object, ...infer Y extends object[]]
  ? [Contrast<T, X>] extends [never]
    ? OneToArr<T, Y>
    : string
  : number

/**
 * 对 Events 元组依次处理：取表头与尾部所有模块比较，再递归尾部，实现「任意两模块」键名唯一性检查。
 */
type ArrContrast<E extends object[]> = E extends [infer X extends object, ...infer Y extends object[]]
  ? OneToArr<X, Y> extends number
    ? ArrContrast<Y>
    : string
  : number

/** 无冲突时为 boolean，有冲突时为 never（用于 let checkVal: CheckVal = true 报错） */
type Exchange<T> = T extends number ? boolean : never

/** 将所有模块事件类型合并为一张事件名 → payload 的映射 */
type Joins<T extends object[]> = T extends [infer H extends object, ...infer U extends object[]] ? H & Joins<U> : {}

/**
 * 编译期断言：扫描结果必须为 number（无跨模块重名事件键）。
 * 若 `ArrContrast<Events>` 为 string（存在重名），此处会报：类型不满足约束 `number`。
 */
type ExpectNoDuplicateKeys<Result extends number> = Result

/**
 * @name 事件总线的信号源定义
 * @description 事件信号的定义规则
 * - 各页面的事件信号定义变量命名: `${页面名(英文)}EventProps`
 *
 * - 页面内事件信号的发送值，如不附加值则建议TS定义为选填，
 *   首选类型建议为string(注: 复杂的类型可能导致各页面信号定义交叉类型时出现never类型)
 *
 * - 建议不要在map方法内的组件设置事件监听，如果需要设置，请自行解决如何区别不同页面同事件监听的问题
 */
type Events = [
  MitmEventProps,
  WebFuzzerEventProps,
  SimpleDetectEventProps,
  EditorEventProps,
  HistoryEventProps,
  PluginsEventProps,
  MainOperatorEventProps,
  PayLoadEventProps,
  ProjectMagEventProps,
  WebShellEventProps,
  RefreshDataEventProps,
  UpdateYakitYaklangEventProps,
  GlobalEventProps,
  PluginBatchExecutorProps,
  YakitRiskProps,
  YakRunnerEventProps,
  YakRunnerAuditEventProps,
  YakRunnerCodeScanEventProps,
  yakJavaDecompilerEventProps,
  NotepadEventProps,
  ShortcutKeyEventProps,
  AIAgentEventProps,
  YakRunnerScanHistoryEventProps,
  AIReActEventProps,
  ReportPageEventProps,
  YakKnowledgeRepositoryEventProps,
  MainWinOperatorEventProps,
  RuleManagementEventProps,
]

/** 跨模块事件键唯一性：通过 ArrContrast 两两比较；通过则为 number，重名则为 string 并触发下方约束失败 */
type EnforceUniqueEventKeysAcrossModules = ExpectNoDuplicateKeys<ArrContrast<Events>>

/** mitt 要求 Record<EventType, unknown>（含 string | symbol 索引）；交叉 Joins 不产生索引签名，故补上 */
type EventBusEventMap = Joins<Events> & Record<string | symbol, unknown>

type CheckVal = Exchange<EnforceUniqueEventKeysAcrossModules>
// !!! 该变量声明不能改动
// 如果编辑器(vscode)对该变量报错，则说明声明的信号有重名情况，请自行检查重名的位置
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let checkVal: CheckVal = true

const emiter = mitt<EventBusEventMap>()

export default emiter
