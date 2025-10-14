import type { SelectProps } from 'antd';
import type { OptionProps } from 'rc-select/lib/Option';
import type { YakitSizeType } from '../YakitInputNumber/YakitInputNumberType';
import type { CacheDataHistoryProps, YakitOptionTypeProps } from '../utils';
import type { BaseOptionType, DefaultOptionType } from 'antd/lib/select';

/**
 * @description: YakitSelectProps
 * @augments YakitSelectProps 继承antd的 SelectProps 默认属性
 * @param {string} wrapperClassName 装饰div的className
 * @param {CSSProperties} wrapperStyle 装饰div的style
 * @param {string} cacheHistoryDataKey 缓存数据 key值
 * @param {number} cacheHistoryListLength 缓存数据 list长度
 * @param {OptionType} defaultOptions
 * @param {boolean} isCacheDefaultValue false会缓存默认值，但是不会将默认值显示到页面上
 */

export interface YakitSelectProps<
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ValueType = any,
    OptionType extends
        | BaseOptionType
        | DefaultOptionType
        | YakitOptionTypeProps = DefaultOptionType,
> extends SelectProps {
    wrapperClassName?: string;
    wrapperStyle?: CSSProperties;
    size?: YakitSizeType;
    cacheHistoryDataKey?: string;
    cacheHistoryListLength?: number;
    defaultOptions?: OptionType;
    /** false会缓存默认值，但是不会将默认值显示到页面上 */
    isCacheDefaultValue?: boolean;
}
export type YakitSelectOptionProps = OptionProps;

export interface YakitSelectCacheDataHistoryProps
    extends Omit<CacheDataHistoryProps, 'options', 'defaultValue'> {
    options?: OptionType;
    defaultValue: string[];
}

export interface YakitBaseSelectRef {
    onSetRemoteValues: (s: string[]) => void;
    onGetRemoteValues: () => void;
}
