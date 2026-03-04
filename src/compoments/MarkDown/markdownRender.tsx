import { code } from '@uiw/react-md-editor';
import { theme } from 'antd';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import type { StreamdownProps, MathPlugin } from 'streamdown';
import { Streamdown } from 'streamdown';
import { mermaid } from '@streamdown/mermaid';
import { math } from '@streamdown/math';
import rehypeSlug from 'rehype-slug';

interface StreamMarkdownProps extends StreamdownProps {
    content?: string;
    wrapperClassName?: string;
}

// react-markdown的平替（注：xss传入的markdown中不可包含html元素 ）
// 现存问题 暗黑模式下代码块不高亮
export const StreamMarkdown: React.FC<StreamMarkdownProps> = React.memo(
    (props) => {
        const { content, wrapperClassName, ...restProps } = props;
        const plugins = useMemo(() => {
            return { code, mermaid, math: math as MathPlugin };
        }, [theme]);
        return (
            <>
                {/* caret="block"|"circle" isAnimating={true} */}
                <div
                    className={classNames('stream-markdown', wrapperClassName)}
                >
                    <Streamdown
                        plugins={plugins as any}
                        shikiTheme={['github-light', 'github-dark']}
                        // controls={{
                        // mermaid: {
                        //     // 全屏不展示
                        //     fullscreen: false,
                        //     download: true,
                        //     copy: true,
                        //     // 平移缩放不展示
                        //     panZoom: false
                        // }
                        // }}
                        mermaid={{
                            config: {
                                theme: 'default',
                            },
                        }}
                        // Streamdown官网文档中内置了一些常用插件 https://streamdown.ai/docs/configuration#core-props
                        rehypePlugins={[
                            // rehypeSanitize 防止 XSS 攻击 官方文档已内置
                            rehypeSlug as any,
                        ]}
                        components={{
                            // eslint-disable-next-line react/no-unstable-nested-components
                            a: (aProps: any) => {
                                return (
                                    <a
                                        {...aProps}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // ipcRenderer.invoke(
                                            //     'open-url',
                                            //     aProps.href || '',
                                            // );
                                        }}
                                    />
                                );
                            },
                        }}
                        {...restProps}
                    >
                        {content}
                    </Streamdown>
                </div>
            </>
        );
    },
);
