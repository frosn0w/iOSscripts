// ==UserScript==
// @name         PatreonCur
// @namespace    https://github.com/frosn0w/iOSscripts
// @version      1.7
// @description  Expand contents
// @author       frosn0w
// @match        *://*.patreon.com/*
// @run-at       document-end
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAA3tJREFUeF7tmj1s00AUx/8vbjdaOy1MMMDCQBlggoEBJMRE2ZqNBSEisdRRO7A1nVhaxSxIRagDYzu2E0KiAwNMdKAMLDDABG3swtamD10hJRjbd44T+YgvY+757r3ffbyPO0LBf1Rw+2EAmBVQcAJmCxR8AZhDUHkLfJ8ZO9c6aN0hxhUGLum4cgh4w4RXVqm1PLL4472KjkoAAteZY3BdpUNdZBg8X/Z2pTpLAXyrjZ8c4v3PuhiWRo99Gjp1vLH9JekbKYDAHW0wyE0zsC6yBPZsb7eWCYDv2m8BXNDFqJR6bDpecDErAE45qFbijhckrnLpFvBd2wDQakpTKtP3FcCg+bLnJ7qbpuucLoGXGLihoj8Bzw9A1bLnf0qSb7qjdQLNJcn0HYBsgLZyvmvfA7CkAgBA1fGCJyqysi0q0y/zGRAeoOk6V8OKE/MJEFZUDDqSYVSY6Gv4m7Lnb3T+px0AoZxfs1fAmEplsEyYsOo0gkpYTBsAYuY7Z6enEELGd46lFQAivt85Sz2BEDJe9MlMj9uw9QIAfokIhbveDjF9MeiavgDEJu0FhIQ+9AcQAaE57awR8U3ZWffrU16zvd1bRy40dKhqBYBBZ0TAEunnO2ax2zgg5hw5jBNEgEXgj7kGQiJqY8bTOD/PTOsEftZNHEDEtxk0GWkgo0KEu7Losu+BkMqSzlPGADDpsKkHmIKIKYklEMicDud5wquMbbyA8QLGC/TXC4jEhUHrsfU+wioYL1LUA9tbuwrC9YRUusrMk0SUmGD1/QxokXV+vLGz5U/bU//E+53JUFR73CnGqDiPgtXY8trv9sMb61ZrK9dkqE1YlKlIFETavyw1Acm3WqXDkQCyGK8AUG8AvTBeAkFfAEUviha6LP7XbU0RL0baACKvxsBnu4kDGPThv7wai/LLkXGCQhwgS3hyvxhRuR7fro1NDPH+w9gCZ8hKAq2VrNKDkcWdxKduTdepEzjf63HZDOXd3vdQOG8DZeMbAFnrAYFrv9b1aaxs9sXTWdsLLmerCdbsBTBmZINp2U5YdBrBbCYA27VjExZb77Q0UKKUZVkTMk8iLYqKMVTcjW6ACFS3PX9eppcSANGJeDQ9zHuzDBKPoHR9OrtJ4I09Gl6QPZL+k3DKEA14u/IKGFQOBsCgzqyqXWYFqJIaVDmzAgZ1ZlXt+gnhrHFfaCYwZQAAAABJRU5ErkJggg==
// @grant        none
// @license MIT
// ==/UserScript==
function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
var close = 1;
setInterval(async function () {
    "use strict";
    if (close < 50) {
        var btns = document.querySelectorAll("button");
        var divs = document.querySelectorAll("div");
        var spans = document.querySelectorAll("span");
        var as = document.querySelectorAll("a");
        //get current date
        var Current = new Date();
        const mm = Current.getMonth() + 1;
        //spans process
        for (let u = 0; u < spans.length; u++) {
            if (spans[u].getAttribute("color") === "content") {
                spans[u].parentNode.parentNode.parentNode.remove();
            }
            //remove lock icon
            else if (spans[u].innerText === "已解锁") {
                spans[u].parentNode.remove();
            }
            //date process
            //remove outdated
            else if (spans[u].innerText.includes("天前 时间： ") || spans[u].innerText.includes("日 时间： ")) {
                spans[u].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.remove();
            }
            else if (spans[u].innerText.includes("昨天 时间： ") && spans[u].innerText.split('时间： ')[1].split(':')[0] < 20) {
                spans[u].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.remove();
            }
            //format date
            else if (spans[u].innerText.includes("昨天 时间： ") && spans[u].innerText.split('时间： ')[1].split(':')[0] > 20) {
                const dd = Current.getDate() - 1;
                const TimeString = mm + "月" + dd + "日";
                spans[u].textContent = TimeString;
            }
            else if (spans[u].innerText.includes(" 小时前") || spans[u].innerText.includes(" 分钟前")) {
                const dd = Current.getDate();
                const TimeString = mm + "月" + dd + "日";
                spans[u].textContent = TimeString;
            }
            //continue
            else {
                continue;
            }
        }
        //div process
        for (let j = 0; j < divs.length; j++) {
            //remove comeent-box
            if (divs[j].getAttribute("data-tag") === "comment-field-box") {
                divs[j].parentNode.parentNode.parentNode.remove();
            }
            //remove minitoolbar
            else if (divs[j].getAttribute("data-tag") === "comment-actions") {
                divs[j].remove();
            }
            //remove load more
            else if (divs[j].innerText === "加载更多") {
                divs[j].parentNode.parentNode.parentNode.remove();
            }
            //continue
            else {
                continue;
            }
        }
        //a process
        for (let v = 0; v < as.length; v++) {
            if (as[v].getAttribute("data-tag") === "comment-avatar-wrapper") {
                as[v].parentNode.remove();
            }
            //bold name
            else if (as[v].getAttribute("data-tag") === "commenter-name") {
                if (as[v].innerText === "贝乐斯 Think Analyze Invest") {
                    as[v].style.color = 'rgb(245, 31, 0)';
                    as[v].style.fontWeight = "bold";
                }
                else {
                    as[v].style.color = 'rgb(0, 0, 0)';
                    as[v].style.fontWeight = "bold";
                }
            }
            //continue
            else {
                continue;
            }
        }
        //btns process
        for (let i = 0; i < btns.length; i++) {
            //remove toolbar
            if (btns[i].getAttribute("aria-label") === "更多操作") {
                btns[i].parentNode.parentNode.parentNode.parentNode.parentNode.remove();
            }
            //remove header
            else if (
                btns[i].getAttribute("aria-label") === "筛选条件选项" &&
                btns[i].getAttribute("data-tag") === "menuToggleDiv") {
                btns[i].parentNode.parentNode.parentNode.parentNode.remove();
            }
            //expand content
            else if (btns[i].innerText === "继续阅读") {
                btns[i].click();
                await sleep(375);
            }
            //click comment
            /*
              else if (btns[i].innerText === "加载更多留言") {
              btns[i].click();
              await sleep(150);
            }
            //click replay
            else if (btns[i].innerText.includes(" 条回复")) {
              btns[i].click();
              await sleep(100);
            }
            */
            //continue
            else {
                continue;
            }
        }
        close++;
    }
}, 2500);