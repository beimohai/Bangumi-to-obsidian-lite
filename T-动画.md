---
<%*
let state=tp.system.suggester(["想看","在看","已看"],["想看⏰","在看📖","已看📘"])
let subGroup=tp.system.suggester(["Online","Amor字幕组","爱恋字幕社","北宇治字幕组","澄空学园","动漫国字幕组","风车字幕组","风之圣殿","幻月字幕组","幻樱字幕组","极影字幕社","漫游字幕组","喵萌奶茶屋","千夏字幕组","轻之国度","豌豆字幕组","雪飄工作室","星空字幕组","银色子弹字幕组","桜都字幕组","悠哈C9字幕社","诸神字幕组"],["Online","Amor字幕组","爱恋字幕社","北宇治字幕组","澄空学园","动漫国字幕组","风车字幕组","风之圣殿","幻月字幕组","幻樱字幕组","极影字幕社","漫游字幕组","喵萌奶茶屋","千夏字幕组","轻之国度","豌豆字幕组","雪飄工作室","星空字幕组","银色子弹字幕组","桜都字幕组","悠哈C9字幕社","诸神字幕组"])
let subLanguage=tp.system.suggester(["Online","简中","简日双语","繁中","繁日双语","简繁日"],["Online","简中","简日双语","繁中","繁日双语","简繁日"]);
let catego=tp.system.suggester(["原创动画","漫画改编","小说改编","游戏改编","其它"],["原创动画","漫画改编","小说改编","游戏改编","其它"])
let mediaInfo=tp.system.suggester(["在线","720P","BD 1080P","BDMV 1080P","BDMV 4K"],["online","720P","BD 1080P","BDMV 1080P","BDMV 4K"])
-%>
笔记ID: "{{DATE:YYYYMMDDHHmmss}}"
别名: "{{VALUE:alias}}"
标签: {{VALUE:tags}}
观看状态: <% state %>
作品大类: Anime
中文名: "{{VALUE:CN}}"
日文名: "{{VALUE:JP}}"
封面: "![]({{VALUE:Poster}})"
开播日期: "{{VALUE:date}}"
开播年份: " {{VALUE:year}}"
开播月份: " {{VALUE:month}}"
Bangumi评分: " {{VALUE:rating}}"
集数: "{{VALUE:episode}}"
具体类型: "{{VALUE:type}}"
动画公司: "{{VALUE:AnimeMake}}"
本地类型: <% mediaInfo %>
字幕语言: <% subLanguage %>
字幕组: "<% subGroup %>"
改编类别: <% catego %>
---




> [!bookinfo|noicon]+ **{{VALUE:CN}}** 
> ![bookcover|400]({{VALUE:Poster}})
>
| 日文名 | {{VALUE:JP}} |
|:------: |:------------------------------------------: |
| 分类 | <% catego %> |
| 新番 | {{VALUE:year}} 年 {{VALUE:month}} 月 | 
| 集数 | {{VALUE:type}} 共{{VALUE:episode}}话 |
| 官网 | [{{VALUE:website}}]({{VALUE:website}})    |
| 制作 | {{VALUE:AnimeMake}} |
| 导演 | {{VALUE:director}} |
| 脚本 | {{VALUE:staff}} |
| 字幕 |<% subGroup %>-<%subLanguage%>    |
| 状态 |<% state %>|
| 评分 | {{VALUE:score}}|
| 存储 |  [<%mediaInfo %>](file:///E:/luvian114/Videos/追番) |


> [!abstract]+ **简介**
> {{VALUE:summary}}

> [!tip]+ **章节列表**

{{VALUE:OpEd}}
{{VALUE:paraList}}

> [!tip]+ **主要角色**
> 
|  {{VALUE:character1}} | {{VALUE:character2}}   |   {{VALUE:character3}}  |
|:------: |:----------------: | :--------------- : |
|  {{VALUE:characterCV1}} | {{VALUE:characterCV2}}   |   {{VALUE:characterCV3}}  |
|  {{VALUE:characterPhoto1}} | {{VALUE:characterPhoto2}}   |   {{VALUE:characterPhoto3}}  |
| {{VALUE:character4}}  |  {{VALUE:character5}}  | {{VALUE:character6}}  |
|  {{VALUE:characterCV4}} | {{VALUE:characterCV5}}   |   {{VALUE:characterCV6}}  |
| {{VALUE:characterPhoto4}}  |  {{VALUE:characterPhoto5}}  | {{VALUE:characterPhoto6}}  |
| {{VALUE:character7}}  |  {{VALUE:character8}}  | {{VALUE:character9}}  |
|  {{VALUE:characterCV7}} | {{VALUE:characterCV8}}   |   {{VALUE:characterCV9}}  |
| {{VALUE:characterPhoto7}}  |  {{VALUE:characterPhoto8}}  | {{VALUE:characterPhoto9}}  |






