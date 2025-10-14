import { ReactNode } from "react"
import {
    SolidYakitPluginIcon,
    SolidPluginYakMitmIcon,
    SolidPluginProtScanIcon,
    SolidSparklesPluginIcon,
    SolidDocumentSearchPluginIcon,
    SolidCollectionPluginIcon,
    SolidCloudpluginIcon,
    SolidPrivatepluginIcon
} from "@/assets/icon/colors"

export const PortScanPluginTemplate: string = `/*
端口扫描插件在每一次端口扫描的时候将会执行

port-scan plugin is working on anytime a port scanned.
*/
handle = result => {
    // result is obj from servicescan
}

/*
// 判断端口是否开放？check if the port open
if result.IsOpen() {
    // do sth
}

// 如果端口大概是个 Web 服务的话，查看 Html Title？check html title for port(if website existed)
if result.GetHtmlTitle().Contains("login") {
    // do sth
}

// 如果端口是一个 web 服务，获取他的数据包信息? get the packet info for port(if website existed)
isHttps, request := result.GetRequestRaw()
response := result.GetResponseRaw()
result.Get


type *MatchResult struct {
  Fields(可用字段): 
      Target: string  
      Port: int  
      State: fp.PortState  
      Reason: string  
      Fingerprint: *fp.FingerprintInfo  
  Methods(可用方法): 
      func GetBanner() return(string) 
      func GetCPEs() return([]string) 
      func GetDomains() return([]string) 
      func GetHtmlTitle() return(string) 
      func GetProto() return(fp.TransportProto) 
      func GetServiceName() return(string) 
      func IsOpen() return(bool) 
      func GetRequestRaw() return(bool, []uint8) 
      func GetResponseRaw() return([]uint8)
      func GetFuzzRequest() return(*mutate.FuzzRequest)
}
*/

`

export const MITMPluginTemplate: string = `

# mirrorHTTPFlow 会镜像所有的流量到这里，包括 .js / .css / .jpg 这类一般会被劫持程序过滤的请求
mirrorHTTPFlow = func(isHttps /*bool*/, url /*string*/, req /*[]byte*/, rsp /*[]byte*/, body /*[]byte*/) {
    
}

# mirrorFilteredHTTPFlow 劫持到的流量为 MITM 自动过滤出的可能和 "业务" 有关的流量，会自动过滤掉 js / css 等流量
mirrorFilteredHTTPFlow = func(isHttps /*bool*/, url /*string*/, req /*[]byte*/, rsp /*[]byte*/, body /*[]byte*/) {
    
}

# mirrorNewWebsite 每新出现一个网站，这个网站的第一个请求，将会在这里被调用！
mirrorNewWebsite = func(isHttps /*bool*/, url /*string*/, req /*[]byte*/, rsp /*[]byte*/, body /*[]byte*/) {
    
}

# mirrorNewWebsitePath 每新出现一个网站路径，关于这个网站路径的第一个请求，将会在这里被传入回调
mirrorNewWebsitePath = func(isHttps /*bool*/, url /*string*/, req /*[]byte*/, rsp /*[]byte*/, body /*[]byte*/) {
    
}

# mirrorNewWebsitePathParams 每新出现一个网站路径且带有一些参数，参数通过常见位置和参数名去重，去重的第一个 HTTPFlow 在这里被调用
mirrorNewWebsitePathParams = func(isHttps /*bool*/, url /*string*/, req /*[]byte*/, rsp /*[]byte*/, body /*[]byte*/) {
    
}


`

export const NucleiPluginTemplate: string = `id: plugin-short-name
info:
  name: YourPluginName

requests:
  - raw:
    - |
      GET / HTTP/1.1
      Host: {{Hostname}}
      
      abc
    matchers:
    - type: word
      words:
        - "abc"
`

export const CodecPluginTemplate = `# codec plugin

/*
Codec Plugin 可以支持在 Codec 中自定义编码解码，自定义 Bypass 与字符串处理函数

函数定义非常简单

func(i: string) string
*/

handle = func(origin /*string*/) {
    # handle your origin str
    return origin
}
`

/** 插件类型对应的详细信息 */
interface PluginTypeInfoProps {
    /** 插件类型名 */
    name: string
    /** 插件类型描述 */
    description: string
    /** 插件类型icon */
    icon: ReactNode
    /** 插件类型展示颜色 */
    color: string
    /** 插件类型默认源码 */
    content: string
    /** 插件类型使用编程语言 */
    language: string
}

/** @name 插件类型对应的详细信息 */
export const pluginTypeToName: Record<string, PluginTypeInfoProps> = {
    yak: {
        name: "Yak 原生插件",
        description: "内置了众多网络安全常用库，可快速编写安全小工具，该原生模块只支持手动调用",
        icon: <SolidYakitPluginIcon />,
        color: "warning",
        content: "yakit.AutoInitYakit()\n\n# Input your code!\n\n",
        language: "yak"
    },
    mitm: {
        name: "Yak-MITM 模块",
        description: "专用于 MITM 模块中的模块，编写 MITM 插件，可以轻松对经过的流量进行修改",
        icon: <SolidPluginYakMitmIcon />,
        color: "blue",
        content: MITMPluginTemplate,
        language: "yak"
    },
    "port-scan": {
        name: "Yak-端口扫描",
        description: "该插件会对目标进行端口扫描，再对扫描的指纹结果做进一步的处理，常用场景先指纹识别，再 Poc 检测",
        icon: <SolidPluginProtScanIcon />,
        color: "success",
        content: PortScanPluginTemplate,
        language: "yak"
    },
    codec: {
        name: "Yak-Codec",
        description: "Yakit 中的编解码模块，可以自定义实现所需要的编解码、加解密",
        icon: <SolidSparklesPluginIcon />,
        color: "purple",
        content: CodecPluginTemplate,
        language: "yak"
    },
    lua: {
        name: "Lua 模块",
        description: "监修中，无法使用",
        icon: <SolidDocumentSearchPluginIcon />,
        color: "bluePurple",
        content: "",
        language: "lua"
    },
    nuclei: {
        name: "Nuclei YamI 模块",
        description: "使用 YakVM 构建了一个沙箱，可以兼容执行 Nuclei DSL ，无感使用 Nuclei 自带的 Yaml 模板",
        icon: <SolidCollectionPluginIcon />,
        color: "cyan",
        content: "# Add your nuclei formatted PoC!",
        language: "yaml"
    }
}

export function GetPluginLanguage(type: string): string {
    return pluginTypeToName[type]?.language || type
}
