import { FC, useEffect, useRef, useState } from 'react';

import AceEditor, { IAceEditorProps } from 'react-ace';

import 'ace-builds/src-noconflict/mode-golang';
import 'ace-builds/src-noconflict/theme-github';
// import 'ace-builds/src-noconflict/ext-language_tools';
// import 'ace-builds/src-noconflict/mode-golang';
// import 'ace-builds/src-noconflict/theme-monokai';

import { Empty, Spin } from 'antd';

type TWizardAceEditor = IAceEditorProps & {
    value?: string;
    onChange?: any;
    loading?: boolean;
};

const WizardAceEditor: FC<TWizardAceEditor> = ({
    value,
    onChange,
    loading,
    ...props
}) => {
    const editorRef = useRef<any>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    // 检查用户是否在底部
    const handleScroll = () => {
        const editor = editorRef.current?.editor;
        if (!editor) return;

        const lastVisibleLine = editor.renderer.getLastVisibleRow();
        const totalLines = editor.session.getLength(); // 总行数

        if (lastVisibleLine + 1 >= totalLines) {
            setIsAtBottom(true);
        } else {
            setIsAtBottom(false);
        }
    };

    // 当 value 更新时，滚动到底部
    useEffect(() => {
        if (isAtBottom) {
            const editor = editorRef.current?.editor;
            if (editor) {
                const lastLine = editor.session.getLength() - 1;
                // 使用 setTimeout 和 requestAnimationFrame 结合，防止浏览器卡死
                editor.scrollToLine(lastLine, false, true, () => {
                    setIsAtBottom(true);
                });
            }
        }
    }, [value, isAtBottom]);

    return typeof loading !== 'undefined' && !loading ? (
        <div className="w-full h-full flex items-center justify-center">
            <Spin spinning={!loading}>
                <Empty />
                <div className="flex items-center justify-center mt-2">
                    连接中, 请稍后...
                </div>
            </Spin>
        </div>
    ) : (
        <AceEditor
            ref={editorRef}
            width="100%"
            mode="golang"
            theme="github"
            // theme="monokai"
            onChange={onChange}
            value={value}
            showGutter={true}
            onScroll={handleScroll}
            name="WIZARD_ACE_EDITOR"
            highlightActiveLine
            enableSnippets
            setOptions={{
                visible: true,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: false,
                enableSnippets: true,
                mergeUndoDeltas: true,
                enableMultiselect: true,
                wrap: true, // 选择合适的换行方式
                useWorker: false,
                printMargin: false,
                showLineNumbers: true,
                tabSize: 4,
            }}
            editorProps={{ $blockScrolling: true }}
            {...props}
        />
    );
};

export default WizardAceEditor;
