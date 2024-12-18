import { WizardDrawer } from '@/compoments';
import ReportTemplate from '@/compoments/ReportTemplate';
import {
    TReportTemplateProps,
    ReportJsonKindData,
} from '@/compoments/ReportTemplate/type';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { EmailMoadl } from '@/pages/TaskDetail/compoments/EmialModal';
import { useSafeState } from 'ahooks';
import { Button } from 'antd';
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import html2pdf from 'html2pdf.js';
import { opt } from '@/pages/TaskDetail/compoments/ScriptDetailButton';

const PreviewReportDrawer = forwardRef<
    UseModalRefType,
    {
        title: string;
    }
>(({ title }, ref) => {
    const [drawer] = WizardDrawer.useDrawer();

    const [width, setWidth] = useState<number>(800);
    const divRef = useRef<HTMLDivElement>(null);

    const EmailModalRef = useRef<UseModalRefType>(null);

    const [cover, setCover] = useState<string>('');

    const [blocks, setBlocks] = useSafeState<TReportTemplateProps['blocks']>(
        [],
    );

    useImperativeHandle(ref, () => ({
        open(block) {
            drawer.open();
            setBlocks(block);
        },
    }));

    useEffect(() => {
        if (Array.isArray(blocks)) {
            // 获取报告内容wrapper宽度
            if (!divRef || !divRef.current) return;
            const div = divRef.current;
            setTimeout(() => setWidth(div.clientWidth), 100);
            for (let item of blocks) {
                if (item.type === 'json') {
                    if (
                        item.data.raw &&
                        item.data.raw !== 'null' &&
                        item.data.raw !== 'undefined' &&
                        item.data.title === '__raw__'
                    ) {
                        const info = JSON.parse(item.data.raw);
                        if (info.type === 'report-cover') {
                            const barGraphData: ReportJsonKindData['report-cover'] =
                                info;
                            setCover(barGraphData.data);
                            break;
                        }
                    }
                }
            }
        }
    }, []);

    const downloadPdf = () => {
        if (!divRef || !divRef.current) return;
        const div = divRef.current;
        html2pdf().from(div).set(opt).save(); // 导出
    };

    return (
        <WizardDrawer
            drawer={drawer}
            width={'75%'}
            title={title}
            footer={
                <Button
                    key="link"
                    onClick={() => {
                        drawer.close();
                    }}
                >
                    关闭
                </Button>
            }
        >
            <div className="w-full flex justify-end">
                <Button
                    type="link"
                    onClick={(e) => {
                        e.preventDefault();
                        downloadPdf();
                    }}
                >
                    下载PDF报告
                </Button>
                <Button
                    type="link"
                    onClick={(e) => {
                        e.preventDefault();
                        EmailModalRef.current?.open();
                    }}
                >
                    发送报告到邮箱
                </Button>
            </div>
            <ReportTemplate blocks={blocks} width={width} divRef={divRef} />
            <EmailMoadl
                ref={EmailModalRef}
                title="发送报告到邮箱"
                cover={cover}
                divRef={divRef}
            />
        </WizardDrawer>
    );
});

export { PreviewReportDrawer };
