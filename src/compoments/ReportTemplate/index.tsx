import { FC } from 'react';

import { Divider } from 'antd';
import { match } from 'ts-pattern';
import { useMemoizedFn } from 'ahooks';
import ReactJson from 'react-json-view';

import { generateUniqueId } from '@/utils';

import Markdown from '../MarkDown';

import type { BlockType, TReportTemplateProps } from './type';
import { ReportMergeTable } from './compoments/SearchJsonTable';
import { ReportTable } from './compoments/JsonTable';

const ReportTemplate: FC<TReportTemplateProps> = ({ blocks }) => {
    const transformBlocks = useMemoizedFn((item: BlockType) => {
        return match(item)
            .with({ type: 'markdown' }, (value) => (
                <Markdown children={value.data} />
            ))
            .with({ type: 'json-table' }, (value) => (
                <ReportTable data={value.data} />
            ))
            .with({ type: 'search-json-table' }, (value) => (
                <ReportMergeTable data={value.data} />
            ))
            .with({ type: 'json' }, (value) => {
                const { title, raw } = value.data;
                if (!raw || raw === 'null' || raw === 'undefined') {
                    return (
                        <div>
                            <Divider orientation={'left'}>
                                JSON: {title}
                            </Divider>
                            <ReactJson src={value.data} collapsed={true} />
                            <br />
                        </div>
                    );
                }
            })
            .otherwise(() => <div>-</div>);
    });
    return blocks.map((item) => (
        <div key={generateUniqueId()}>{transformBlocks(item)}</div>
    ));
};

export default ReportTemplate;
