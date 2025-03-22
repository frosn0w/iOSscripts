// ==UserScript==
// @name         PatreonExpander
// @namespace    https://github.com/frosn0w/iOSscripts
// @version      2.25.323
// @description  Expand content and comments.
// @author       frosn0w
// @match        *://*.patreon.com/*
// @run-at       document-end
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MzYgNDc2Ij48dGl0bGU+UGF0cmVvbiBsb2dvPC90aXRsZT48cGF0aCBkYXRhLWZpbGw9IjEiIGQ9Ik00MzYgMTQzYy0uMDg0LTYwLjc3OC00Ny41Ny0xMTAuNTkxLTEwMy4yODUtMTI4LjU2NUMyNjMuNTI4LTcuODg0IDE3Mi4yNzktNC42NDkgMTA2LjIxNCAyNi40MjQgMjYuMTQyIDY0LjA4OS45ODggMTQ2LjU5Ni4wNTEgMjI4Ljg4M2MtLjc3IDY3LjY1MyA2LjAwNCAyNDUuODQxIDEwNi44MyAyNDcuMTEgNzQuOTE3Ljk0OCA4Ni4wNzItOTUuMjc5IDEyMC43MzctMTQxLjYyMyAyNC42NjItMzIuOTcyIDU2LjQxNy00Mi4yODUgOTUuNTA3LTUxLjkyOUMzOTAuMzA5IDI2NS44NjUgNDM2LjA5NyAyMTMuMDExIDQzNiAxNDNaIj48L3BhdGg+PC9zdmc+
// @grant        none
// @license MIT
// ==/UserScript==

let executionCount = 1;
const INTERVAL_DELAY = 2888;

// 安全移除函数（提升到全局作用域）
const safeRemove = (element, selector = null, levels = 0) => {
  let target = selector ? element.closest(selector) : element;
  for (let i = 0; target && i < levels; i++) {
    target = target.parentNode;
  }
  target?.remove();
};

setInterval(async () => {
  "use strict";
  if (executionCount >= 50) return;

  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
  const lastMonth = currentDate.getMonth();
  const yesterday = currentDate.getDate() - 1;

  // 优化选择器性能
  const processElements = (selector, processor) => {
    document.querySelectorAll(selector).forEach(processor);
  };
  // 处理 p 标签样式
  processElements("p", (element) => {
    element.style.setProperty("--global-lineHeights-body", "1.2");
    element.style.setProperty("margin", "8px 0", "important");
  });
  // 处理 ul 标签样式
  processElements("ul", (element) => {
    element.style.setProperty("margin", "4px 0", "important");
  });
  // 处理 a 标签
  processElements("a", (element) => {
    const text = element.innerText;
    const dataTag = element.getAttribute("data-tag");
    // 格式化日期
    if (text.includes(" 小时前") || text.includes(" 分钟前")) {
      element.textContent = `${currentMonth}月${currentDay}日`;
    } else if (text.includes("昨天")) {
      element.textContent = `${currentMonth}月${yesterday}日`;
    }

    if (dataTag === "post-published-at") {
      if (
        text.includes(" 天前") ||
        (text.includes(`${currentMonth}月`) &&
          parseInt(text.split(`${currentMonth}月`)[1]) < yesterday) ||
        (text.includes(`${currentMonth}月`) &&
          parseInt(text.split(`${currentMonth}月`)[0]) === lastMonth)
      ) {
        safeRemove(element, 'div[data-tag="post-card"]', 2);
      }
    } else if (text.includes("Skip navigation")) {
      element.remove();
    } else if (dataTag === "comment-avatar-wrapper") {
      element.parentNode?.remove();
    } else if (
      element.href === "https://www.patreon.com/user/gift?u=80821958"
    ) {
      safeRemove(element, null, 4);
    }
  });

  // 处理 div 标签
  processElements("div", (element) => {
    const dataTag = element.getAttribute("data-tag");
    if (element.id === "main-app-navigation") {
      element.parentNode?.remove();
    } else if (
      element.ariaExpanded === "false" &&
      element.innerText.includes("我的会籍")
    ) {
      element.closest("nav")?.parentNode?.parentNode?.parentNode?.remove();
    } else if (
      dataTag === "creation-name" &&
      element.innerText.includes("Love & Peace !")
    ) {
      safeRemove(element, null, 4);
    } else if (dataTag === "search-input-box") {
      safeRemove(element, null, 5);
    } else if (dataTag === "chip-container") {
      element.parentNode?.parentNode?.remove();
    } else if (dataTag === "post-details") {
      element.remove();
    } else if (
      dataTag === "comment-body" &&
      element.innerText.includes("此留言已被删除。")
    ) {
      element.parentNode?.parentNode?.remove();
    } else if (dataTag === "comment-actions") {
      element.remove();
    } else if (dataTag === "comment-field-box") {
      safeRemove(element, null, 3);
    } else if (dataTag === "comment-row") {
      element.parentNode?.style.setProperty(
        "--global-bg-base-hover",
        "#e2e8f000"
      );
    } else if (dataTag === "post-stream-container") {
      element.parentNode?.style.setProperty("padding-left", "4px");
      element.parentNode?.style.setProperty("padding-right", "4px");
    }
  });

  // 处理按钮
  processElements("button", (button) => {
    const text = button.innerText;
    const clickHandler = () => button.click();
    //remove header
    if (
      button.ariaExpanded === "false" &&
      button.getAttribute("aria-label") === "打开导航"
    ) {
      button.closest("header")?.remove();
    } else if (["收起", "收起回复"].includes(text)) {
      button.parentNode?.remove();
    } else if (text === "展开") {
      setInterval(clickHandler, 2888);
    } else if (text === "加载更多留言") {
      setInterval(clickHandler, 1688);
    } else if (text === "加载回复") {
      setInterval(clickHandler, 1888);
    } else if (
      button.getAttribute("data-tag") === "commenter-name" &&
      text === "贝乐斯 Think Analyze Invest"
    ) {
      button.remove();
    }
  });

  executionCount++;
}, INTERVAL_DELAY);
