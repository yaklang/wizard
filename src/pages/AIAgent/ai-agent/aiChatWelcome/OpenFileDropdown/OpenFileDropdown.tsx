import { YakitDropdownMenu } from '@/compoments/yakitUI/YakitDropdownMenu/YakitDropdownMenu'
// import type { OpenDialogOptions } from '@/utils/fileSystemDialog';
// import { handleOpenFileSystemDialog } from '@/utils/fileSystemDialog';
import type { FC, ReactNode } from 'react'
import { useMemo } from 'react'

export interface OpenFileDropdownItem {
  path: string
  isFolder: boolean
}

interface OpenFileDropdownProps {
  children: ReactNode
  cb?: (data: OpenFileDropdownItem) => void
}

// async function openFileOrFolder(
//     properties: OpenDialogOptions['properties'],
// ): Promise<string | undefined> {
//     const { filePaths } = await handleOpenFileSystemDialog({
//         title: properties?.includes('openDirectory')
//             ? '请选择文件夹'
//             : '请选择文件',
//         properties,
//     });
//     if (!filePaths || filePaths.length === 0) return;
//     return filePaths[0].replace(/\\/g, '\\');
// }
const OpenFileDropdown: FC<OpenFileDropdownProps> = ({ children }) => {
  const dropdownMenu = useMemo(() => {
    return {
      data: [
        {
          label: '打开文件',
          key: 'open-file',
        },
        {
          label: '打开文件夹',
          key: 'open-folder',
        },
      ],
      onClick: () => {
        // const isFolder = key === 'open-folder';
        // openFileOrFolder(isFolder ? ['openDirectory'] : ['openFile'])
        //     .then((path) => {
        //         if (!path) return;
        //         cb?.({
        //             path,
        //             isFolder,
        //         });
        //     })
        //     .catch(() => {});
      },
    }
  }, [])

  return (
    <YakitDropdownMenu
      menu={dropdownMenu}
      dropdown={{
        trigger: ['click'],
        placement: 'bottomLeft',
      }}
    >
      {children}
    </YakitDropdownMenu>
  )
}
export default OpenFileDropdown
