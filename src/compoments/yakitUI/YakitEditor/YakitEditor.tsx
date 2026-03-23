import React, { useMemo, useRef, useState } from 'react';
import {} from 'antd';
import {} from '@ant-design/icons';
import styles from './YakitEditor.module.scss';
import classNames from 'classnames';
import ReactResizeDetector from 'react-resize-detector';
import MonacoEditor from 'react-monaco-editor';
// 编辑器 注册
import '@/utils/monacoSpec/theme';
import '@/utils/monacoSpec/fuzzHTTP';
import '@/utils/monacoSpec/yakEditor';
import '@/utils/monacoSpec/html';
import type {
    OperationRecord,
    YakitEditorProps,
    YakitIMonacoEditor,
} from './YakitEditorType';
import { GetPluginLanguage } from './type';
import { useUpdateEffect } from 'ahooks';
import { getRemoteValue, setRemoteValue } from '@/utils/kv';

export const YakitEditor: React.FC<YakitEditorProps> = (props) => {
    const {
        isBytes = false,
        value,
        valueBytes,
        setValue,
        type,
        theme = 'kurior',
        editorDidMount,
        readOnly = false,
        disabled = false,
        noWordWrap = false,
        noMiniMap = false,
        noLineNumber = false,
        lineNumbersMinChars = 5,
        fontSize = 12,
        showLineBreaks = false,
        editorOperationRecord,
    } = props;
    const [editor, setEditor] = useState<YakitIMonacoEditor>();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const preWidthRef = useRef<number>(0);
    const preHeightRef = useRef<number>(0);
    const [showBreak, setShowBreak] = useState<boolean>(showLineBreaks);
    const [nowFontsize, setNowFontsize] = useState<number>(fontSize);

    /** 编辑器语言 */
    const language = useMemo(() => {
        return GetPluginLanguage(type || 'http');
    }, [type]);

    useUpdateEffect(() => {
        if (fontSize) {
            setNowFontsize(fontSize);
            onOperationRecord('fontSize', fontSize);
        }
    }, [fontSize]);

    useUpdateEffect(() => {
        setShowBreak(showLineBreaks);
        onOperationRecord('showBreak', showLineBreaks);
    }, [showLineBreaks]);

    /** 操作记录存储 */
    const onOperationRecord = (
        type: 'fontSize' | 'showBreak',
        value: number | boolean,
    ) => {
        if (editorOperationRecord) {
            getRemoteValue(editorOperationRecord).then((data: any) => {
                if (!data) {
                    let obj: OperationRecord = {
                        [type]: value,
                    };
                    setRemoteValue(editorOperationRecord, JSON.stringify(obj));
                } else {
                    try {
                        let obj: OperationRecord = JSON.parse(data);
                        obj[type] = value;
                        setRemoteValue(
                            editorOperationRecord,
                            JSON.stringify(obj),
                        );
                    } catch (error) {}
                }
            });
        }
    };
    return (
        <div
            className={classNames(
                'yakit-editor-code',
                styles['yakit-editor-wrapper'],
                {
                    'yakit-editor-wrap-style': !showBreak,
                    [styles['yakit-editor-disabled']]: disabled,
                },
            )}
        >
            <ReactResizeDetector
                onResize={(width, height) => {
                    if (!width || !height) return;
                    /** 重绘编辑器尺寸 */
                    if (editor) editor.layout({ height, width });
                    /** 记录当前编辑器外边框尺寸 */
                    preWidthRef.current = width;
                    preHeightRef.current = height;
                }}
                handleWidth={true}
                handleHeight={true}
                refreshMode="debounce"
                refreshRate={30}
            />
            {disabled && <div className={styles['yakit-editor-shade']} />}
            <div
                ref={wrapperRef}
                className={styles['yakit-editor-container']}
                // onContextMenu={(e) => {
                //   e.stopPropagation();
                //   e.preventDefault();
                //   showContextMenu();
                // }}
            >
                <MonacoEditor
                    theme={theme || 'kurior'}
                    value={
                        isBytes
                            ? new Buffer(
                                  (valueBytes || []) as Uint8Array,
                              ).toString()
                            : value
                    }
                    onChange={setValue}
                    language={language}
                    editorDidMount={(editor: YakitIMonacoEditor) => {
                        setEditor(editor);
                        /** 编辑器关光标，设置坐标0的初始位置 */
                        editor.setSelection({
                            startColumn: 0,
                            startLineNumber: 0,
                            endColumn: 0,
                            endLineNumber: 0,
                        });
                        if (editorDidMount) editorDidMount(editor);
                    }}
                    options={{
                        readOnly: readOnly,
                        scrollBeyondLastLine: false,
                        fontWeight: '500',
                        fontSize: nowFontsize || 12,
                        showFoldingControls: 'always',
                        showUnused: true,
                        wordWrap: noWordWrap ? 'off' : 'on',
                        renderLineHighlight: 'line',
                        lineNumbers: noLineNumber ? 'off' : 'on',
                        minimap: noMiniMap ? { enabled: false } : undefined,
                        lineNumbersMinChars: lineNumbersMinChars || 5,
                        contextmenu: false,
                        renderWhitespace: 'all',
                        bracketPairColorization: {
                            enabled: true,
                            independentColorPoolPerBracketType: true,
                        },
                        fixedOverflowWidgets: true,
                    }}
                />
            </div>
        </div>
    );
};
