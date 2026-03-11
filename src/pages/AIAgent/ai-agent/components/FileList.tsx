import type { FC } from 'react';
import styles from './FileList.module.scss';
import { OutlineChevronrightIcon } from '@/assets/icon/outline';
import type { AIYakExecFileRecord } from '@/pages/AIAgent/ai-re-act/hooks/aiRender';
import { formatTimestamp } from '@/utils/timeUtil';
import emiter from '@/utils/eventBus/eventBus';
import { AITabsEnum } from '../defaultConstant';
import { getFileActionStatus, renderFileTypeIcon } from '../../utils';
import { IconNotepadFileTypeDir } from '../../utils/icon/icon';
import { YakitTag } from '@/compoments/YakitUI/YakitTag/YakitTag';
import type { PluginExecuteLogFile } from '../../plugins/operator/pluginExecuteResult/PluginExecuteResultType';
import { YakitButton } from '@/compoments/YakitUI/YakitButton/YakitButton';

export interface FileListItem {
    name: string;
    isDir?: boolean;
    desc?: string;
    status?: 'success' | 'danger' | 'white';
    label?: string;
    time?: string;
}

interface FileListProps {
    title?: string;
    fileList?: AIYakExecFileRecord[];
}

const getFileIcon = (name: string, isDir: boolean) => {
    // 后缀
    const type =
        name.indexOf('.') > -1 ? (name.split('.').pop() as string) : '';
    if (isDir) {
        return <IconNotepadFileTypeDir />;
    }
    return renderFileTypeIcon({ type });
};

const getFileName = (path: string, isDir: boolean): string => {
    if (!path) return '';
    const normalized = path.replace(/[\\/]+$/, '');
    const parts = normalized.split(/[\\/]/);
    const lastPart = parts[parts.length - 1];
    if (isDir) return lastPart;
    return lastPart;
};

const FileList: FC<FileListProps> = ({ title, fileList }) => {
    const switchAIActTab = () => {
        emiter.emit(
            'switchAIActTab',
            JSON.stringify({ key: AITabsEnum.Operation_Log }),
        );
    };
    return (
        <div className={styles['file-list']}>
            <div className={styles['file-list-title']}>
                <span>{title ?? `相关文件 (${fileList?.length})`}</span>
                <YakitButton
                    hidden={fileList!.length < 6}
                    type="text"
                    onClick={switchAIActTab}
                >
                    查看全部
                </YakitButton>
            </div>
            <div className={styles['file-list-content']}>
                {fileList?.slice(0, 5).map((item) => {
                    try {
                        const data = JSON.parse(
                            item.data ?? '{}',
                        ) as PluginExecuteLogFile.FileItem;
                        const { color, action, message } = getFileActionStatus(
                            data.action,
                            data.action_message,
                        );
                        const name = getFileName(data.path, data.is_dir);
                        const Icon = getFileIcon(data.path, data.is_dir);
                        const dangerFile =
                            color === 'danger' && !data.is_dir ? (
                                <del>{name}</del>
                            ) : (
                                name
                            );
                        return (
                            <div
                                key={item.id}
                                className={styles['file-list-item']}
                                onClick={switchAIActTab}
                            >
                                <div className={styles['file-list-item-main']}>
                                    <YakitTag
                                        style={
                                            color === 'white'
                                                ? {
                                                      backgroundColor:
                                                          'var(--Colors-Use-Neutral-Border)',
                                                  }
                                                : {}
                                        }
                                        className={styles['file-list-item-tag']}
                                        border={false}
                                        color={color}
                                    >
                                        {action}
                                    </YakitTag>
                                    <div
                                        className={
                                            styles['file-list-item-icon']
                                        }
                                    >
                                        {Icon}
                                    </div>
                                    <div
                                        className={
                                            styles['file-list-item-name']
                                        }
                                    >
                                        {dangerFile}
                                    </div>
                                    <div
                                        className={
                                            styles['file-list-item-desc']
                                        }
                                    >
                                        {message}
                                    </div>
                                </div>
                                <div
                                    className={styles['file-list-item-actions']}
                                >
                                    <div
                                        className={
                                            styles[
                                                'file-list-item-actions-time'
                                            ]
                                        }
                                    >
                                        {formatTimestamp(item.timestamp)}
                                    </div>
                                    <OutlineChevronrightIcon />
                                </div>
                            </div>
                        );
                    } catch (error) {
                        return (
                            <div>
                                PluginExecuteLogFile.FileItem解析错误:
                                {JSON.stringify(error)}
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
};
export default FileList;
