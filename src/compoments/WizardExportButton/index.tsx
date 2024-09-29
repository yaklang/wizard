import type { FC } from 'react';

import { Button } from 'antd';

import { ExportsIcon } from '@/assets/compoments';
import { TWizardExportProps } from '../WizardTable/types';

/**
 *
 * @param props 导出文件按钮
 * @param dowload_request 导出文件请求
 * @returns ReactNode
 */
const WizardExport: FC<TWizardExportProps> = ({
    dowload_request,
    loading,
    ...props
}) => {
    return (
        <Button
            {...props}
            type="primary"
            loading={loading}
            icon={props.icon ?? <ExportsIcon />}
            onClick={
                async () => await dowload_request()
                // .then(() => {
                //     message.success('导出成功');
                // })
                // .catch(() => {
                //     message.error('导出失败');
                // });
            }
        >
            导出Excel
        </Button>
    );
};

export default WizardExport;
