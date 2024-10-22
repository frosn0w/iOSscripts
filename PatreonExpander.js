// ==UserScript==
// @name         PatreonExpander
// @namespace    https://github.com/frosn0w/iOSscripts
// @version      2.9.1
// @description  Expand content and comments.
// @author       frosn0w
// @match        *://*.patreon.com/*
// @run-at       document-end
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MzYgNDc2Ij48dGl0bGU+UGF0cmVvbiBsb2dvPC90aXRsZT48cGF0aCBkYXRhLWZpbGw9IjEiIGQ9Ik00MzYgMTQzYy0uMDg0LTYwLjc3OC00Ny41Ny0xMTAuNTkxLTEwMy4yODUtMTI4LjU2NUMyNjMuNTI4LTcuODg0IDE3Mi4yNzktNC42NDkgMTA2LjIxNCAyNi40MjQgMjYuMTQyIDY0LjA4OS45ODggMTQ2LjU5Ni4wNTEgMjI4Ljg4M2MtLjc3IDY3LjY1MyA2LjAwNCAyNDUuODQxIDEwNi44MyAyNDcuMTEgNzQuOTE3Ljk0OCA4Ni4wNzItOTUuMjc5IDEyMC43MzctMTQxLjYyMyAyNC42NjItMzIuOTcyIDU2LjQxNy00Mi4yODUgOTUuNTA3LTUxLjkyOUMzOTAuMzA5IDI2NS44NjUgNDM2LjA5NyAyMTMuMDExIDQzNiAxNDNaIj48L3BhdGg+PC9zdmc+
// @grant        none
// @license MIT
// ==/UserScript==
var close = 1;
document.querySelector("header").remove();
setInterval(async function () {
  "use strict";
  if (close < 50) {
    var btns = document.querySelectorAll("button");
    var divs = document.querySelectorAll("div");
    var spans = document.querySelectorAll("span");
    var as = document.querySelectorAll("a");
    var Current = new Date();
    const dd = Current.getDate();
    const mm = Current.getMonth() + 1;
    const lmm = Current.getMonth();
    const ldd = Current.getDate() - 1;
    //a-tag process
    for (let v = 0; v < as.length; v++) {
      //format date
      if (
        as[v].innerText.includes(" 小时前") ||
        as[v].innerText.includes(" 分钟前")
      ) {
        const TimeString = mm + "月" + dd + "日";
        as[v].textContent = TimeString;
      } else if (as[v].innerText.includes("昨天")) {
        const TimeString1 = mm + "月" + ldd + "日";
        as[v].textContent = TimeString1;
      }
      //remove outdated post card
      else if (
        as[v].getAttribute("data-tag") === "post-published-at" &&
        (as[v].innerText.includes(" 天前") ||
          (as[v].innerText.includes(mm + "月") &&
            as[v].innerText.split(mm + "月")[1].split("日")[0] < ldd) ||
          (as[v].innerText.includes(mm + "月") &&
            as[v].innerText.split(mm + "月")[0] === lmm))
      ) {
        as[v].closest('div[data-tag = "post-card"]').parentNode.parentNode.remove(); //find closest <div> with data-tag = post-card
      }
      //remove avatar
      else if (as[v].getAttribute("data-tag") === "comment-avatar-wrapper") {
        as[v].parentNode.remove();
      }
      //continue
      else {
        continue;
      }
    }
    //div-tag process
    for (let j = 0; j < divs.length; j++) {
      //remove head-main navigation
      if (divs[j].getAttribute("id") === "main-app-navigation") {
        divs[j].remove();
      }
      //remove head-subnav
      else if (
        divs[j].getAttribute("aria-expanded") === "false" &&
        divs[j].innerText.includes("我的会籍")
      ) {
        divs[j].closest("nav").parentNode.parentNode.parentNode.remove();
      }
      //remove head-imgaine
      else if (
        divs[j].getAttribute("data-tag") === "creation-name" &&
        divs[j].innerText.includes("Love & Peace !")
      ) {
        divs[j].parentNode.parentNode.parentNode.parentNode.remove();
      }
      //remove head-searchbox
      else if (divs[j].getAttribute("data-tag") === "search-input-box") {
        divs[j].parentNode.parentNode.parentNode.parentNode.parentNode.remove();
      }
      //remove postcard-hiden button named "new feature"
      else if (divs[j].getAttribute("data-tag") === "chip-container") {
        divs[j].parentNode.parentNode.remove();
      }
      //remove postcard-postcard toolbar(like,comment,share,more)
      else if (divs[j].getAttribute("data-tag") === "post-details") {
        divs[j].remove();
      }
      //remove comment-deleted row
      else if (
        divs[j].getAttribute("data-tag") === "comment-body" &&
        divs[j].innerText.includes("此留言已被删除。")
      ) {
        divs[j].parentNode.parentNode.remove();
      }
      //remove comment-toolbar
      else if (divs[j].getAttribute("data-tag") === "comment-actions") {
        divs[j].remove();
      }
      //remove comment-comment box
      else if (divs[j].getAttribute("data-tag") === "comment-field-box") {
        divs[j].parentNode.parentNode.parentNode.remove();
      }
      //remove line
      else if (divs[j].getAttribute("data-tag") === "comment-row") {
        divs[j].parentNode.style.setProperty(
          "--global-bg-base-hover",
          "#e2e8f000"
        );
      }
      //boarder the padding
      else if (divs[j].getAttribute("data-tag") === "post-stream-container") {
        divs[j].parentNode.style.setProperty("padding-left", "4px");
        divs[j].parentNode.style.setProperty("padding-right", "4px");
      }
      //continue
      else {
        continue;
      }
    }
    //button-tag process
    for (let i = 0; i < btns.length; i++) {
      //remove "Collapse" button
      if (btns[i].innerText === "收起") {
        btns[i].parentNode.remove();
      }
      //remove “Collapse Replay” button
      else if (btns[i].innerText === "收起回复") {
        btns[i].parentNode.remove();
      }
      //click to expand contents
      else if (btns[i].innerText === "展开") {
        setInterval(async function () {
          btns[i].click();
        }, 2888);
      }
      //click to load comments
      else if (btns[i].innerText === "加载更多留言") {
        setInterval(async function () {
          btns[i].click();
        }, 1688);
      }
      //click to load replies
      else if (btns[i].innerText === "加载回复") {
        setInterval(async function () {
          btns[i].click();
        }, 1888);
      }
      //comment-remove text and keep author tag
      else if (
        btns[i].getAttribute("data-tag") === "commenter-name" &&
        btns[i].innerText === "贝乐斯 Think Analyze Invest"
      ) {
        btns[i].remove();
      }
      //continue
      else {
        continue;
      }
    }
    close++;
  }
}, 2888);
