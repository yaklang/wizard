import { Tag } from 'antd';
import React from 'react';
import type { YakitTagProps } from './YakitTagType';
import styles from './YakitTag.module.scss';
import classNames from 'classnames';

/**
 * 更新说明
 * 1、关闭按钮增加hover主题色
 * 2.height 修为不加border
 */

/**
 * @description: tag
 * @augments TagProps 继承antd的TagProps默认属性
 * @param {middle|large|small} size 默认middle 16 20 24
 * @param {"danger" | "info" | "success" | "warning"|"serious" |"yellow"| "purple" | "blue" | "cyan" | "bluePurple"} color 颜色
 * @param {boolean} disable
 * @param {boolean} enableCopy 是否可复制
 * @param {e} onAfterCopy 复制后的回调
 */
export const YakitTag: React.FC<YakitTagProps> = (props) => {
    const {
        color,
        size,
        disable,
        className,
        enableCopy,
        copyText,
        ...restProps
    } = props;
    return (
        <Tag
            {...restProps}
            closable={props.closable || enableCopy}
            className={classNames(
                styles['yakit-tag-middle'],
                {
                    [styles['yakit-tag-small']]: size === 'small',
                    [styles['yakit-tag-large']]: size === 'large',
                    [styles['yakit-tag-danger']]: color === 'danger',
                    [styles['yakit-tag-info']]: color === 'info',
                    [styles['yakit-tag-success']]:
                        color === 'success' || color === 'green',
                    [styles['yakit-tag-warning']]: color === 'warning',
                    [styles['yakit-tag-serious']]:
                        color === 'serious' || color === 'red',
                    [styles['yakit-tag-yellow']]: color === 'yellow',
                    [styles['yakit-tag-purple']]: color === 'purple',
                    [styles['yakit-tag-blue']]: color === 'blue',
                    [styles['yakit-tag-cyan']]: color === 'cyan',
                    [styles['yakit-tag-bluePurple']]: color === 'bluePurple',
                    [styles['yakit-tag-white']]: color === 'white',
                    [styles['yakit-tag-disable']]: !!disable,
                },
                className,
            )}
        >
            {(enableCopy && copyText) || props.children}
        </Tag>
    );
};
