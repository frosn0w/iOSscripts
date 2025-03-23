// ==UserScript==
// @name         PatreonExpander
// @namespace    https://github.com/frosn0w/iOSscripts
// @version      2.25.324
// @description  Simplify elements, expand contents and comments
// @author       frosn0w
// @match        *://*.patreon.com/*
// @run-at       document-end
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MzYgNDc2Ij48dGl0bGU+UGF0cmVvbiBsb2dvPC90aXRsZT48cGF0aCBkYXRhLWZpbGw9IjEiIGQ9Ik00MzYgMTQzYy0uMDg0LTYwLjc3OC00Ny41Ny0xMTAuNTkxLTEwMy4yODUtMTI4LjU2NUMyNjMuNTI4LTcuODg0IDE3Mi4yNzktNC42NDkgMTA2LjIxNCAyNi40MjQgMjYuMTQyIDY0LjA4OS45ODggMTQ2LjU5Ni4wNTEgMjI4Ljg4M2MtLjc3IDY3LjY1MyA2LjAwNCAyNDUuODQxIDEwNi44MyAyNDcuMTEgNzQuOTE3Ljk0OCA4Ni4wNzItOTUuMjc5IDEyMC43MzctMTQxLjYyMyAyNC42NjItMzIuOTcyIDU2LjQxNy00Mi4yODUgOTUuNTA3LTUxLjkyOUMzOTAuMzA5IDI2NS44NjUgNDM2LjA5NyAyMTMuMDExIDQzNiAxNDNaIj48L3BhdGg+PC9zdmc+
// @grant        none
// @license MIT
// ==/UserScript==

let executionCount = 1;
const INTERVAL_DELAY = 2888;
// 注入全局样式
const style = document.createElement("style");
style.textContent = `
  p { line-height: 1.4 !important; }
  div[data-tag="comment-row"]::before {
    width: 0px !important;
  }
  div[data-tag="comment-row"]::after {
    width: 0px !important;
    border-left: 0 !important;
  }
`;
document.head.appendChild(style);

// 安全移除函数（全局作用域）
const safeRemove = (element, selector = null, levels = 0, onBeforeRemove) => {
  if (!element || !(element instanceof Element)) return false;

  try {
    let target = selector ? element.closest(selector) : element;
    if (!target) return false;
    // 向上遍历父节点
    while (target && levels > 0) {
      target = target.parentElement;
      levels--;
    }
    // 元素或元素父级不存在返回false
    if (!target || !target.parentElement) return false;
    // 允许在移除前执行自定义逻辑（如清理事件监听器），避免内存泄漏
    if (typeof onBeforeRemove === "function") {
      onBeforeRemove(target);
    }
    // 移除元素
    target.remove();
    return true;
  } catch (error) {
    console.error("safeRemove error:", error);
    return false;
  }
};

setInterval(async () => {
  "use strict";
  if (executionCount >= 50) return;
  // 获取当前日期
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
  const lastMonth = currentDate.getMonth();
  const yesterday = currentDate.getDate() - 1;

  // 优化选择器性能
  const processElements = (selector, processor) => {
    document.querySelectorAll(selector).forEach(processor);
  };
  // 缩短正文部分的 p 标签行距
  processElements("span", (element) => {
    if (element.getAttribute("data-tag") === "post-title") {
      element.parentNode?.parentNode?.parentNode?.parentNode?.classList.add(
        "TAI-body-div"
      );
      const style = document.createElement("style");
      style.textContent = `
      .TAI-body-div p {
        margin: 8px 0 !important;
      }
    `;
      document.head.appendChild(style);
    }
  });
  // 处理 ul 标签样式
  processElements("ul", (element) => {
    element.style.setProperty("margin", "6px 0", "important");
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
    // 删除过期的内容
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
      safeRemove(element, null, 1);
    } else if (
      element.ariaExpanded === "false" &&
      element.innerText.includes("我的会籍")
    ) {
      safeRemove(element, "nav", 3);
    } else if (
      dataTag === "creation-name" &&
      element.innerText.includes("Love & Peace !")
    ) {
      safeRemove(element, null, 4);
    } else if (dataTag === "search-input-box") {
      safeRemove(element, null, 5);
    } else if (dataTag === "chip-container") {
      safeRemove(element, null, 2);
    } else if (dataTag === "post-details") {
      safeRemove(element);
    } // 移除已删除的留言及发布人头像
    else if (
      dataTag === "comment-body" &&
      element.innerText.includes("此留言已被删除。")
    ) {
      safeRemove(element, null, 3);
    } else if (dataTag === "comment-actions") {
      safeRemove(element);
    } else if (dataTag === "comment-field-box") {
      safeRemove(element, null, 3);
    } // 缩窄页边距
    else if (dataTag === "post-stream-container") {
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
      safeRemove(button, "header");
    } else if (["收起", "收起回复"].includes(text)) {
      safeRemove(button, null, 1);
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
      safeRemove(button, '[data-tag="commenter-name"]'); // 添加选择器二次验证
    }
  });
  executionCount++;
}, INTERVAL_DELAY);
