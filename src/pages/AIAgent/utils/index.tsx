import {
    LogNodeStatusFileIcon,
    SolidYakCattleNoBackColorIcon,
} from '@/assets/icon/colors';
import {
    IconNotepadFileTypeWord,
    IconNotepadFileTypeCompress,
    IconNotepadFileTypePPT,
    IconNotepadFileTypeExcel,
    IconNotepadFileTypePdf,
    IconNotepadFileTypeUnknown,
} from './icon/icon';
import { YakitEditor } from '@/compoments/YakitUI/YakitEditor/YakitEditor';
import type { YakitTagColor } from '@/compoments/yakitUI/YakitTag/YakitTagType';
import type { ReactNode } from 'react';
import type { PluginExecuteLogFile } from '../plugins/operator/pluginExecuteResult/PluginExecuteResultType';
import { modeToPermissions } from './invoker';
import { FileActionEnum } from '../plugins/operator/pluginExecuteResult/PluginExecuteResultType.d';

export const renderFileTypeIcon = (params: {
    type: string;
    iconClassName?: string;
}) => {
    const { type, iconClassName } = params;
    switch (type) {
        case '.doc':
        case 'doc':
            return <IconNotepadFileTypeWord className={iconClassName} />;
        case '.zip':
        case 'zip':
        case '.7z':
        case '7z':
        case '.tar':
        case 'tar':
            return <IconNotepadFileTypeCompress className={iconClassName} />;
        case '.ppt':
        case 'ppt':
            return <IconNotepadFileTypePPT className={iconClassName} />;
        case '.csv':
        case 'csv':
        case '.xlsx':
        case 'xlsx':
        case '.numbers':
        case 'numbers':
        case 'xls':
        case '.xls':
            return <IconNotepadFileTypeExcel className={iconClassName} />;
        case '.pdf':
        case 'pdf':
            return <IconNotepadFileTypePdf className={iconClassName} />;
        case '.txt':
        case 'txt':
            return <LogNodeStatusFileIcon className={iconClassName} />;
        case '.yak':
        case 'yak':
            return <SolidYakCattleNoBackColorIcon className={iconClassName} />;
        default:
            return <IconNotepadFileTypeUnknown className={iconClassName} />;
    }
};

export const getFileActionStatus = (
    action: PluginExecuteLogFile.FileActionType,
    action_message: PluginExecuteLogFile.FileActionMessage,
) => {
    let content: ReactNode = ''; // 预览内容
    let message = ''; // 操作描述
    let actionText = '未知操作'; // 操作权限
    let color: YakitTagColor = 'white';
    try {
        switch (action) {
            case FileActionEnum.Read_Action:
                // eslint-disable-next-line no-case-declarations, @typescript-eslint/consistent-type-assertions
                const read = {
                    ...action_message,
                } as PluginExecuteLogFile.ReadFileActionMessage;
                // eslint-disable-next-line no-case-declarations
                const readContent = read.content || '';
                actionText = '读取';
                message = `${read.offset}-${read.offset + read.length} ${read.unit}`;
                content =
                    readContent.length > 200
                        ? readContent.substring(0, 200) + '...'
                        : readContent;
                break;
            case FileActionEnum.Write_Action:
                // eslint-disable-next-line no-case-declarations, @typescript-eslint/consistent-type-assertions
                const write = {
                    ...action_message,
                } as PluginExecuteLogFile.WriteFileActionMessage;
                // eslint-disable-next-line no-case-declarations
                const writeContent = write.content || '';
                actionText = '修改内容';
                message = `修改方式:${write.mode}`;
                content =
                    writeContent.length > 200
                        ? writeContent.substring(0, 200) + '...'
                        : writeContent;
                break;
            case FileActionEnum.Create_Action:
                // eslint-disable-next-line no-case-declarations, @typescript-eslint/consistent-type-assertions
                const create = {
                    ...action_message,
                } as PluginExecuteLogFile.CreateFileActionMessage;
                actionText = '创建';
                color = 'success';
                message = `创建${create.isDir ? '文件夹' : '文件'}`;
                content = '暂无可预览内容';
                break;
            case FileActionEnum.Delete_Action:
                // eslint-disable-next-line no-case-declarations, @typescript-eslint/consistent-type-assertions
                const remove = {
                    ...action_message,
                } as PluginExecuteLogFile.DELETEFileActionMessage;
                actionText = '删除';
                color = 'danger';
                message = `删除${remove.isDir ? '文件夹' : '文件'}`;
                content = `${remove.isDir ? '文件夹' : '文件'}已被删除,无法展示预览内容`;
                break;
            case FileActionEnum.Status_Action:
                // eslint-disable-next-line no-case-declarations, @typescript-eslint/consistent-type-assertions
                const status = {
                    ...action_message,
                } as PluginExecuteLogFile.STATUSFileActionMessage;
                actionText = '查看元信息';
                content = (
                    <div style={{ height: 300 }}>
                        {/** NOTE - 个数过多后，可能会有性能影响 */}
                        <YakitEditor
                            readOnly={true}
                            type="yak"
                            value={JSON.stringify(status.status, null, 2)}
                        />
                    </div>
                );
                break;
            case FileActionEnum.Chmod_Action:
                // eslint-disable-next-line no-case-declarations, @typescript-eslint/consistent-type-assertions
                const chmod = {
                    ...action_message,
                } as PluginExecuteLogFile.CHMODFileActionMessage;
                actionText = '修改权限';
                // eslint-disable-next-line no-case-declarations
                const mode = modeToPermissions(chmod.chmodMode);
                content = (
                    <>
                        所属者权限: {mode ? mode[0] : '未知'}
                        <br />
                        所属组权限: {mode ? mode[1] : '未知'}
                        <br />
                        其他用户权限: {mode ? mode[2] : '未知'}
                    </>
                );
                break;
            case FileActionEnum.Find_Action:
                // eslint-disable-next-line no-case-declarations, @typescript-eslint/consistent-type-assertions
                const find = {
                    ...action_message,
                } as PluginExecuteLogFile.FINDFileActionMessage;
                actionText = '查找';
                message = `通过${find.mode}查找到${find.content.length}个满足条件${find.condition}的文件`;
                content = '暂无可预览内容';
                break;
            default:
                break;
        }
    } catch (error) {
        actionText = action;
        message = action_message.message;
    }
    return {
        color,
        action: actionText,
        message,
        content,
    };
};
