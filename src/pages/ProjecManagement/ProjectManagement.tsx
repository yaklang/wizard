import React from 'react';
import { Card } from 'antd';

const ProjectManagement: React.FC = () => {
    return (
        <div className="p-4">
            <Card>
                <div className="text-[18px] font-bold mb-4">
                    静态分析 · 项目管理
                </div>
                <div>
                    这是 ProjectManagement
                    页面占位，后续可在此实现项目相关功能。
                </div>
            </Card>
        </div>
    );
};

export { ProjectManagement };
