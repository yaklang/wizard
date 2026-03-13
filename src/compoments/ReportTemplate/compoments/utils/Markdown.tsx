import React from 'react';
import type { Options } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export interface MarkdownProp extends Options {
    escapeHtml?: boolean;
    filterFirstHeader?: boolean;
}

export const Markdown: React.FC<MarkdownProp> = (props) => {
    const { escapeHtml = true, filterFirstHeader = false, children } = props;

    let processedChildren = children;
    if (filterFirstHeader && typeof children === 'string') {
        // 移除第一个 # 或 ## 标题 (通常是规则里自带的)
        processedChildren = children.replace(/^(#+\s+.*?\n+)/, '');
    }

    return (
        <div className="markdown-body">
            <ReactMarkdown
                {...props}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={escapeHtml ? [rehypeRaw] : []}
            >
                {processedChildren}
            </ReactMarkdown>
        </div>
    );
};
