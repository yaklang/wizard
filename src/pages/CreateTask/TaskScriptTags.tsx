import type { Key } from 'react';
import React, { useEffect, useRef } from 'react';
import { Popover, Tag } from 'antd';
import styles from '../TaskScript/index.module.scss';
import { useSafeState } from 'ahooks';
import type { GetAnalysisScriptResponse } from '@/apis/task/types';
import { targetColorFn } from '../TaskScript/data';

interface TaskScriptTagsProps {
    tags: GetAnalysisScriptResponse['tags'];
    script_name: string;
}

const TaskScriptTags: React.FC<Partial<TaskScriptTagsProps>> = ({ tags }) => {
    const contentRef = useRef<HTMLDivElement | null>(null);

    const [tagItem, setTagItem] = useSafeState<
        GetAnalysisScriptResponse['tags']
    >([]);

    useEffect(() => {
        setTagItem(tags);
    }, []);

    return (
        <div className={styles['content-tags']} ref={contentRef}>
            {tagItem
                ?.filter((it) => it !== '')
                ?.map(
                    (tag: string, key: Key) =>
                        key === 0 && (
                            <Tag
                                className={styles['tag']}
                                color={targetColorFn(key)}
                                key={tag}
                            >
                                {tag}
                            </Tag>
                        ),
                )}
            {tagItem &&
                tagItem.filter((it) => it !== '')?.slice(1, tagItem?.length)
                    ?.length > 0 && (
                    <Popover
                        content={
                            <div className="max-h-30 overflow-auto flex flex-col gap-2">
                                {tagItem
                                    .slice(1, tagItem?.length)
                                    .map((tag: any) => (
                                        <Tag
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}
                                            key={tag}
                                        >
                                            {tag}
                                        </Tag>
                                    ))}
                            </div>
                        }
                        trigger="click"
                        placement="bottom"
                    >
                        <Tag className={styles['tag-length']}>
                            + {tagItem?.slice(1, tagItem?.length)?.length}
                        </Tag>
                    </Popover>
                )}
        </div>
    );
};

export { TaskScriptTags };
