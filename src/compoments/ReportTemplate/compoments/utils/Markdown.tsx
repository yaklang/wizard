import React from 'react';
import type { Options } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export interface MarkdownProp extends Options {
    escapeHtml?: boolean;
}

export const Markdown: React.FC<MarkdownProp> = (props) => {
    const { escapeHtml = true } = props;

    return (
        <div className="markdown-body">
            <ReactMarkdown
                {...props}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={escapeHtml ? [rehypeRaw] : []}
            />
        </div>
    );
};
