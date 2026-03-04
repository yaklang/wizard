import React, { useEffect } from 'react';
import { useMemoizedFn, useUpdateEffect } from 'ahooks';
import { YakitEditor } from '@/compoments/yakitUI/YakitEditor/YakitEditor';
import useStore from '../../hooks/useStore';
import { apiFetchQuerySyntaxFlowResult } from '../../utils';

export interface RuleEditorBoxProps {
    ruleEditor: string;
    setRuleEditor: (value: string) => void;
    disabled?: boolean;
    onAuditRuleSubmit: () => void;
}
export const RuleEditorBox: React.FC<RuleEditorBoxProps> = (props) => {
    const { ruleEditor, setRuleEditor, disabled } = props;
    const { projectName, pageInfo } = useStore();

    // 获取文本域输入框
    const onGrpcSetTextArea = useMemoizedFn(
        (arr: { Key: string; Value: number }[]) => {
            let resultId: number | null = null;
            arr.forEach((item) => {
                if (item.Key === 'result_id') {
                    resultId = item.Value;
                }
            });
            if (resultId) {
                const Pagination = {
                    Page: 1,
                    Limit: 10,
                    Order: 'desc',
                    OrderBy: 'Id',
                };
                apiFetchQuerySyntaxFlowResult({
                    Pagination,
                    Filter: {
                        TaskIDs: [],
                        ResultIDs: [resultId],
                        RuleNames: [],
                        ProgramNames: [],
                        Keyword: '',
                        OnlyRisk: false,
                    },
                })
                    .then((rsp: any) => {
                        const resData = rsp?.Results || [];
                        if (resData.length > 0) {
                            setRuleEditor(resData[0].RuleContent);
                        }
                    })
                    .catch(() => {
                        setRuleEditor('');
                    });
            }
        },
    );

    useEffect(() => {
        if (pageInfo && pageInfo.Query) {
            onGrpcSetTextArea(pageInfo.Query);
        } else {
            setRuleEditor('');
        }
    }, [pageInfo?.Query]);

    useUpdateEffect(() => {
        setRuleEditor('');
    }, [projectName]);

    return (
        <YakitEditor
            type="syntaxflow"
            value={ruleEditor}
            setValue={(content: string) => {
                setRuleEditor(content);
            }}
            disabled={disabled}
        />
    );
};
