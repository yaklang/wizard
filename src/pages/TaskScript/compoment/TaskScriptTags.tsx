import React, { Key, useEffect, useRef } from 'react';
import { Popover, Tag } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import styles from '../index.module.scss';
import { targetColorFn } from '../data';
import { useSafeState } from 'ahooks';

interface TaskScriptTagsProps {
    // items: Record<any | 'tags', string | string[]>;
    items: any;
    keys: Key;
}
// TODO 该文件缺少类型
const TaskScriptTags: React.FC<TaskScriptTagsProps> = ({ items }) => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [tagItem, setTagItem] = useSafeState<any>({});

    useEffect(() => {
        setTagItem(items);
    }, []);

    // 删除标签
    const headDeleteTag = (
        e: React.MouseEvent<HTMLElement, MouseEvent>,
        tag: string,
    ) => {
        e.preventDefault();
        setTagItem((values: any) => {
            const targetFilterTag = values.tags.filter(
                (name: any) => name !== tag,
            );
            return { ...values, tags: targetFilterTag };
        });
    };

    return (
        <div className={styles['content-tags']} ref={contentRef}>
            {tagItem?.tags?.map(
                (tag: any, key: any) =>
                    key === 0 && (
                        <Tag
                            className={styles['tag']}
                            closable
                            closeIcon={
                                <CloseOutlined className={styles['tag-icon']} />
                            }
                            onClose={(e) => headDeleteTag(e, tag)}
                            color={targetColorFn(key)}
                            key={tag}
                        >
                            {tag}
                        </Tag>
                    ),
            )}
            {tagItem?.tags?.slice(1, tagItem?.tags?.length)?.length > 0 && (
                <Popover
                    content={
                        <div className="max-h-30 overflow-auto flex flex-col gap-2">
                            {tagItem?.tags
                                .slice(1, items.tags.length)
                                .map((tag: any) => (
                                    <Tag
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                        }}
                                        closable
                                        closeIcon={<CloseOutlined />}
                                        onClose={(e) => headDeleteTag(e, tag)}
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
                        + {tagItem?.tags?.slice(1, items?.tags?.length)?.length}
                    </Tag>
                </Popover>
            )}
            <Tag className={styles['add-tag']} icon={<PlusOutlined />}>
                Add Tag
            </Tag>
        </div>
    );
};

export { TaskScriptTags };
