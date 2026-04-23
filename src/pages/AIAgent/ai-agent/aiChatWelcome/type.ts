import type { ReactNode } from 'react'
import type { HandleStartParams } from '../aiAgentChat/type'
import type { AIReActChatRefProps } from '@/pages/AIAgent/ai-re-act/aiReActChat/AIReActChatType'
import type { YakitButtonProp } from '@/compoments/yakitUI/YakitButton/YakitButton'

export interface AIChatWelcomeProps {
  onTriageSubmit: (data: HandleStartParams) => void
  onSetReAct: () => void
  api?: ReturnType<any>[1]
  streams?: ReturnType<any>[0]
  ref?: React.ForwardedRef<AIReActChatRefProps>
}
interface AIRecommendItem {
  type: string
  name: string
  description: string
}
export interface AIRecommendProps extends Omit<AIRecommendItemProps, 'item'> {
  icon: ReactNode
  hoverIcon: ReactNode
  title: ReactNode
  data: AIRecommendItem[]
  onMore: () => void
}

export interface AIRecommendItemProps {
  item: AIRecommendItem
  lineStartDOMRect?: DOMRect
  checkItems: AIRecommendItem[]
  onCheckItem: (item: AIRecommendItem) => void
}

export interface AIMaterialsData {
  type: string
  data: AIRecommendItem[]
  icon: ReactNode
  hoverIcon: ReactNode
}
export interface RandomAIMaterialsDataProps {
  tools: AIMaterialsData
  forges: AIMaterialsData
  // knowledgeBases: AIMaterialsData;
}

export interface SideSettingButtonProps extends YakitButtonProp {
  [key: string]: any
}

export type DragSource = 'desktopToAItree' | 'AIRreeToChat' | null
