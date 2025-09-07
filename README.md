# Bangumi-to-obsidian
本说明文档为ACGbangumiv2.1.js文件的使用说明，具体配置流程可见B站视频BV1gRPgeDEog
使用过程中有任何问题都可联系本人。反馈时最好说明清楚是在查找**哪部作品**时出现了**什么报错信息**。报错信息可在Obsidian中同时按下`Ctrl`+`Shift`+`I`打开控制台，最新最靠下的红色信息即为系统报错。

---
# 更新日志
【关于API】
其实，我已经写好一份API版的脚本。但由于BangumiAPI一次性读取字段有限，该脚本响应速度很慢，平均1分钟左右才能生成一篇笔记。故搁置，静待BangumiAPI的更新。

v2.1：2025年9月
修复了角色列表无法正常捕捉的BUG。
解决了R18作品无法捕捉的问题。
新增个人评分输入的判断，自动替换中文字符(From 北漠海)。
新增动画分类新字段，内容为"xx年x月"新番(From 北漠海)。
优化标签自选框，新增了默认选高亮标签，复选框内越靠前的标签为点亮人数越多的。

v2.0：2025年2月
新增用正则表达式对Bangumi漫画、部分游戏信息的一键导入。
新增动画信息的部分字段，新增标签筛选功能、个人评分输入功能。
修复之前版本的已知bug，包括但不限于：标题有标点的动画无法导入、角色名称导入失败。

v1.0：2024年4月
实现用正则表达式对Bangumi动画的信息一键导入

---

# 使用方法

## 正常使用

准备：Obsidian(插件Templater QuickAdd)、ACGBangumiv2.1.js脚本文件
**配置步骤**
旧用户步骤：打开Macros管理器，Marcro-Configure-选择v2.1脚本。结束！

**新用户**请按照以下步骤配置：或观看教学[B站视频](https://www.bilibili.com/video/BV1gRPgeDEog/)
1. 先在QuickAdd插件面板选择Manage Macros，打开Macros管理器。新建一个Macro，名称随意。点击配置`Configure`，只需要在`User Scripts`一栏中选择脚本，即运行信息的获取程序`ACGbangumiv2.1.js`。 
2. 返回到QuickAdd面板，建立一个Macro，名称随意。这里的名称会是以后运行QuickAdd程序时显示的最常用名称。输入名称、选择Macro类型后点击`Add choice`即可。点击小齿轮进行配置，复选框中选择步骤1.中设定的Macro名称，关闭对话框即可保存配置。点击小雷电，确保小雷电颜色为黄色亮起。
3. 在QuickAdd面板建立三个Template，名称**必须**是`Bangumi动画`，`Bangumi漫画`，`Bangumi游戏`。（推荐建立一个Multi文件夹，用以收纳这三个模板，名称随意）
4. 在QuickAdd面板分别对三个Template做配置，点击小齿轮，模板路径`Template Path`选择对应的Obsidian模板md文件（动画的Template选择动画的模板，以此类推），事先预定笔记名称`File Name Format`设定为开启，笔记名称`File Name`输入框输入`{{VALUE:CN}}_动画`，`{{VALUE:CN}}_漫画`，`{{VALUE:CN}}_游戏`。其余根据需要自行配置。（推荐`Open`开关设置为开启，即新创建的作品信息笔记会创建好后就打开）
5. 配置成功啦！已经可以按照模板添加新的读书笔记了。其中模板内可使用的语法：`{{VALUE:`+变量+`}}`，具体内容是需要看抓包程序的设定。本质上，获取到的信息保存在对象Info中。模板中的`{{VALUE:`+变量+`}}`，在程序中是`Info.变量`。

**日常运行**：Obsidian快捷键`Ctrl+p`运行命令行，输入QuickAdd，找到步骤2中命名的Macro，回车运行即可。

## 高级配置

请确保正常使用基本无误再进行这部分配置。本配置的唯一作用为，检索导入R级作品信息。
额外准备材料：能访问R级作品的Bangumi账号、可上网的浏览器、能修改js脚本的软件（Windows系统用记事本都行）。

**配置步骤**
1. 打开浏览器，访问任意R级作品的Bangumi详情页。
2. Windows/Linus按`Ctrl+Shift+I`（Mac按`Cmd+Option+I`）打开浏览器开发者选项。
3. （看GetCookie.png）选中"网络"或“Network”选项卡，勾选"禁用缓存"。
4. （看GetCookie.png）刷新页面。页面加载完毕后，找到"g=js?"开头的一项，选中“标头”标签页，找到“请求标头”，复制Cookie一栏的所有内容。
5. 粘贴到脚本第一行USER_COOKIE后的代码里。
6. 保存脚本。 配置成功啦！找个作品试试看吧。
```java
//const USER_COOKIE = `Here is your cookie`//原版代码，改成：
const USER_COOKIE = `chii_sec_id=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx; chii_theme=light; _tea_utm_cache_10000007=undefined; chii_cookietime=2592000; chii_auth=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx; chii_searchDateLine=0; chii_sid=xxxxxx`;
```
以上仅为有效cookie包含的字段示例，有效的cookie理论上与示例格式一致。xxxx为字符串。

**注意事项**
1. Cookie与Bangumi账号强绑定。一旦被他人知晓cookie，Bangumi账号安全无法保证。所以，请**不要公开暴露自己的cookie信息！**
2. Cookie有时效性，一般有效期是7天-30天。本脚本不会检测cookie是否还在有效期内，也不会检测cookie是否有效。一旦发现R级作品无法导入，出现报错“您输入的作品不是动画/漫画/游戏”，请重新按步骤获取新的cookie。
# 字段说明

为便于使用，将程序中抓取到的具体动画的信息变量做列表说明（高亮为新增字段）。
#### 公用变量名称

| 变量             | 说明          |
| -------------- | ----------- |
| CN             | 中文名         |
| JP             | 日语名         |
| fileName       | 中文名_日文名     |
| type           | 作品类别        |
| rating         | 总评分         |
| Poster         | 作品海报封面      |
| url            | 作品信息页面网址    |
| alias          | 别名          |
| tags           | 标签(自选后)     |
| score          | 个人评分(手动输入)  |
| summary        | 作品简介        |
| character      | 1-9，各角色的名字  |
| characterCV    | 1-9，对应角色声优名 |
| characterPhoto | 1-9，对应角色缩略图 |
#### 动画特有变量

| 变量             | 说明         |
| -------------- | ---------- |
| season     | x月新番       |
| seasonYear | xx年        |
| website        | 官方网站（取第一个） |
| episode        | 作品集数       |
| director       | 导演         |
| AudioDirector  | 音响监督       |
| AnimeChief     | 总作画监督      |
| ArtDirector    | 美术监督       |
| staff          | 脚本         |
| MusicMake      | 音乐制作公司     |
| AnimeMake      | 动画制作公司     |
| from           | 原作 原作期刊    |
| fromWho        | 原作作者       |
| fromWhere      | 原作期刊       |
| date           | 放送年月日      |
| year           | 放送年份       |
| month          | 放送月份       |
| paraList       | 章节列表       |
| OpEd           | SP OP ED列表 |
#### 漫画特有变量

| 变量          | 说明     |
| ----------- | ------ |
| author      | 作者 原作  |
| episode     | 作品话数   |
| staff       | 作画     |
| Publish     | 出版社    |
| Journal     | 连载杂志   |
| ReleaseDate | 发售日    |
| Start       | 开始连载时间 |
| End         | 结束连载时间 |
| status      | 连载状态   |
#### 游戏特有变量
| 变量          | 说明   |
| ----------- | ---- |
| platform    | 平台   |
| playerNum   | 游玩人数 |
| develop     | 开发   |
| Publish     | 发行   |
| script      | 脚本   |
| music       | 音乐   |
| art         | 原画   |
| director    | 导演   |
| producer    | 制作人  |
| ReleaseDate | 发行日期 |
| price       | 售价   |
| website     | 官方网站 |
