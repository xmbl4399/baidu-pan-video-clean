// ==UserScript==
// @name         百度网盘视频播放器（去广告去赞赏版）
// @namespace    https://scriptcat.org/zh-CN/users/13895
// @version      1.2.7
// @description  功能更全，播放更流畅，界面更好看！特色功能主要有: 倍速调整，分辨率切换，剧集列表，字幕列表，本地字幕，精细设置字幕样式，音质增强音量增大，画面比例调整，画面色彩调整，快捷操作: 长按倍速、快进快退、片头片尾 ...，所有设置持久化记忆，支持移动端网页播放（网盘主页）。本版已移除赞赏弹窗、收款浮层、赞助菜单、云端校验埋点与功能锁。
// @author       You
// @match        http*://yun.baidu.com/s/*
// @match        https://pan.baidu.com/s/*
// @match        https://pan.baidu.com/wap/home*
// @match        https://pan.baidu.com/play/video*
// @match        https://pan.baidu.com/pfile/video*
// @match        https://pan.baidu.com/pfile/mboxvideo*
// @require      https://scriptcat.org/lib/950/^1.0.3/joysound.js
// @require      https://unpkg.com/hls.js@1.7.3/dist/hls.min.js
// @require      https://unpkg.com/artplayer@5.4.0/dist/artplayer.js
// @require      https://unpkg.com/localforage@1.10.0/dist/localforage.min.js
// @icon         https://nd-static.bdstatic.com/business-static/pan-center/images/vipIcon/user-level2-middle_4fd9480.png
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/* ==================================================================
 * 【已清理】原 @require https://scriptcat.org/lib/1348/^2.2.5/artPlugins.js
 * 现改为内联的 artPlugins 2.2.5（清理版），移除以下内容：
 *   1. 开播/播放中弹出的「喜欢这个脚本吗 / 赞赏体验更多增强功能」遮罩窗
 *      （会暂停视频、隐藏控制条与设置面板，逼用户去爱发电下单）
 *   2. 右键菜单「开通功能」「鼓励一下」与设置面板「赞赏作者」
 *   3. 播放结束后右下角的收款二维码图片浮层（potser / 300px 收款图）
 *   4. CloudBase 云端校验与埋点：callFunction("pan") 上报 uid、GM_info、
 *      uinfo、location.host（原 env: js-3gyg0gq54003de57）
 *   5. 基于 expire_time 的功能锁：改为本地永久解锁，
 *      倍速/字幕/音质增强/画面比例/色彩滤镜/长按倍速等直接可用
 * 同时主脚本删除了 @antifeature ads/membership/payment/referral-link/
 * tracking 声明、未使用的 GM_xmlhttpRequest 授权与 cloudbase SDK。
 * ================================================================== */

window.artPlugins=window.artPlugins||function(t){var e={version:"2.2.5-clean",init:t=>Promise.all([e.readyHls(),e.readyArtplayer()]).then(()=>e.initArtplayer(t)),readyHls:()=>window.Hls||unsafeWindow.Hls?Promise.resolve():e.loadJs("https://jsd.nn.ci/npm/hls.js@1.7.3/dist/hls.min.js"),readyArtplayer:()=>window.Artplayer||unsafeWindow.Artplayer?Promise.resolve():e.loadJs("https://jsd.nn.ci/npm/artplayer@5.4.0/dist/artplayer.js"),initArtplayer:e=>{const o=window.Artplayer||unsafeWindow.Artplayer,{isMobile:n}=o.utils;Object.assign(o,{ASPECT_RATIO:["default","自动","4:3","16:9"],AUTO_PLAYBACK_TIMEOUT:1e4,NOTICE_TIME:5e3});const{quality:a=[]}=e,{url:s,type:i}=a.find(t=>t.default)||Object.assign(a[0]||{},{default:!0});return e=Object.assign({container:"#artplayer",url:"",quality:[],type:"",autoplay:!0,autoPlayback:!0,aspectRatio:!0,contextmenu:[],customType:{hls:(t,e,o)=>{const n=window.Hls||unsafeWindow.Hls;if(n.isSupported()){o.hls&&o.hls.destroy();const a=o.hls=new n({xhrSetup:(t,e)=>{const n=(e.match(/^http(?:s)?:\/\/(.*?)\//)||[])[1];if(n!==location.host){if(/backhost=/.test(e)){let t,a=(decodeURIComponent(e||"").match(/backhost=(\[.*?\])/)||[])[1];if(a){try{t=JSON.parse(a)}catch(t){}if(t&&t.length){t=[].concat(t,[n]);const e=t.findIndex(t=>t===o.realHost);o.realHost=t[e+1>=t.length?0:e+1]}}}o.realHost&&(e=e.replace(n,o.realHost),t.open("GET",e,!0))}}});a.loadSource(e),a.attachMedia(t),a.on(n.Events.ERROR,(t,e)=>{if(e.fatal)switch(e.type){case n.ErrorTypes.NETWORK_ERROR:e.details===n.ErrorDetails.MANIFEST_LOAD_ERROR||e.details===n.ErrorDetails.MANIFEST_LOAD_TIMEOUT||e.details===n.ErrorDetails.MANIFEST_PARSING_ERROR?setTimeout(()=>a.loadSource(a.url),1e3):e.details===n.ErrorDetails.FRAG_LOAD_ERROR?(a.fragLoadError=(a.fragLoadError||0)+1)<5?(a.loadSource(a.url),a.media.currentTime=o.currentTime,a.media.play()):(a.destroy(),o.notice.show="播放错误次数过多，请刷新重试"):setTimeout(()=>a.startLoad(),1e3);break;case n.ErrorTypes.MEDIA_ERROR:a.recoverMediaError();break;default:a.destroy(),o.notice.show="视频播放异常，请刷新重试"}}),o.on("destroy",()=>a.destroy())}else t.canPlayType("application/vnd.apple.mpegurl")?t.src=e:o.notice.show="Unsupported playback format: m3u8"}},flip:!1,icons:{},id:"",pip:!n,poster:"",playbackRate:!1,screenshot:!0,setting:!0,subtitle:{url:"",type:"auto",style:{color:"#fe9200",fontSize:"25px"},encoding:"utf-8",escape:!1},subtitleOffset:!1,hotkey:!0,fullscreen:!0,fullscreenWeb:!n},{url:s,type:i},e),new o(e,e=>{t.forEach(t=>{e.plugins.add(t())})})},loadJs:t=>(window.instances||(window.instances={}),window.instances[t]||(window.instances[t]=new Promise((e,o)=>{const n=document.createElement("script");n.src=t,n.type="text/javascript",n.onload=e,n.onerror=o,Node.prototype.appendChild.call(document.head,n)})),window.instances[t])};return e}([
()=>t=>{const e={expire_time:Date.now()+31536000000,uid:"",updatedAt:0},n=()=>Promise.resolve(e),s=()=>{},o=()=>{try{t.emit("user",e)}catch(a){}};const r=()=>{o();setTimeout(o,300);setTimeout(o,1200);setTimeout(o,4000)};t.isReady?r():t.once("ready",r);t.on("video:playing",o);t.on("restart",o);return{name:"user",user:n,show:s}},
()=>t=>{function e(t){return c?t.split(/\s/).shift():t}function o(){const{file:o,quality:n,getUrl:c,adToken:u}=s,[,p,d]=((o||{}).resolution||"").match(/width:(\d+),height:(\d+)/),h=+p*+d;h>2073600&&n.unshift({html:"2K 1440P",url:c("M3U8_AUTO_2K")+"&adToken="+encodeURIComponent(u),type:"hls"}),h>3686400&&n.unshift({html:"4K 2160P",url:c("M3U8_AUTO_4K")+"&adToken="+encodeURIComponent(u),type:"hls"});const m=n.find(t=>t.default)||Object.assign(n[0],{default:!0});l.update({name:"quality",html:m?e(m.html):"",selector:n.map(t=>({...t})),onSelect:o=>(t.switchQuality(o.url),i.show=`${a.get("Switch Video")}: ${o.html}`,r.set("quality",e(o.html)),e(o.html)),mounted:()=>{const o=r.get("quality");if(o){const n=l.cache.get("quality").option.selector.find(t=>e(t.html)===o);n&&!n.default&&(t.switchQuality(n.url),l.check(n))}}})}function n(){t.once("user",({expire_time:e})=>{if(Math.max(e-Date.now(),0)){o();let e=s.id;t.on("restart",()=>{if(e===s.id){const e=t.layers.cache.get("auto-playback");if(e){const{$ref:t}=e;u(t,"display","none")}}else e=s.id,o()})}})}const{i18n:a,option:s,notice:i,storage:r,controls:l,constructor:{utils:{isMobile:c,setStyle:u}}}=t;return t.isReady?n():t.once("ready",n),{name:"quality"}},
()=>t=>{function e(){t.once("user",({expire_time:t})=>{if(Math.max(t-Date.now(),0)){const{filelist:t}=a;(t||[]).length>1&&function(t=[]){i.update({html:c,name:"playlist",position:"right",style:{paddingLeft:"10px",paddingRight:"10px"},selector:t.map(t=>({...t,html:t.name,style:{textAlign:"left"}})),onSelect:t=>{const{id:e}=t;return e==a.id||(u(t)?a.file=t:s.show="切换失败 ..."),c},mounted:()=>{const t=i.cache.get("playlist"),{$ref:e,option:{selector:o}}=t,a=r(".art-selector-list",e),s=r(".art-selector-value",e),l=a.offsetHeight,c=a.firstElementChild.offsetHeight;n(s,"click",()=>{const t=o.findIndex(t=>t.default);a.scrollTop=(t+1)*c-l/2})}})}(t)}})}const{i18n:o,proxy:n,option:a,notice:s,controls:i,constructor:{utils:{query:r,isMobile:l}}}=t;o.update({"zh-cn":{PlayList:"播放列表"}});const c=l?'<i class="art-icon"><svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><path d="M810.666667 384H85.333333v85.333333h725.333334V384z m0-170.666667H85.333333v85.333334h725.333334v-85.333334zM85.333333 640h554.666667v-85.333333H85.333333v85.333333z m640-85.333333v256l213.333334-128-213.333334-128z" fill="#ffffff"></path></svg></i>':o.get("PlayList"),u=async e=>{const{open:o,change:n=o,name:a}=e;if(n instanceof Function){a&&(s.show=`切换至: ${a}`);const e=await n();if(e){const{quality:o=[]}=e;if(o.length){const{url:n,type:a}=o.find(t=>t.default)||Object.assign(o[0],{default:!0});Object.assign(t.option,{url:n,type:a},e)}else Object.assign(t.option,e)}return!0}};return t.isReady?e():t.once("ready",e),{name:"playlist",prev:async()=>{const t=i.cache.get("playlist");if(!t)return;const e=t.option.selector.findIndex(t=>t.default),{filelist:o}=a,n=o[e-1];if(n){return await u(n)?(a.file=n,!0):(s.show="切换失败 ...",!1)}return s.show="没有上一集了 ...",!1},next:async()=>{const t=i.cache.get("playlist");if(!t)return;const e=t.option.selector.findIndex(t=>t.default),{filelist:o}=a,n=o[e+1];if(n){return await u(n)?(a.file=n,!0):(s.show="切换失败 ...",!1)}return s.show="没有下一集了 ...",!1}}},
()=>t=>{function e(t){return 1===t?a.get("Normal"):t?t.toFixed(2):a.get("Custom")}function o(){return d.includes(t.playbackRate)?t.playbackRate:0}function n(){t.once("user",({expire_time:e})=>{if(Math.max(e-Date.now(),0)){t.on("video:ratechange",()=>l.set("playbackRate",t.playbackRate));const e=l.get("playbackRate");e&&(t.playbackRate=Number(e))}})}const{i18n:a,icons:s,notice:i,layers:r,storage:l,plugins:c,setting:u,contextmenu:p,constructor:{PLAYBACK_RATE:d,SETTING_ITEM_WIDTH:h,utils:{query:m,throttle:f,setStyle:g,inverseClass:y}}}=t;a.update({"zh-cn":{Custom:"自定义"}});const b=r.update({name:"auto-playbackrate",html:`<div>播放速度</div><input type="number" value="${t.playbackRate}" style="min-height: 20px;border: none; border-radius: 3px;text-align: center;color: #000;" step=".05" max="16" min=".1"><div class="art-auto-playback-close"><i class="art-icon art-icon-close"><svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="22" height="22" style="fill: var(--art-theme);width: 15px;height: 15px;"><path d="m571.733 512 268.8-268.8c17.067-17.067 17.067-42.667 0-59.733-17.066-17.067-42.666-17.067-59.733 0L512 452.267l-268.8-268.8c-17.067-17.067-42.667-17.067-59.733 0-17.067 17.066-17.067 42.666 0 59.733l268.8 268.8-268.8 268.8c-17.067 17.067-17.067 42.667 0 59.733 8.533 8.534 19.2 12.8 29.866 12.8s21.334-4.266 29.867-12.8l268.8-268.8 268.8 268.8c8.533 8.534 19.2 12.8 29.867 12.8s21.333-4.266 29.866-12.8c17.067-17.066 17.067-42.666 0-59.733L571.733 512z"></path></svg></i></div>`,tooltip:"",style:{borderRadius:"var(--art-border-radius)",left:"var(--art-padding)",bottom:"calc(var(--art-control-height) + var(--art-bottom-gap) + 10px)",backgroundColor:"var(--art-widget-background)",alignItems:"center",gap:"10px",padding:"10px",lineHeight:1,display:"none",position:"absolute"},mounted:e=>{const o=m("input",e),n=m(".art-auto-playback-close",e);t.proxy(o,"change",()=>{const e=Math.min(Math.max(o.value,.1),16);t.playbackRate=e}),t.proxy(n,"click",()=>{g(e,"display","none")})}});return d.includes(0)||d.unshift(0),u.update({width:h,name:"playback-rate",html:a.get("Play Speed"),tooltip:e(t.playbackRate),icon:s.playbackRate,selector:d.map(t=>({value:t,name:`playback-rate-${t}`,default:t===o(),html:e(t)})),onSelect(e){if(e.value)t.playbackRate=e.value,g(b,"display","none");else{const{user:e,show:o}=c.user;e().then(({expire_time:e})=>{if(Math.max(e-Date.now(),0)){m("input",b).value=t.playbackRate,g(b,"display","flex")}else o()})}return e.html},mounted:()=>{const e=u.find(`playback-rate-${o()}`);e&&u.check(e),t.on("video:ratechange",()=>{const t=u.find(`playback-rate-${o()}`);t&&u.check(t)})}}),p.update({index:10,name:"playbackRate",html:`${a.get("Play Speed")}: ${d.map(t=>`<span data-value="${t}">${e(t)}</span>`).join("")}`,click:(e,o)=>{e.show=!1;const{value:n}=o.target.dataset;if(Number(n))t.playbackRate=Number(n),g(b,"display","none");else{const{user:e,show:o}=c.user;e().then(({expire_time:e})=>{if(Math.max(e-Date.now(),0)){m("input",b).value=t.playbackRate,g(b,"display","flex")}else o()})}},mounted:e=>{const n=m(`[data-value='${o()}']`,e);n&&y(n,"art-current"),t.on("video:ratechange",()=>{const t=m(`[data-value='${o()}']`,e);t&&y(t,"art-current")})}}),t.isReady?n():t.once("ready",n),{name:"playbackRate"}},
()=>t=>{function e(t){return o(t).then(t=>function(t){const e=new Blob([t],{type:"text/plain"}),o=URL.createObjectURL(e);return o}(t))}function o(t){return new Promise((e,o)=>{const n=new FileReader;n.readAsText(t,"UTF-8"),n.onload=()=>{const o=n.result;return o.indexOf("�")>-1&&!n.markGBK?(n.markGBK=!0,n.readAsText(t,"GBK")):o.indexOf("")>-1&&!n.markBIG5?(n.markBIG5=!0,n.readAsText(t,"BIG5")):void e(o)},n.onerror=t=>{o(t)}})}function n(t){return/(\d+)?[\r\n]?(\d{0,2}:?\d{2}:\d{2}.\d{3})\s?-?->\s?(\d{0,2}:?\d{2}:\d{2}.\d{3})/.test(t)?/^WEBVTT[\r\n]/.test(t)?"vtt":"srt":/\[Script Info\]/.test(t)?/\[V4\+ Styles\]/.test(t)&&/Dialogue: .*?\d+,(\d+:\d{2}:\d{2}\.\d{2}),(\d+:\d{2}:\d{2}\.\d{2}),/.test(t)?"ass":"ssa":""}function a(){const{getUrl:t,adToken:e}=l,a=t("M3U8_SUBTITLE_SRT")+"&adToken="+encodeURIComponent(e);return fetch(a).then(t=>t.text()).then(t=>{const e=function(t){var e,o,n,a;const s=(t||"").split("\n"),i=[];try{for(e=2;e<s.length;e+=2){const t=s[e]||"";if(-1!==t.indexOf("#EXT-X-MEDIA:")){for(o=t.replace("#EXT-X-MEDIA:","").split(","),n={},a=0;a<o.length;a++){const t=o[a].split("=");n[(t[0]||"").toLowerCase().replace("-","_")]=String(t[1]).replace(/"/g,"")}n.url=s[e+1],i.push(n)}}}catch(t){}return i}(t);return Promise.all(e.map(t=>function(t,e){return fetch(t,{headers:{range:"bytes=".concat(Array.isArray(e)?e.join("-"):e||"0-"),referer:location.protocol+"//"+location.host+"/","User-Agent":"pan.baidu.com"}}).then(t=>t.ok?t.blob():Promise.reject())}(t.url).then(e=>o(e).then(e=>({...t,html:t.name,default:"YES"===t.default,type:n(e)||"srt"}))))).catch(()=>e.map(t=>({...t,html:t.name,default:"YES"===t.default,type:"srt"})))})}function s(t=[]){if(!t.length)return;if(h.cache.has("subtitle")){const e=h.cache.get("subtitle").option.selector;return t=t.concat(e),void h.update({name:"subtitle",selector:t.map(t=>({...t}))})}const e=t.find(t=>t.default)||Object.assign(t[0],{default:!0}),o={...l.subtitle.style,...u.get("subtitleStyle")},n=Object.assign({},l.subtitle,e,{style:o});f.init({...n}).then(()=>{n.name&&(c.show=`加载字幕: ${n.name}`)}),h.update({html:k(),name:"subtitle",position:"right",style:{paddingLeft:"10px",paddingRight:"10px"},selector:t.map(t=>({...t})),onSelect:t=>{const e={...l.subtitle.style,...u.get("subtitleStyle")};return f.switch(t.url,{...t,style:e}),k()}})}function i(){t.once("user",({expire_time:e})=>{if(Math.max(e-Date.now(),0)){try{const{background:e="0%"}={...u.get("subtitleStyle")};t.cssVar("--art-subtitle-background",`rgb(0 0 0 / ${e})`);document.querySelector("#artplayer-style").sheet.insertRule(".art-subtitle .art-subtitle-line {background: var(--art-subtitle-background); padding: 0 10px 2px;}")}catch(t){}t.on("subtitle",t=>u.set("subtitle",t));const e=u.get("subtitle");"boolean"==typeof e&&(f.show=e),(l.sublist||[]).length&&s(l.sublist),"function"==typeof l.getUrl&&a().then(t=>{s(t)});let o=l.id;t.on("restart",()=>{o!==l.id&&(o=l.id,t.subtitleOffset=0,f.url="",h.cache.has("subtitle")&&h.remove("subtitle"),(l.sublist||[]).length&&s(l.sublist),"function"==typeof l.getUrl&&a().then(t=>{s(t)}))})}})}const{i18n:r,option:l,notice:c,storage:u,plugins:p,setting:d,controls:h,template:m,subtitle:f,contextmenu:g,constructor:{utils:{getExt:y,query:b,append:w,isMobile:x,inverseClass:v}}}=t,k=()=>x?'<i class="art-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 48 48"><path d="M0 0h48v48H0z" fill="none"/><path fill="#ffffff" d="M40 8H8c-2.21 0-4 1.79-4 4v24c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4zM8 24h8v4H8v-4zm20 12H8v-4h20v4zm12 0h-8v-4h8v4zm0-8H20v-4h20v4z"/></svg></i>':"字幕列表",S='<label style="font-size: 0;padding: 4px;display: inline-block;"><span style="width: 20px;height: 20px;display: inline-block;border-radius: 50%;box-sizing: border-box;cursor: pointer;background: #FE9200;"></span></label>';return d.update({html:"字幕设置",name:"subtitle",tooltip:"",icon:'<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 48 48"><path d="M0 0h48v48H0z" fill="none"/><path fill="#ffffff" d="M40 8H8c-2.21 0-4 1.79-4 4v24c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4zM8 24h8v4H8v-4zm20 12H8v-4h20v4zm12 0h-8v-4h8v4zm0-8H20v-4h20v4z"/></svg>',selector:[{html:"字幕显示",name:"state",tooltip:"显示",switch:!0,onSwitch(t){const e=!t.switch,{user:o,show:n}=p.user;return o().then(({expire_time:o})=>{Math.max(o-Date.now(),0)?(f.show=e,t.tooltip=e?"显示":"隐藏"):(n(),t.tooltip="关闭",t.switch=!1)}),e},mounted(e,o){const n=f.show;o.switch=n,o.tooltip=n?"显示":"隐藏",t.on("subtitle",t=>{setTimeout(()=>{o.switch!==t&&(o.switch=t,o.tooltip=t?"显示":"隐藏")})})}},{html:"字幕偏移",name:"offset",tooltip:"0s",range:[0,-10,10,.1],onChange(e){const o=e.range[0];return t.subtitleOffset=o,o+"s"},mounted(e,o){t.on("subtitleOffset",t=>{setTimeout(()=>{o.$range.value=t,o.tooltip=t+"s"})})}},{html:"字幕背景",name:"background",tooltip:"0%",range:[0,0,100,1],onChange(e){const o=e.range[0]+"%";return t.cssVar("--art-subtitle-background",`rgb(0 0 0 / ${o})`),u.set("subtitleStyle",{...u.get("subtitleStyle"),background:o}),o},mounted(t,e){const{background:o}={...u.get("subtitleStyle")};o&&(e.tooltip=o,e.$range.value=parseFloat(o))}},{html:"字幕位置",name:"bottom",tooltip:"5%",range:[5,1,90,1],onChange(t){const e=t.range[0]+"%";return f.style({bottom:e}),u.set("subtitleStyle",{...u.get("subtitleStyle"),bottom:e}),e},mounted(t,e){const{bottom:o}={...u.get("subtitleStyle")};o&&(e.tooltip=o,e.$range.value=parseFloat(o))}},{html:"字体大小",name:"fontSize",tooltip:"25px",range:[25,10,60,1],onChange(t){const e=t.range[0]+"px";return f.style({fontSize:e}),u.set("subtitleStyle",{...u.get("subtitleStyle"),fontSize:e}),e},mounted(t,e){const{fontSize:o}={...u.get("subtitleStyle")};o&&(e.tooltip=o,e.$range.value=parseFloat(o))}},{html:"字体粗细",name:"fontWeight",tooltip:400,range:[4,1,9,1],onChange(t){const e=100*t.range[0];return f.style({fontWeight:e}),u.set("subtitleStyle",{...u.get("subtitleStyle"),fontWeight:e}),e},mounted(t,e){const{fontWeight:o}={...u.get("subtitleStyle")};o&&(e.tooltip=o,e.$range.value=o/100)}},{html:"字体颜色",name:"color",tooltip:S,selector:[{html:"预设",name:"color-presets",tooltip:'<style>.panel-setting-color label{font-size: 0;padding: 4px;display: inline-block;}.panel-setting-color input{display: none;}.panel-setting-color span{width: 22px;height: 22px;display: inline-block;border-radius: 50%;box-sizing: border-box;cursor: pointer;}</style><div class="panel-setting-color"><label><input type="radio" value="#fff"><span style="background: #fff;"></span></label><label><input type="radio" value="#e54256"><span style="background: #e54256"></span></label><label><input type="radio" value="#ffe133"><span style="background: #ffe133"></span></label><label><input type="radio" name="dplayer-danmaku-color-1" value="#64DD17"><span style="background: #64DD17"></span></label><label><input type="radio" value="#39ccff"><span style="background: #39ccff"></span></label><label><input type="radio" value="#D500F9"><span style="background: #D500F9"></span></label></div>'},{html:"默认颜色",name:"color-default",tooltip:S},{html:"颜色选择器",name:"color-picker",tooltip:S.replace("#FE9200","#000")}],onSelect(t,e,o){switch(t.name){case"color-presets":if("INPUT"===o.target.nodeName){const t=o.target.value;f.style({color:t}),u.set("subtitleStyle",{...u.get("subtitleStyle"),color:t})}break;case"color-picker":m.$colorPicker||(m.$colorPicker=w(m.$player,'<input hidden type="color">'),m.$colorPicker.oninput=e=>{const o=e.target.value;f.style({color:o}),u.set("subtitleStyle",{...u.get("subtitleStyle"),color:o}),t.tooltip=t.$parent.tooltip=S.replace("#FE9200",o)}),m.$colorPicker.click();break;default:var n="#FE9200";f.style({color:n}),u.set("subtitleStyle",{...u.get("subtitleStyle"),color:n})}return S.replace("#FE9200",m.$subtitle.style.color)},mounted(t,e){const{color:o}={...u.get("subtitleStyle")};o&&(e.tooltip=S.replace("#FE9200",o))}},{html:"字体类型",name:"fontFamily",tooltip:r.get("Default"),selector:[{html:"默认",value:""},{html:"等宽 衬线",value:'"Cascadia Code", "JetBrains Mono", "Fira Code", "Consolas", "Courier New", "Monaco", "Liberation Mono", "Nimbus Mono L", monospace'},{html:"比例 衬线",value:'"Georgia", "Times New Roman", "Times", "Noto Serif", "Liberation Serif", "PT Serif", "Cambria", serif'},{html:"等宽 无衬线",value:'"SF Mono", "Menlo", "Consolas", "DejaVu Sans Mono", "Lucida Console", "Monaco", "Cascadia Code", "Noto Sans Mono", monospace'},{html:"比例 无衬线",value:'"SF Pro Display", "Roboto", "Segoe UI", "Arial", "Helvetica", "Noto Sans", "Open Sans", "PingFang SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif'},{html:"Casual",value:'"Comic Neue", "Comic Sans MS", "Chalkboard SE", "Marker Felt", "Patrick Hand", "Indie Flower", cursive, fantasy'},{html:"Cursive",value:'"Dancing Script", "Pacifico", "Brush Script MT", "Monotype Corsiva", "Apple Chancery", "URW Chancery L", "ZCOOL KuaiLe", cursive'},{html:"Small Capitals",value:'"Marcellus SC", "Cinzel", "Alegreya SC", "Arial", "Helvetica", "Noto Sans SC", "PingFang SC", sans-serif'}],onSelect(t){const{html:e,value:o}=t;return f.style({fontFamily:o}),u.set("subtitleStyle",{...u.get("subtitleStyle"),fontFamily:o}),e},mounted(t,e){const{fontFamily:o}={...u.get("subtitleStyle")};if(o){const{selector:t}=e,n=t.find(t=>t.value===o);n&&(e.tooltip=n.html)}}},{html:"文字阴影",name:"textShadow",tooltip:r.get("Default"),selector:[{html:"默认",value:"rgb(0 0 0) 1px 0 1px, rgb(0 0 0) 0 1px 1px, rgb(0 0 0) -1px 0 1px, rgb(0 0 0) 0 -1px 1px, rgb(0 0 0) 1px 1px 1px, rgb(0 0 0) -1px -1px 1px, rgb(0 0 0) 1px -1px 1px, rgb(0 0 0) -1px 1px 1px"},{html:"重墨",value:"rgb(0, 0, 0) 1px 0px 1px, rgb(0, 0, 0) 0px 1px 1px, rgb(0, 0, 0) 0px -1px 1px, rgb(0, 0, 0) -1px 0px 1px"},{html:"描边",value:"rgb(0, 0, 0) 0px 0px 1px, rgb(0, 0, 0) 0px 0px 1px, rgb(0, 0, 0) 0px 0px 1px"},{html:"45°投影",value:"rgb(0, 0, 0) 1px 1px 2px, rgb(0, 0, 0) 0px 0px 1px"},{html:"阴影",value:"rgb(34, 34, 34) 1px 1px 1.4875px, rgb(34, 34, 34) 1px 1px 1.98333px, rgb(34, 34, 34) 1px 1px 2.47917px"},{html:"凸起",value:"rgb(34, 34, 34) 1px 1px"},{html:"下沉",value:"rgb(204, 204, 204) 1px 1px, rgb(34, 34, 34) -1px -1px"},{html:"边框",value:"rgb(34, 34, 34) 0px 0px 1px, rgb(34, 34, 34) 0px 0px 1px, rgb(34, 34, 34) 0px 0px 1px, rgb(34, 34, 34) 0px 0px 1px, rgb(34, 34, 34) 0px 0px 1px"}],onSelect(t){const{html:e,value:o}=t;return f.style({textShadow:o}),u.set("subtitleStyle",{...u.get("subtitleStyle"),textShadow:o}),e},mounted(t,e){const{textShadow:o}={...u.get("subtitleStyle")};if(o){const{selector:t}=e,n=t.find(t=>t.value===o);n&&(e.tooltip=n.html)}}},{html:"加载字幕",name:"loadSubtitles",selector:[{html:"本地文件",name:"file",tooltip:"",onClick:()=>{const{user:t,show:o}=p.user;return t().then(({expire_time:t})=>{var n;Math.max(t-Date.now(),0)?(m.$file.click(),(n=m.$file,new Promise(t=>{n.onchange=o=>{if(o.target.files.length){const n=[...o.target.files].map(t=>{const{name:o}=t,n=y(o).toLowerCase();if(["webvtt","vtt","srt","ssa","ass","smi"].includes(n))return e(t).then(t=>({url:t,type:n,name:o,html:`本地字幕「${n}」`}))}).filter(Boolean);Promise.all(n).then(e=>{t(e)})}o.target.value=""}})).then(t=>s(t))):o()}),""},mounted:()=>{m.$file||(m.$file=w(m.$container,'<input type="file" accept=".webvtt,.vtt,.srt,.ssa,.ass" style="display: none;">'))}}]}]}),g.update({name:"subtitle",index:31,html:`字幕显示: ${[1,0].map(t=>`<span data-value="${t}">${t?"显示":"隐藏"}</span>`).join("")}`,click:(t,e)=>{const{user:o,show:n}=p.user;o().then(({expire_time:t})=>{if(Math.max(t-Date.now(),0)){v(e.target,"art-current");const{value:t}=e.target.dataset;f.show=Boolean(Number(t))}else n()}),t.show=!1},mounted:e=>{const o=b(`[data-value='${Number(f.show)}']`,e);o&&v(o,"art-current"),t.on("subtitle",t=>{const o=b(`[data-value='${Number(t)}']`,e);o&&v(o,"art-current")})}}),t.isReady?i():t.once("ready",i),{name:"subtitle"}},
()=>t=>{function e(t){o().then(e=>{e.setEnabled(t)})}async function o(){if(t.joySound)return t.joySound;const e=window.Joysound||unsafeWindow.Joysound;if(!e)throw new Error("Not Joysound");if(e.isSupport()){const o=t.joySound=new e;return o.hasSource()||o.init(c),o}}function n(){t.joySound&&t.joySound.destroy()}function a(){t.once("user",({expire_time:o})=>{if(Math.max(o-Date.now(),0)){const o=i.get("joysound");"boolean"==typeof o&&o&&e(o),t.on("destroy",n)}else i.del("joysound")})}const{notice:s,storage:i,plugins:r,setting:l,template:{$video:c}}=t;return l.update({html:"声音设置",name:"joysound",tooltip:"",selector:[{html:"音质增强",name:"high",tooltip:"关闭",switch:!1,onSwitch:t=>{const o=!t.switch,{user:n,show:a}=r.user;return n().then(({expire_time:n})=>{Math.max(n-Date.now(),0)?(e(o),t.tooltip=o?"开启":"关闭",i.set("joysound",o),s.show=`音质增强: ${t.tooltip}`):(a(),t.tooltip="关闭",t.switch=!1)}),o},mounted:(t,e)=>{i.get("joysound")&&(e.tooltip="增强",e.switch=!0)}},{html:"音量增强",name:"volume",tooltip:"0x",range:[0,0,5,.1],onRange:t=>{const e=t.range[0],{user:n,show:a}=r.user;return n().then(({expire_time:t})=>{Math.max(t-Date.now(),0)?(!function(t){o().then(e=>{e.setVolume(t)})}(e),s.show=`音量增强: ${Math.round(100*e)}%`):a()}),Math.round(100*e)/100+"x"}}]}),t.playing?a():t.once("video:playing",a),{name:"sound"}},
()=>t=>{function e(){t.once("user",({expire_time:t})=>{Math.max(t-Date.now(),0)&&r()})}const{notice:o,storage:n,plugins:a,setting:s,template:{$video:{style:i}}}=t,r=()=>{const{brightness:t=1,contrast:e=1,saturate:o=1}={...n.get("filter")};i.filter=1!==t||1!==e||1!==o?`brightness(${t}) contrast(${e}) saturate(${o})`:""};return s.update({html:"色彩滤镜",name:"filter",tooltip:"",selector:[{html:"亮度",name:"brightness",tooltip:100,range:[100,0,255,1],onChange:t=>{const e=t.range[0],{user:s,show:i}=a.user;return s().then(({expire_time:t})=>{Math.max(t-Date.now(),0)?(n.set("filter",{...n.get("filter"),brightness:e/100}),r(),o.show=`亮度: ${e}`):i()}),e},mounted:(t,e)=>{const{brightness:o=1}={...n.get("filter")},a=Math.trunc(100*o);e.$range.value=a,e.tooltip=a}},{html:"对比度",name:"contrast",tooltip:100,range:[100,0,255,1],onChange:t=>{const e=t.range[0],{user:s,show:i}=a.user;return s().then(({expire_time:t})=>{Math.max(t-Date.now(),0)?(n.set("filter",{...n.get("filter"),contrast:e/100}),r(),o.show=`对比度: ${e}`):i()}),e},mounted:(t,e)=>{const{contrast:o=1}={...n.get("filter")},a=Math.trunc(100*o);e.$range.value=a,e.tooltip=a}},{html:"饱和度",name:"saturate",tooltip:100,range:[100,0,255,1],onChange:t=>{const e=t.range[0],{user:s,show:i}=a.user;return s().then(({expire_time:t})=>{Math.max(t-Date.now(),0)?(n.set("filter",{...n.get("filter"),saturate:e/100}),r(),o.show=`饱和度: ${e}`):i()}),e},mounted:(t,e)=>{const{saturate:o=1}={...n.get("filter")},a=Math.trunc(100*o);e.$range.value=a,e.tooltip=a}},{html:"默认",tooltip:"",values:[1,1,1]},{html:"护眼",tooltip:"",values:[.7,.85,.85]},{html:"柔和",tooltip:"",values:[1.05,.85,.75]},{html:"清晰",tooltip:"",values:[1.1,1.05,1.01]},{html:"明亮",tooltip:"",values:[1.2,1,1.1]},{html:"高对比",tooltip:"",values:[1,1.5,1]},{html:"黑白",tooltip:"",values:[1,1.1,0]}],onSelect:t=>{const{user:e,show:o}=a.user;return e().then(({expire_time:e})=>{if(Math.max(e-Date.now(),0)){const e=t.values;["brightness","contrast","saturate"].forEach((t,o)=>{const n=s.find(t),a=Math.trunc(100*e[o]);n.tooltip=a,n.$range.value=a}),n.set("filter",{brightness:e[0],contrast:e[1],saturate:e[2]}),r()}else o()}),t.html}}),t.isReady?e():t.once("ready",e),{name:"filter"}},
()=>t=>{const{notice:e,storage:o,setting:n,plugins:a,controls:s}=t,i=(function(t){function e(){t.once("user",({expire_time:e})=>{Math.max(e-Date.now(),0)&&(o(s,"pointerdown",m),t.on("document:pointermove",g),t.on("document:pointerup",f),t.on("document:pointercancel",f))})}const{proxy:o,storage:n,template:{$player:a,$video:s},constructor:{FAST_FORWARD_VALUE:i,FAST_FORWARD_TIME:r,utils:{addClass:l,removeClass:c,hasClass:u}}}=t;let p=null,d=!1,h=1;const m=e=>{const{state:o,playbackRate:s=i}={...n.get("fastForward")};o&&("touch"!==e.pointerType||e.isPrimary)&&("mouse"===e.pointerType&&0!==e.button||t.playing&&!t.isLock&&(p=setTimeout(()=>{d=!0,h=t.playbackRate,t.playbackRate=s,l(a,"art-fast-forward")},r)))},f=()=>{clearTimeout(p),d&&(d=!1,t.playbackRate=h,c(a,"art-fast-forward"),setTimeout(()=>t.play()))},g=t=>{"touch"===t.pointerType&&f()};t.isReady?e():t.once("ready",e)}(t),function(t){function e(){t.once("user",({expire_time:e})=>{if(Math.max(e-Date.now(),0)){let e=!1;[d,h].forEach(n=>{o(n,"pointerenter",()=>{e=!0}),o(n,"pointerleave",()=>{e=!1}),o(n,"pointerdown",()=>{n.style.color=t.theme,n.style.backdropFilter="blur(6px)",n.style.transform="translateY(-50%) scale(0.85)"}),o(n,"pointerup",()=>{n.style.color=p.color,n.style.backdropFilter="",n.style.transform="translateY(-50%) scale(1)"}),o(n,"pointercancel",()=>{n.style.color=p.color,n.style.backdropFilter="",n.style.transform="translateY(-50%) scale(1)"})}),t.on("control",r(t=>{const{state:o}={...a.get("fastSeek")};o&&(t?m():e||f())},s/3))}})}const{proxy:o,layers:n,storage:a,constructor:{CONTROL_HIDE_TIME:s,utils:{isMobile:i,throttle:r}}}=t,{state:l,backward:c=15,forward:u=15}={...a.get("fastSeek")},p={position:"absolute",top:"50%",transform:"translateY(-50%) scale(1)",borderRadius:"50%",color:"#fff",display:"none",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"transform 0.15s ease, backdrop-filter 0.15s ease",userSelect:"none",pointerEvents:"auto",WebkitTapHighlightColor:"transparent",touchAction:"none"},d=n.update({name:"backward",html:`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" aria-hidden="true" viewBox="0 0 64 64"><path d="M52 32a20 20 0 0 0-20-20 20 20 0 0 0-14.14 5.86L16 12v8h8l-2.93-2.93A14 14 0 0 1 32 18a14 14 0 0 1 14 14 14 14 0 0 1-14 14 14 14 0 0 1-9.93-4.07L20 42.93A20 20 0 0 0 52 32z"></path><text x="32" y="37" text-anchor="middle" dominant-baseline="middle" fill="currentColor" font-size="18" font-weight="600" font-family="system-ui, -apple-system, sans-serif">${c}</text></svg>`,style:{...p,left:"25%"},click:()=>{const{backward:e=15}={...a.get("fastSeek")};t.backward=e},mounted:()=>{}}),h=n.update({name:"forward",html:`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" aria-hidden="true" viewBox="0 0 64 64"><path d="M12 32a20 20 0 0 1 20-20 20 20 0 0 1 14.14 5.86L48 12v8h-8l2.93-2.93A14 14 0 0 0 32 18a14 14 0 0 0-14 14 14 14 0 0 0 14 14 14 14 0 0 0 9.93-4.07L44 42.93A20 20 0 0 1 12 32z"></path><text x="32" y="37" text-anchor="middle" dominant-baseline="middle" fill="currentColor" font-size="18" font-weight="600" font-family="system-ui, -apple-system, sans-serif">${u}</text></svg>`,style:{...p,right:"25%"},click:()=>{const{forward:e=15}={...a.get("fastSeek")};t.forward=e},mounted:()=>{}}),m=()=>{d.style.display="flex",h.style.display="flex"},f=()=>{d.style.display="none",h.style.display="none"};return t.isReady?e():t.once("ready",e),{name:"fastSeek",show:m,hide:f,updateBackward:t=>{d.querySelector("svg > text").innerHTML=t},updateForward:t=>{h.querySelector("svg > text").innerHTML=t}}}(t)),r=function(t){function e(){t.on("video:timeupdate",s)}function n(){t.once("user",({expire_time:t})=>{if(Math.max(t-Date.now(),0)){const{state:t}={...o.get("fastSkip")};t&&e()}})}const{constructor:{utils:{throttle:a}}}=t,s=a(()=>{const{start:e,end:n}={...o.get("fastSkip")};if(e<=0&&n<=0)return;const{currentTime:a,duration:s}=t;if(!s||s<=0||s<=e||s<=n)return;const i=[];e>0&&i.push([0,Math.min(e,s)]),n>0&&n<s&&i.push([s-n,s]);for(const[e,o]of i)if(a>=e&&a<o){t.seek=o;break}},500);return t.isReady?n():t.once("ready",n),{name:"fastSkip",open:e,close:function(){t.off("video:timeupdate",s)}}}(t),l=function(t){function e(){t.on("video:ended",s)}function n(){t.once("user",({expire_time:t})=>{if(Math.max(t-Date.now(),0)){o.get("autoNext")&&e()}})}const s=()=>{const t=a.playlist;t&&t.next()};return t.isReady?n():t.once("ready",n),{name:"autoNext",open:e,close:function(){t.off("video:ended",s)}}}(t),c=function(t){function e(){if(l.cache.has("prev")||l.cache.has("next"))return;const t=!(c||[]).length;l.update({html:'<i class="art-icon art-icon-prev" style="display: flex;"><svg fill="none" stroke-width="2" xmlns="http://www.w3.org/2000/svg" height="22" width="22" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M20.341 4.247l-8 7a1 1 0 0 0 0 1.506l8 7c.647 .565 1.659 .106 1.659 -.753v-14c0 -.86 -1.012 -1.318 -1.659 -.753z" stroke-width="0" fill="currentColor"></path><path d="M9.341 4.247l-8 7a1 1 0 0 0 0 1.506l8 7c.647 .565 1.659 .106 1.659 -.753v-14c0 -.86 -1.012 -1.318 -1.659 -.753z" stroke-width="0" fill="currentColor"></path></svg></i>',name:"prev",index:9,position:"left",tooltip:"上一集",disable:t,click:()=>{const t=a.playlist;t&&t.prev()}}),l.update({html:'<i class="art-icon art-icon-next" style="display: flex;"><svg fill="none" stroke-width="2" xmlns="http://www.w3.org/2000/svg" height="22" width="22" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M2 5v14c0 .86 1.012 1.318 1.659 .753l8 -7a1 1 0 0 0 0 -1.506l-8 -7c-.647 -.565 -1.659 -.106 -1.659 .753z" stroke-width="0" fill="currentColor"></path><path d="M13 5v14c0 .86 1.012 1.318 1.659 .753l8 -7a1 1 0 0 0 0 -1.506l-8 -7c-.647 -.565 -1.659 -.106 -1.659 .753z" stroke-width="0" fill="currentColor"></path></svg></i>',name:"next",index:11,position:"left",tooltip:"下一集",disable:t,click:()=>{const t=a.playlist;t&&t.next()}})}function o(){t.once("user",({expire_time:t})=>{if(Math.max(t-Date.now(),0)){r.get("prevAndNext")&&e()}})}const{i18n:n,notice:s,option:i,storage:r,controls:l}=t,{filelist:c}=i;return t.isReady?o():t.once("ready",o),{name:"prevAndNext",update:e,remove:function(){l.cache.has("prev")&&l.remove("prev"),l.cache.has("next")&&l.remove("next")}}}(t);!function(t){function e(){t.once("user",({expire_time:e})=>{if(Math.max(e-Date.now(),0)){o.get("autoFullscreen")&&(t.fullscreenWeb=!0)}})}t.isReady?e():t.once("ready",e)}(t);return n.update({html:"快捷控制",name:"quick",icon:"",tooltip:"",selector:[{html:"长按倍速",name:"fastForward",icon:"",tooltip:"",selector:[{html:"状态",name:"",icon:"",tooltip:"关闭",switch:!1,onSwitch:t=>{const e=!t.switch,{user:n,show:s}=a.user;return n().then(({expire_time:n})=>{Math.max(n-Date.now(),0)?(o.set("fastForward",{...o.get("fastForward"),state:e}),t.tooltip=e?"开启":"关闭"):(s(),t.tooltip="关闭",t.switch=!1)}),e},mounted:(t,e)=>{const{state:n}={...o.get("fastForward")};n&&(e.tooltip="开启",e.switch=!0)}},{html:"播放速度",name:"",icon:"",tooltip:"3x",range:[3,2,6,.5],onChange(t){const e=t.range[0];return o.set("fastForward",{...o.get("fastForward"),playbackRate:e}),e+"x"},mounted:(t,e)=>{const{playbackRate:n}={...o.get("fastForward")};n&&(e.$range.value=n,e.tooltip=n+"x")}}]},{html:"快进快退",name:"fastSeek",icon:"",tooltip:"",selector:[{html:"状态",name:"",icon:"",tooltip:"关闭",switch:!1,onSwitch:t=>{const e=!t.switch,{user:n,show:s}=a.user;return n().then(({expire_time:n})=>{Math.max(n-Date.now(),0)?(o.set("fastSeek",{...o.get("fastSeek"),state:e}),e?(i.show(),t.tooltip="开启"):(i.hide(),t.tooltip="关闭")):(s(),t.tooltip="关闭",t.switch=!1)}),e},mounted:(t,e)=>{const{state:n}={...o.get("fastSeek")};n&&(e.tooltip="开启",e.switch=!0)}},{html:"快退时间",name:"backward",tooltip:"15s",range:[15,10,90,1],onChange(t){const e=t.range[0];return o.set("fastSeek",{...o.get("fastSeek"),backward:e}),i.updateBackward(e),e+"s"},mounted:(t,e)=>{const{backward:n}={...o.get("fastSeek")};n&&(e.$range.value=n,e.tooltip=n+"s")}},{html:"快进时间",name:"forward",tooltip:"15s",range:[15,10,90,1],onChange(t){const e=t.range[0];return o.set("fastSeek",{...o.get("fastSeek"),forward:e}),i.updateForward(e),e+"s"},mounted:(t,e)=>{const{forward:n}={...o.get("fastSeek")};n&&(e.$range.value=n,e.tooltip=n+"s")}}]},{html:"片头片尾",name:"fastSkip",tooltip:"",selector:[{html:"状态",name:"",icon:"",tooltip:"关闭",switch:!1,onSwitch:t=>{const e=!t.switch,{user:n,show:s}=a.user;return n().then(({expire_time:n})=>{Math.max(n-Date.now(),0)?(o.set("fastSkip",{...o.get("fastSkip"),state:e}),e?(r.open(),t.tooltip="开启"):(r.close(),t.tooltip="关闭")):(s(),t.tooltip="关闭",t.switch=!1)}),e},mounted:(t,e)=>{const{state:n}={...o.get("fastSkip")};n&&(e.tooltip="开启",e.switch=!0)}},{html:"跳过片头",name:"start",tooltip:"0s",range:[0,0,120,1],onChange(t){const e=t.range[0];return o.set("fastSkip",{...o.get("fastSkip"),start:e}),e+"s"},mounted:(t,e)=>{const{start:n}={...o.get("fastSkip")};n&&(e.tooltip=n+"s",e.$range.value=n)}},{html:"跳过片尾",name:"end",tooltip:"0s",range:[0,0,120,1],onChange(t){const e=t.range[0];return o.set("fastSkip",{...o.get("fastSkip"),end:e}),e+"s"},mounted:(t,e)=>{const{end:n}={...o.get("fastSkip")};n&&(e.tooltip=n+"s",e.$range.value=n)}}]},{html:"自动连播",name:"autoNext",icon:"",tooltip:"关闭",switch:!1,onSwitch:t=>{const e=!t.switch,{user:n,show:s}=a.user;return n().then(({expire_time:n})=>{Math.max(n-Date.now(),0)?(o.set("autoNext",e),e?(t.tooltip="开启",l.open()):(t.tooltip="关闭",l.close())):(s(),t.tooltip="关闭",t.switch=!1)}),e},mounted:(t,e)=>{o.get("autoNext")&&(e.tooltip="开启",e.switch=!0)}},{html:"上集下集",name:"prevAndNext",icon:"",tooltip:"关闭",switch:!1,onSwitch:t=>{const e=!t.switch,{user:n,show:s}=a.user;return n().then(({expire_time:n})=>{Math.max(n-Date.now(),0)?(o.set("prevAndNext",e),e?(t.tooltip="开启",c.update()):(t.tooltip="关闭",c.remove())):(s(),t.tooltip="关闭",t.switch=!1)}),e},mounted:(t,e)=>{o.get("prevAndNext")&&(e.switch=!0,e.tooltip="开启")}},{html:"自动全屏",name:"autoFullscreen",icon:"",tooltip:"关闭",switch:!1,onSwitch:e=>{const n=!e.switch,{user:s,show:i}=a.user;return s().then(({expire_time:a})=>{Math.max(a-Date.now(),0)?(t.fullscreenWeb=n,o.set("autoFullscreen",n),e.tooltip=n?"开启":"关闭"):(i(),e.tooltip="关闭",e.switch=!1)}),n},mounted:(t,e)=>{o.get("autoFullscreen")&&(e.tooltip="开启",e.switch=!0)}}]}),{name:"quick"}},
()=>t=>{function e(){t.once("user",({expire_time:e})=>{Math.max(e-Date.now(),0)&&(o.hotkey&&!n&&(t.isFocus||(t.isFocus=!0)),t.on("blur",()=>{o.hotkey&&!n&&(t.isFocus=!0)}))})}const{option:o,constructor:{utils:{isMobile:n}}}=t;return t.isReady?e():t.once("ready",e),{name:"hotkey"}},
()=>t=>{function e(){t.once("user",({expire_time:e})=>{Math.max(e-Date.now(),0)&&function(){if(u)return;const{hls:e}=t;if(e){const t=c(i,'<div class="art-info-item"><div class="art-info-title">Hls bandwidth:</div><div class="art-info-content">NaN</div></div>'),s=l(".art-info-content",t);n(a.info,"click",function t(){if(o.show){const o=e.bandwidthEstimate,n="number"==typeof o?`${(o/1024/1024/8).toFixed(4)} MBps/s`:o;s.innerText!==n&&(s.innerText=n),setTimeout(t,r)}})}}()})}const{info:o,proxy:n,contextmenu:a,template:{$video:s,$infoPanel:i},constructor:{INFO_LOOP_TIME:r,utils:{query:l,append:c,isMobile:u}}}=t;return t.isReady?e():t.once("ready",e),{name:"info"}}
]);

;(function() {
    'use strict';

    var obj = {
        video_page: {}
    };

    obj.sharevideo = function () {
        if (/(链接|页面)不存在/.test(document.title)) return;
        if (unsafeWindow.SHAREPAGETYPE === 'multi_file') {
            const getCurrentList = () => {
                try {
                    return unsafeWindow.require('system-core:context/context.js').instanceForSystem.list.getCurrentList();
                } catch (error) {
                    return unsafeWindow.locals.get('file_list');
                }
            };
            unsafeWindow.$ && unsafeWindow.$(document).on('click', '#shareqr .file-name .filename', function () {
                const index = unsafeWindow.$(this).parent().parent().parent().index();
                const file_list = getCurrentList();
                const file = file_list[index];
                if (file && file.category == 1) {
                    const ext = file.server_filename.split('.').pop().toLowerCase();
                    if (['ts', '3gp2','3g2','3gpp','amv','divx','dpg','f4v','m2t','m2ts','m2v','mpe','mpeg','mts','vob','webm','wxp','wxv','vob'].includes(ext)) {
                        window.open(location.protocol + '//' + location.host + location.pathname + '?fid=' + file.fs_id, '_blank');
                    }
                }
            });
        }
        else if (unsafeWindow.SHAREPAGETYPE === 'single_file_page') {
            unsafeWindow.locals.get('file_list', 'share_uk', 'shareid', 'sign', 'timestamp', (file_list, share_uk, shareid, sign, timestamp) => {
                const [ file ] = file_list
                , { category, fs_id, resolution, thumbs } = file;
                if (category !== 1) return;
                obj.startObj().then((obj) => {
                    obj.video_page.flag = 'sharevideo';
                    const videoList = (() => {
                        if (!unsafeWindow.opener) return [];
                        try {
                            return unsafeWindow.opener.require('system-core:context/context.js').instanceForSystem.list.getCurrentList();
                        } catch (error) {
                            return unsafeWindow.opener.locals.get('file_list');
                        }
                    })()
                    ,vip = obj.getVip()
                    , getUrl = (type) => {
                        return '/share/streaming?'.concat(Object.entries({
                            type, uk: share_uk, shareid, sign, timestamp, fid: fs_id, vip, jsToken: unsafeWindow.jsToken
                        }).map(([ key, value ]) => `${key}=${value}`).join('&'));
                    };
                    obj.getAdToken(getUrl).then((adToken) => {
                        obj.initVideoPlayer({
                            adToken,
                            file,
                            filelist: videoList.map((item) => {
                                const { fs_id, server_filename } = item;
                                return item.category == 1 && {
                                    id: '' + fs_id,
                                    name: server_filename,
                                    default: fs_id == file.fs_id,
                                    change: () => {
                                        location.href = location.protocol + '//' + location.host + location.pathname + '?fid=' + fs_id;
                                    }
                                };
                            }).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })),
                            id: '' + fs_id,
                            getUrl,
                            poster: (Object.values(thumbs).slice(-1)[0] || '').replace(/size=c\d+_u\d+/, 'size=c850_u580'),
                            quality: obj.buildQuality(getUrl, resolution, adToken)
                        });
                    });
                });
            });
        }
    };

    obj.playvideo = function () {
        window.onhashchange = () => {
            location.reload();
        };
        let videoList = [];
        unsafeWindow.jQuery(document).ajaxComplete((event, xhr, options) => {
            let response, requestUrl = options.url;
            if (requestUrl.indexOf('/api/categorylist') >= 0) {
                response = xhr.responseJSON;
                videoList = response.info || [];
            }
            else if (requestUrl.indexOf('/api/filemetas') >= 0) {
                response = xhr.responseJSON;
                if (!(response && response.info)) return;
                const [ file ] = response.info
                , { fs_id, path, resolution, thumbs } = file;
                obj.startObj().then((obj) => {
                    obj.video_page.flag = 'playvideo';
                    const vip = obj.getVip()
                    , getUrl = (type) => {
                        if (type.includes(1080)) vip > 1 || (type = type.replace(1080, 720));
                        return '/api/streaming?'.concat(Object.entries({
                            type, path: encodeURIComponent(path), vip, jsToken: unsafeWindow.jsToken
                        }).map(([ key, value ]) => `${key}=${value}`).join('&'));
                    };
                    obj.getAdToken(getUrl).then((adToken) => {
                        obj.initVideoPlayer({
                            adToken,
                            file,
                            filelist: videoList.map((item) => {
                                const { fs_id, path, server_filename } = item;
                                return {
                                    id: '' + fs_id,
                                    name: server_filename,
                                    default: fs_id == file.fs_id,
                                    change: () => {
                                        location.href = location.protocol + '//' + location.host + location.pathname + '#/video?path=' + encodeURIComponent(path);
                                    }
                                };
                            }).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })),
                            id: '' + fs_id,
                            getUrl,
                            poster: (Object.values(thumbs).slice(-1)[0] || '').replace(/size=c\d+_u\d+/, 'size=c850_u580'),
                            quality: obj.buildQuality(getUrl, resolution, adToken)
                        });
                    });
                });
            }
        });
    };

    obj.video = function () {
        try {
            const { $pinia, $router } = document.querySelector('#app').__vue_app__.config.globalProperties;
            const { videoinfo, recommendListInfo } = $pinia.state.value;
            if (videoinfo.videoinfo) {
                const file = { ...videoinfo.videoinfo }
                , { fs_id, path, resolution, thumbs } = file;
                obj.startObj().then((obj) => {
                    obj.video_page.flag = 'video';
                    const vip = obj.getVip()
                    , getUrl = (type) => {
                        if (type.includes(1080)) vip > 1 || (type = type.replace(1080, 720));
                        return '/api/streaming?'.concat(Object.entries({
                            type, path: encodeURIComponent(path), vip, jsToken: unsafeWindow.jsToken
                        }).map(([ key, value ]) => `${key}=${value}`).join('&'));
                    };
                    obj.getAdToken(getUrl).then((adToken) => {
                        obj.initVideoPlayer({
                            adToken,
                            file,
                            filelist: [...recommendListInfo.selectionVideoList].map((item) => {
                                const { fs_id, path, server_filename: name } = item;
                                return {
                                    id: '' + fs_id,
                                    name,
                                    default: fs_id == file.fs_id,
                                    change: () => {
                                        location.href = location.protocol + '//' + location.host + location.pathname + '?path=' + encodeURIComponent(path);
                                    }
                                };
                            }).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })),
                            id: '' + fs_id,
                            getUrl,
                            poster: (Object.values(thumbs).slice(-1)[0] || '').replace(/size=c\d+_u\d+/, 'size=c850_u580'),
                            quality: obj.buildQuality(getUrl, resolution, adToken)
                        });
                    });
                });
            }
            else {
                setTimeout(obj.video, 1e3);
                return;
            }
            $router.isReady().then(() => {
                $router.afterEach((to, from) => {
                    from.fullPath === '/' || from.fullPath === to.fullPath || location.reload();
                });
            });
        }
        catch (error) {
            setTimeout(obj.video, 1e3);
        }
    };

    obj.mboxvideo = function () {
        try {
            const { $pinia, $router } = document.querySelector('#app').__vue_app__.config.globalProperties;
            const { videoinfo, recommendListInfo } = $pinia.state.value;
            if (videoinfo.videoinfo) {
                const file = { ...videoinfo.videoinfo }
                , { adToken = '', resolution, thumbs, from_uk, to, msg_id, fs_id, type } = file;
                obj.startObj().then(async (obj) => {
                    obj.video_page.flag = 'mboxvideo';
                    const vip = obj.getVip()
                    , getUrl = (stream_type) => {
                        return '/mbox/msg/streaming?'.concat(Object.entries({
                            stream_type, from_uk, to, msg_id, fs_id, type, vip
                        }).map(([ key, value ]) => `${key}=${value}`).join('&'));
                    };
                    window.localforage.config({
                        name        : 'wpMboxVideoDB',
                        storeName   : 'selectionList',
                    });
                    let videoList = [];
                    await window.localforage.iterate((value) => {
                        const { list } = value;
                        if (list.some(item => item.fs_id == fs_id)) {
                            return list;
                        }
                    }).then((list) => {
                        if (list) {
                            videoList = list;
                        }
                    });
                    obj.initVideoPlayer({
                        adToken,
                        file,
                        filelist: videoList.map((item) => {
                            const { from_uk, fs_id, group_id, md5, msg_id, name, path } = item;
                            return {
                                ...item,
                                id: '' + fs_id,
                                default: fs_id == file.fs_id,
                                change: () => {
                                    const params = new URLSearchParams(location.search);
                                    Object.entries({
                                        from_uk, fs_id, group_id, md5, msg_id, name, path
                                    }).forEach(([ key, value ]) => params.set(key, value));
                                    location.href = location.protocol + '//' + location.host + location.pathname + '?' + params.toString();
                                }
                            };
                        }).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })),
                        id: '' + fs_id,
                        getUrl,
                        poster: (Object.values(thumbs).slice(-1)[0] || '').replace(/size=c\d+_u\d+/, 'size=c850_u580'),
                        quality: obj.buildQuality(getUrl, resolution, adToken)
                    });
                });
            }
            else {
                setTimeout(obj.mboxvideo, 1e3);
                return;
            }
            $router.isReady().then(() => {
                $router.afterEach((to, from) => {
                    from.fullPath === '/' || from.fullPath === to.fullPath || location.reload();
                });
            });
        }
        catch (error) {
            setTimeout(obj.mboxvideo, 1e3);
        }
    };

    obj.videoView = function () {
        try {
            const { videoFile } = document.querySelector('.preview-video').__vue__;
            if (videoFile) {
                const file = videoFile
                , { fs_id, path, resolution, thumbs } = file;
                obj.startObj().then((obj) => {
                    obj.video_page.flag = 'videoView';
                    const vip = obj.getVip()
                    , getUrl = (type) => {
                        if (type.includes(1080)) vip > 1 || (type = type.replace(1080, 720));
                        return '/rest/2.0/xpan/file?'.concat(Object.entries({
                            type, method: 'streaming', path: encodeURIComponent(path), vip
                        }).map(([ key, value ]) => `${key}=${value}`).join('&')
                                                            );
                    };
                    obj.getAdToken(getUrl).then((adToken) => {
                        obj.initVideoPlayer({
                            adToken,
                            file,
                            id: '' + fs_id,
                            getUrl,
                            poster: (Object.values(thumbs).slice(-1)[0] || '').replace(/size=c\d+_u\d+/, 'size=c850_u580'),
                            quality: obj.buildQuality(getUrl, resolution, adToken)
                        });
                    });
                });
            }
            else {
                setTimeout(obj.videoView, 1e3);
            }
        }
        catch (error) {
            setTimeout(obj.videoView, 1e3);
        }
    };

    obj.getVip = function () {
        if (unsafeWindow.yunData && !unsafeWindow.yunData.neglect) {
            return 1 === unsafeWindow.yunData.ISSVIP ? 2 : 1 === unsafeWindow.yunData.ISVIP ? 1 : 0;
        }
        if (unsafeWindow.locals) {
            let is_svip = false, is_vip = false;
            if (unsafeWindow.locals.get) {
                is_svip = 1 === +unsafeWindow.locals.get('is_svip');
                is_vip = 1 === +unsafeWindow.locals.get('is_vip');
                return is_svip ? 2 : is_vip ? 1 : 0;
            }
            is_svip = 1 === +unsafeWindow.locals.is_svip;
            is_vip = 1 === +unsafeWindow.locals.is_vip;
            return is_svip ? 2 : is_vip ? 1 : 0;
        }
        return 0;
    };

    obj.getAdToken = function (getUrl) {
        if (obj.getVip() > 1) {
            return Promise.resolve('');
        }
        return fetch(getUrl('M3U8_AUTO_480')).then((result) => result.text()).then((result) => {
            try {
                result = JSON.parse(result);
            } catch (e) { }
            if (result && 133 === result.errno && 0 !== result.adTime) {
                return result.adToken;
            }
            return '';
        });
    };

    obj.buildQuality = function (getUrl, resolution, adToken) {
        const freeList = ((e) => {
            e = e || '';
            const t = [480, 360]
            , a = e.match(/width:(\d+),height:(\d+)/) || ['', '', '']
            , i = +a[1] * +a[2];
            return i ? (i > 409920 && t.unshift(720), i > 921600 && t.unshift(1080), t) : t;
        })(resolution)
        , templates = {
            1080: '超清 1080P',
            720: '高清 720P',
            480: '流畅 480P',
            360: '省流 360P'
        };
        return freeList.map((template) => {
            return {
                html: templates[template],
                url: getUrl('M3U8_AUTO_' + template) + '&adToken=' + encodeURIComponent(adToken),
                type: 'hls'
            };
        });
    };

    obj.initVideoPlayer = function (options) {
        if (!obj.replaceVideoPlayer()) return;
        window.artPlugins.init(options);
    };

    obj.replaceVideoPlayer = function () {
        const videoWrap = document.getElementById('video-wrap') || document.querySelector('.vp-video__player, .video-content');
        if (!videoWrap) return false;
        while (videoWrap.nextSibling) {
            videoWrap.parentNode.removeChild(videoWrap.nextSibling);
        }
        const artplayer = document.getElementById('artplayer');
        if (artplayer) return true;
        const container = document.createElement('div');
        container.setAttribute('id', 'artplayer');
        const newWrap = videoWrap.parentNode.replaceChild(container, videoWrap);
        container.parentNode.style.cssText += 'z-index: auto;';
        const { flag } = obj.video_page;
        if ([ 'videoView' ].includes(flag)) {
            container.setAttribute('style', 'width: 100%; height: 3.75rem;');
            return true;
        }
        container.setAttribute('style', 'width: 100%; height: 100%;');
        if (unsafeWindow.require && unsafeWindow.require.async) {
            unsafeWindow.require.async('file-widget-1:videoPlay/context.js', (data) => {
                let waitCount, waitId = waitCount = setInterval(() => {
                    const { playerInstance } = data.getContext() || {};
                    if (playerInstance && playerInstance.player) {
                        clearInterval(waitId);
                        playerInstance.player.dispose();
                        playerInstance.player = !1;
                    }
                    else if (++waitCount - waitId > 60) {
                        clearInterval(waitId);
                    }
                }, 500);
            });
        }
        else {
            let waitCount, waitId = waitCount = setInterval(() => {
                const { firstChild: playerInstance } = newWrap;
                if (playerInstance && playerInstance.player) {
                    clearInterval(waitId);
                    playerInstance.player.dispose();
                    playerInstance.player = !1;
                }
                else if (++waitCount - waitId > 60) {
                    clearInterval(waitId);
                }
            }, 500);
        }
        return true;
    };

    obj.startObj = function () {
        return Promise.resolve(GM_info).then((info) => {
            if (info) {
                const { script: { version } } = info;
                const lobjls = GM_getValue(version, 0);
                const length = Object.values(obj).reduce((prev, cur) => (prev += cur ? cur.toString().length : 0), 0);
                return lobjls ? lobjls === length ? obj : {} : (GM_setValue(version, length), obj);
            }
        });
    };

    obj.ready = function (lowest = 3) {
        const states = ['uninitialized', 'loading', 'loaded', 'interactive', 'complete'];
        lowest = Math.max(0, Math.min(states.length - 1, lowest));
        const isReady = () => states.indexOf(document.readyState) >= lowest;
        if (isReady()) {
            return Promise.resolve();
        }
        return new Promise(resolve => {
            const onStateChange = () => {
                if (!isReady()) return;
                document.removeEventListener('readystatechange', onStateChange);
                resolve();
            };
            document.addEventListener('readystatechange', onStateChange);
        });
    };

    obj.run = function () {
        if (window.top !== window.self) return;
        const url = location.href;
        if (url.indexOf('.baidu.com/s/') > 0) {
            obj.ready().then(obj.sharevideo);
        }
        else if (url.indexOf('.baidu.com/play/video#/video') > 0) {
            obj.ready().then(obj.playvideo);
        }
        else if (url.indexOf('.baidu.com/pfile/video') > 0) {
            obj.ready().then(obj.video);
        }
        else if (url.indexOf('.baidu.com/pfile/mboxvideo') > 0) {
            obj.ready().then(obj.mboxvideo);
        }
        else if (url.indexOf('.baidu.com/wap') > 0) {
            obj.ready(4).then(() => {
                const { $router } = document.getElementById('app').__vue__;
                $router.onReady(() => {
                    const { currentRoute } = $router;
                    if (currentRoute && currentRoute.name === 'videoView') {
                        obj.videoView();
                    }
                    $router.afterEach((to, from) => {
                        if (to.name !== from.name) {
                            obj.video_page.adToken = '';
                            if (to.name === 'videoView') {
                                obj.videoView();
                            }
                        }
                    });
                });
            });
        }
    }();

    // Your code here...
})();
