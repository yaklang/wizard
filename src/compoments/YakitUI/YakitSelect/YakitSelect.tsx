import { Select } from 'antd';
import React, { useState } from 'react';
import type {
    YakitBaseSelectRef,
    YakitSelectCacheDataHistoryProps,
    YakitSelectProps,
} from './YakitSelectType';
import styles from './YakitSelect.module.scss';
import classNames from 'classnames';
import type { BaseOptionType, DefaultOptionType } from 'antd/lib/select';
import { YakitTag } from '../YakitTag/YakitTag';
import { ChevronDownIcon, ChevronUpIcon } from '@/assets/newIcon';
import { useMemoizedFn } from 'ahooks';

export interface YakitOptionTypeProps {
    value: string;
    label: string;
}

export interface CacheDataHistoryProps {
    options: YakitOptionTypeProps[];
    defaultValue: string;
}

const { Option } = Select;

/**
 * @description: 下拉选择
 * @augments SwitchProps 继承antd的 SelectProps 默认属性
 * @param {string} wrapperClassName Switch装饰div的className
 * @param {CSSProperties} wrapperStyle Switch装饰div的style
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const YakitSelectCustom = <ValueType, OptionType>(
    {
        size = 'middle',
        wrapperClassName = '',
        wrapperStyle,
        defaultOptions,
        ...props
    }: YakitSelectProps<OptionType>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ref: React.Ref<YakitBaseSelectRef>,
) => {
    const [show, setShow] = useState<boolean>(false);
    const cacheHistoryDataRef = React.useRef<YakitSelectCacheDataHistoryProps>({
        options: [],
        defaultValue: [],
    });

    const getNewOption = useMemoizedFn((options) => {
        let newOption: DefaultOptionType[] = [];
        if (options.length > 0) {
            newOption = options as DefaultOptionType[];
        } else if (defaultOptions?.length > 0) {
            newOption = (defaultOptions || []) as DefaultOptionType[];
        } else if ((props?.options?.length || 0) > 0) {
            newOption = props.options as DefaultOptionType[];
        }
        return newOption || [];
    });
    let extraProps = {};
    if (!props.children) {
        extraProps = {
            ...extraProps,
            options: getNewOption(cacheHistoryDataRef.current.options),
            defaultValue: cacheHistoryDataRef.current.defaultValue,
        };
    }

    const tagRender = useMemoizedFn((props) => {
        return (
            <YakitTag size={size} {...props}>
                <span className="content-ellipsis" style={{ width: '100%' }}>
                    {props.label}
                </span>
            </YakitTag>
        );
    });
    return (
        <div
            className={classNames(
                'ant-select',
                'ant-select-in-form-item',
                styles['yakit-select'],
                {
                    [styles['yakit-select-wrapper-tags']]:
                        props.mode === 'tags' || props.mode === 'multiple',
                    [styles['yakit-select-large']]: size === 'large',
                    [styles['yakit-select-middle']]: size === 'middle',
                    [styles['yakit-select-small']]: size === 'small',
                },
                wrapperClassName,
            )}
            style={wrapperStyle}
        >
            <Select
                suffixIcon={
                    show ? (
                        <ChevronUpIcon
                            className={styles['yakit-select-icon']}
                        />
                    ) : (
                        <ChevronDownIcon
                            className={styles['yakit-select-icon']}
                        />
                    )
                }
                tagRender={tagRender}
                {...props}
                {...extraProps}
                size="middle"
                dropdownClassName={classNames(
                    styles['yakit-select-popup'],
                    {
                        [styles['yakit-select-wrapper-tags']]:
                            props.mode === 'tags' || props.mode === 'multiple',
                        [styles['yakit-select-popup-y']]: show,
                    },
                    props.dropdownClassName,
                )}
                onDropdownVisibleChange={(open) => {
                    setShow(open);
                    if (props.onDropdownVisibleChange)
                        props.onDropdownVisibleChange(open);
                }}
            >
                {props.children}
            </Select>
        </div>
    );
};

export const YakitSelect = React.forwardRef(YakitSelectCustom) as unknown as (<
    ValueType = any,
    OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(
    props: React.PropsWithChildren<YakitSelectProps<ValueType, OptionType>> & {
        ref?: React.Ref<YakitBaseSelectRef>;
    },
) => React.ReactElement) & {
    SECRET_COMBOBOX_MODE_DO_NOT_USE: string;
    Option: typeof Option;
    OptGroup: any;
};

YakitSelect.Option = Option;
