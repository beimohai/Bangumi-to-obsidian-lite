---
<%*
let state=tp.system.suggester(["想看","在看","已看"],["想看⏰","在看📖","已看📘"])
let mediaInfo=tp.system.suggester(["是否本地保存？还没有","已保存"],["False","True"])
-%>
笔记ID: "{{DATE:YYYYMMDDHHmmss}}"
别名: "{{VALUE:alias}}"
标签: {{VALUE:tags}}
观看状态: <% state %>
连载状态：{{VALUE:status}}
作品大类: Comic
中文名: "{{VALUE:CN}}"
日文名: "{{VALUE:JP}}"
封面: "({{VALUE:Poster}})"
Bangumi评分: " {{VALUE:rating}}"
话数: "{{VALUE:episode}}"
具体类型: "{{VALUE:type}}"
出版社: "{{VALUE:Publish}}"
保存状态: <% mediaInfo %>
---




> [!bookinfo|noicon]+ **{{VALUE:CN}}** 
> ![bookcover|400]({{VALUE:Poster}})
>
| 日文名 | {{VALUE:JP}} |
|:------: |:------------------------------------------: |
| 开始 | {{VALUE:Start}} | 
| 集数 | {{VALUE:status}} -{{VALUE:episode}}话 |
| 杂志 | {{VALUE:Journal}} |
| 作者 | {{VALUE:author}} |
| 作画 | {{VALUE:staff}} |
| 状态 |{{VALUE:status}}|
|观看|<% state %>|S
| 评分 | {{VALUE:score}}|
| 存储 |  [点我查看本地漫画](file:///E:/luvian114/Pictures/漫画) |


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









