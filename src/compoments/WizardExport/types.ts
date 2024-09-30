import { ButtonProps } from 'antd';

interface TWizardExportProps extends ButtonProps {
    dowload_request: () => Promise<any>;
}

export type { TWizardExportProps };
