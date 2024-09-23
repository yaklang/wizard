export const FofaMarkdown = `## Fofa 搜索案例

[https://fofa.so/](https://fofa.so/)

直接输入查询语句，将从标题，html 内容，http 头信息，url 字段中搜索; 如果查询表达式有多个与或关系，尽量在外面用()包含起来; 

新增==完全匹配的符号，可以加快搜索速度，比如查找 qq.com 所有 host，可以是 domain=="qq.com"

### 高级查询 / 高级搜索

可以使用括号 和 && || !=等符号，如

    title="powered by" && title!="discuz"
    body="content=WordPress" || (header="X-Pingback" && header="/xmlrpc.php" && bo dy="/wp-includes/") && host="gov.cn"

### title="beijing"

从标题中搜索“北京” -

### header="elastic"
从 http 头中搜索“elastic” -

### body="网络空间测绘"
从 html 正文中搜索“网络空间测绘” -

### fid="kIlUsGZ8pT6AtgKSKD63iw=="

查找相同的网站指纹

搜索网站类型资产

### domain="qq.com"
搜索根域名带有 qq.com 的网站。 -

### icp="京 ICP 证 030173 号" 

查找备案号为“京 ICP 证 030173 号”的网站

### js_name="js/jquery.js"

查找网站正文中包含 js/jquery.js 的资产 搜索网站类型资产

### js_md5="82ac3f14327a8b7ba49baa208d4eaa15"

查找 js 源码与之匹配的资产 -

### icon_hash="-247388890"
搜索使用此 icon 的资产。 仅限 FOFA 高级会员使用

### host=".gov.cn"
 从 url 中搜索”.gov.cn” 搜索要用 host 作为名称

### port="6379"

查找对应“6379”端口的资产 -

### ip="1.1.1.1"

从 ip 中搜索包含“1.1.1.1”的网站 搜索要用 ip 作为名称

### ip="220.181.111.1/24"


查询 IP 为“220.181.111.1”的 C 网段资产 -
### status_code="402"
查询服务器状态为“402”的资产 -

### protocol="quic"
查询 quic 协议资产 搜索指定协议类型(在开启端口扫描的情况下有效)

### country="CN"
搜索指定国家(编码)的资产。 -

### region="Xinjiang"
搜索指定行政区的资产。
 
### city="乌鲁木齐"
搜索指定城市的资产。

### cert="baidu"
搜索证书(https 或者 imaps 等)中带有 baidu 的资产。 -

### cert.subject="Oracle Corporation"
搜索证书持有者是 Oracle Corporation 的资产 -

### cert.issuer="DigiCert"
搜索证书颁发者为 DigiCert Inc 的资产 -

### cert.is_valid=true
验证证书是否有效，true 有效，false 无效 仅限 FOFA 高级会员使用

### banner=users && protocol=ftp
搜索 FTP 协议中带有 users 文本的资产。 -

### type=service
搜索所有协议资产，支持 subdomain 和 service 两种 搜索所有协议资产

### os="centos"
搜索 CentOS 资产。 -

### server=="Microsoft IIS/10"
搜索 IIS 10 服务器。 -

### app="Microsoft-Exchange"
搜索 Microsoft-Exchange 设备 -

### after="2017" && before="2017-10-01"
时间范围段搜索

### asn="19551"
搜索指定 asn 的资产。 -

### org="Amazon.com, Inc."
搜索指定 org(组织)的资产。 -

### base_protocol="udp"
搜索指定 udp 协议的资产。 -

### is_fraud=falsenew 

排除仿冒/欺诈数据 -

### is_honeypot=false
排除蜜罐数据（仅限 FOFA 高级会员使用）

### is_ipv6=true
搜索 ipv6 的资产
搜索 ipv6 的资产,只接受 true 和 false。

### is_domain=true
搜索域名的资产 搜索域名的资产,只接受 true 和 false。
 
### port_size="6"
查询开放端口数量等于"6"的资产 仅限 FOFA 会员使用

### port_size_gt="6"
查询开放端口数量大于"6"的资产 仅限 FOFA 会员使用
### port_size_lt="12"
查询开放端口数量小于"12"的资产 仅限 FOFA 会员使用
### ip_ports="80,161"
搜索同时开放 80 和 161 端口的 ip
### ip_country="CN"
搜索中国的 ip 资产(以 ip 为单位的资产数据)。 搜索中国的 ip 资产
### ip_region="Zhejiang"
搜索指定行政区的 ip 资产(以 ip 为单位的资产数据)。 搜索指定行政区的资产
### ip_city="Hangzhou"
搜索指定城市的 ip 资产(以 ip 为单位的资产数据)。 搜索指定城市的资产
### ip_after="2021-03-18"
搜索 2021-03-18 以后的 ip 资产(以 ip 为单位的资产数据)。 搜索 2021-03-18 以后的 ip 资产
### ip_before="2019-09-09"
搜索 2019-09-09 以前的 ip 资产(以 ip 为单位的资产数据)。 搜索 2019-09-09 以前的 ip 资产
`