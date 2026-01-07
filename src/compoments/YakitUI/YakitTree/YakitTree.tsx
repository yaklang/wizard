import React from 'react';
import { Tree } from 'antd';
import type { DataNode as TreeNode, TreeProps } from 'antd/es/tree';
import { OutlineMinusIcon, OutlinePlusIcon } from '@/assets/icon/outline';
import { YakitEmpty } from '../YakitEmpty/YakitEmpty';
import styles from './YakitTree.module.scss';

export type TreeKey = string | number;
interface YakitTreeProps extends TreeProps {
    showIcon?: boolean; // 是否展示treeNode节点前的icon 默认 -> 展示
    treeData: TreeNode[]; // 需要满足 DataNode类型的数组
}

const YakitTree: React.FC<YakitTreeProps> = React.memo((props) => {
    const { showLine = true, showIcon = true } = props;

    const switcherIconRender = (p: any) => {
        return p.expanded ? (
            <OutlineMinusIcon className={styles['switcher-icon']} />
        ) : (
            <OutlinePlusIcon className={styles['switcher-icon']} />
        );
    };
    return (
        <div className={styles.yakitTree}>
            {props.treeData.length ? (
                <Tree
                    {...props}
                    showLine={showLine ? { showLeafIcon: false } : false}
                    showIcon={showIcon}
                    switcherIcon={switcherIconRender}
                />
            ) : (
                <YakitEmpty />
            )}
        </div>
    );
});

export default YakitTree;
