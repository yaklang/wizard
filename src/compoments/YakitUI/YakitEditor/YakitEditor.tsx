<<<<<<< HEAD
import React, { useEffect, useMemo, useRef, useState } from 'react';
=======
import React, { useMemo, useRef, useState } from 'react';
>>>>>>> 38104b8 (feat: 引入yakit控件)
import {} from 'antd';
import {} from '@ant-design/icons';
import styles from './YakitEditor.module.scss';
import classNames from 'classnames';
import ReactResizeDetector from 'react-resize-detector';
<<<<<<< HEAD
import MonacoEditor, { monaco } from 'react-monaco-editor';
=======
import MonacoEditor from 'react-monaco-editor';
>>>>>>> 38104b8 (feat: 引入yakit控件)
// 编辑器 注册
import '@/utils/monacoSpec/theme';
import '@/utils/monacoSpec/fuzzHTTP';
import '@/utils/monacoSpec/yakEditor';
import '@/utils/monacoSpec/html';
import type {
<<<<<<< HEAD
    HighLightText,
    OperationRecord,
    YakitEditorProps,
    YakitIModelDecoration,
    YakitIMonacoEditor,
} from './YakitEditorType';
import { GetPluginLanguage } from './type';
import { useMemoizedFn, useThrottleFn, useUpdateEffect } from 'ahooks';
import { getRemoteValue, setRemoteValue } from '@/utils/kv';
import { randomString } from '@/utils';
import { failed } from '@/utils/notification';
import { editor as newEditor } from 'monaco-editor';
import IModelDecoration = newEditor.IModelDecoration;
=======
    OperationRecord,
    YakitEditorProps,
    YakitIMonacoEditor,
} from './YakitEditorType';
import { GetPluginLanguage } from './type';
import { useUpdateEffect } from 'ahooks';
import { getRemoteValue, setRemoteValue } from '@/utils/kv';

>>>>>>> 38104b8 (feat: 引入yakit控件)
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
<<<<<<< HEAD
        highLightText = [],
        highLightClass,
        highLightFind = [],
        highLightFindClass,
        fixContentType,
        originalContentType,
        fixContentTypeHoverMessage,
        renderValidationDecorations,
=======
>>>>>>> 38104b8 (feat: 引入yakit控件)
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
<<<<<<< HEAD

    /**
     * editor编辑器的额外渲染功能:
     * 1、每行的换行符进行可视字符展示
     */
    const pasteWarning = useThrottleFn(
        () => {
            failed('粘贴过快，请稍后再试');
        },
        { wait: 500 },
    );

    const deltaDecorationsRef = useRef<() => any>();
    const highLightTextFun = useMemoizedFn(() => highLightText);
    const highLightFindFun = useMemoizedFn(() => highLightFind);
    const fixContentTypeFun = useMemoizedFn(() => fixContentType);
    const originalContentTypeFun = useMemoizedFn(() => originalContentType);
    const disableUnicodeDecodeRef = useRef(props.disableUnicodeDecode);
    const fixContentTypeHoverMessageFun = useMemoizedFn(
        () => fixContentTypeHoverMessage,
    );
    useEffect(() => {
        if (!editor) {
            return;
        }
        const model = editor.getModel();
        if (!model) {
            return;
        }

        let current: string[] = [];

        /** 随机上下文ID */
        const randomStr = randomString(10);
        /** 对于需要自定义命令的快捷键生成对应的上下文ID */
        let yakitEditor = editor.createContextKey(randomStr, false);
        // @ts-ignore
        yakitEditor.set(true);
        /* limited paste by interval */
        let lastPasteTime = 0;
        let pasteLimitInterval = 80;
        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV,
            () => {
                const current = new Date().getTime();
                const currentInterval = current - lastPasteTime;
                if (currentInterval < pasteLimitInterval) {
                    pasteWarning.run();
                } else {
                    lastPasteTime = current;
                    editor.trigger(
                        'keyboard',
                        'editor.action.clipboardPasteAction',
                        {},
                    );
                }
            },
            randomStr,
        );
        const generateDecorations = (): YakitIModelDecoration[] => {
            // const text = model.getValue();
            const endsp = model.getPositionAt(1800);
            const dec: YakitIModelDecoration[] = [];
            const text =
                endsp.lineNumber === 1
                    ? model.getValueInRange({
                          startLineNumber: 1,
                          startColumn: 1,
                          endLineNumber: 1,
                          endColumn: endsp.column,
                      })
                    : model.getValueInRange({
                          startLineNumber: 1,
                          startColumn: 1,
                          endLineNumber: endsp.lineNumber,
                          endColumn: endsp.column,
                      });

            if (props.type === 'http') {
                (() => {
                    try {
                        // http
                        [
                            {
                                regexp: /\nContent-Length:\s*?\d+/,
                                classType: 'content-length',
                            },
                        ].forEach((detail) => {
                            // handle content-length
                            const match = detail.regexp.exec(text);
                            if (!match) {
                                return;
                            }
                            const start = model.getPositionAt(match.index);
                            const end = model.getPositionAt(
                                match.index + match[0].indexOf(':'),
                            );
                            dec.push({
                                id: detail.classType + match.index,
                                ownerId: 0,
                                range: new monaco.Range(
                                    start.lineNumber,
                                    start.column,
                                    end.lineNumber,
                                    end.column,
                                ),
                                options: {
                                    afterContentClassName: detail.classType,
                                },
                            } satisfies YakitIModelDecoration);
                        });
                    } catch (e) {}
                })();
                (() => {
                    try {
                        // http
                        [
                            { regexp: /\nHost:\s*?.+/, classType: 'host' },
                        ].forEach((detail) => {
                            // handle host
                            const match = detail.regexp.exec(text);
                            if (!match) {
                                return;
                            }
                            const start = model.getPositionAt(match.index);
                            const end = model.getPositionAt(
                                match.index + match[0].indexOf(':'),
                            );
                            dec.push({
                                id: detail.classType + match.index,
                                ownerId: 0,
                                range: new monaco.Range(
                                    start.lineNumber,
                                    start.column,
                                    end.lineNumber,
                                    end.column,
                                ),
                                options: {
                                    afterContentClassName: detail.classType,
                                },
                            } satisfies YakitIModelDecoration);
                        });
                    } catch (e) {}
                })();
            }
            if (
                (props.type === 'html' || props.type === 'http') &&
                !disableUnicodeDecodeRef.current
            ) {
                (() => {
                    // http html
                    const text = model.getValue();
                    let match;
                    const regex = /(\\u[\dabcdef]{4})+/gi;

                    while ((match = regex.exec(text)) !== null) {
                        const start = model.getPositionAt(match.index);
                        const end = model.getPositionAt(
                            match.index + match[0].length,
                        );
                        const decoded = match[0]
                            .split('\\u')
                            .filter(Boolean)
                            .map((hex) =>
                                String.fromCharCode(parseInt(hex, 16)),
                            )
                            .join('');
                        dec.push({
                            id: 'decode' + match.index,
                            ownerId: 1,
                            range: new monaco.Range(
                                start.lineNumber,
                                start.column,
                                end.lineNumber,
                                end.column,
                            ),
                            options: {
                                className: 'unicode-decode',
                                hoverMessage: { value: decoded },
                                afterContentClassName: 'unicode-decode',
                                after: {
                                    content: decoded,
                                    inlineClassName: 'unicode-decode-after',
                                },
                            },
                        } satisfies IModelDecoration);
                    }
                })();
            }

            (() => {
                const targetValue = fixContentTypeFun();
                if (!targetValue) return;
                const text = model.getValue();
                let match;

                // 匹配 Content-Type: 后面的值
                const regex = /Content-Type:\s*([^\r\n]*)/gi;

                while ((match = regex.exec(text)) !== null) {
                    const contentTypeValue = match[1].trim(); // 获取 Content-Type 后的值并去除多余空格
                    if (contentTypeValue === targetValue) {
                        // 计算 Content-Type: 后具体值的起始位置，避免空格问题
                        const textBeforeMatch = text.substring(
                            match.index,
                            regex.lastIndex,
                        ); // 获取匹配到的完整文本
                        const contentStartIndex =
                            match.index +
                            textBeforeMatch.indexOf(contentTypeValue); // 确保起始位置精确匹配

                        const start = model.getPositionAt(contentStartIndex);
                        const end = model.getPositionAt(
                            match.index + match[0].length,
                        );

                        dec.push({
                            id: 'decode' + match.index,
                            ownerId: 1,
                            range: new monaco.Range(
                                start.lineNumber,
                                start.column,
                                end.lineNumber,
                                end.column,
                            ),
                            options: {
                                className: 'unicode-decode',
                                hoverMessage: {
                                    value: fixContentTypeHoverMessageFun() as string,
                                },
                                afterContentClassName: 'unicode-decode',
                                after: {
                                    content:
                                        originalContentTypeFun() === ''
                                            ? '原Content-Type为空，该Content-type为自动探测'
                                            : originalContentTypeFun() ||
                                              '未知',
                                    inlineClassName: 'unicode-decode-after',
                                },
                            },
                        } satisfies IModelDecoration);
                    }
                }
            })();
            (() => {
                // all
                const keywordRegExp = /\r?\n/g;
                let match;
                let count = 0;
                while ((match = keywordRegExp.exec(text)) !== null) {
                    count++;
                    const start = model.getPositionAt(match.index);
                    const className: 'crlf' | 'lf' =
                        match[0] === '\r\n' ? 'crlf' : 'lf';
                    const end = model.getPositionAt(
                        match.index + match[0].length,
                    );
                    dec.push({
                        id: 'keyword' + match.index,
                        ownerId: 2,
                        range: new monaco.Range(
                            start.lineNumber,
                            start.column,
                            end.lineNumber,
                            end.column,
                        ),
                        options: { beforeContentClassName: className },
                    } satisfies YakitIModelDecoration);
                    if (count > 19) {
                        return;
                    }
                }
            })();

            function highLightRange(item: any) {
                const {
                    startOffset = 0,
                    highlightLength = 0,
                    startLineNumber,
                    startColumn,
                    endLineNumber,
                    endColumn,
                } = item;
                let range = {
                    startLineNumber: 0,
                    startColumn: 0,
                    endLineNumber: 0,
                    endColumn: 0,
                };
                if (typeof startLineNumber === 'number') {
                    range.startLineNumber = startLineNumber;
                    range.startColumn = startColumn;
                    range.endLineNumber = endLineNumber;
                    range.endColumn = endColumn;
                } else {
                    if (model) {
                        // 获取偏移量对应的位置
                        const startPosition = model.getPositionAt(
                            Number(startOffset),
                        );
                        const endPosition = model.getPositionAt(
                            Number(startOffset) + Number(highlightLength),
                        );
                        range.startLineNumber = startPosition.lineNumber;
                        range.startColumn = startPosition.column;
                        range.endLineNumber = endPosition.lineNumber;
                        range.endColumn = endPosition.column;
                    }
                }
                return range;
            }

            (() => {
                // all
                highLightTextFun().forEach((item) => {
                    const range = highLightRange(item);
                    // 创建装饰选项
                    dec.push({
                        id:
                            'hight-light-text_' +
                            range.startLineNumber +
                            '_' +
                            range.startColumn +
                            '_' +
                            range.endLineNumber +
                            '_' +
                            range.endColumn,
                        ownerId: 3,
                        range: new monaco.Range(
                            range.startLineNumber,
                            range.startColumn,
                            range.endLineNumber,
                            range.endColumn,
                        ),
                        options: {
                            isWholeLine: false,
                            className: highLightClass
                                ? highLightClass
                                : 'hight-light-default-bg-color',
                            hoverMessage: [
                                {
                                    value: (item as HighLightText).hoverVal,
                                    isTrusted: true,
                                },
                            ],
                        },
                    } satisfies IModelDecoration);
                });

                highLightFindFun().forEach((item) => {
                    const range = highLightRange(item);
                    // 创建装饰选项
                    dec.push({
                        id:
                            'hight-light-find_' +
                            range.startLineNumber +
                            '_' +
                            range.startColumn +
                            '_' +
                            range.endLineNumber +
                            '_' +
                            range.endColumn,
                        ownerId: 3,
                        range: new monaco.Range(
                            range.startLineNumber,
                            range.startColumn,
                            range.endLineNumber,
                            range.endColumn,
                        ),
                        options: {
                            isWholeLine: false,
                            className: highLightFindClass
                                ? highLightFindClass
                                : 'hight-light-find-default-bg-color',
                            hoverMessage: [{ value: '', isTrusted: true }],
                        },
                    } satisfies IModelDecoration);
                });
            })();

            return dec;
        };

        deltaDecorationsRef.current = () => {
            current = model.deltaDecorations(current, generateDecorations());
        };

        editor.onDidChangeModelContent(() => {
            current = model.deltaDecorations(current, generateDecorations());
        });
        current = model.deltaDecorations(current, generateDecorations());

        return () => {
            try {
                editor.dispose();
            } catch (e) {}
        };
    }, [editor]);

    useEffect(() => {
        if (deltaDecorationsRef.current) {
            disableUnicodeDecodeRef.current = props.disableUnicodeDecode;
            deltaDecorationsRef.current();
        }
    }, [
        JSON.stringify(highLightText),
        JSON.stringify(highLightFind),
        props.disableUnicodeDecode,
        props.fixContentType,
        props.originalContentType,
    ]);

=======
>>>>>>> 38104b8 (feat: 引入yakit控件)
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
<<<<<<< HEAD
                        renderValidationDecorations,
=======
>>>>>>> 38104b8 (feat: 引入yakit控件)
                    }}
                />
            </div>
        </div>
    );
};
