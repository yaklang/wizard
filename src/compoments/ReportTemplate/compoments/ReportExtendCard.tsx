import React, { useEffect, useState } from 'react';
import {} from 'antd';
import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import styles from './ReportExtendCard.module.scss';
import { Markdown } from './utils/Markdown';

interface FoldHoleCardItemProps {
    [key: string]: any;
}

export interface FoldHoleCardProps {
    data: FoldHoleCardItemProps;
}
export const FoldHoleCard: React.FC<FoldHoleCardProps> = (props) => {
    const { data } = props;
    const [dataSource, setDataSource] = useState<any[]>([]);
    const [extendItem, setExtendItem] = useState<boolean>(false);
    useEffect(() => {
        let newArr = (Object.entries(data) || []).filter(
            (item) => typeof item[1] !== 'string',
        );
        newArr.sort((a, b) => {
            return a[1].sort - b[1].sort;
        });
        setDataSource(newArr);
    }, []);

    return (
        <div className={styles['fold-hole']}>
            {dataSource.map((item: any, index: number) => {
                const content = item?.[1]?.value;
                if (item[1]?.fold) {
                    return (
                        <div
                            key={index}
                            className={styles['fold-hole-title']}
                            onClick={() => setExtendItem(!extendItem)}
                        >
                            {extendItem ? (
                                <MinusSquareOutlined />
                            ) : (
                                <PlusSquareOutlined />
                            )}
                            <Markdown>{`#### ${content}`}</Markdown>
                        </div>
                    );
                }
                return null;
            })}
            {extendItem && (
                <div className={styles['card-content']}>
                    {dataSource.map((item: any, index: number) => {
                        const title = item?.[0];
                        const content = item?.[1]?.value;
                        if (item[1]?.type === 'code') {
                            return (
                                <div
                                    key={index}
                                    className={styles['fold-hole-code']}
                                >
                                    <div className={styles['title']}>
                                        {title}：{!content ? '-' : ''}
                                    </div>
                                    <div className={styles['content']}>
                                        {content ? (
                                            <Markdown>
                                                {'```\n' + content + '\n```'}
                                            </Markdown>
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div
                                    key={index}
                                    className={styles['fold-hole-item']}
                                >
                                    <div className={styles['title']}>
                                        {title}：
                                    </div>
                                    <div className={styles['content']}>
                                        {content
                                            ? (() => {
                                                  let displayContent = content;
                                                  // 如果是审计路径，尝试格式化 JSON 或添加美化符号
                                                  if (
                                                      title.includes('审计路径')
                                                  ) {
                                                      try {
                                                          const path =
                                                              JSON.parse(
                                                                  content,
                                                              );
                                                          if (
                                                              Array.isArray(
                                                                  path,
                                                              )
                                                          ) {
                                                              displayContent =
                                                                  path
                                                                      .map(
                                                                          (
                                                                              step,
                                                                          ) =>
                                                                              Array.isArray(
                                                                                  step,
                                                                              )
                                                                                  ? step[1] ||
                                                                                    step[0]
                                                                                  : step,
                                                                      )
                                                                      .join(
                                                                          ' ➔ ',
                                                                      );
                                                          }
                                                      } catch (e) {
                                                          // 如果不是 JSON，尝试直接把逗号替换为箭头
                                                          if (
                                                              typeof content ===
                                                                  'string' &&
                                                              content.includes(
                                                                  ',',
                                                              )
                                                          ) {
                                                              displayContent =
                                                                  content
                                                                      .split(
                                                                          ',',
                                                                      )
                                                                      .map(
                                                                          (s) =>
                                                                              s.trim(),
                                                                      )
                                                                      .join(
                                                                          ' ➔ ',
                                                                      );
                                                          }
                                                      }
                                                  }
                                                  return (
                                                      <Markdown
                                                          filterFirstHeader={
                                                              title.includes(
                                                                  '描述',
                                                              ) ||
                                                              title.includes(
                                                                  '建议',
                                                              )
                                                          }
                                                      >
                                                          {displayContent}
                                                      </Markdown>
                                                  );
                                              })()
                                            : '-'}
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            )}
        </div>
    );
};

interface FoldRuleCardItemProps {
    data: any[];
    title: string;
}

interface FoldRuleCardProps {
    content: FoldRuleCardItemProps;
}

export const FoldRuleCard: React.FC<FoldRuleCardProps> = (props) => {
    const { content } = props;
    const { data, title } = content;
    const [extendItem, setExtendItem] = useState<boolean>(false);
    return (
        <div className={styles['rule-risk']}>
            <div
                className={styles['rule-risk-title']}
                onClick={() => setExtendItem(!extendItem)}
            >
                {extendItem ? (
                    <MinusSquareOutlined size={12} />
                ) : (
                    <PlusSquareOutlined size={12} />
                )}
                <Markdown>{`#### ${title} (共${data?.length}个)`}</Markdown>
            </div>
            {extendItem && (
                <div className={styles['rule-risk-content']}>
                    {data?.map((item, index) => {
                        return <FoldHoleCard key={index} data={item} />;
                    })}
                </div>
            )}
        </div>
    );
};
