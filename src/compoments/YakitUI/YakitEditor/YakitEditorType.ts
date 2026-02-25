import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import type { Selection } from '@/pages/YakRunnerAuditCode/RunnerTabs/RunnerTabsType';
/** monaco-editor 相关接口 */
export type YakitSelection = monacoEditor.Selection;
export type YakitIMonacoEditor = monacoEditor.editor.IStandaloneCodeEditor;
export type YakitIMonacoCodeEditor = monacoEditor.editor.ICodeEditor;
export type YakitITextModel = monacoEditor.editor.ITextModel;
export type YakitIModelDecoration = monacoEditor.editor.IModelDecoration;

export interface HighLightText {
    startOffset: number;
    highlightLength: number;
    hoverVal: string;
}

export interface YakitEditorProps {
    /** @name 内容类型是否为字节码 */
    isBytes?: boolean;
    /** @name 编辑器内容(string类型) */
    value?: string;
    /** @name 编辑器内容(字节码类型) */
    valueBytes?: Uint8Array;
    /** @name 修改编辑器内容事件回调 */
    setValue?: (content: string) => any;

    /** @name 文件类型 */
    type?: 'html' | 'http' | 'yak' | string;
    /** @name 编辑器主题 */
    theme?: string;

    /** @name 编辑器加载完成后的回调 */
    editorDidMount?: (editor: YakitIMonacoEditor) => any;

    /** @name 配置项-是否禁用 */
    disabled?: boolean;
    /** @name 配置项-是否开启只读模式 */
    readOnly?: boolean;
    /** @name 配置项-是否关闭内容过长时的自动换行展示适配 */
    noWordWrap?: boolean;
    /** @name 配置项-是否关闭代码mini地图展示 */
    noMiniMap?: boolean;
    /** @name 配置项-是否关闭行号展示 */
    noLineNumber?: boolean;
    /** @name 配置项-展示行号的位数(默认5位) */
    lineNumbersMinChars?: number;
    /** @name 配置项-字体大小(默认为12) */
    fontSize?: number;

    /** @name 是否展示换行字符(只有在[type="http"]下有效,同时可在右键菜单中关闭显示功能) */
    showLineBreaks?: boolean;

    /** @name 配置项-操作记录(拥有此项可记录字体大小及换行符) */
    editorOperationRecord?: string;

    /** @name 配置项-(存在此项则将字体/换行交由emiter更新) */
    editorId?: string;

    /** @name 配置项-高亮显示配置 */
    highLightText?: HighLightText[] | Selection[];
    highLightClass?: string;
    /** @name 配置项-关联高亮显示配置 */
    highLightFind?: HighLightText[] | Selection[];
    highLightFindClass?: string;

    renderValidationDecorations?: 'on' | 'off' | 'editable';
}

export interface OperationRecordRes {
    fontSize?: number;
    showBreak?: boolean;
}

/** 操作记录存储 */
export interface OperationRecord {
    [key: string]: number | boolean;
}
