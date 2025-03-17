import { useCallback, useRef } from 'react';

import HexEditor from 'react-hex-editor';
import type { HexEditorHandle } from 'react-hex-editor/dist/types';

import { WizardAceEditor } from '@/compoments';
import useListenHeight from '@/hooks/useListenHeight';
import { useTheme } from '../CodecEntry';
import { OutlineImport } from '../assets/Exclamation';
import { Button, message, Tag, Tooltip } from 'antd';
import { useSafeState } from 'ahooks';
import { CopyOutlined, EnterOutlined } from '@ant-design/icons';
import { OutlineStorage } from '../assets/OutlineStorage';
import { OutlineArrowBigUp } from '../assets/OutlineArrowBigUp ';
import { copyToClipboard, saveFile } from '@/utils';
import { OutlineArrowscollapse } from '../assets/OutlineArrowscollapseIcon';
import { OutlineArrowsexpand } from '../assets/OutlineArrowsexpand';

const CodeEditor = () => {
    const { collectListContext, setCollectListContext } = useTheme();
    const [wrap, setWrap] = useSafeState({
        topEditorWrap: false,
        bottomEditorWrap: false,
    });

    // hex
    const [showData, setShowData] = useSafeState<Uint8Array>(
        new Uint8Array([]),
    );
    const [nonce, setNonce] = useSafeState<number>(0);

    const typeContainerRef = useRef(null);
    const [containerHeight] = useListenHeight(typeContainerRef);
    const inputFileRef = useRef<HTMLInputElement | null>(null);
    const HexEditorRef = useRef<HexEditorHandle>(null);

    const handleButtonClick = () => {
        inputFileRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setCollectListContext((preValue) => ({
                    ...preValue,
                    text: e.target?.result as string,
                }));
            };
            reader.readAsText(file);
        }
    };

    const handleSetValue = useCallback(
        (offset: number, value: number) => {
            collectListContext.rowResultBuff[offset] = value;
            setShowData(showData);
            setNonce((v) => v + 1);
        },
        [showData],
    );

    return (
        <div ref={typeContainerRef} className="h-full flex-1">
            <div className="h-9 flex justify-between items-center px-2">
                <div>Input</div>
                <div className="flex items-center justify-center">
                    <Tooltip title="导入">
                        <div
                            className="h-5 cursor-pointer w-5 flex justify-center items-center rounded-1 hover:bg-[#f0f1f3] mr-1 hover:text-[#1677ff] text-[#85899e]"
                            onClick={handleButtonClick}
                        >
                            <OutlineImport className="w-4" />
                        </div>
                        <input
                            type="file"
                            ref={inputFileRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </Tooltip>
                    <Tooltip
                        title={
                            <div className="w-18 text-center">
                                {wrap.topEditorWrap ? '不自动换行' : '自动换行'}
                            </div>
                        }
                    >
                        <div
                            className="h-5 w-5 flex justify-center items-center rounded-1 mr-1"
                            style={{
                                background: `${wrap.topEditorWrap ? '#1677ff' : 'none'}`,
                                color: `${wrap.topEditorWrap ? '#f0f1f3' : '#85899e'}`,
                            }}
                        >
                            <EnterOutlined
                                className="w-4"
                                onClick={() =>
                                    setWrap((preValue) => ({
                                        ...preValue,
                                        topEditorWrap: !preValue.topEditorWrap,
                                    }))
                                }
                            />
                        </div>
                    </Tooltip>
                    <Button
                        type="link"
                        danger
                        className="px-1 text-3"
                        onClick={() =>
                            setCollectListContext((preValue) => ({
                                ...preValue,
                                text: '',
                            }))
                        }
                    >
                        清空
                    </Button>
                </div>
            </div>
            <WizardAceEditor
                style={{ height: `${containerHeight / 2}px` }}
                wrapEnabled={wrap.topEditorWrap}
                value={collectListContext.text}
                tabSize={4}
                onChange={(e: string) =>
                    setCollectListContext((preValue) => ({
                        ...preValue,
                        text: e,
                    }))
                }
            />

            <div className="h-9 flex justify-between items-center px-2">
                <div className="flex items-center justify-center gap-2">
                    <div>OutPut</div>
                    <Tag.CheckableTag
                        checked={collectListContext.hex}
                        onChange={(checked) =>
                            setCollectListContext((preValue) => ({
                                ...preValue,
                                hex: checked,
                            }))
                        }
                    >
                        Hex原文
                    </Tag.CheckableTag>
                </div>

                <div className="flex items-center justify-center">
                    {collectListContext.hex ? null : (
                        <>
                            <Tooltip title="保存">
                                <div
                                    className="h-5 cursor-pointer w-5 flex justify-center items-center rounded-1 hover:bg-[#f0f1f3] mr-1 hover:text-[#1677ff]"
                                    onClick={() => {
                                        if (
                                            collectListContext.resultStr &&
                                            collectListContext.resultStr
                                                .length > 0
                                        ) {
                                            saveFile(
                                                collectListContext.resultStr,
                                                `Output-${new Date().getTime()}.txt`,
                                            );
                                        } else {
                                            message.warning('暂无可保存内容');
                                        }
                                    }}
                                >
                                    <OutlineStorage className="text-[#85899e] w-4 hover:color-[#1677ff] cursor-pointer" />
                                </div>
                            </Tooltip>
                            <Tooltip title="将Output替换至Input">
                                <div
                                    className="h-5 cursor-pointer w-5 flex justify-center items-center rounded-1 hover:bg-[#f0f1f3] mr-1 hover:text-[#1677ff]"
                                    onClick={() =>
                                        setCollectListContext((preValue) => ({
                                            ...preValue,
                                            text: preValue.resultStr,
                                        }))
                                    }
                                >
                                    <OutlineArrowBigUp className="text-[#85899e] w-4 hover:color-[#1677ff] cursor-pointer" />
                                </div>
                            </Tooltip>

                            <Tooltip title="复制">
                                <div
                                    className="h-5 cursor-pointer w-5 flex justify-center items-center rounded-1 hover:bg-[#f0f1f3] mr-1 hover:text-[#1677ff]"
                                    onClick={() => {
                                        copyToClipboard(
                                            collectListContext.resultStr,
                                        )
                                            .then(() => {
                                                if (
                                                    collectListContext.resultStr
                                                        .length === 0 ||
                                                    !collectListContext.resultStr
                                                ) {
                                                    message.warning('内容为空');
                                                } else {
                                                    message.success('复制成功');
                                                }
                                            })
                                            .catch(() => {
                                                message.info(
                                                    '复制失败，请重试',
                                                );
                                            });
                                    }}
                                >
                                    <CopyOutlined className="text-[#85899e] w-4 hover:color-[#1677ff] cursor-pointer" />
                                </div>
                            </Tooltip>

                            <Tooltip
                                title={
                                    <div className="w-18 text-center">
                                        {wrap.topEditorWrap
                                            ? '不自动换行'
                                            : '自动换行'}
                                    </div>
                                }
                            >
                                <div
                                    className="h-5 w-5 flex justify-center items-center rounded-1 mr-1"
                                    style={{
                                        background: `${wrap.bottomEditorWrap ? '#1677ff' : 'none'}`,
                                        color: `${wrap.bottomEditorWrap ? '#f0f1f3' : '#85899e'}`,
                                    }}
                                >
                                    <EnterOutlined
                                        className="w-4"
                                        onClick={() =>
                                            setWrap((preValue) => ({
                                                ...preValue,
                                                bottomEditorWrap:
                                                    !preValue.bottomEditorWrap,
                                            }))
                                        }
                                    />
                                </div>
                            </Tooltip>
                        </>
                    )}

                    <div
                        className="h-5 w-5 flex justify-center items-center text-[#85899e] cursor-pointer rounded-1 hover:bg-[#f0f1f3] hover:text-[#1677ff]"
                        onClick={() =>
                            setCollectListContext((preValue) => ({
                                ...preValue,
                                expansion: !preValue.expansion,
                            }))
                        }
                    >
                        {collectListContext.expansion ? (
                            <OutlineArrowscollapse className="text-[#85899e] hover:color-[#1677ff]" />
                        ) : (
                            <OutlineArrowsexpand className="text-[#85899e] hover:color-[#1677ff]" />
                        )}
                    </div>
                </div>
            </div>
            {collectListContext.hex ? (
                <div style={{ height: `${containerHeight / 2 - 72}px` }}>
                    <HexEditor
                        readOnly={true}
                        ref={HexEditorRef}
                        asciiWidth={18}
                        data={collectListContext.rowResultBuff}
                        nonce={nonce}
                        setValue={handleSetValue}
                        overscanCount={0x03}
                        showAscii={true}
                        showColumnLabels={true}
                        showRowLabels={true}
                        highlightColumn={true}
                    />
                </div>
            ) : (
                <WizardAceEditor
                    style={{ height: `${containerHeight / 2 - 72}px` }}
                    wrapEnabled={wrap.bottomEditorWrap}
                    readOnly={true}
                    value={collectListContext.resultStr}
                    tabSize={4}
                />
            )}
        </div>
    );
};

export { CodeEditor };
