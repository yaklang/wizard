import type { YakitRoute } from '../../enums/yakitRoute'

/**
 * @name Route信息(用于打开页面)
 * @property route-页面的路由
 * @property pluginId-插件id(本地)
 * @property pluginName-插件名称
 */
export interface RouteToPageProps {
  route: YakitRoute
  pluginId?: number
  pluginName?: string
}
