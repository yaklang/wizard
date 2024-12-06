import React from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/zenburn.css';
import 'codemirror/theme/solarized.css';
import 'codemirror/addon/display/fullscreen.css';
import './CodeMirror.css';

import 'codemirror/mode/go/go';
import 'codemirror/mode/php/php';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/python/python';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/textile/textile';
import 'codemirror/mode/http/http';
import 'codemirror/addon/display/fullscreen';

export interface CodeViewerProps {
    mode?:
        | 'go'
        | 'yaml'
        | 'markdown'
        | 'textile'
        | 'http'
        | 'javascript'
        | string;
    value: string;
    setValue?: (i: string) => any;
    width?: number | string;
    height?: number | string;
    fullHeight?: boolean;
    theme?: string;
    highlightKeywords?: string[];

    isReport?: boolean;
}

const fixMode = (i: string) => {
    switch (i) {
        case 'py':
        case 'python':
        case 'py3':
        case 'py2':
        case 'ipy':
            return 'python';
        case 'js':
        case 'ts':
            return 'javascript';
        case 'tsx':
        case 'jsx':
            return 'jsx';
        case 'go':
        case 'golang':
            return 'go';
        case 'yaml':
        case 'yml':
            return 'yaml';
        case 'md':
        case 'markdown':
            return 'markdown';
        default:
            return 'javascript';
    }
};

export const CodeViewer: React.FC<CodeViewerProps> = (p) => {
    return (
        <div
            style={{
                width: p.width || 650,
                overflow: 'auto',
                height: p.height,
            }}
        >
            <CodeMirror
                className={
                    p.isReport
                        ? 'fullText'
                        : p.fullHeight
                          ? 'fullText'
                          : 'height450px'
                }
                value={p.value}
                editorDidMount={(editor) => {
                    let pairs: {
                        start: {
                            line: number;
                            ch: number;
                        };
                        end: {
                            line: number;
                            ch: number;
                        };
                    }[] = [];
                    (p.highlightKeywords || []).map((i) => {
                        p.value.split('\n').map((lineValue, index) => {
                            let startIndex = 0;
                            do {
                                let iStart = lineValue.indexOf(i, startIndex);
                                if (iStart >= 0) {
                                    pairs.push({
                                        start: {
                                            line: index,
                                            ch: iStart,
                                        },
                                        end: {
                                            line: index,
                                            ch: iStart + i.length,
                                        },
                                    });
                                    startIndex = iStart + i.length;
                                } else {
                                    break;
                                }
                            } while (true);
                        });
                    });
                    pairs.map((i) => {
                        editor.markText(i.start, i.end, {
                            className: 'codemirror-highlighted',
                        });
                    });
                }}
                options={{
                    extraKeys: {
                        F11(cm: any) {
                            cm.setOption(
                                'fullScreen',
                                !cm.getOption('fullScreen'),
                            );
                        },
                        'Ctrl-H'(cm: any) {
                            cm.setOption(
                                'fullScreen',
                                !cm.getOption('fullScreen'),
                            );
                        },
                    },
                    mode: fixMode(p.mode || '') || 'go',
                    tabSize: 2,
                    theme: p.theme || 'zenburn',
                    lineNumbers: true,
                    scrollbarStyle: p.isReport ? 'null' : 'native',
                    lineWrapping: !!p.isReport,
                }}
                onBeforeChange={(_: any, __: any, value: any) => {
                    p.setValue && p.setValue(value);
                }}
            />
        </div>
    );
};
