import React from 'react';
import { Modal, Progress, Typography } from 'antd';
import type { TSSAReportExportFormat } from '@/compoments/SSAReportExportModal';

export interface TSSAReportExportProgressModalState {
    open: boolean;
    format: TSSAReportExportFormat;
    percent: number;
    message: string;
}

interface SSAReportExportProgressModalProps {
    state: TSSAReportExportProgressModalState;
}

const titleMap: Record<TSSAReportExportFormat, string> = {
    pdf: '正在导出 PDF 报告',
    word: '正在导出 Word 报告',
};

const SSAReportExportProgressModal: React.FC<
    SSAReportExportProgressModalProps
> = ({ state }) => {
    return (
        <Modal
            open={state.open}
            title={titleMap[state.format]}
            footer={null}
            closable={false}
            maskClosable={false}
            keyboard={false}
            destroyOnClose={false}
        >
            <Typography.Paragraph style={{ marginBottom: 12 }}>
                {state.message || '正在准备导出，请稍候...'}
            </Typography.Paragraph>
            <Progress
                percent={Math.max(0, Math.min(100, Math.round(state.percent)))}
                status={state.percent >= 100 ? 'success' : 'active'}
            />
            <Typography.Text type="secondary">
                风险较多时浏览器渲染与打包会持续一段时间，请保持当前页面打开。
            </Typography.Text>
        </Modal>
    );
};

export default SSAReportExportProgressModal;
