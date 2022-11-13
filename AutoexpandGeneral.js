// ==UserScript==
// @name         AutoexpandGeneral
// @namespace    https://github.com/frosn0w/iOSscripts
// @version      1.0.1
// @description  expand hidden, remove useless.
// @author       frosn0w
// @match        *://*.patreon.com/*
// @match        *://blog.csdn.net/*
// @run-at       document-end
// @icon         none
// @grant        none
// @license MIT
// ==/UserScript==
(function () {
	"use strict";
	/*
	 * 网站列表
	 * @type {name/url/type}
	var load_comments = document.querySelector();
	var load_replies = document.querySelector(
	 */

	var websites = [
		{
			name: "Patreon",
			url: "www.patreon.com",
			handles: [
			    //Remove
				//head_bar
				{
					type: "remove",
					item: ".sc-1sly433-0.frJbNq",
				},
				//navigation_bar
				{
					type: "remove",
					item: ".sc-1qfj9l9-2.bBIVdO",
				},
				//lock_icon,tool_bar,tool bar mini
				{
					type: "remove",
					item: ".sc-ieecCq.dAvYFw",
				},
				//tool_bar
				{
					type: "remove",
					item: ".sc-iCfMLu.OiRfc",
				},
				//tool_bar_mini
				{
					type: "remove",
					item: ".dCNNRZ:nth-of-type(n+2)",
				},
				//replay_box
				{
					type: "remove",
					item: ".sc-1ez3bpy-0.fXliAM",
				},
				//Click
				//read_all
				{
					type: "click",
					item: ".gkqJBN button",
				},
				//load_comments
				{
					type: "click",
					item: "button.sc-1qsig82-0",
				},
				//load_replies
				{
					type: "click",
					item: "button.sc-ieecCq.bPcUvx",
				},
			],
		},
		{
			name: "CSDN",
			url: "blog.csdn.net",
			handles: [
				//autoexpand
				{
					type: "click",
					item: ".hide-preCode-bt",
				},
				//display_all
				{
					type: "display",
					item: ".hide-article-box",
				},
				//cancel_box
				{
					type: "display",
					item: ".weixin-shadowbox",
				},
				//read_all
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
				//load_comments
				{
					type: "click",
					item: ".btn_comment_readmore",
				},
			],
		},
    ];

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
							}
						} else if (handle.type == "overflow") {
							//slide protect
							for (var item of items) {
								item.style.setProperty("overflow", "unset", "important");
							}
                        } else if (handle.type == "remove"){
                            //remove useless
                            for(var item of items){
                                item.remove();
                            }
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
	}, 1758);
})();
