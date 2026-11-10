# 百度网盘视频播放器 · 去广告去赞赏版

在 [百度网盘](https://pan.baidu.com) 网页版视频页上，把原生播放器替换为 [ArtPlayer](https://artplayer.org/)，补上倍速、清晰度切换、剧集列表、字幕（含本地字幕）、音质增强、画面比例与色彩滤镜、长按倍速等能力；**同时清掉原脚本全家桶塞进来的赞赏遮罩、收款二维码、赞助菜单和云端校验埋点**。

仓库：<https://github.com/xmbl4399/baidu-pan-video-clean>

> 本仓库是基于上游脚本 1.2.6 的**清理分支**，不是原作者的官方发布。上游地址见 [溯源](#溯源)。

## 为什么需要这个仓库

上游把「播放器插件」拆成了一个 `@require` 的外部库 `artPlugins.js`，而**所有广告、赞赏、功能锁都在那个库里**，主脚本本身是干净的：

| 原库里的东西 | 表现 |
| --- | --- |
| 赞助遮罩窗 | 开播时盖住画面，**暂停视频、隐藏控制条与设置**，逼你去爱发电下单 |
| 右键「开通功能」/「鼓励一下」 | 右键菜单里的付费与引流入口 |
| 设置面板「赞赏作者」 | 设置里的赞助页 |
| `potser` 收款浮层 | 播放结束弹 300px 收款二维码 |
| CloudBase 上报 | `callFunction("pan")` 把 uid、`GM_info`、页面 host 传到 `js-3gyg0gq54003de57` 环境 |
| `expire_time` 功能锁 | 每调用一个功能就查一次到期时间，过期即弹窗 |

本仓库的做法：**把 `artPlugins.js` 内联为清理版**（保留全部 9 个功能插件，只把第 1 个「user 校验/赞助」插件换成永久解锁桩），并把上报 SDK、`@antifeature` 声明一并删掉。

## 安装

1. 装 [ScriptCat](https://scriptcat.org/)（或 Tampermonkey / Violentmonkey）。
2. 一键安装：[**点这里安装**](https://raw.githubusercontent.com/xmbl4399/baidu-pan-video-clean/main/baidu-pan-video-clean.user.js)
   —— 脚本管理器会弹出安装页。也可以从源码新建脚本后整体粘贴。
3. 打开任意百度网盘视频页刷新即可。

生效判据：控制条右侧出现 **720P / 480P / 360P 三档画质 + 播放列表 + 字幕列表**（页面原生只有「字幕 / 倍速 / 流畅」三个按钮），设置里没有「赞赏作者」，右键没有「开通功能」。

## 目录结构

```
baidu-pan-video-clean.user.js   ← 产物（唯一需要安装的文件，由 tools/build.py 生成）
src/
  header.txt                    ← UserScript 元数据头
  notice.txt                    ← 清理说明块注释
  artPlugins.clean.js           ← 内联的 artPlugins 2.2.5（清理版）
  main.js                       ← 原主脚本 body（未改动业务逻辑）
upstream/                       ← 上游原始文件，仅供溯源与 diff
tools/
  build.py                      ← 拼接 src/ → 单文件
  serve.py                      ← 本地 http（带 CORS），方便 ScriptCat 从 URL 安装
```

改代码请改 `src/`，然后 `python3 tools/build.py`；提交前用 `python3 tools/build.py --check` 确认产物与源同步。

## 已知坑（改代码前务必看）

**1. 拼接处必须有前导分号。** 清理版库以 `])` 结尾，主脚本以 `(function() {` 开头。两者直接相邻会被解析成 `([... ])(function(){...})()` —— 数组被当函数调用，脚本在那行就 `TypeError: (intermediate value)(...) is not a function` 挂掉。

危险的地方在于**现象很迷惑**：ArtPlayer 已经加载、页面原生播放器照常播放，看起来像「脚本没安装」，实际是脚本在第 75 行就退出了。`tools/build.py` 会强制校验 `]);` + `;(function() {` 这组分隔，删掉它构建直接失败。

**2. `obj.getAdToken` 不是广告。** 这是百度官方播放鉴权（`M3U8_AUTO_480` 探测 + `adToken` 参数），删了会拿到 `errno 133` 播放失败。名字带 "Ad" 但请勿清理。

**3. 别动这 9 个插件。** quality / playlist / auto-playbackrate / subtitle / sound / filter / quick / hotkey / info 都通过 `{user, show}` 契约拿解锁状态，清理版已让 `user()` 返回远期 `expire_time`，它们会自动全功能可用。它们内部的 `adToken` 同样是百度的播放参数。

## 已知问题：播一会儿就重载、自动从头播放（1.2.9 已修）

**现象**：视频看着看着突然「重启」——画面重新加载，进度条回到 00:00，过一会儿又崩，各清晰度（720P / 480P / 360P）都会出现。

**根因**：不在脚本，在**百度转码流音频轨里的坏包**。逐段解 MPEG-TS（音频 PID 257）后确认：

- 音频 PES 里绝大多数 AAC 帧都是正常的 48kHz 立体声（全片统计 62,279 帧 `sfi=4/ch=2`），但每隔约 50~80 秒会出现一个坏 PES：**第一个 ADTS 头的帧长字段被写成了整个 PES 载荷的长度**（如 6590、6673、4995 字节，正常一帧只有 300~400 字节），后面跟着一段不是 ADTS 帧的拼接残渣，真实帧要到偏移 1498~2539 字节处才开始。
- Chromium 的音频解码器把它当单帧喂进去，立刻失败并抛
  `PipelineStatus::PIPELINE_ERROR_DECODE: Failed to send audio packet for decoding: {timestamp=520807412 duration=23219 size=6590}` → `MediaError code=3`。报出来的 `size` 正好等于那个被写坏的帧长，可与上面的解析一一对上。
- 随后 hls.js 的 `recoverMediaError()` 走 `detachMedia()`（栈里能看到 `HTMLVideoElement.load ← onMediaDetaching`）→ 重建 MediaSource → artplayer 重新加载，`currentTime` 归 0，于是**从头开始**。重建后几十秒又撞上下一个坏 PES，形成循环。

**排除项**：不是 `location.reload()`（全程 `navigation.length===1`、`location.href` 不变、无 beforeunload）；不是网速（出错时 `buffered` 早已缓冲到几十秒后、`networkState=1`）；不是 CDN（同一分片从 4 个 backhost 拉取，长度与 sha256 完全一致）；也不是某一个清晰度独有 —— 720P、480P、360P 的音频坏包是同一个编码器产物。

**1.2.9 的修法**（`src/artPlugins.clean.js` 的 `customType.hls` 段）：**不重建、不跳转，直接把错误事件吞掉**。

- 在 `document` 的捕获阶段监听 `error`，命中 `e.target === video && video.error.code === 3`（解码错误）时 `stopImmediatePropagation()` + `preventDefault()`。
- 这样 hls.js 的 `BufferController.onMediaDetaching` 与 artplayer 的 `video:error` 重连逻辑都收不到事件，MediaSource 不重建，`currentTime` 保持不变。Chromium 的 MSE 对 AAC 本身有丢包容错，会自行跳过坏帧继续解码。
- 兜底：如果连续 8 秒播放位置没有任何推进（`readyState>=3` 且未暂停，说明解码器真的卡死了），才临时撤下拦截、调用 `recoverMediaError()`，在 `canplay` 时把位置设到「卡住处 +5 秒」（第二次 +2 秒）跳过坏包，1.5 秒后重新装上拦截。既不掩盖真实故障，也绝不会回到 00:00。

**实测**：第 53 集从 8:40 起播，一路跨越原来必崩的 590 秒、720 秒位置，连续播到 17:16（`__wd6.n === 0`，一次错误都没放行）；`webkitAudioDecodedByteCount` 从 85 万增长到 134 万，`webkitVideoDecodedByteCount` 同步增长，说明音频是正常解码而非静音跳过。另在卡死态（`readyState=1`、`error.code=3`）上实测兜底：守护自动 `recoverMediaError()` 并把位置设到 542 秒，随后正常播到 707 秒无错。

> 关键点：`MEDIA_ERR_DECODE` **不会**以 fatal 事件到达 `hls.on(Events.ERROR)`，只体现在 `video` 元素自身的 `error` 事件上；而 `error` 事件**不冒泡**，必须用 `document.addEventListener('error', handler, true)` 才能拦在 hls.js / artplayer 之前。

## 验证记录

在 `pan.baidu.com/pfile/video` 页面（一个 72 集的课程目录）实测：

| 检查项 | 清理前 | 清理后 |
| --- | --- | --- |
| 赞赏遮罩 | `.art-mask-show` 挂载，视频被暂停 | `.art-mask` 存在但无 `art-mask-show`，`.art-bottom` opacity=1 |
| 右键菜单 | 含「开通功能」「鼓励一下」 | 仅 播放速度 / 画面比例 / 字幕显示 / 统计信息 / 关闭 |
| 设置面板 | 含「赞赏作者」 | 画面比例 / 播放速度 / 字幕设置 / 声音设置 / 色彩滤镜 / 快捷控制 |
| 全页文本 | 命中「赞赏/赞助/爱发电」 | `body.innerText` 正则无一命中 |
| 功能 | 受 `expire_time` 锁 | 720/480/360 三档、72 集列表、字幕列表、截图全部可用 |

## 范围说明

**未处理**（属于百度网盘站点自身 UI，不在脚本广告范畴）：右上角「开通SVIP」、右侧栏「SVIP享视频倍速等50+特权 / 去开通」、播放器下方「用客户端看更清晰流畅」。想连这些一起隐藏，可以在脚本末尾追加 CSS。

## 溯源

- 上游脚本：scriptcat.org 脚本页（`@namespace https://scriptcat.org/zh-CN/users/13895`，版本 1.2.6）
- 上游插件库：`https://scriptcat.org/lib/1348/^2.2.5/artPlugins.js`
- 原始文件快照见 [`upstream/`](upstream/)，便于核对改了什么

## 许可

清理与改动部分随本仓库；上游脚本与 `artPlugins.js` 版权归原作者所有。若原作者希望下架，请开 issue。
