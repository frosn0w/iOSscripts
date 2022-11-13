// ==UserScript==
// @name         AutoexpandGeneral
// @namespace    https://github.com/frosn0w/iOSscripts
// @version      1.0.1
// @description  expand hidden, remove useless.
// @author       frosn0w
// @match        *://*.patreon.com/*
// @match        *://blog.csdn.net/*
// @run-at       document-end
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAA3tJREFUeF7tmj1s00AUx/8vbjdaOy1MMMDCQBlggoEBJMRE2ZqNBSEisdRRO7A1nVhaxSxIRagDYzu2E0KiAwNMdKAMLDDABG3swtamD10hJRjbd44T+YgvY+757r3ffbyPO0LBf1Rw+2EAmBVQcAJmCxR8AZhDUHkLfJ8ZO9c6aN0hxhUGLum4cgh4w4RXVqm1PLL4472KjkoAAteZY3BdpUNdZBg8X/Z2pTpLAXyrjZ8c4v3PuhiWRo99Gjp1vLH9JekbKYDAHW0wyE0zsC6yBPZsb7eWCYDv2m8BXNDFqJR6bDpecDErAE45qFbijhckrnLpFvBd2wDQakpTKtP3FcCg+bLnJ7qbpuucLoGXGLihoj8Bzw9A1bLnf0qSb7qjdQLNJcn0HYBsgLZyvmvfA7CkAgBA1fGCJyqysi0q0y/zGRAeoOk6V8OKE/MJEFZUDDqSYVSY6Gv4m7Lnb3T+px0AoZxfs1fAmEplsEyYsOo0gkpYTBsAYuY7Z6enEELGd46lFQAivt85Sz2BEDJe9MlMj9uw9QIAfokIhbveDjF9MeiavgDEJu0FhIQ+9AcQAaE57awR8U3ZWffrU16zvd1bRy40dKhqBYBBZ0TAEunnO2ax2zgg5hw5jBNEgEXgj7kGQiJqY8bTOD/PTOsEftZNHEDEtxk0GWkgo0KEu7Losu+BkMqSzlPGADDpsKkHmIKIKYklEMicDud5wquMbbyA8QLGC/TXC4jEhUHrsfU+wioYL1LUA9tbuwrC9YRUusrMk0SUmGD1/QxokXV+vLGz5U/bU//E+53JUFR73CnGqDiPgtXY8trv9sMb61ZrK9dkqE1YlKlIFETavyw1Acm3WqXDkQCyGK8AUG8AvTBeAkFfAEUviha6LP7XbU0RL0baACKvxsBnu4kDGPThv7wai/LLkXGCQhwgS3hyvxhRuR7fro1NDPH+w9gCZ8hKAq2VrNKDkcWdxKduTdepEzjf63HZDOXd3vdQOG8DZeMbAFnrAYFrv9b1aaxs9sXTWdsLLmerCdbsBTBmZINp2U5YdBrBbCYA27VjExZb77Q0UKKUZVkTMk8iLYqKMVTcjW6ACFS3PX9eppcSANGJeDQ9zHuzDBKPoHR9OrtJ4I09Gl6QPZL+k3DKEA14u/IKGFQOBsCgzqyqXWYFqJIaVDmzAgZ1ZlXt+gnhrHFfaCYwZQAAAABJRU5ErkJggg==
// @grant        none
// @license MIT
// @updateURL    https://raw.githubusercontent.com/frosn0w/iOSscripts/main/AutoexpandGeneral.js
// @downloadURL  https://raw.githubusercontent.com/frosn0w/iOSscripts/main/AutoexpandGeneral.js
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
