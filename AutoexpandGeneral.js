// ==UserScript==
// @name         AutoexpandGeneral
// @nameEN       AutoexpandGeneral
// @nameZH       AutoexpandGeneral
// @namespace    https://github.com/frosn0w/iOSscripts
// @version      1.0.0
// @description  expand hidden, remove useless.
// @author       frosn0w
// @match        *://*.patreon.com/*
// @run-at       document-end
// @icon         none
// @grant        none
// @license MIT
// @updateURL    https://raw.githubusercontent.com/frosn0w/iOSscripts/main/AutoexpandGeneral.js
// @downloadURL  https://raw.githubusercontent.com/frosn0w/iOSscripts/main/AutoexpandGeneral.js
// ==/UserScript==
(function () {
	"use strict";
	/*
	 * 网站列表
	 * @type {name/url/操作类型}
	 */
	var websites = [
		{
			name: "Patreon",
			url: "www.patreon.com",
			handles: [
				//PC端:展开全部
				{
					type: "click",
					item: ".expandBtn",
				},
				{
					type: "click",
					item: ".normal-style",
				},
				//PC端:查看等多回答
				{
					type: "click",
					item: ".ic_ask_down_reeow",
				},
			],
		},
		{
			name: "CSDN",
			url: "blog.csdn.net",
			handles: [
				//PC端:自动展开代码块
				{
					type: "click",
					item: ".hide-preCode-bt",
				},
				//PC端:关注博主即可阅读全文
				{
					type: "display",
					item: ".hide-article-box",
				},
				//下载弹窗
				{
					type: "display",
					item: ".weixin-shadowbox",
				},
				//阅读全文
				{
					type: "display",
					item: ".btn_mod",
				},
				{
					type: "height",
					item: ".article_content",
				},
				{
					type: "display",
					item: ".readall_box",
				},
				//展开评论
				{
					type: "click",
					item: ".btn_comment_readmore",
				},
			],
		}
    ]
    
//分类执行
	var time = 0;
	var interval = setInterval(() => {
		if (++time == 100) {
			clearInterval(interval);
		}
		for (var website of websites) {
			if (location.href.indexOf(website.url) != -1) {
				if (website.fun) {
					website.fun();
				}
				for (var handle of website.handles) {
					var items = document.querySelectorAll(handle.item);
					if (items.length != 0) {
						if (handle.type == "display") {
							//display
							for (var item of items) {
								item.style.display = "none";
							}
						} else if (handle.type == "height") {
							//unfold
							for (var item of items) {
								item.style.setProperty("height", "unset", "important");
								item.style.setProperty("max-height", "unset", "important");
								item.style.setProperty("max-height", "unset", "important");
							}
						} else if (handle.type == "overflow") {
							//slide protect
							for (var item of items) {
								item.style.setProperty("overflow", "unset", "important");
							}
            } else if (remove.type == ""){
              
						} else {
							//click
							for (var item of items) {
								if (item != null && item.getAttribute("opened") != "yes") {
									item.click();
									item.setAttribute("opened", "yes");
								}
							}
						}
					}
				}
			}
		}
	}, 100);
})();
