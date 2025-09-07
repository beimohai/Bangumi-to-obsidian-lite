---
<%*
let state=tp.system.suggester(["想玩","在玩","已玩"],["想玩⏰","在玩📖","已玩📘"])
let mediaInfo=tp.system.suggester(["是否本地下载？还没有","已保存"],["False","True"])
-%>
笔记ID: "{{DATE:YYYYMMDDHHmmss}}"
别名: "{{VALUE:alias}}"
标签: {{VALUE:tags}}
观看状态: <% state %>
作品大类: Game
中文名: "{{VALUE:CN}}"
日文名: "{{VALUE:JP}}"
封面: "({{VALUE:Poster}})"
Bangumi评分: " {{VALUE:rating}}"
平台: "{{VALUE:platform}}"
具体类型: "{{VALUE:type}}"
游玩人数:"{{VALUE:playerNum}}"
开发:"{{VALUE:develop}}"
发行: "{{VALUE:Publish}}"
保存状态: <% mediaInfo %>
---




> [!bookinfo|noicon]+ **{{VALUE:CN}}** 
> ![bookcover|400]({{VALUE:Poster}})
>
| 日文名 | {{VALUE:JP}} |
|:------: |:------------------------------------------: |
| 发行日期 | {{VALUE:ReleaseDate}} | 
| 售价 | {{VALUE:price}} |
| 官网 | {{VALUE:website}} |
|观看|<% state %>|
| 评分 | {{VALUE:score}}|
| 存储 |  [点我开始游戏](file:///E:/luvian114/Game) |


> [!abstract]+ **简介**
> {{VALUE:summary}}


> [!tip]+ **主要角色**
> 
|  **{{VALUE:character1}}**| **{{VALUE:character2}}**   |   **{{VALUE:character3}}**  |
|:------: |:----------------: | :--------------- : |
|  {{VALUE:characterPhoto1}} | {{VALUE:characterPhoto2}}   |   {{VALUE:characterPhoto3}}  |
| **{{VALUE:character4}}**  |  **{{VALUE:character5}}**  | **{{VALUE:character6}}**  |
| {{VALUE:characterPhoto4}}  |  {{VALUE:characterPhoto5}}  | {{VALUE:characterPhoto6}}  |
| **{{VALUE:character7}}**  |  **{{VALUE:character8}}**  | **{{VALUE:character9}}**  |
| {{VALUE:characterPhoto7}}  |  {{VALUE:characterPhoto8}}  | {{VALUE:characterPhoto9}}  |









