import type { YakitSelectProps } from '@/compoments/yakitUI/YakitSelect/YakitSelectType'

export type AIReviewRuleSelectProps = ReviewRuleSelectProps

export interface ReviewRuleSelectProps {
  className?: string
}

export interface AIChatSelectProps extends Omit<YakitSelectProps, 'dropdownRender'> {
  dropdownRender: (menu: React.ReactElement, setOpen: (open: boolean) => void) => React.ReactElement
  getList?: () => void
  children?: React.ReactNode
  setOpen?: (open: boolean) => void
}
