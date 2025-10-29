//原作者：@月涟_luvian
//原项目地址：https://github.com/luvian114/Bangumi-to-obsidian
//原参考作者：@Lumos Cuman 永皓yh 风吹走记忆
//原特别鸣谢：@鬼头明里单推人 及 热心观众

//修改版作者：@北漠海 已征得原作者同意发布
//修改版地址：https://github.com/beimohai/Bangumi-to-obsidian-lite
//v2.2版

const notice = (msg) => new Notice(msg, 5000);
const log = (msg) => console.log(msg);

const headers = {
    "Content-Type": "text/html; charset=utf-8",
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.100.4758.11 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Site': 'same-site',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
    'Referer': 'https://bgm.tv/',
    'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
}

module.exports = bangumi

let QuickAdd;
var pageNum = 1;

/* ======================
   配置项（可自行调整）
   AUTO_LOOP: 完成一部动画的记录后是否自动继续循环记录下一部（true为继续，false为暂停，默认false）
   OPEN_IN_MAIN_LEAF: 生成动画笔记后是否在当前活动窗格打开（true）或总是在新 leaf 打开（false）
   BASIC_FOLDER_PATH：储存你的存放目录，需要自行修改
   ====================== */
const AUTO_LOOP = false;
const OPEN_IN_MAIN_LEAF = true;
const BASIC_FOLDER_PATH = "你的存放目录";

/* ---------- 网络与 HTML 解析工具 ---------- */

/**
 * 发送 GET 请求（封装 request）
 * @param {string} url
 * @param {object} customHeaders
 * @returns {Promise<string|null>} 响应文本或 null
 */
async function requestGet(url, customHeaders = headers) {
    try {
        const finalURL = new URL(url);
        const res = await request({
            url: finalURL.href,
            method: "GET",
            cache: "no-cache",
            headers: customHeaders,
        });
        return res || null;
    } catch (err) {
        console.error("requestGet 请求失败:", err);
        notice(`请求失败: ${err.message}`);
        return null;
    }
}

/**
 * 将 HTML 文本解析为 DOM Document
 * @param {string} html
 * @returns {Document}
 */
function parseHtmlToDom(html) {
    if (!html || typeof html !== "string") return new DOMParser().parseFromString("<html></html>", "text/html");
    const p = new DOMParser();
    return p.parseFromString(html, "text/html");
}

/* ---------- 主流程（入口函数） ---------- */

/**
 * 主入口：与 QuickAdd 集成的异步函数
 * @param {object} QuickAddInstance QuickAdd 实例（由 QuickAdd 调用传入）
 */
async function bangumi(QuickAddInstance) {
    QuickAdd = QuickAddInstance;
    let Info = {};

    // 作品名输入
    const name = await QuickAdd.quickAddApi.inputPrompt("输入查询的作品名称");
    if (!name) { new Notice("没有输入任何内容"); return; }

    // 拼接搜索 URL 并搜索
    url = "https://bgm.tv/subject_search/" + name + "?cat=2";
    let searchResult = await searchBangumi(url);
    if (!searchResult) { new Notice("找不到你搜索的内容"); return; }

    // 供用户选择具体结果（含“下一页”）
    let choice;
    while (true) {
        choice = await QuickAdd.quickAddApi.suggester((obj) => obj.text, searchResult);
        if (!choice) { new Notice("没有选择内容"); return; }
        if (choice.typeId === 8) {
            new Notice("加载下一页");
            searchResult = await searchBangumi(choice.link);
            if (!searchResult) { new Notice("找不到你搜索的内容"); return; }
            continue;
        } else {
            Info = await getAnimeByurl(choice.link);
            new Notice("正在生成动画笔记");
            break;
        }
    }

    // 记录日期（YYYYMMDD）
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    Info.recordDate = `${year}${month}${day}`;

    // 评分输入（自动把中文标点替换为半角点并校验范围）
    let score;
    while (true) {
        score = await QuickAdd.quickAddApi.inputPrompt("请给这部作品评分", "1.0-10.0分");
        if (!score && score !== 0) { new Notice("请输入评分!", 3000); continue; }
        score = String(score).trim();
        score = score.replace(/[。，、．,]/g, '.');
        score = score.replace(/\.{2,}/g, '.');
        let scoreNum = parseFloat(score);
        if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 10) { new Notice("请输入1.0到10.0之间的数字!", 3000); continue; }
        if (scoreNum === 10) score = "10.0"; else score = scoreNum.toFixed(1);
        break;
    }

    // 观看状态 与 动画来源类型
    Info.state = await QuickAdd.quickAddApi.suggester(["已看", "在看", "想看", "抛弃"], ["已看", "在看", "想看", "抛弃"]);
    Info.catego = await QuickAdd.quickAddApi.suggester(["小说改编", "漫画改编", "原创动画", "游戏改编", "其它"], ["小说改编", "漫画改编", "原创动画", "游戏改编", "其它"]);

    Info.score = score;
    Info.url = choice.link;

    // 根据开播日期推导分类文件夹（便于按季度保存）
    let seasonFolder = "未知季度";
    if (Info.date && Info.date.includes("年")) {
        const year = Info.date.split("年")[0];
        const monthPart = Info.date.split("年")[1];
        if (monthPart && monthPart.includes("月")) {
            const m = parseInt(monthPart.split("月")[0]);
            let seasonYear = year;
            if (m === 12) seasonYear = (parseInt(year) + 1).toString();
            if ([12,1,2].includes(m)) seasonFolder = "01月新番";
            else if ([3,4,5].includes(m)) seasonFolder = "04月新番";
            else if ([6,7,8].includes(m)) seasonFolder = "07月新番";
            else if ([9,10,11].includes(m)) seasonFolder = "10月新番";
            folderPath = `${BASIC_FOLDER_PATH}/${seasonYear}/${seasonFolder}`;
        }
    } else {
        folderPath = `${BASIC_FOLDER_PATH}`;
    }

    // 尝试解析 netaba subject 地址并抓取（容错，不影响主流程）
    try {
        const netabaUrl = getNetabaSubjectUrl(Info.url);
        if (netabaUrl) {
            Info.netaba = netabaUrl;
            const netabaHtml = await requestGet(netabaUrl);
            if (netabaHtml) Info.netabaHtml = netabaHtml;
        }
    } catch (e) { console.error("netaba fetch error", e); }

    // 生成模板并创建/更新笔记
    const templateContent = generateTemplateContent(Info);
    await createNote(QuickAdd, Info.fileName, templateContent, folderPath, Info);

    // 根据配置决定是否自动循环录入下一部
    if (AUTO_LOOP) { try { await bangumi(QuickAdd); } catch (e) { console.error("自动继续出错", e); } }
}

/* ---------- 搜索 Bangumi（支持“下一页”） ---------- */

/**
 * 搜索并返回可供 QuickAdd 选择的 itemList
 * @param {string} url
 * @returns {Promise<Array|null>}
 */
async function searchBangumi(url) {
    const res = await requestGet(url);
    if (!res) return null;

    const doc = parseHtmlToDom(res);
    let $ = s => doc.querySelector(s);
    let re = $("#browserItemList");
    if (!re) return null;

    let result = re.querySelectorAll(".inner");
    let itemList = [];

    // 预置“下一页”项
    text = "下一页";
    type = "none";
    typeId = 8;
    pageNum = pageNum + 1;
    link = url + "&page=" + pageNum;
    itemList.push({ text: text, link: link, type: type, typeId: typeId });

    for (var i = 0; i < result.length; i++) {
        let temp = result[i];
        let value = temp.querySelector("h3 span").getAttribute("class");
        if (value.includes("ico_subject_type subject_type_2")) {
            text = "🎞️" + " 《" + temp.querySelector("h3 a").textContent.trim() + "》 \n" + temp.querySelector(".info.tip").textContent.trim();
            type = "anime";
            typeId = 2;
            link = "https://bgm.tv" + temp.querySelector("h3 a").getAttribute("href");
            itemList.push({ text: text, link: link, type: type, typeId: typeId });
        }
    }
    if (itemList.length == 0) return null;
    itemList.sort(function (a, b) { return a.typeId - b.typeId });
    return itemList;
}

/* ---------- 抓取动画页面并解析信息 ---------- */

/**
 * 抓取并解析动画详情页（从 bgm.tv）
 * 返回对象 workinginfo（包含 CN, JP, Poster, episode, date 等字段）
 * @param {string} url
 * @returns {Promise<object>}
 */
async function getAnimeByurl(url) {
    const page = await requestGet(url);
    if (!page) { notice("No results found."); return; }

    const doc = parseHtmlToDom(page);
    const $ = s => doc.querySelector(s);
    const $$ = s => doc.querySelectorAll(s);

    let workinginfo = {};

    const Type = $("#headerSubject")?.getAttribute('typeof');
    if (Type != "v:Movie") { new Notice("您输入的作品不是动画！"); return; }

    // 名称、类型、评分
    const workingname = $("meta[name='keywords']")?.content || "";
    const cleanFileName = (str) => str ? str.replace(/[\*"\\\/<>:\|?]/g, ' ').trim() : '';
    workinginfo.CN = cleanFileName((workingname.split(",")[0] || "").trim());
    workinginfo.JP = cleanFileName((workingname.split(",")[1] || "").trim());
    workinginfo.fileName = workinginfo.CN || workinginfo.JP || "未知作品";
    workinginfo.type = ($("small.grey")?.textContent || "").trim();
    workinginfo.rating = ($("span[property='v:average']")?.textContent || "未知").trim();

    // 封面处理，若无则用占位图
    let regPoster = $("div[align='center'] > a")?.href || "";
    let Poster = String(regPoster).replace("app://", "http://").trim();
    workinginfo.Poster = Poster ? (Poster.startsWith("http") ? Poster : `https://${Poster.replace(/^https?:\/\//, "")}`) : "https://via.placeholder.com/300x450?text=无封面";

    // 解析 infobox（工作人员、话数等）
    const infobox = $$("#infobox > li");
    const str = Array.from(infobox).map(li => li.innerText).join("\n");

    // 话数
    const regepisode = /话数:.(\d*)/g;
    let episode = regepisode.exec(str);
    episode = (episode == null) ? '0' : episode[1].trim();
    workinginfo.episode = episode;

    // 官网
    const regwebsite = /官方网站:\s*(.*)\n/gm;
    let website = regwebsite.exec(str);
    website = (website == null) ? '未知' : website[1].trim();
    workinginfo.website = website.match("http") ? website : "https://" + website;

    // 导演
    const regdirector = /导演:([^\n]*)/;
    let director = regdirector.exec(str);
    director = (director == null) ? '未知' : director[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "");
    workinginfo.director = director;

    // 动画制作公司
    const regAnimeMake = /动画制作:([^\n]*)/;
    let AnimeMake = regAnimeMake.exec(str);
    AnimeMake = (AnimeMake == null) ? '未知' : AnimeMake[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "");
    workinginfo.AnimeMake = AnimeMake;

    workinginfo.fromWho = undefined;
    const regfrom = /原作:([^\n]*)/;
    let from = regfrom.exec(str);
    from = String((from == null) ? '-' : from[1].trim());
    workinginfo.fromWho = from.split("(")[0].split("・")[0];

    // 放送/发售日解析（根据类型不同字段不同）
    let regstartdate;
    switch (workinginfo.type) {
        case "TV": regstartdate = /放送开始:([^\n]*)/; break;
        case "OVA": regstartdate = /发售日:([^\n]*)/; break;
        case "剧场版": regstartdate = /上映年度:([^\n]*)/; break;
        default: regstartdate = /放送开始:([^\n]*)/;
    }
    let startdate = regstartdate.exec(str);
    startdate = (startdate == null) ? '未知' : startdate[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "");
    if (startdate !== '未知') {
        try {
            let dateStr = startdate.replace('年', '-').replace('月', '-').replace('日', '');
            let dateObj = new Date(dateStr);
            const weekdays = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
            const weekday = weekdays[dateObj.getDay()];
            startdate = `${startdate} ${weekday}`;
        } catch (e) { console.error("日期转换失败", e); }
    }
    workinginfo.date = startdate;

    if (startdate && startdate.includes("年")) {
        workinginfo.year = startdate.split("年")[0];
        const monthPart = startdate.split("年")[1];
        if (monthPart && monthPart.includes("月")) workinginfo.month = monthPart.split("月")[0];
    }

    // 解析分集列表（prg_list）
    const paragraphbox = $$(".prg_list li");
    const paragraph = []; let TypeNum = 1;
    paragraphbox.forEach(li => {
        let row = [];
        let paragraphType = li.querySelector('span');
        if (!paragraphType) {
            row.push(TypeNum);
        } else {
            row.push(paragraphType.textContent.trim());
            TypeNum = TypeNum + 1;
        }
        let title = li.querySelector('a');
        if (!title) {
            row.push(''); row.push(''); row.push('');
        } else {
            let regtitle = title.getAttribute('title') || '';
            row.push((regtitle.split(' ')[0] || '').split('.')[1] || '');
            if (row[0] == 1) {
                row.push(regtitle.split(' ')[1] || '');
            } else {
                regtitle = regtitle.replace(regtitle.split(' ')[0], "");
                row.push(regtitle || '');
            }
            let titleId = title.getAttribute('rel');
            let titleCN = $(titleId)?.innerText || '';
            let regtitleCN = /中文标题:([\s\S]*)(?=首播:)/g;
            titleCN = titleCN.match(regtitleCN);
            titleCN = (titleCN == null) ? ' ' : titleCN;
            row.push(String(titleCN).replace("中文标题:", ""));
        }
        paragraph.push(row);
    });

    // 组装 paraList、OpEd
    let TypeString = []; let paraList = []; let opedList = [];
    for (let i = 0; i < paragraph.length; i++) {
        if (paragraph[i][0] === 1) {
            paraList.push('第' + paragraph[i][1] + '话 ' + paragraph[i][2] + ' ' + paragraph[i][3]);
        } else if (typeof paragraph[i][0] === 'string') {
            TypeString = paragraph[i][0];
        } else {
            opedList.push(TypeString + '-' + paragraph[i][1] + ': ' + paragraph[i][2]);
        }
    }
    workinginfo.paraList = Array.from(paraList).join("\n");
    workinginfo.OpEd = Array.from(opedList).join("\n");

    return workinginfo;
}

/* 代理 urlGet（保留兼容） */
async function urlGet(url) { return await requestGet(url); }

/* ---------- 分集解析 / 表格拆分 / 旧表格解析等工具 ---------- */

/**
 * 解析 Info.paraList 为数组 {episode, jpTitle, cnTitle}
 * 更鲁棒地处理多空格分隔或“第N话”形式
 * @param {string} paraList
 */
function parseEpisodes(paraList) {
    const episodes = [];
    if (!paraList) return episodes;
    const lines = paraList.split("\n");
    lines.forEach(line => {
        const numMatch = line.match(/第?\s*(\d+)\s*话?/);
        let epNum = numMatch ? numMatch[1] : null;
        let rest = line;
        if (numMatch) rest = line.replace(numMatch[0], '').trim();
        let jp = '', cn = '';
        if (rest.match(/\s{2,}/)) {
            const parts = rest.split(/\s{2,}/);
            jp = parts[0].trim();
            cn = parts[1].trim();
        } else {
            const lastSpace = rest.lastIndexOf(' ');
            if (lastSpace > 0) {
                jp = rest.slice(0, lastSpace).trim();
                cn = rest.slice(lastSpace + 1).trim();
            } else {
                jp = rest.trim();
                cn = '';
            }
        }
        if (epNum) episodes.push({ episode: epNum, jpTitle: jp, cnTitle: cn });
    });
    return episodes;
}

/**
 * 将表格行按管道符切分为列，支持单元格内含 HTML 标签、反斜转义与反引号代码块
 * 更健壮，避免把单元格内的 | 错误识别为分隔符
 * @param {string} line 一行表格文本
 * @returns {Array<string>} 列数组（已去首尾空格）
 */
function splitTableRow(line) {
    if (typeof line !== 'string') return [];
    let s = line.trim();
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|')) s = s.slice(0, -1);
    const cols = [];
    let buf = '';
    let inBacktick = false;
    let inTag = false;
    let escaped = false;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (escaped) { buf += ch; escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === '`') { inBacktick = !inBacktick; buf += ch; continue; }
        if (ch === '<' && !inBacktick) { inTag = true; buf += ch; continue; }
        if (ch === '>' && inTag) { inTag = false; buf += ch; continue; }
        if (ch === '|' && !inBacktick && !inTag) { cols.push(buf.trim()); buf = ''; continue; }
        buf += ch;
    }
    cols.push(buf.trim());
    return cols;
}

/**
 * 从笔记内容中解析分集表格，并返回 map： episode -> [jp,cn,status,score,comment]
 * - 跳过表头、分隔线
 * - 支持单元格含 | 或 HTML 标签
 * @param {string} content
 * @returns {Object} map
 */
function parseEpisodeRows(content) {
    const map = {};
    if (!content) return map;
    const headerRegex = /^#\s*分集信息\s*$/m;
    const mHeader = content.match(headerRegex);
    if (!mHeader) return map;
    const headerPos = content.search(headerRegex);
    const afterHeaderPos = content.indexOf('\n', headerPos);
    const start = (afterHeaderPos === -1) ? headerPos + mHeader[0].length : afterHeaderPos + 1;
    const rest = content.slice(start);
    const nextHeader = rest.search(/\n#\s/);
    const end = (nextHeader === -1) ? content.length : start + nextHeader;
    const block = content.slice(start, end);

    const lines = block.split('\n');
    const headerTokens = ['集数','日文标题','中文标题','状态','评分','短评','集數','标题'];

    for (let line of lines) {
        line = line.trim();
        if (!line.startsWith('|')) continue;
        if (/^\|\s*-+\s*\|/.test(line)) continue;
        const cols = splitTableRow(line);
        if (cols.length < 4) continue;
        const firstCellRaw = (cols[1] || '').trim();
        const firstCellLower = firstCellRaw.toString().toLowerCase();
        let isHeaderLike = false;
        for (const tk of headerTokens) {
            if (firstCellLower.indexOf(tk.toLowerCase()) !== -1) { isHeaderLike = true; break; }
        }
        if (isHeaderLike) continue;
        if (firstCellRaw === '') continue;
        const digitsMatch = firstCellRaw.match(/\d+/);
        let epKey;
        if (digitsMatch && !isNaN(Number(digitsMatch[0]))) epKey = String(Number(digitsMatch[0]));
        else epKey = firstCellRaw;
        const jp = cols[2] || '';
        const cn = cols[3] || '';
        const status = (cols[4] !== undefined) ? cols[4] : '';
        const score = (cols[5] !== undefined) ? cols[5] : '';
        const comment = (cols[6] !== undefined) ? cols[6] : '';
        map[epKey] = [jp, cn, status, score, comment];
    }
    return map;
}

/* ---------- 文本空行规整 ---------- */

function normalizeBlankLines(text) {
    if (!text) return text;
    text = text.replace(/\r\n/g, '\n');
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.replace(/^\s+/, '');
    text = text.replace(/\s+$/, '');
    return text;
}

/* ---------- 模板生成 ---------- */

function generateTemplateContent(Info, mergedRows = null, preservedTotalReview = '') {
    let content = `# 动画信息\n> [!bookinfo|noicon]+ **${Info.CN}**\n> ![bookcover|400](${Info.Poster})\n>\n| 中文名 | ${Info.CN} |\n|:------: |:------------------------------------------: |\n| 日文名 | ${Info.JP} |\n| 开播日期 | ${Info.date} |\n| 动画类型 | ${Info.catego} |\n| 动画集数 | ${Info.type} 共 ${Info.episode} 话 |\n| 制作公司 | ${Info.AnimeMake} |\n| 制作监督 | ${Info.director} |\n| 观看状态 | ${Info.state} |\n| 个人评分 | ${Info.score} |\n| BGM 评分 | ${Info.rating} |\n| 记录日期 | ${Info.recordDate} |\n| BGM 地址 | [${Info.CN}](${Info.url}) |`;

    if (Info.netaba) content += `\n| Netaba 地址 | [评分变化](${Info.netaba}) |`;

    content += `\n# 分集信息\n| 集数 | 日文标题 | 中文标题 | 状态 | 评分 | 短评 |\n| ---- | ------------ | ------------ | ---- | ---- | ---- |`;

    let rows;
    if (Array.isArray(mergedRows)) rows = mergedRows;
    else {
        const parsed = parseEpisodes(Info.paraList || '');
        rows = parsed.map(ep => ({ episode: ep.episode, jpTitle: ep.jpTitle, cnTitle: ep.cnTitle, status: '', score: '', comment: '' }));
    }

    const unchecked = '☐';
    const checkedSymbol = '☑';

    for (const r of rows) {
        const epDisplay = (r.episode === undefined || r.episode === null) ? '' : String(r.episode);
        const jp = r.jpTitle || '';
        const cn = r.cnTitle || '';
        const status = (r.status !== undefined && r.status !== null && String(r.status).trim().length > 0) ? r.status : (Info.state === "已看" ? checkedSymbol : unchecked);
        const score = r.score || '';
        const comment = r.comment || '';
        content += `\n| ${epDisplay} | ${jp} | ${cn} | ${status} | ${score} | ${comment} |`;
    }

    if (Info.netaba) {
        content += `\n\n<div style="width:100%;height:850px;max-width:100%;">\n<iframe src="${Info.netaba}" style="width:100%;height:850px;border:0;"></iframe>\n</div>`;
    }

    content += `\n# 总评\n`;
    if (preservedTotalReview && preservedTotalReview.trim().length > 0) {
        content += normalizeBlankLines(preservedTotalReview).trim() + '\n';
    } else {
        content += '\n';
    }

    content += `\n# 变更记录`;
    content = normalizeBlankLines(content).trim() + '\n';
    return content;
}

/* ---------- 表格字段解析 ---------- */

function parseNoteContent(content) {
    const fields = {};
    if (!content) return fields;
    const lines = content.split('\n');
    for (const line of lines) {
        const m = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
        if (!m) continue;
        const fieldName = m[1].trim();
        let fieldValue = m[2].trim();
        if (/^[:\-]+$/.test(fieldName.replace(/\s+/g, '')) || /^[:\-]+$/.test(fieldValue.replace(/\s+/g, ''))) continue;
        // 移除箭头功能：直接取最终值（删除原箭头分割逻辑）
        fieldValue = fieldValue.replace(/\s*分\s*$/,'').trim();
        fields[fieldName] = fieldValue;
    }
    return fields;
}

/* ---------- 提取章节/变更记录等通用方法 ---------- */

/**
 * 提取指定标题块内部文本（不含标题行）
 * @param {string} content 全文
 * @param {string} title 标题（例如 "总评"）
 * @returns {string} 区块文本
 */
function extractSection(content, title) {
    if (!content) return '';
    const re = new RegExp(`(^#\\s*${escapeRegExp(title)}\\s*$)([\\s\\S]*?)(?=\\n#\\s|$)`, 'm');
    const m = content.match(re);
    if (!m) return '';
    return m[2].trim();
}

/**
 * 提取变更记录行（返回数组，每行为 "- YYYY-MM-DD hh:mm:ss ... "）
 * @param {string} content
 * @returns {Array<string>}
 */
function extractChangeRecords(content) {
    const headerRegex = /^#\s*变更记录\s*$/m;
    const match = content.match(headerRegex);
    if (!match) return [];
    const headerPos = content.search(headerRegex);
    const afterHeaderPos = content.indexOf('\n', headerPos);
    const start = (afterHeaderPos === -1) ? headerPos + match[0].length : afterHeaderPos + 1;
    const rest = content.slice(start);
    const nextHeader = rest.search(/\n#\s/);
    const end = (nextHeader === -1) ? content.length : start + nextHeader;
    const block = content.slice(start, end).trim();
    if (!block) return [];
    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    return lines;
}

/**
 * 替换或在末尾追加变更记录块（mergedLines 已去重）
 * @param {string} updatedContent 文档待写入内容
 * @param {Array<string>} mergedLines 变更行数组
 * @returns {string} 新文档文本
 */
function replaceOrAppendChangeBlock(updatedContent, mergedLines) {
    const changeBlock = mergedLines.length > 0 ? ('# 变更记录\n' + mergedLines.join('\n')) : '# 变更记录';
    const changeBlockRegex = /(^#\s*变更记录\s*$)([\s\S]*?)(?=\n#\s|$)/m;
    if (changeBlockRegex.test(updatedContent)) {
        updatedContent = updatedContent.replace(changeBlockRegex, changeBlock);
    } else {
        updatedContent = updatedContent.trim() + '\n' + changeBlock;
    }
    updatedContent = normalizeBlankLines(updatedContent).trim() + '\n';
    return updatedContent;
}

/* ---------- 小工具（格式化、比较、转义等） ---------- */

/** 正则转义 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 格式化显示值（个人评分/BGM评分 保留1位小数） */
function formatDisplayValue(fieldName, value) {
    if (value === null || typeof value === 'undefined') return '';
    if ((fieldName === "个人评分" || fieldName === "BGM 评分") && value !== '') {
        const num = parseFloat(String(value));
        if (!isNaN(num)) return num.toFixed(1);
        else return String(value);
    }
    return String(value);
}

/** 值比较（数字优先） */
function areValuesEqual(fieldName, oldVal, newVal) {
    if (oldVal === undefined || newVal === undefined) return false;
    if (fieldName === "个人评分" || fieldName === "BGM 评分") {
        const a = parseFloat(oldVal);
        const b = parseFloat(newVal);
        if (!isNaN(a) && !isNaN(b)) return Math.abs(a - b) < 1e-6;
        return String(oldVal).trim() === String(newVal).trim();
    } else {
        return String(oldVal).trim() === String(newVal).trim();
    }
}

/** 获取当前时间戳（用于变更记录） */
function getNowTimestamp() {
    const d = new Date();
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** 由 Bangumi URL 推导 netaba.re subject 地址 */
function getNetabaSubjectUrl(bgmUrl) {
    try {
        const m = bgmUrl.match(/subject\/(\d+)/);
        if (m) {
            const id = m[1];
            return `https://netaba.re/subject/${id}`;
        }
    } catch (e) { return null; }
    return null;
}

/* =========================
   createNote：创建或更新笔记（核心合并逻辑）
   - 保留用户在分集表格内的评分/短评/状态
   - 仅追加缺失集（不会覆盖已有分集行）
   - 合并并去重变更记录
   - 动画信息部分直接覆盖，旧数据仅保留在变更记录
   ========================= */

/**
 * 创建或更新笔记（主写入逻辑）
 * @param {object} QuickAdd QuickAdd 实例
 * @param {string} fileName 文件名（不含 .md）
 * @param {string} content 由 generateTemplateContent 生成的默认内容
 * @param {string} folderPath 保存路径
 * @param {object} Info 抓取到的动画信息
 */
async function createNote(QuickAdd, fileName, content, folderPath, Info) {
    const filePath = `${folderPath}/${fileName}.md`;
    let file;

    // 本地工具（仅在此函数内使用）
    function normalizeBlankLinesLocal(text) {
        if (!text) return text;
        text = text.replace(/\n{3,}/g, '\n\n');
        text = text.replace(/^\s+/, '');
        text = text.replace(/\s+$/, '');
        return text;
    }
    function escapeRegExpLocal(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function uniqueKeepOrderLocal(arr) {
        const seen = new Set();
        return arr.filter(x => {
            if (seen.has(x)) return false;
            seen.add(x);
            return true;
        });
    }
    function splitTableRowLocal(line) {
        const parts = line.split('|').map(s => s.trim());
        if (parts[0] === '') parts.shift();
        if (parts[parts.length - 1] === '') parts.pop();
        return parts;
    }
    function episodeRowToLine(r) {
        const ep = r.episode || '';
        const jp = r.jpTitle || '';
        const cn = r.cnTitle || '';
        const status = r.status || '';
        const score = r.score || '';
        const comment = r.comment || '';
        return `| ${ep} | ${jp} | ${cn} | ${status} | ${score} | ${comment} |`;
    }

    // 从旧文档中提取以数字为首列的分集行（按原有顺序）
    function extractExistingNumericRowsFromContent(oldContent) {
        const rows = [];
        if (!oldContent) return rows;
        const headerRegex = /^#\s*分集信息\s*$/m;
        const mh = headerRegex.exec(oldContent);
        if (!mh) return rows;
        const headerEnd = mh.index + mh[0].length;
        const rest = oldContent.slice(headerEnd);
        const nextHeaderMatch = rest.match(/\n#\s/);
        const blockEnd = nextHeaderMatch ? headerEnd + nextHeaderMatch.index : oldContent.length;
        const block = oldContent.slice(mh.index, blockEnd);
        const lines = block.split('\n');
        for (const line of lines) {
            const t = line.trim();
            if (!/^\|\s*\d+\s*\|/.test(t)) continue;
            const cols = splitTableRowLocal(t);
            rows.push({
                episode: String((cols[0]||'').match(/\d+/)?.[0] || (cols[0]||'')).trim(),
                jpTitle: cols[1] || '',
                cnTitle: cols[2] || '',
                status: cols[3] || '',
                score: cols[4] || '',
                comment: cols[5] || ''
            });
        }
        return rows;
    }

    const CHECKED = '☑';
    const UNCHECKED = '☐';

    try {
        // 确保目标文件夹存在
        const folderExists = app.vault.getAbstractFileByPath(folderPath);
        if (!folderExists) await app.vault.createFolder(folderPath);

        // 初次创建：直接写入由 generateTemplateContent 生成的内容
        content = normalizeBlankLinesLocal(content).trim() + '\n';
        await app.vault.create(filePath, content);
        new Notice(`已创建笔记: ${fileName}`);
        file = app.vault.getAbstractFileByPath(filePath);
    } catch (err) {
        if (err.message && err.message.includes("already exists")) {
            // 目标已存在：进入覆盖更新逻辑（删除箭头，直接替换动画信息）
            file = app.vault.getAbstractFileByPath(filePath);
            const oldContent = await app.vault.read(file);

            // 解析旧笔记头部字段供提示
            const oldFields = parseNoteContent(oldContent);
            const oldInfo = `原记录日期: ${oldFields["记录日期"] || "未知"}\n` +
                            `原个人评分: ${oldFields["个人评分"] || "未知"}\n` +
                            `原BGM评分: ${oldFields["BGM 评分"] || "未知"}`;

            const overwrite = await QuickAdd.quickAddApi.yesNoPrompt(
                "笔记已存在",
                `是否覆盖现有笔记？\n\n${oldInfo}`
            );
            if (!overwrite) return;

            // 核心修改：直接覆盖动画信息，仅保留用户数据和变更记录
            // 1. 提取旧数据（分集用户数据、总评、变更记录）
            const existingNumericRows = extractExistingNumericRowsFromContent(oldContent); // 分集状态/评分/短评
            const preservedTotalReview = extractSection(oldContent, "总评"); // 总评内容
            const oldChangeLines = extractChangeRecords(oldContent); // 历史变更记录

            // 2. 对比旧字段和新字段，生成新的变更记录（记录旧值→新值）
            const newFields = parseNoteContent(generateTemplateContent(Info));
            const fieldsToCompare = ["个人评分", "BGM 评分", "观看状态", "记录日期"];
            const newChangeLines = [];

            for (const field of fieldsToCompare) {
                const oldValue = oldFields[field];
                const newValue = newFields[field];
                if (oldValue === undefined || newValue === undefined) continue;
                if (!areValuesEqual(field, oldValue, newValue)) {
                    const displayOld = formatDisplayValue(field, oldValue);
                    const displayNew = formatDisplayValue(field, newValue);
                    newChangeLines.push(`- ${getNowTimestamp()} ${field}: ${displayOld} → ${displayNew}`);
                }
            }

            // 3. 生成新模板（含新动画信息+旧分集/总评）
            let updatedContent = generateTemplateContent(Info, existingNumericRows, preservedTotalReview);

            // 4. 合并变更记录（旧记录+新记录，去重）
            const mergedChangeLines = uniqueKeepOrderLocal(oldChangeLines.concat(newChangeLines));
            updatedContent = replaceOrAppendChangeBlock(updatedContent, mergedChangeLines);

            // 5. 写回文件（直接覆盖，无箭头残留）
            const toWrite = normalizeBlankLinesLocal(updatedContent).trim() + '\n';
            await app.vault.modify(file, toWrite);
            new Notice(`已覆盖更新笔记: ${fileName}`);
            file = app.vault.getAbstractFileByPath(filePath);
        } else {
            new Notice(`创建笔记失败: ${err.message || String(err)}`);
        }
    }

    // 判定叶子是否属于主工作区（根分割区及其子区域）
    function isInMainWorkspace(leaf) {
        let current = leaf.parent;
        while (current) {
            if (current === app.workspace.rootSplit) {
                return true;
            }
            current = current.parent;
        }
        return false;
    }

    // 获取主工作区现有叶子（用于OPEN_IN_MAIN_LEAF=true时复用）
    function getExistingMainLeaf() {
        const mainLeaves = [];
        app.workspace.iterateAllLeaves(leaf => {
            if (isInMainWorkspace(leaf)) {
                mainLeaves.push(leaf);
            }
        });
        // 优先返回主工作区活动叶子，无则返回第一个主工作区叶子
        const activeMainLeaf = mainLeaves.find(leaf => leaf === app.workspace.activeLeaf);
        return activeMainLeaf || (mainLeaves.length > 0 ? mainLeaves[0] : null);
    }

    // 打开文件的最终逻辑（整合OPEN_IN_MAIN_LEAF配置）
    if (file) {
        let targetLeaf;
        if (OPEN_IN_MAIN_LEAF) {
            // 逻辑1：复用主工作区现有叶子（无则创建新的主工作区叶子）
            targetLeaf = getExistingMainLeaf();
            if (!targetLeaf) {
                // 主工作区无叶子时，创建新的主工作区叶子（非分屏）
                targetLeaf = app.workspace.createLeafInParent(app.workspace.rootSplit);
            }
        } else {
            // 逻辑2：在主工作区新建独立叶子（新标签页，非分屏）
            // 使用getLeaf(true)强制在主工作区新建标签页，避免分屏
            targetLeaf = app.workspace.getLeaf(true);
        }

        // 强制激活目标叶子（确保在主工作区显示）
        app.workspace.setActiveLeaf(targetLeaf);
        // 打开文件
        await targetLeaf.openFile(file);
    }

    // 若启用自动循环，递归继续（注意：大量连续操作可能造成调用栈增长）
    if (typeof AUTO_LOOP !== 'undefined' && AUTO_LOOP) {
        try { await bangumi(QuickAdd); } catch (e) { console.error("自动继续出错", e); }
    }
}