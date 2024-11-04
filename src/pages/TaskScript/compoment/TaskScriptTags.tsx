import React, { Key, useEffect, useRef } from 'react';
import { Input, InputRef, message, Popover, Tag } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import styles from '../index.module.scss';
import { targetColorFn } from '../data';
import { useSafeState, useUpdateEffect } from 'ahooks';
import { TGetAnalysisScriptReponse } from '@/apis/task/types';
import { postAnalysisScript } from '@/apis/task';

interface TaskScriptTagsProps {
    tags: TGetAnalysisScriptReponse['tags'];
    script_name: string;
}

const TaskScriptTags: React.FC<Partial<TaskScriptTagsProps>> = ({
    tags,
    script_name,
}) => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<InputRef>(null);

    const [tagItem, setTagItem] = useSafeState<
        TGetAnalysisScriptReponse['tags']
    >([]);

    useEffect(() => {
        setTagItem(tags);
    }, []);

    useUpdateEffect(() => {
        inputRef && inputRef.current?.focus();
    }, [tagItem]);

    // 删除标签
    const headDeleteTag = async (
        e: React.MouseEvent<HTMLElement, MouseEvent>,
        tag: string,
    ) => {
        e.preventDefault();
        const targetTagList = tagItem?.filter(
            (tagName: string) => tagName !== tag,
        );
        await postAnalysisScript({
            script_name,
            tags: targetTagList,
        })
            .then(() => {
                message.success('删除标签成功');
                setTagItem(targetTagList);
            })
            .catch((err) => {
                message.destroy();
                message.warning(err ?? '删除标签失败');
            });
    };

    // 添加标签操作
    const headAddScriptTag = async () => {
        setTagItem((items) => {
            return items ? [...items, ''] : [''];
        });
    };

    // 新增标签方法
    const handAddInputBlur = async () => {
        const inputValue =
            inputRef.current?.input?.value.replace(/\s+/g, '') ?? '';
        if (inputValue === '') {
            setTagItem((items) => items?.filter((it) => it !== ''));
            message.destroy();
            message.info('新增标签内容不能为空');
        } else {
            const targetTagList = tagItem
                ?.concat(inputValue)
                .filter((it) => it !== '');
            await postAnalysisScript({
                script_name,
                tags: targetTagList,
            })
                .then(() => {
                    message.success('新增标签成功');
                    setTagItem(targetTagList);
                })
                .catch((err) => {
                    message.destroy();
                    message.warning(err ?? '新增标签失败');
                });
        }
    };

    return (
        <div className={styles['content-tags']} ref={contentRef}>
            {tagItem
                ?.filter((it) => it !== '')
                ?.map(
                    (tag: string, key: Key) =>
                        key === 0 && (
                            <Tag
                                className={styles['tag']}
                                closable
                                closeIcon={
                                    <CloseOutlined
                                        className={styles['tag-icon']}
                                    />
                                }
                                onClose={(e) => headDeleteTag(e, tag)}
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
                                            closable
                                            closeIcon={<CloseOutlined />}
                                            onClose={(e) =>
                                                headDeleteTag(e, tag)
                                            }
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
            {tagItem?.includes('') ? (
                <Input
                    className="w-20.5 h-5 px-1 text-xs font-normal"
                    ref={inputRef}
                    onPressEnter={handAddInputBlur}
                    onBlur={handAddInputBlur}
                />
            ) : (
                <Tag
                    className={styles['add-tag']}
                    icon={<PlusOutlined />}
                    onClick={headAddScriptTag}
                >
                    Add Tag
                </Tag>
            )}
        </div>
    );
};

export { TaskScriptTags };
