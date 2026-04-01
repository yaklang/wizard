import type { YakitAutoCompleteProps } from './../YakitAutoComplete/YakitAutoCompleteType.d'
import type { FormItemProps, InputProps } from 'antd'
import type { DraggerProps } from 'antd/lib/upload'
import type { YakitSizeType } from '../YakitInputNumber/YakitInputNumberType'
import type { InternalTextAreaProps } from '../YakitInput/YakitInputType'
import type { ReactNode } from 'react'

type YakitDragger = Omit<DraggerProps, 'beforeUpload' | 'onChange'>

export interface FileDraggerProps {
  disabled?: boolean
  multiple?: boolean
  className?: string
  children?: ReactNode
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void
}
export interface YakitFormDraggerProps extends YakitDraggerProps {
  formItemClassName?: string
  formItemProps?: FormItemProps
}

export interface YakitDraggerProps extends FileDraggerProps {
  size?: YakitSizeType
  inputProps?: InputProps
  setContent?: (s: string) => void
  help?: ReactDOM
  showDefHelp?: boolean
  value?: string
  onChange?: (s: string) => void
  selectType?: 'file' | 'folder' | 'all'

  /** 展示组件 input|textarea */
  renderType?: 'input' | 'textarea' | 'autoComplete'
  /** autoComplete的props */
  autoCompleteProps?: YakitAutoCompleteProps
  /** textarea的props */
  textareaProps?: InternalTextAreaProps
  /** 是否显示路径数量 */
  isShowPathNumber?: boolean

  /** 接受的文件类型 */
  accept?: string
}

export interface YakitDraggerContentProps
  extends Omit<YakitDragger, 'showUploadList' | 'directory' | 'multiple' | 'beforeUpload' | 'onChange'> {
  /** textarea的props */
  textareaProps?: InternalTextAreaProps
  size?: YakitSizeType
  /** 回显的文本值 */
  value?: string
  /** @description 回显的文本回调事件 */
  onChange?: (s: string) => void
  help?: ReactDOM
  showDefHelp?: boolean
  // InputProps?: InputProps
  // /** 展示组件 input|textarea */
  // renderType?: "input" | "textarea"
  /** @default 500k */
  fileLimit?: number
  /** value的分隔符 @default ',' */
  valueSeparator?: string
}

export interface YakitFormDraggerContentProps extends YakitDraggerContentProps {
  formItemClassName?: string
  formItemProps?: FormItemProps
}
