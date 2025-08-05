// ==UserScript==
// @name         PatreonToolBox
// @namespace    https://github.com/frosn0w/iOSscripts
// @version      1.25.0805
// @description  Patreon page expander and watermarking tool.
// @author       frosn0w
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MzYgNDc2Ij48dGl0bGU+UGF0cmVvbiBsb2dvPC90aXRsZT48cGF0aCBkYXRhLWZpbGw9IjEiIGQ9Ik00MzYgMTQzYy0uMDg0LTYwLjc3OC00Ny41Ny0xMTAuNTkxLTEwMy4yODUtMTI4LjU2NUMyNjMuNTI4LTcuODg0IDE3Mi4yNzktNC42NDkgMTA2LjIxNCAyNi40MjQgMjYuMTQyIDY0LjA4OS45ODggMTQ2LjU5Ni4wNTEgMjI4Ljg4M2MtLjc3IDY3LjY1MCA2LjAwNCAyNDUuODQxIDEwNi44MyAyNDcuMTEgNzQuOTE3Ljk0OCA4Ni4wNzItOTUuMjc5IDEyMC43MzctMTQxLjYyMyAyNC42NjItMzIuOTcyIDU2LjQxNy00Mi4yODUgOTUuNTA3LTUxLjkyOUMzOTAuMzA5IDI2NS44NjUgNDM2LjA5NyAyMTMuMDExIDQzNiAxNDNaIj48L3BhdGg+PC9zdmc+
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  // ================================================================
  // ===== 全局模块: 轻量级Toast通知 =====
  // ================================================================
  const Toast = {
    styleInjected: false,
    init: function () {
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
    show: function (message, duration = 3000, type = '') {
      this.init();
      let container = document.querySelector('.gm-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'gm-toast-container';
        document.body.appendChild(container);
      }
      const toastElement = document.createElement('div');
      toastElement.className = `gm-toast ${type}`;
      toastElement.textContent = message;
      container.appendChild(toastElement);
      setTimeout(() => { toastElement.classList.add('show'); }, 10);
      setTimeout(() => {
        toastElement.classList.remove('show');
        toastElement.addEventListener('transitionend', () => { toastElement.remove(); });
      }, duration);
    }
  };


  // ================================================================
  // ===== SECTION 1: Patreon Expander 功能代码 =====
  // ================================================================
  const patreonConfig = {
    REMAIN_DAYS: 1,
    STYLE_ID: "patreon-expander-styles",
  };

  const patreonGlobalStyles = `
      div[data-tag="comment-row"]::before,
      div[data-tag="comment-row"]::after { width: 0 !important; border-left: 0 !important; }
      #TAI-global-id p { margin: 8px 0 !important; font-size: 17px !important; line-height: 1.4 !important; }
      #TAI-global-id li p { margin: 6px 0 !important; }
      #TAI-global-id ul { margin: 6px 0 !important; }
      #TAI-global-id h3 { font-size: 20px !important; }
      #TAI-title-id a { font-size: 24px !important; }
      #TAI-comment-id p div { line-height: 1.3 !important; }
      #TAI-comment-id div button span { font-size: 17px !important; }
    `;

  const DateFormatter = {
    currentDate: new Date(),
    refresh() { this.currentDate = new Date(); },
    get formattedDate() { return `${this.currentMonth}月${this.currentDay}日`; },
    get yesterdayDate() {
      const date = new Date(this.currentDate);
      date.setDate(date.getDate() - 1);
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    get currentMonth() { return this.currentDate.getMonth() + 1; },
    get currentDay() { return this.currentDate.getDate(); },
  };

  const safeRemove = (() => {
    const removedCache = new WeakSet();
    return (element, selector = null, levels = 0) => {
      if (!element || !element?.parentElement || removedCache.has(element)) return false;
      try {
        const target = selector ? element.closest(selector) : element;
        if (!target) return false;
        let parent = target;
        for (let i = 0; i < levels; i++) parent = parent?.parentElement;
        if (!parent) return false;
        parent.remove();
        removedCache.add(element);
        return true;
      } catch (error) { console.error("Removal failed:", error); return false; }
    };
  })();

  function shouldRemovePost(text) {
    const { currentMonth, currentDay } = DateFormatter;
    return (
      text.includes(" 天前") ||
      (text.includes(`${currentMonth}月`) && parseInt(text.split(`${currentMonth}月`)[1]) < currentDay - patreonConfig.REMAIN_DAYS) ||
      (text.includes(`${currentMonth}月`) && parseInt(text.split(`${currentMonth}月`)[0]) === currentMonth - 1)
    );
  }

  function processLinks(element) {
    const { textContent, href, dataset } = element;
    if (dataset.tag === "post-published-at" && shouldRemovePost(textContent)) safeRemove(element, 'div[data-tag="post-card"]', 2);
    else if (/小时前|分钟前/.test(textContent)) element.textContent = DateFormatter.formattedDate;
    else if (textContent.includes("昨天")) element.textContent = DateFormatter.yesterdayDate;
    else if (href === "https://www.patreon.com/user/gift?u=80821958") safeRemove(element, null, 4);
    else if (textContent === "Skip navigation") element.remove();
    else if (dataset.tag === "comment-avatar-wrapper") safeRemove(element, null, 1);
  }

  function processButtons(button) {
    const { textContent, ariaExpanded, ariaLabel, dataset } = button;
    const BUTTON_INTERVALS = { "展开": 4888, "加载更多留言": 1688, "加载回复": 1888, };
    if (ariaExpanded === "false" && ariaLabel === "打开导航") safeRemove(button, "header");
    else if (ariaLabel === "creator-public-page-post-all-filters-toggle") safeRemove(button, null, 4);
    else if (["收起", "收起回复"].includes(textContent)) safeRemove(button, null, 1);
    else if (Object.keys(BUTTON_INTERVALS).includes(textContent)) {
      if (!button.autoClicker) {
        button.autoClicker = setInterval(() => { document.contains(button) ? button.click() : clearInterval(button.autoClicker); }, BUTTON_INTERVALS[textContent]);
      }
    } else if (dataset.tag === "commenter-name" && textContent === "贝乐斯 Think Analyze Invest") button.textContent = "贝乐斯";
  }

  function processDivs(element) {
    const { dataset, id, ariaExpanded, textContent } = element;
    if (id === "main-app-navigation") safeRemove(element, null, 1);
    else if (ariaExpanded === "false" && textContent.includes("我的会籍")) safeRemove(element, "nav", 3);
    else if (dataset.tag === "creation-name" && textContent.includes("Love & Peace !")) safeRemove(element, null, 4);
    else if (dataset.tag === "search-input-box") safeRemove(element, null, 5);
    else if (dataset.tag === "chip-container") safeRemove(element, null, 2);
    else if (dataset.tag === "post-details") safeRemove(element);
    else if (dataset.tag === "comment-body" && textContent.includes("此留言已被移除。")) safeRemove(element, null, 3);
    else if (dataset.tag === "comment-actions") safeRemove(element);
    else if (dataset.tag === "comment-field-box") safeRemove(element, null, 3);
    else if (dataset.tag === "post-stream-container") {
      element.parentNode?.style.setProperty("padding-left", "4px");
      element.parentNode?.style.setProperty("padding-right", "4px");
    } else if (dataset.tag === "comment-body") {
      element.parentNode?.classList.add("TAI-comment");
      element.parentNode?.setAttribute("id", "TAI-comment-id");
    }
  }

  function processSpans(element) {
    if (element.getAttribute("data-tag") === "post-title") {
      const targetElement = element.parentNode?.parentNode?.parentNode?.parentNode?.parentNode;
      targetElement?.classList.add("TAI-global");
      targetElement?.setAttribute("id", "TAI-global-id");
      element.classList.add("TAI-title");
      element.setAttribute("id", "TAI-title-id");
    }
  }

  function runPatreonExpander() {
    if (!window.location.hostname.includes('patreon.com')) { Toast.show('此功能专为Patreon网站设计。', 3000, 'error'); return; }
    Toast.show('开始执行Patreon页面优化...', 2000, 'success');
    if (!document.getElementById(patreonConfig.STYLE_ID)) {
      const style = document.createElement("style");
      style.id = patreonConfig.STYLE_ID;
      style.textContent = patreonGlobalStyles;
      document.head.appendChild(style);
    }
    DateFormatter.refresh();
    document.querySelectorAll("a").forEach(processLinks);
    document.querySelectorAll("button").forEach(processButtons);
    document.querySelectorAll("div").forEach(processDivs);
    document.querySelectorAll("span").forEach(processSpans);
  }

  // ================================================================
  // ===== SECTION 2: 复合水印功能 (图片+页面) =====
  // ================================================================

  // --- 配置: 为图片添加的水印 ---
  const watermarkUrls = [
    'https://raw.githubusercontent.com/frosn0w/Pic-Bed/refs/heads/main/Patreon_WM/WM.Wechat.LGRAY.svg',
    'https://raw.githubusercontent.com/frosn0w/Pic-Bed/refs/heads/main/Patreon_WM/WM.Wechat.CLR.svg'
  ];
  const watermarkOptions = {
    scale: 0.35,
    opacity: 0.9,
  };

  // --- 配置: 为整个页面平铺的水印 ---
  const pageWatermarkOptions = {
    url: 'https://raw.githubusercontent.com/frosn0w/Pic-Bed/refs/heads/main/Patreon_WM/WM.Wechat.DGRAY.svg',
    width: 40,
    opacity: 0.8,
    angle: 0,
    horizontalPadding: 320,
    verticalPadding: 400,
  };

  // 功能1: 为整个页面添加平铺水印并避开图片
  function applyPageWatermark() {
    const WATERMARK_ID = 'gm-page-watermark-container';
    if (document.getElementById(WATERMARK_ID)) {
      console.log('Page watermark already exists.');
      return;
    }

    const watermarkImage = new Image();
    watermarkImage.crossOrigin = 'Anonymous';
    watermarkImage.src = pageWatermarkOptions.url;

    watermarkImage.onload = () => {
      const container = document.createElement('div');
      container.id = WATERMARK_ID;

      // 定义平铺水印的容器样式
      const pageWidth = document.body.scrollWidth;
      const pageHeight = document.body.scrollHeight;
      container.style.cssText = `
                position: absolute; /* absolute:相对于整个文档定位 */
                top: 0;
                left: 0;
                width: ${pageWidth}px; /* 宽度为文档滚动宽度 */
                height: ${pageHeight}px; /* 高度为文档滚动高度 */
                z-index: 9999998;
                pointer-events: none;
            `;
      document.body.appendChild(container);

      const imageRects = Array.from(document.querySelectorAll('img')).map(img => img.getBoundingClientRect());
      const tileWidth = pageWatermarkOptions.width;
      const tileHeight = watermarkImage.naturalHeight * (tileWidth / watermarkImage.naturalWidth);
      const horizontalStep = tileWidth + pageWatermarkOptions.horizontalPadding;
      const verticalStep = tileHeight + pageWatermarkOptions.verticalPadding;

      // 循环范围设为整个文档
      for (let y = 50; y < pageHeight; y += verticalStep) {
        for (let x = 20; x < pageWidth; x += horizontalStep) {
          const tileRect = {
            left: x, top: y, right: x + tileWidth, bottom: y + tileHeight,
          };
          const intersectsWithImage = imageRects.some(imgRect =>
            !(tileRect.right < (imgRect.left + window.scrollX) ||
              tileRect.left > (imgRect.right + window.scrollX) ||
              tileRect.bottom < (imgRect.top + window.scrollY) ||
              tileRect.top > (imgRect.bottom + window.scrollY))
          );

          if (intersectsWithImage) continue;

          const tile = new Image();
          tile.src = watermarkImage.src;
          tile.style.cssText = `
                        position: absolute;
                        left: ${x}px;
                        top: ${y}px;
                        width: ${tileWidth}px;
                        height: ${tileHeight}px;
                        opacity: ${pageWatermarkOptions.opacity};
                        transform: rotate(${pageWatermarkOptions.angle}deg);
                        pointer-events: none;
                    `;
          container.appendChild(tile);
        }
      }
      Toast.show('页面水印已应用。', 2000, 'success');
    };
    watermarkImage.onerror = () => { Toast.show('页面水印SVG加载失败。', 4000, 'error'); };
  }

  // 功能2: 为图片添加水印的主流程函数
  function addWatermarks() {
    const loadedWatermarks = []; let loadedCount = 0; let hasError = false;
    Toast.show(`预加载 ${watermarkUrls.length} 个图片水印...`);
    const onAllLoaded = () => {
      if (hasError) { Toast.show('部分图片水印加载失败。', 4000, 'error'); return; }
      applyToPageImages(loadedWatermarks);
      applyPageWatermark();
    };
    watermarkUrls.forEach((url, i) => {
      const watermark = new Image(); watermark.crossOrigin = 'Anonymous'; watermark.src = url;
      watermark.onload = () => { loadedCount++; loadedWatermarks[i] = watermark; if (loadedCount === watermarkUrls.length) onAllLoaded(); };
      watermark.onerror = () => { loadedCount++; hasError = true; console.error(`加载水印失败 #${i + 1}: ${url}`); if (loadedCount === watermarkUrls.length) onAllLoaded(); };
    });
  }

  // 水印叠加到图片的函数
  function applyToPageImages(watermarks) {
    if (watermarks.length === 0) { Toast.show('图片水印加载失败。', 4000, 'error'); return; }
    const images = document.querySelectorAll('img:not([data-watermarked="true"])');
    if (images.length === 0) { Toast.show('未找到新图片。', 3000); return; }
    Toast.show(`为 ${images.length} 张图片添加水印...`, 3000, 'success');
    images.forEach((img) => {
      const watermark = watermarks[Math.floor(Math.random() * watermarks.length)];
      img.crossOrigin = 'Anonymous';
      const process = (target, wm) => {
        if (target.dataset.watermarked || !target.naturalWidth || !target.naturalHeight) return;
        const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
        canvas.width = target.naturalWidth; canvas.height = target.naturalHeight;
        ctx.drawImage(target, 0, 0); ctx.globalAlpha = watermarkOptions.opacity;
        const fitRatio = Math.min(canvas.width / wm.naturalWidth, canvas.height / wm.naturalHeight);
        const finalScale = fitRatio * watermarkOptions.scale;
        const w = wm.naturalWidth * finalScale, h = wm.naturalHeight * finalScale;
        const x = (canvas.width - w) / 2, y = (canvas.height - h) / 2;
        ctx.drawImage(wm, x, y, w, h);
        target.dataset.watermarked = 'true'; target.src = canvas.toDataURL();
      };
      if (img.complete) process(img, watermark); else img.onload = () => process(img, watermark);
    });
  }

  // ================================================================
  // ===== SECTION 3: 菜单命令注册 =====
  // ================================================================
  GM_registerMenuCommand('Patreon Expander', runPatreonExpander);
  GM_registerMenuCommand('Copyright Process', addWatermarks);

})();