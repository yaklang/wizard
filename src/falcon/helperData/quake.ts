export const QuakeMarkdown = `## 360 Quake 语法

[官方网站](https://quake.360.cn/quake/#/help?id=5eb238f110d2e850d5c6aec8&title=%E6%A3%80%E7%B4%A2%E5%85%B3%E9%94%AE%E8%AF%8D)

<h3 id="0x01-基本信息部分">0x01 基本信息部分</h3>
<table>
<thead>
<tr>
<th>检索语法</th>
<th>字段名称</th>
<th>支持的数据模式</th>
<th>解释说明</th>
<th>范例</th>
</tr>
</thead>
<tbody><tr>
<td>ip</td>
<td>IP地址及网段</td>
<td>主机数据<br>服务数据<br></td>
<td>支持检索单个IP、CIDR地址段、支持IPv6地址</td>
<td><code>ip:"1.1.1.1"</code> <br><code>ip: "1.1.1.1/16"</code> <br><code>ip:"2804:29b8:500d:4184:40a8:2e48:9a5d:e2bd"</code>  <br> <code>ip:"2804:29b8:500d:4184:40a8:2e48:9a5d:e2bd/24"</code></td>
</tr>
<tr>
<td>is_ipv6</td>
<td>搜索ipv4的资产</td>
<td>主机数据<br>服务数据<br></td>
<td>只接受 true 和 false</td>
<td><code>is_ipv6:"true"</code>：查询IPv6数据 <br><code>is_ipv6:"false"</code>：查询IPv4数据</td>
</tr>
<tr>
<td>is_latest</td>
<td>搜索最新的资产</td>
<td>服务数据</td>
<td>只接受 true 和 false</td>
<td><code>is_latest  :"true"</code>：查询最新的资产数据</td>
</tr>
<tr>
<td>port</td>
<td>端口</td>
<td>主机数据<br>服务数据<br></td>
<td>搜索开放的端口</td>
<td><code>port:"80"</code>：查询开放80端口的主机</td>
</tr>
<tr>
<td>ports</td>
<td>多端口</td>
<td>主机数据<br>服务数据</td>
<td>搜索某个主机同时开放过的端口</td>
<td><code>ports:"80,8080,8000"</code>：查询同时开放过80、8080、8000端口的主机</td>
</tr>
<tr>
<td>port:[min TO max]<br>port:&gt;或&lt;<br>port:&gt;=或&lt;=</td>
<td>端口范围</td>
<td>主机数据<br>服务数据</td>
<td>搜索满足某个端口范围的主机</td>
<td><code>port:&lt;80</code>：查询开放端口小于80的主机<br><code>port:[80 TO 1024]</code>：查询开放的端口介入80和1024之间的主机<br> <code>port:&gt;=80</code>：查询开放端口包含且大于80端口的主机</td>
</tr>
<tr>
<td>transport</td>
<td>传输层协议</td>
<td>主机数据<br>服务数据<br></td>
<td>只接受tcp、udp</td>
<td><code>transport:"tcp"</code>：查询tcp数据<br><code>transport:"udp"</code>：查询udp数据</td>
</tr>
</tbody></table>
<h3 id="0x02-asn网络自治域相关部分">0x02 ASN网络自治域相关部分</h3>
<table>
<thead>
<tr>
<th>检索语法</th>
<th>字段名称</th>
<th>支持的数据模式</th>
<th>解释说明</th>
<th>范例</th>
</tr>
</thead>
<tbody><tr>
<td>asn</td>
<td>自治域号码</td>
<td>主机数据<br>服务数据<br></td>
<td>自治域号码</td>
<td><code>asn:"12345"</code></td>
</tr>
<tr>
<td>org</td>
<td>自治域归属组织名称</td>
<td>主机数据<br>服务数据<br></td>
<td>自治域归属组织名称</td>
<td><code>org:"No.31,Jin-rong Street"</code></td>
</tr>
</tbody></table>
<h3 id="0x03-主机名与操作系统部分">0x03 主机名与操作系统部分</h3>
<table>
<thead>
<tr>
<th>检索语法</th>
<th>字段名称</th>
<th>支持的数据模式</th>
<th>解释说明</th>
<th>范例</th>
</tr>
</thead>
<tbody><tr>
<td>hostname</td>
<td>主机名</td>
<td>服务数据</td>
<td>即rDNS数据</td>
<td><code>hostname:"50-87-74-222.unifiedlayer.com"</code></td>
</tr>
<tr>
<td>domain</td>
<td>网站域名</td>
<td>服务数据</td>
<td>网站域名信息</td>
<td><code>domain:"360.cn"</code><br><code>domain:*.360.cn</code></td>
</tr>
<tr>
<td>os</td>
<td>操作系统部分</td>
<td>服务数据</td>
<td>操作系统名称+版本</td>
<td><code>os:"Windows"</code></td>
</tr>
</tbody></table>
<h3 id="0x04--服务数据部分">0x04  服务数据部分</h3>
<table>
<thead>
<tr>
<th>检索语法</th>
<th>字段名称</th>
<th>支持的数据模式</th>
<th>解释说明</th>
<th>范例</th>
</tr>
</thead>
<tbody><tr>
<td>service</td>
<td>服务名称</td>
<td>主机数据<br>服务数据</td>
<td>即应用协议名称</td>
<td><code>service:"http"</code></td>
</tr>
<tr>
<td>services</td>
<td>多个服务名称</td>
<td>主机数据</td>
<td>搜索某个主机同时支持的协议 <br>仅在 <code>主机数据</code>模式下可用</td>
<td><code>services:"rtsp,https,telnet"</code>：支持rtsp、https、telnet的主机</td>
</tr>
<tr>
<td>product</td>
<td>服务产品</td>
<td>主机数据<br>服务数据</td>
<td>经过Quake指纹识别后的产品名称（未来会被精细化识别产品替代）</td>
<td><code>product:"Apache"</code>Apache服务器产品</td>
</tr>
<tr>
<td>products</td>
<td>多个服务产品</td>
<td>主机数据</td>
<td>经过Quake指纹识别后的产品名称 <br>仅在 <code>主机数据</code>模式下可用</td>
<td><code>products:"BusyBox,Apache"</code> 同时使用BusyBox,Apache的产品</td>
</tr>
<tr>
<td>version</td>
<td>产品版本</td>
<td>主机数据<br>服务数据</td>
<td>经过Quake指纹识别后的产品版本</td>
<td><code>version:"1.2.1"</code></td>
</tr>
<tr>
<td>response</td>
<td>服务原始响应</td>
<td>服务数据</td>
<td>这里是包含端口信息最丰富的地方</td>
<td><code>response:"奇虎科技"</code>：端口原生返回数据中包含"奇虎科技"的主机<br> <code>response:"220 ProFTPD 1.3.5a Server"</code>：端口原生返回数据中包含"220 ProFTPD 1.3.5a Server"字符串的主机</td>
</tr>
<tr>
<td>cert</td>
<td>SSL\\TLS证书信息</td>
<td>主机数据<br>服务数据</td>
<td>这里存放了格式解析后的证书信息字符串</td>
<td><code>cert:"奇虎科技"</code>：包含"奇虎科技"的证书<br><code>cert:"360.cn"</code>：包含"360.cn"域名的证书</td>
</tr>
</tbody></table>
<h3 id="0x05--精细化应用识别部分">0x05  精细化应用识别部分</h3>
<table>
<thead>
<tr>
<th>检索语法</th>
<th>字段名称</th>
<th>支持的数据模式</th>
<th>解释说明</th>
<th>范例</th>
</tr>
</thead>
<tbody><tr>
<td>app</td>
<td>应用名称</td>
<td>服务数据</td>
<td>该字段是Quake精细化识别后的应用名称</td>
<td><code>app:"微软SharePoint"</code> <br> <code>app:"Tomcat-Web服务器"</code></td>
</tr>
<tr>
<td>catalog</td>
<td>应用类别</td>
<td>服务数据</td>
<td>该字段是应用类型的集合，是一个更高层面应用的聚合</td>
<td><code>catalog:"IoT物联网"</code> <br> <code>catalog:"IoT物联网" OR catalog:"网络安全设备"</code></td>
</tr>
<tr>
<td>type</td>
<td>应用类型</td>
<td>服务数据</td>
<td>该字段是对应用进行的分类结果，指一类用途相同的资产</td>
<td><code>type:"防火墙"</code><br>  <code>type:"VPN"</code></td>
</tr>
<tr>
<td>level</td>
<td>应用层级</td>
<td>服务数据</td>
<td>对于所有应用进行分级，一共5个级别：硬件设备层、操作系统层、服务协议层、中间支持层、应用业务层</td>
<td><code>level:"硬件设备层"</code> <br>  <code>level:"应用业务层"</code></td>
</tr>
<tr>
<td>vendor</td>
<td>应用生产厂商</td>
<td>服务数据</td>
<td>该字段指某个应用设备的生产厂商</td>
<td><code>vendor:"Sangfor深信服科技股份有限公司"</code> <br> <code>vendor:"Sangfor" OR vendor:"微软"</code> <br> <code>vendor:"DrayTek台湾居易科技"</code></td>
</tr>
</tbody></table>
<h3 id="0x06-ip归属与定位部分">0x06 IP归属与定位部分</h3>
<table>
<thead>
<tr>
<th>检索语法</th>
<th>字段名称</th>
<th>支持的数据模式</th>
<th>解释说明</th>
<th>范例</th>
</tr>
</thead>
<tbody><tr>
<td>country</td>
<td>国家（英文）与国家代码</td>
<td>主机数据、服务数据</td>
<td>搜索 country:C hina country:CN 都可以</td>
<td><code>country:"China"</code> <code>country:"CN"</code></td>
</tr>
<tr>
<td>country_cn</td>
<td>国家（中文）</td>
<td>主机数据、服务数据</td>
<td>用于搜索中文国家名称</td>
<td><code>country_cn:"中国"</code></td>
</tr>
<tr>
<td>province</td>
<td>省份（英文）</td>
<td>主机数据、服务数据</td>
<td>用于搜索英文省份名称</td>
<td><code>province:"Sichuan"</code></td>
</tr>
<tr>
<td>province_cn</td>
<td>省份（中文）</td>
<td>主机数据、服务数据</td>
<td>用于搜索中文省份名称</td>
<td><code>province_cn:"四川"</code></td>
</tr>
<tr>
<td>city</td>
<td>城市（英文）</td>
<td>主机数据、服务数据</td>
<td>用于搜索英文城市名称</td>
<td><code>city:"Chengdu"</code></td>
</tr>
<tr>
<td>city_cn</td>
<td>城市（中文）</td>
<td>主机数据、服务数据</td>
<td>用于搜索中文城市名称</td>
<td><code>city_cn:"成都"</code></td>
</tr>
<tr>
<td>owner</td>
<td>IP归属单位</td>
<td>主机数据、服务数据</td>
<td>这里的归属并不精确，后期Quake会推出单位归属专用关键词</td>
<td><code>owner: "tencent.com"</code>   <code>owner: "清华大学"</code></td>
</tr>
<tr>
<td>isp</td>
<td>运营商</td>
<td>主机数据、服务数据</td>
<td>根据IP划分归属的运营商</td>
<td><code>isp: "联通"</code><br>  <code>isp: "amazon.com"</code></td>
</tr>
</tbody></table>
<h3 id="0x07-图像数据部分">0x07 图像数据部分</h3>
<table>
<thead>
<tr>
<th>检索语法</th>
<th>字段名称</th>
<th>解释说明</th>
<th>范例</th>
</tr>
</thead>
<tbody><tr>
<td>img_tag</td>
<td>图片标签</td>
<td>用于搜索图片的标签</td>
<td><code>img_tag: "windows"</code></td>
</tr>
<tr>
<td>img_ocr</td>
<td>图片OCR</td>
<td>用于搜索图片中的信息</td>
<td><code>img_ocr:"admin"</code></td>
</tr>
</tbody></table>
`