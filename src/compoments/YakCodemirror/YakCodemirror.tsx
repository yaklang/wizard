import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import styles from './YakCodemirror.module.scss';
import type { YakCodemirrorProps } from './YakCodemirror.moduleType';
import { Controlled as CodeMirror } from 'react-codemirror2';

// 正确的样式导入方式
import 'codemirror/lib/codemirror.css';
// 主题样式
import 'codemirror/theme/material.css'; // 暗黑主题
// import "codemirror/theme/eclipse.css" // Eclipse主题
// import "codemirror/theme/xq-light.css" // XQ Light主题
// import "codemirror/theme/idea.css" // IntelliJ IDEA主题
import 'codemirror/theme/solarized.css'; // Solarized主题
// 语言模式
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/css/css';
import 'codemirror/mode/python/python';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/php/php';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/dockerfile/dockerfile';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/clike/clike'; // java, c, cpp等
// 插件
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/edit/matchbrackets';

export const YakCodemirror: React.FC<YakCodemirrorProps> = (props) => {
    const {
        value,
        onChange,
        fileName,
        readOnly = false,
        language = 'javascript',
        theme = 'solarized',
        highLight,
        firstLineNumber = 1,
        editorDidMount,
    } = props;
    const [codemirrorEditor, setCodemirrorEditor] = useState<any>();

    // 根据文件后缀判断语言模式
    const getLanguageMode = (filename: string) => {
        const extension = filename.toLowerCase().split('.').pop() || '';
        const modeMap: { [key: string]: string } = {
            // JavaScript 相关
            js: 'javascript',
            jsx: 'javascript',
            ts: 'text/typescript',
            tsx: 'text/typescript-jsx',

            // Web 相关
            html: 'htmlmixed',
            htm: 'htmlmixed',
            css: 'css',
            less: 'text/x-less',
            scss: 'text/x-scss',
            sass: 'text/x-scss',

            // 后端语言
            py: 'python',
            python: 'python',
            java: 'text/x-java',
            cpp: 'text/x-c++src',
            c: 'text/x-csrc',
            cs: 'text/x-csharp',
            php: 'php',
            rb: 'ruby',
            go: 'go',
            rs: 'rust',

            // 标记语言
            md: 'markdown',
            markdown: 'markdown',
            xml: 'xml',
            svg: 'xml',
            yaml: 'yaml',
            yml: 'yaml',
            json: 'javascript',

            // 其他
            sql: 'sql',
            sh: 'shell',
            bash: 'shell',
            dockerfile: 'dockerfile',
            docker: 'dockerfile',

            // 配置文件
            conf: 'properties',
            config: 'properties',
            ini: 'properties',
            properties: 'properties',
        };

        return modeMap[extension] || 'javascript'; // 默认返回 javascript
    };

    const { isDark } = useTheme();
    const options = useMemo(() => {
        // 几个推荐的亮色主题：
        // idea (IntelliJ IDEA风格)   theme: "idea"
        // eclipse (Eclipse IDE风格)    theme: "eclipse"
        // xq-light (清爽的浅色主题)     theme: "xq-light"
        // solarized (Solarized Light)    theme: "solarized"
        // neat (简洁主题)    theme: "neat"
        let setting: any = {
            mode: fileName ? getLanguageMode(fileName) : language,
            theme: isDark ? 'material' : theme,
            lineNumbers: true,
            viewportMargin: Infinity, // 关键设置
            lineWrapping: false, // 设置为 false 禁止换行
            smartIndent: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            styleActiveLine: true,
            lint: true,
            tabSize: 2,
            firstLineNumber,
            // 设置只读模式
            readOnly,
            extraKeys: {
                'Ctrl-Space': 'autocomplete',
            },
        };
        if (readOnly) {
            // 隐藏光标
            setting.cursorHeight = 0;
        }
        return setting;
    }, [readOnly, fileName, isDark, theme, language, firstLineNumber]);

    useEffect(() => {
        if (!codemirrorEditor || !highLight) return;

        const marks = codemirrorEditor.getAllMarks();
        marks.forEach((mark: any) => mark.clear());

        const { from, to } = highLight;
        const newFrom = { line: from.line - 1, ch: from.ch - 1 };
        const newTo = { line: to.line - 1, ch: to.ch - 1 };

        const highlightClass = highLight.className || styles['highlight-text'];
        codemirrorEditor.markText(newFrom, newTo, {
            className: highlightClass,
            css: 'background-color: var(--Colors-Use-Yellow-Bg)',
        });

        // height:auto + viewportMargin:Infinity 使 CodeMirror 全量展开，
        // 滚动由外部容器处理，CM 内部 scrollIntoView 无效，改用 DOM 原生滚动
        const timer = setTimeout(() => {
            codemirrorEditor.refresh();
            const wrapper = codemirrorEditor.getWrapperElement();
            const el = wrapper.querySelector('.' + CSS.escape(highlightClass));
            if (el) {
                el.scrollIntoView({ block: 'center' });
            }
            codemirrorEditor.setCursor(newFrom);
        }, 50);

        return () => clearTimeout(timer);
    }, [codemirrorEditor, highLight]);

    return (
        <div className={styles['yak-codemirror']} style={{ fontSize: 14 }}>
            <CodeMirror
                value={value}
                options={options}
                onBeforeChange={(_editor, _data, value) => {
                    onChange && onChange(value);
                }}
                onChange={() => {
                    // 如果需要在onChange时做些什么 后续需要时自行补充
                }}
                editorDidMount={(editor) => {
                    setCodemirrorEditor(editor);
                    if (editorDidMount) editorDidMount(editor);
                }}
            />
        </div>
    );
};
