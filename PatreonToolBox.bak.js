// ==UserScript==
// @name         PatreonToolBox
// @namespace    https://github.com/frosn0w/iOSscripts
// @version      1.25.0810
// @description  Patreon page expander and watermarking tool. Now with manual activation and improved button handling.
// @author       Frosn0w
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MzYgNDc2Ij48dGl0bGU+UGF0cmVvbiBsb2dvPC90aXRsZT48cGF0aCBkYXRhLWZpbGw9IjEiIGQ9Ik00MzYgMTQzYy0uMDg0LTYwLjc3OC00Ny41Ny0xMTAuNTkxLTEwMy4yODUtMTI4LjU2NUMyNjMuNTI4LTcuODg0IDE3Mi4yNzktNC42NDkgMTA2LjIxNCAyNi40MjQgMjYuMTQyIDY0LjA4OS45ODggMTQ2LjU5Ni4wNTEgMjI4Ljg4M2MtLjc3IDY3LjY1MCA2LjAwNCAyNDUuODQxIDEwNi44MyAyNDcuMTEgNzQuOTE3Ljk0OCA4Ni4wNzItOTUuMjc5IDEyMC43MzctMTQxLjYyMyAyNC42NjItMzIuOTcyIDU2LjQxNy00Mi4yODUgOTUuNTA3LTUxLjkyOUMzOTAuMzA5IDI2NS44NjUgNDM2LjA5NyAyMTMuMDExIDQzNiAxNDNaIj48L3BhdGg+PC9zdmc+
// @license      MIT
// ==/UserScript==

(function () {
  ("use strict");

  // =======================================
  // =========== Toast 通知模块 =============
  // =======================================

  /**
   * Toast 对象用于在页面右上角显示简短的消息提示
   * 它采用单例模式，确保样式表只被注入一次
   */
  const Toast = {
    styleInjected: false,

    /**
     * 初始化 Toast，注入所需的 CSS 样式到页面头部
     * 如果样式已注入，则直接返回，避免重复操作
     */
    init() {
      if (this.styleInjected) return;

      const styles = `
        .gm-toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999999; display: flex; flex-direction: column; align-items: flex-end; pointer-events: none; }
        .gm-toast { background-color: rgba(0, 0, 0, 0.8); color: white; padding: 10px 20px; border-radius: 8px; margin-bottom: 10px; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.15); opacity: 0; transform: translateX(100%); transition: opacity 0.3s ease, transform 0.3s ease; pointer-events: auto; }
        .gm-toast.show { opacity: 1; transform: translateX(0); }
        .gm-toast.success { background-color: rgba(27, 153, 68, 0.9); }
        .gm-toast.error { background-color: rgba(212, 59, 59, 0.9); }
      `;

      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.innerText = styles;
      document.head.appendChild(styleSheet);
      this.styleInjected = true;
    },

    /**
     * 显示一条 Toast 消息
     * @param {string} message - 要显示的消息内容
     * @param {number} [duration=3000] - 消息显示的持续时间（毫秒）
     * @param {string} [type=""] - 消息类型，可以是 'success' 或 'error'，用于应用不同颜色
     */
    show(message, duration = 3000, type = "") {
      this.init();

      let container = document.querySelector(".gm-toast-container");
      if (!container) {
        container = document.createElement("div");
        container.className = "gm-toast-container";
        document.body.appendChild(container);
      }

      const toastElement = document.createElement("div");
      toastElement.className = `gm-toast ${type}`;
      toastElement.textContent = message;
      container.appendChild(toastElement);

      setTimeout(() => {
        toastElement.classList.add("show");
      }, 10);

      setTimeout(() => {
        toastElement.classList.remove("show");
        toastElement.addEventListener("transitionend", () => {
          toastElement.remove();
        });
      }, duration);
    },
  };

  // =======================================
  // ========= Patreon 页面优化模块 ==========
  // =======================================

  // 模块配置常量
  const PATREON_CONFIG = {
    // 需要保留帖子的天数
    REMAIN_DAYS: 1,
    STYLE_ID: "patreon-expander-styles",
  };

  // 全局优化样式
  /* 
   * 调整评论区连线部分被root代替，暂时注释掉
   * div[data-tag="comment-row"]::before,
   * div[data-tag="comment-row"]::after { width: 0 !important; border-left: 0 !important; }
   * 1. 将页面分区线条宽度调整为0px，借助颜色区分分区，扩大可阅读空间
   * 2. 调整正文文字大小和行距，包含有序/无序列表，提升可读性
   * 3. 缩小主副标题，解决移动设备过大回行问题
   * 4. 缩小评论区气泡圆角，缩小评论区行距，增加评论区昵称字体大小
   */
  const PATREON_GLOBAL_STYLES = `
    :root { --global-borderWidth-thin: 0px !important; }
    #TAI-Hostpost-id div p { margin: 8px 0 !important; font-size: 17px !important; line-height: 1.4 !important; }
    #TAI-Hostpost-id li p { margin: 6px 0 !important; }
    #TAI-Hostpost-id ul { margin: 6px 0 !important; }
    #TAI-Hostpost-id h3 { font-size: 20px !important; }
    #TAI-title-id a { font-size: 24px !important; }
    #TAI-comment-id { border-radius: 8px !important; }
    #TAI-comment-id p div { line-height: 1.3 !important; }
    #TAI-comment-id div button span { font-size: 17px !important; }
  `;

  // 功能函数：日期格式化工具
  const DateFormatter = {
    currentDate: new Date(),
    refresh() {
      this.currentDate = new Date();
    },
    get formattedDate() {
      return `${this.currentMonth}月${this.currentDay}日`;
    },
    get yesterdayDate() {
      const date = new Date(this.currentDate);
      date.setDate(date.getDate() - 1);
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    get currentMonth() {
      return this.currentDate.getMonth() + 1;
    },
    get currentDay() {
      return this.currentDate.getDate();
    },
  };

  // 功能函数：安全移除DOM元素
  const safeRemove = (() => {
    const removedCache = new WeakSet();
    return (element, selector = null, levels = 0) => {
      if (!element || !element.parentElement || removedCache.has(element)) {
        return false;
      }
      try {
        const target = selector ? element.closest(selector) : element;
        if (!target) return false;
        let parent = target;
        for (let i = 0; i < levels; i++) {
          parent = parent?.parentElement;
        }
        if (parent) {
          parent.remove();
          removedCache.add(element);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Removal failed:", error);
        return false;
      }
    };
  })();

  // 功能函数：安全点击按钮
  function safeClick(button, interval, expectedText) {
    if (!button || button.autoClicker) return;
    button.autoClicker = setInterval(() => {
      try {
        if (
          !document.contains(button) ||
          (expectedText && button.textContent !== expectedText) ||
          button.disabled ||
          button.getAttribute("aria-busy") === "true"
        ) {
          clearInterval(button.autoClicker);
          delete button.autoClicker;
          return;
        }
        button.click();
      } catch (e) {
        clearInterval(button.autoClicker);
        delete button.autoClicker;
      }
    }, interval);
  }

  // 过期内容判断函数
  function shouldRemovePost(text) {
    const remainDays = PATREON_CONFIG.REMAIN_DAYS;
    const { currentMonth, currentDay } = DateFormatter;
    if (text.includes(" 天前")) return true;
    const match = text.match(/(\d{1,2})月(\d{1,2})日/);
    if (!match) return false;
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    if (month < currentMonth || (currentMonth === 1 && month === 12))
      return true;
    if (month === currentMonth && day < currentDay - remainDays) return true;
    return false;
  }

  // 处理链接元素
  function processLinks(element) {
    const { textContent, href, dataset } = element;
    // 根据日期移除过期内容
    if (dataset.tag === "post-published-at" && shouldRemovePost(textContent)) {
      safeRemove(element, 'div[data-tag="post-card"]', 2);
    }
    // 格式化日期
    else if (/小时前|分钟前/.test(textContent)) {
      element.textContent = DateFormatter.formattedDate;
    } else if (textContent.includes("昨天")) {
      element.textContent = DateFormatter.yesterdayDate;
    }
    // 移除分享模块
    else if (href === "https://www.patreon.com/user/gift?u=80821958") {
      safeRemove(element, null, 4);
    } else if (textContent === "Skip navigation") {
      element.remove();
    }
    // 移除评论区头像
    else if (dataset.tag === "comment-avatar-wrapper") {
      safeRemove(element, null, 1);
    }
  }

  // 处理按钮元素
  function processButtons(button) {
    const { textContent, ariaExpanded, ariaLabel } = button;
    const BUTTON_INTERVALS = { 展开: 3888, 加载更多留言: 1666, 加载回复: 1888 };
    // 移除导航栏
    if (ariaExpanded === "false" && ariaLabel === "打开导航") {
      safeRemove(button, "header");
    }
    // 移除页面顶部的筛选按钮
    else if (ariaLabel === "creator-public-page-post-all-filters-toggle") {
      safeRemove(button, null, 4);
    }
    // 移除展开后的收起按钮
    else if (["收起", "收起回复"].includes(textContent)) {
      safeRemove(button, null, 1);
    }
    // 展开正文并加载评论
    else if (Object.keys(BUTTON_INTERVALS).includes(textContent)) {
      safeClick(button, BUTTON_INTERVALS[textContent], textContent);
    }
    // 简化博主昵称解决移动设备出现省略号
    else if (
      button.dataset.tag === "commenter-name" &&
      textContent === "贝乐斯 Think Analyze Invest"
    ) {
      button.textContent = "贝乐斯";
    }
  }

  // 处理 div 元素
  function processDivs(element) {
    const { dataset, id, ariaExpanded, textContent } = element;
    // 移除主导航
    if (id === "main-app-navigation") {
      safeRemove(element, null, 1);
    }
    // 移除顶部杂项
    else if (ariaExpanded === "false" && textContent.includes("我的会籍")) {
      safeRemove(element, "nav", 3);
    }
    // 移除顶部标题文字
    else if (
      dataset.tag === "creation-name" &&textContent.includes("Love & Peace !")) {
      safeRemove(element, null, 4);
    }
    // 移除顶部的搜索框
    else if (dataset.tag === "search-input-box") {
      safeRemove(element, null, 5);
    }
    // 移除“新功能”按钮
    else if (dataset.tag === "chip-container") {
      safeRemove(element, null, 2);
    }
    // 移除转评赞按钮
    else if (dataset.tag === "post-details") {
      safeRemove(element);
    }
    // 移除评论区已删除留言
    else if (
      dataset.tag === "comment-body" &&
      textContent.includes("此留言已被移除")
    ) {
      safeRemove(element, null, 3);
    }
    // 移除评论区回复框、操作按钮
    else if (dataset.tag === "comment-actions") {
      safeRemove(element);
    } else if (dataset.tag === "comment-field-box") {
      safeRemove(element, null, 3);
    }
    // 缩窄正文卡片边距
    else if (dataset.tag === "post-stream-container") {
      element.parentNode?.style.setProperty("padding-left", "0px");
      element.parentNode?.style.setProperty("padding-right", "0px");
    }
    // 关闭正文卡片圆角
    else if (dataset.tag === "post-card") {
      element.style.setProperty("--Card-radius-enabled", "0");
    }
    // 注入评论区样式
    else if (dataset.tag === "comment-body") {
      element.parentNode?.classList.add("TAI-comment");
      element.parentNode?.setAttribute("id", "TAI-comment-id");
    }
  }

  // 处理 span 元素
  function processSpans(element) {
    // 注入标题、正文主体样式
    if (element.getAttribute("data-tag") === "post-title") {
      const targetElement =
        element.parentNode?.parentNode?.parentNode?.parentNode?.parentNode;
      targetElement?.classList.add("TAI-Hostpost");
      targetElement?.setAttribute("id", "TAI-Hostpost-id");
      element.classList.add("TAI-title");
      element.setAttribute("id", "TAI-title-id");
    }
  }

  // 定义观察器和状态变量，但不立即启动
  let observer;
  let isObserverActive = false;

  /*
   * 运行 Patreon 页面优化功能的主函数
   * 此函数会一次性处理当前页面内容，并启动一个观察器来持续监控动态加载的内容
   */
  function runPatreonExpander() {
    // 确保只在 Patreon 网站上运行
    if (!window.location.hostname.includes("patreon.com")) {
      Toast.show("此功能专为Patreon网站设计", 3000, "error");
      return;
    }
    // 防止用户重复点击菜单命令，重复启动观察器
    if (isObserverActive) {
      Toast.show("页面优化功能已在运行中", 3000);
      return;
    }

    Toast.show("开始执行Patreon页面优化...", 2000, "success");

    // 注入全局样式
    if (!document.getElementById(PATREON_CONFIG.STYLE_ID)) {
      const style = document.createElement("style");
      style.id = PATREON_CONFIG.STYLE_ID;
      style.textContent = PATREON_GLOBAL_STYLES;
      document.head.appendChild(style);
    }

    // 刷新日期并对当前页面上所有相关元素进行一次性处理
    DateFormatter.refresh();
    document.querySelectorAll("a, button, div, span").forEach((el) => {
      if (el.matches("a")) processLinks(el);
      if (el.matches("button")) processButtons(el);
      if (el.matches("div")) processDivs(el);
      if (el.matches("span")) processSpans(el);
    });

    // 初始化并启动 MutationObserver 来处理后续动态加载的内容
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // --- 处理新增的节点 ---
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // 仅处理元素节点
              const elements = [
                node,
                ...node.querySelectorAll("a, button, div, span"),
              ];
              elements.forEach((el) => {
                if (el.matches("a")) processLinks(el);
                if (el.matches("button")) processButtons(el);
                if (el.matches("div")) processDivs(el);
                if (el.matches("span")) processSpans(el);
              });
            }
          });
        }
        // --- 处理属性或文本变化 (用于捕捉“展开”->“收起”等状态变化) ---
        else if (
          mutation.type === "attributes" ||
          mutation.type === "characterData"
        ) {
          // 如果目标是文本节点，则获取其父元素；否则目标就是元素本身
          const targetElement =
            mutation.target.nodeType === Node.TEXT_NODE
              ? mutation.target.parentElement
              : mutation.target;
          if (targetElement && typeof targetElement.matches === "function") {
            if (targetElement.matches("button")) {
              processButtons(targetElement);
            }
          }
        }
      }
    });

    // 启动观察器，增加对属性和文本内容的监控
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    isObserverActive = true; // 标记为已运行，防止重复启动
    Toast.show("页面动态监控已启动", 2500, "success");
  }

  // =======================================
  // =========== 水印及防伪模块 ==============
  // =======================================
  // 修改文字颜色及博主名
  function Copyrights() {
    const styleTag = document.getElementById("patreon-expander-styles");
    if (styleTag) {
      styleTag.textContent += `
          #TAI-Hostpost-id div p { color: #333333 !important; }
    `;
    }
    const buttons = document.querySelectorAll(
      'button[data-tag="commenter-name"]'
    );
    buttons.forEach((btn) => {
      if (btn.textContent.trim() === "贝乐斯") {
        btn.textContent = "正版微信 bWFzaw";
      }
    });
    Toast.show("文字颜色减弱、博主名替换已完成", 3000);
  }
  // 图片水印配置
  const WATERMARK_URLS = [
    "https://raw.githubusercontent.com/frosn0w/Pic-Bed/refs/heads/main/Patreon_WM/WM.Wechat.LGRAY.png",
    "https://raw.githubusercontent.com/frosn0w/Pic-Bed/refs/heads/main/Patreon_WM/WM.Wechat.CLR.png",
  ];
  const WATERMARK_OPTIONS = {
    scale: 0.45,
    opacity: 0.99,
  };

  // 页面中心水印配置
  const PAGE_WATERMARK_OPTIONS = {
    url: "https://raw.githubusercontent.com/frosn0w/Pic-Bed/refs/heads/main/Patreon_WM/WM.Wechat.LGRAY.png",
    width: 160,
    opacity: 0.99,
    verticalSpacing: 400,
  };

  // 应用页面中心水印
  function applyPageWatermark() {
    const WATERMARK_ID = "gm-page-watermark-container";
    if (document.getElementById(WATERMARK_ID)) {
      console.log("Page watermark already exists.");
      return;
    }
    const watermarkImage = new window.Image();
    watermarkImage.crossOrigin = "Anonymous";
    watermarkImage.src = PAGE_WATERMARK_OPTIONS.url;
    watermarkImage.onload = () => {
      const container = document.createElement("div");
      container.id = WATERMARK_ID;
      const pageWidth = document.body.scrollWidth;
      const pageHeight = document.body.scrollHeight;
      container.style.cssText = `position: absolute; top: 0; left: 0; width: ${pageWidth}px; height: ${pageHeight}px; z-index: 9999998; pointer-events: none;`;
      document.body.appendChild(container);
      const imageRects = Array.from(document.querySelectorAll("img")).map(
        (img) => img.getBoundingClientRect()
      );
      const tileWidth = PAGE_WATERMARK_OPTIONS.width;
      const tileHeight =
        watermarkImage.naturalHeight *
        (tileWidth / watermarkImage.naturalWidth);
      const verticalStep = tileHeight + PAGE_WATERMARK_OPTIONS.verticalSpacing;
      const tileX = window.innerWidth / 2 - tileWidth / 2;
      for (let y = 120; y < pageHeight; y += verticalStep) {
        const tileRect = {
          left: tileX,
          top: y,
          right: tileX + tileWidth,
          bottom: y + tileHeight,
        };
        const intersectsWithImage = imageRects.some(
          (imgRect) =>
            !(
              tileRect.right < imgRect.left + window.scrollX ||
              tileRect.left > imgRect.right + window.scrollX ||
              tileRect.bottom < imgRect.top + window.scrollY ||
              tileRect.top > imgRect.bottom + window.scrollY
            )
        );
        if (intersectsWithImage) continue;
        const tile = new window.Image();
        tile.src = watermarkImage.src;
        tile.style.cssText = `
        position: absolute; left: ${tileX}px; top: ${y}px; width: ${tileWidth}px; height: ${tileHeight}px;
        opacity: ${PAGE_WATERMARK_OPTIONS.opacity}; pointer-events: none;
        `;
        container.appendChild(tile);
      }
      Toast.show("页面水印已应用", 2000, "success");
    };
    watermarkImage.onerror = () => {
      Toast.show("页面水印SVG加载失败", 4000, "error");
    };
  }

  // 应用图片水印
  function applyToPageImages(watermarks) {
    if (watermarks.length === 0) {
      Toast.show("图片水印加载失败", 4000, "error");
      return;
    }
    const images = document.querySelectorAll(
      'img:not([data-watermarked="true"])'
    );
    if (images.length === 0) {
      Toast.show("未找到需要添加水印的新图片", 3000);
      return;
    }
    Toast.show(`为 ${images.length} 张图片添加水印...`, 3000, "success");
    images.forEach((img) => {
      const watermark =
        watermarks[Math.floor(Math.random() * watermarks.length)];
      img.crossOrigin = "Anonymous";
      const process = (target, wm) => {
        if (
          target.dataset.watermarked ||
          !target.naturalWidth ||
          !target.naturalHeight
        )
          return;
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = target.naturalWidth;
          canvas.height = target.naturalHeight;
          ctx.drawImage(target, 0, 0);
          ctx.globalAlpha = WATERMARK_OPTIONS.opacity;
          const fitRatio = Math.min(
            canvas.width / wm.naturalWidth,
            canvas.height / wm.naturalHeight
          );
          const finalScale = fitRatio * WATERMARK_OPTIONS.scale;
          const w = wm.naturalWidth * finalScale;
          const h = wm.naturalHeight * finalScale;
          const x = (canvas.width - w) / 2;
          const y = (canvas.height - h) / 2;
          ctx.drawImage(wm, x, y, w, h);
          target.dataset.watermarked = "true";
          target.src = canvas.toDataURL();
        } catch (e) {
          console.error("图片水印处理失败：", e);
        }
      };
      if (img.complete) {
        process(img, watermark);
      } else {
        img.onload = () => process(img, watermark);
      }
    });
  }

  // 加载并应用水印
  function addWatermarks() {
    const loadedWatermarks = [];
    let loadedCount = 0;
    let hasError = false;
    Toast.show(`预加载 ${WATERMARK_URLS.length} 个图片水印...`);
    const onAllLoaded = () => {
      if (hasError) {
        Toast.show("部分图片水印加载失败，仍将继续应用", 4000, "error");
      }
      applyToPageImages(loadedWatermarks.filter(Boolean));
      applyPageWatermark();
    };
    WATERMARK_URLS.forEach((url, i) => {
      const watermark = new window.Image();
      watermark.crossOrigin = "Anonymous";
      watermark.src = url;
      watermark.onload = () => {
        loadedCount++;
        loadedWatermarks[i] = watermark;
        if (loadedCount === WATERMARK_URLS.length) onAllLoaded();
      };
      watermark.onerror = () => {
        loadedCount++;
        hasError = true;
        console.error(`加载水印失败 #${i + 1}: ${url}`);
        if (loadedCount === WATERMARK_URLS.length) onAllLoaded();
      };
    });
    const buttons = document.querySelectorAll(
      'button[data-tag="commenter-name"]'
    );
    Copyrights();
  }

  // =======================================
  // ============== 菜单注册 ================
  // =======================================
  // 命令1：Patreon Expander - 手动启动页面优化和监控
  GM_registerMenuCommand("1. Patreon Expander", runPatreonExpander);
  // 命令2：Content Protector - 手动添加水印和防伪信息
  GM_registerMenuCommand("2. Copyright Protector", addWatermarks);
})();
