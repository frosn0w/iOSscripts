// ==UserScript==
// @name         PatreonToolBox
// @namespace    https://github.com/frosn0w/iOSscripts
// @version      1.25.0926
// @description  Refactored Patreon page expander and watermarking tool. Modular, rule-driven, safer and more maintainable.
// @author       Frosn0w
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MzYgNDc2Ij48dGl0bGU+UGF0cmVvbiBsb2dvPC90aXRsZT48cGF0aCBkYXRhLWZpbGw9IjEiIGQ9Ik00MzYgMTQzYy0uMDg0LTYwLjc3OC00Ny41Ny0xMTAuNTkxLTEwMy4yODUtMTI4LjU2NUMyNjMuNTI4LTcuODg0IDE3Mi4yNzktNC42NDkgMTA2LjIxNCAyNi40MjQgMjYuMTQyIDY0LjA4OS45ODggMTQ2LjU5Ni4wNTEgMjI4Ljg4M2MtLjc3IDY3LjY1MCA2LjAwNCAyNDUuODQxIDEwNi44MyAyNDcuMTEgNzQuOTE3Ljk0OCA4Ni4wNzItOTUuMjc5IDEyMC43MzctMTQxLjYyMyAyNC42NjItMzIuOTcyIDU2LjQxNy00Mi4yODUgOTUuNTA3LTUxLjkyOUMzOTAuMzA5IDI2NS44NjUgNDM2LjA5NyAyMTMuMDExIDQzNiAxNDNaIj48L3BhdGg+PC9zdmc+
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  // ==================================================
  // ================ Utility Module ==================
  // ==================================================
  const Utils = (() => {
    const removedCache = new WeakSet();

    function injectStyle(id, css) {
      if (!id) return;
      const existing = document.getElementById(id);
      if (existing) return existing;
      const style = document.createElement("style");
      style.id = id;
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    }

    function safeRemove(input, selector = null, ascend = 0) {
      try {
        const el =
          typeof input === "string" ? document.querySelector(input) : input;
        if (!el) return false;
        const target = selector ? el.closest(selector) : el;
        if (!target || !target.parentElement) return false;
        if (removedCache.has(target)) return false;
        let parent = target;
        for (let i = 0; i < ascend; i++) {
          parent = parent?.parentElement;
          if (!parent) break;
        }
        if (parent) {
          parent.remove();
          removedCache.add(target);
          return true;
        }
      } catch (err) {
        console.error("safeRemove error:", err);
      }
      return false;
    }

    function safeClick(
      button,
      interval = 1000,
      expectedText = null,
      maxAttempts = 12
    ) {
      if (!button || button.__gmAutoClick) return;
      let attempts = 0;
      button.__gmAutoClick = setInterval(() => {
        attempts++;
        try {
          if (
            !document.contains(button) ||
            button.disabled ||
            button.getAttribute("aria-busy") === "true"
          ) {
            clearInterval(button.__gmAutoClick);
            delete button.__gmAutoClick;
            return;
          }
          if (expectedText && button.textContent !== expectedText) {
            clearInterval(button.__gmAutoClick);
            delete button.__gmAutoClick;
            return;
          }
          if (attempts > maxAttempts) {
            clearInterval(button.__gmAutoClick);
            delete button.__gmAutoClick;
            return;
          }
          button.click();
        } catch (e) {
          clearInterval(button.__gmAutoClick);
          delete button.__gmAutoClick;
        }
      }, interval);
    }

    function formatDateFromNow(date = new Date()) {
      // Returns object with month/day strings
      return { month: date.getMonth() + 1, day: date.getDate() };
    }

    function todayString() {
      const d = new Date();
      return `${d.getMonth() + 1}月${d.getDate()}日`;
    }

    function yesterdayString() {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return `${d.getMonth() + 1}月${d.getDate()}日`;
    }

    return {
      injectStyle,
      safeRemove,
      safeClick,
      formatDateFromNow,
      todayString,
      yesterdayString,
    };
  })();

  // ==================================================
  // =================== Toast Module =================
  // ==================================================
  const Toast = (() => {
    let id = "gm-toast-styles";
    let styleInjected = false;
    const containerClass = "gm-toast-container";

    const styles = `
      .${containerClass} { position: fixed; top: 20px; right: 20px; z-index: 9999999; display: flex; flex-direction: column; align-items: flex-end; pointer-events: none; }
      .gm-toast { background-color: rgba(0, 0, 0, 0.8); color: white; padding: 10px 20px; border-radius: 8px; margin-bottom: 10px; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.15); opacity: 0; transform: translateX(100%); transition: opacity 0.3s ease, transform 0.3s ease; pointer-events: auto; }
      .gm-toast.show { opacity: 1; transform: translateX(0); }
      .gm-toast.success { background-color: rgba(27, 153, 68, 0.9); }
      .gm-toast.error { background-color: rgba(212, 59, 59, 0.9); }
    `;

    function init() {
      if (styleInjected) return;
      Utils.injectStyle(id, styles);
      styleInjected = true;
    }

    function show(message, duration = 3000, type = "") {
      init();
      let container = document.querySelector(`.${containerClass}`);
      if (!container) {
        container = document.createElement("div");
        container.className = containerClass;
        document.body.appendChild(container);
      }
      const el = document.createElement("div");
      el.className = `gm-toast ${type}`;
      el.textContent = message;
      container.appendChild(el);
      // animate
      requestAnimationFrame(() => el.classList.add("show"));
      setTimeout(() => {
        el.classList.remove("show");
        el.addEventListener("transitionend", () => el.remove(), { once: true });
      }, duration);
    }

    return { show };
  })();

  // ==================================================
  // ======== Patreon Configuration & Styles ==========
  // ==================================================
  const CONFIG = {
    REMAIN_DAYS: 1,
    STYLE_ID: "patreon-expander-styles",
    PATREON_GLOBAL_STYLES: `
      :root { --global-borderWidth-thin: 0px !important; --global-bg-pageAlt-default: #f1f1f1; }
      #TAI-Postcard-id { --Card-radius-enabled: 0; background-color: #ffffff; }
      #TAI-Hostpost-id div div div p { margin: 8px 0 !important; font-size: 17px !important; line-height: 1.4 !important; }
      #TAI-Hostpost-id li p { margin: 6px 0 !important; }
      #TAI-Hostpost-id ul { margin: 6px 0 !important; }
      #TAI-Hostpost-id h3 { font-size: 20px !important; }
      #TAI-title-id a { font-size: 24px !important; }
      #TAI-comment-id { border-radius: 8px !important; }
      #TAI-comment-id p div { line-height: 1.3 !important; }
      #TAI-comment-id div button span { font-size: 17px !important; }
    `,
  };

  // ==================================================
  // ============= Remove Outdated Post ===============
  // ==================================================
  function shouldRemovePost(text) {
    if (!text) return false;
    const remainDays = Number(CONFIG.REMAIN_DAYS);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    //匹配x天前，允许没有空格、普通空格、NBSP（\u00A0）或全角空格（\u3000）
    const match1 = String(text).match(/(\d+)[\s\u00A0\u3000]*天前/);
    if (match1) {
      const days = parseInt(match1[1], 10);
      if (!Number.isNaN(days) && days > remainDays) {
        return true;
      }
    }

    //匹配跨年与超过保留天数
    const match2 = text.match(/(\d{1,2})月(\d{1,2})日/);
    const month = parseInt(match2[1], 10);
    const day = parseInt(match2[2], 10);
    if (month < currentMonth || (currentMonth === 1 && month === 12)) {
      return true;
    }
    if (month === currentMonth && currentDay - day > remainDays) {
      return true;
    }
    return false;
  }

  // ==================================================
  // =================== Rule Engine ==================
  // ==================================================
  // Rules are intentionally written to preserve original behaviour.
  const RULES = {
    a: [
      {
        test: (el) =>
          el.dataset?.tag === "post-published-at" &&
          shouldRemovePost(el.textContent),
        action: (el) => Utils.safeRemove(el, 'div[data-tag="post-card"]', 2),
      },
      // 格式化日期
      {
        test: (el) => /小时前|分钟前/.test(el.textContent),
        action: (el) => (el.textContent = Utils.todayString()),
      },
      {
        test: (el) => el.textContent?.includes("昨天"),
        action: (el) => (el.textContent = Utils.yesterdayString()),
      },
      // 移除赠送礼物区域
      {
        test: (el) => el.href === "https://www.patreon.com/u80821958/gift",
        action: (el) => Utils.safeRemove(el, null, 4),
      },
      // 移除“跳过导航”标签
      {
        test: (el) => el.textContent === "跳过导航",
        action: (el) => el.remove(),
      },
      {
        test: (el) => el.dataset?.tag === "comment-avatar-wrapper",
        action: (el) => Utils.safeRemove(el, null, 1),
      },
    ],

    button: [
      // 移除移动端筛选按钮
      {
        test: (el) =>
          el.getAttribute("aria-label") ===
          "creator-public-page-post-all-filters-toggle",
        action: (el) => Utils.safeRemove(el, null, 4),
      },
      // 展开内容并移除按钮
      {
        test: (el) => ["收起", "收起回复"].includes(el.textContent),
        action: (el) => Utils.safeRemove(el, null, 1),
      },
      {
        test: (el) =>
          ["展开", "加载更多留言", "加载回复"].includes(el.textContent),
        action: (el) => Utils.safeClick(el, {}),
      },
      // 简化作者名
      {
        test: (el) =>
          el.dataset?.tag === "commenter-name" &&
          el.textContent === "贝乐斯 Think Analyze Invest",
        action: (el) => (el.textContent = "贝乐斯"),
      },
      // 移除评论区“更多”按钮
      {
        test: (el) => el.getAttribute("data-tag") === "comment-more-actions",
        action: (el) => el.remove(),
      },
    ],

    div: [
      // 移除新版双层导航栏
      {
        test: (el) => el.dataset?.tag === "mobile-nav-hamburger-button",
        action: (el) => Utils.safeRemove(el, "nav", 5),
      },
      // 移除隐藏导航栏
      {
        test: (el) => el.id === "main-app-navigation",
        action: (el) => Utils.safeRemove(el, null, 1),
      },
      // 移除搜索框（网站改版中，移动端暂不显示）
      {
        test: (el) => el.dataset?.tag === "search-input-box",
        action: (el) => Utils.safeRemove(el, null, 5),
      },
      // 移除“新功能”标签
      {
        test: (el) => el.dataset?.tag === "chip-container",
        action: (el) => Utils.safeRemove(el, null, 2),
      },
      {
        test: (el) => el.dataset?.tag === "post-details",
        action: (el) => Utils.safeRemove(el),
      },
      {
        test: (el) =>
          el.dataset?.tag === "comment-body" &&
          el.textContent?.includes("此留言已被移除"),
        action: (el) => Utils.safeRemove(el, null, 3),
      },
      {
        test: (el) => el.dataset?.tag === "comment-actions",
        action: (el) => Utils.safeRemove(el),
      },
      {
        test: (el) => el.dataset?.tag === "comment-field-box",
        action: (el) => Utils.safeRemove(el, null, 3),
      },
      // 缩小页边距
      {
        test: (el) => el.dataset?.tag === "cw-post-stream-container",
        action: (el) => {
          el.parentNode?.parentNode?.style.setProperty("padding-left", "0px");
          el.parentNode?.parentNode?.style.setProperty("padding-right", "0px");
        },
      },
      // 移除发布卡片圆角
      {
        test: (el) => el.dataset?.tag === "post-card",
        action: (el) => {
          el.classList.add("TAI-Postcard");
          el.setAttribute("id", "TAI-Postcard-id");
        },
      },
      // 插入评论区样式
      {
        test: (el) => el.dataset?.tag === "comment-body",
        action: (el) => {
          el.parentNode?.classList.add("TAI-comment");
          el.parentNode?.setAttribute("id", "TAI-comment-id");
        },
      },
    ],

    span: [
      // 插入发布区样式
      {
        test: (el) => el.getAttribute("data-tag") === "post-title",
        action: (el) => {
          const targetElement =
            el.parentNode?.parentNode?.parentNode?.parentNode;
          targetElement?.classList.add("TAI-Hostpost");
          targetElement?.setAttribute("id", "TAI-Hostpost-id");
          el.classList.add("TAI-title");
          el.setAttribute("id", "TAI-title-id");
        },
      },
    ],
  };

  // Map for button auto-click intervals used previously
  const BUTTON_INTERVALS = { 展开: 3888, 加载更多留言: 1666, 加载回复: 1888 };

  // Helper to run safeClick with previous semantics
  function clickWithIntervals(el) {
    const interval = BUTTON_INTERVALS[el.textContent] || 1500;
    Utils.safeClick(el, interval, el.textContent, 20);
  }

  // ==================================================
  // ============== Element Processor =================
  // ==================================================
  function processElement(el) {
    if (!el || el.nodeType !== 1) return;
    const tag = el.tagName.toLowerCase();
    const rules = RULES[tag];
    if (!rules) return;
    for (const rule of rules) {
      try {
        if (rule.test(el)) {
          // special-case for click rule object
          if (
            tag === "button" &&
            rule.action &&
            rule.action.name === "bound "
          ) {
            // noop
          }
          // If action references clickWithIntervals marker, call it
          if (rule.test && rule.action === Utils.safeClick) {
            clickWithIntervals(el);
            break;
          }

          // If action is the generic placeholder we used earlier, handle click
          if (
            tag === "button" &&
            ["展开", "加载更多留言", "加载回复"].includes(el.textContent)
          ) {
            clickWithIntervals(el);
            break;
          }

          // Otherwise execute action
          rule.action(el);
          break; // break after first matching rule to mimic original logic
        }
      } catch (e) {
        console.error("rule action error:", e);
      }
    }
  }

  // ==================================================
  // ============ Patreon Expander Module =============
  // ==================================================
  let observer = null;
  let isObserverActive = false;

  function scanAndProcess(root = document) {
    // process the root if it is a target
    const candidates = root.querySelectorAll("a, button, div, span");
    // also include the root itself if it matches
    if (root.matches && root.matches("a, button, div, span"))
      processElement(root);
    candidates.forEach((el) => processElement(el));
  }

  function runPatreonExpander() {
    if (!window.location.hostname.includes("patreon.com")) {
      Toast.show("此功能专为Patreon网站设计", 3000, "error");
      return;
    }
    if (isObserverActive) {
      Toast.show("页面优化功能已在运行中", 3000);
      return;
    }

    Toast.show("开始执行Patreon页面优化...", 2000, "success");

    // inject global styles
    Utils.injectStyle(CONFIG.STYLE_ID, CONFIG.PATREON_GLOBAL_STYLES);

    // initial pass
    scanAndProcess(document);

    // optimized mutation observer
    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return; // only elements
            // If node itself is relevant, process it directly; otherwise limited query for performance
            if (node.matches && node.matches("a, button, div, span")) {
              processElement(node);
            }
            // Query children but limit selector to only the needed tags (short-circuiting large trees)
            const inner = node.querySelectorAll("a, button, div, span");
            inner.forEach((el) => processElement(el));
          });
        } else if (m.type === "attributes" || m.type === "characterData") {
          const targetElement =
            m.target.nodeType === Node.TEXT_NODE
              ? m.target.parentElement
              : m.target;
          if (
            targetElement &&
            typeof targetElement.matches === "function" &&
            targetElement.matches("button")
          ) {
            processElement(targetElement);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
    isObserverActive = true;
    Toast.show("页面动态监控已启动", 2500, "success");
  }

  // ==================================================
  // =============== Watermark Module =================
  // ==================================================
  const WATERMARK_URLS = [
    "https://raw.githubusercontent.com/frosn0w/Pic-Bed/refs/heads/main/Patreon_WM/WM.Wechat.LGRAY.png",
    "https://raw.githubusercontent.com/frosn0w/Pic-Bed/refs/heads/main/Patreon_WM/WM.Wechat.CLR.png",
  ];

  const WATERMARK_OPTIONS = { scale: 0.4, opacity: 0.99 };

  const PAGE_WATERMARK_OPTIONS = {
    url: WATERMARK_URLS[0],
    width: 160,
    opacity: 0.99,
    verticalSpacing: 400,
    // these distances are used to avoid watermarking the top and bottom of the page
    pagetopdistance: 120,
    pagebuttomdistance: 200,
  };

  function applyPageWatermark() {
    const WATERMARK_ID = "gm-page-watermark-container";
    if (document.getElementById(WATERMARK_ID)) return;
    const watermarkImage = new Image();
    watermarkImage.crossOrigin = "Anonymous";
    watermarkImage.src = PAGE_WATERMARK_OPTIONS.url;
    watermarkImage.onload = () => {
      const pageWidth = Math.max(
        document.documentElement.scrollWidth,
        document.body.scrollWidth
      );
      const pageHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      const container = document.createElement("div");
      container.id = WATERMARK_ID;
      container.style.cssText = `position:absolute;top:0;left:0;width:${pageWidth}px;height:${pageHeight}px;z-index:9999998;pointer-events:none;`;
      document.body.appendChild(container);

      const imgs = Array.from(document.querySelectorAll("img")).map((i) =>
        i.getBoundingClientRect()
      );
      const tileWidth = PAGE_WATERMARK_OPTIONS.width;
      const tileHeight =
        watermarkImage.naturalHeight *
        (tileWidth / watermarkImage.naturalWidth);
      const verticalStep = tileHeight + PAGE_WATERMARK_OPTIONS.verticalSpacing;
      const tileX = window.innerWidth / 2 - tileWidth / 2;
      const topdistance = PAGE_WATERMARK_OPTIONS.pagetopdistance;
      const buttomdistance = PAGE_WATERMARK_OPTIONS.pagebuttomdistance;
      for (
        let y = topdistance;
        y < pageHeight - buttomdistance;
        y += verticalStep
      ) {
        const tileRect = {
          left: tileX,
          top: y,
          right: tileX + tileWidth,
          bottom: y + tileHeight,
        };
        const intersects = imgs.some(
          (imgRect) =>
            !(
              tileRect.right < imgRect.left + window.scrollX ||
              tileRect.left > imgRect.right + window.scrollX ||
              tileRect.bottom < imgRect.top + window.scrollY ||
              tileRect.top > imgRect.bottom + window.scrollY
            )
        );
        if (intersects) continue;
        const tile = new Image();
        tile.src = watermarkImage.src;
        tile.style.cssText = `position:absolute;left:${tileX}px;top:${y}px;width:${tileWidth}px;height:${tileHeight}px;opacity:${PAGE_WATERMARK_OPTIONS.opacity};pointer-events:none;`;
        container.appendChild(tile);
      }
      Toast.show("页面水印已应用", 2000, "success");
    };
    watermarkImage.onerror = () =>
      Toast.show("页面水印SVG加载失败", 4000, "error");
  }

  function applyToPageImages(watermarks) {
    if (!watermarks || watermarks.length === 0) {
      Toast.show("图片水印加载失败", 4000, "error");
      return;
    }
    const images = Array.from(
      document.querySelectorAll('img:not([data-watermarked="true"])')
    );
    if (images.length === 0) {
      Toast.show("未找到需要添加水印的新图片", 3000);
      return;
    }
    Toast.show(`为 ${images.length} 张图片添加水印...`, 3000, "success");

    // batch processing to avoid long main-thread blocking
    const batchSize = 8;
    let idx = 0;

    function processBatch() {
      const slice = images.slice(idx, idx + batchSize);
      slice.forEach((img) => {
        try {
          const watermark =
            watermarks[Math.floor(Math.random() * watermarks.length)];
          img.crossOrigin = "Anonymous";
          function doProcess(target, wm) {
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
          }
          if (img.complete) doProcess(img, watermark);
          else img.onload = () => doProcess(img, watermark);
        } catch (e) {
          console.error(e);
        }
      });
      idx += batchSize;
      if (idx < images.length) setTimeout(processBatch, 120);
    }

    processBatch();
  }

  function addWatermarks() {
    Toast.show(`预加载 ${WATERMARK_URLS.length} 个图片水印...`);
    const loaded = [];
    let count = 0;
    let hasError = false;
    function maybeDone() {
      if (count === WATERMARK_URLS.length) {
        if (hasError)
          Toast.show("部分图片水印加载失败，仍将继续应用", 4000, "error");
        applyToPageImages(loaded.filter(Boolean));
        applyPageWatermark();
      }
    }
    WATERMARK_URLS.forEach((u, i) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = u;
      img.onload = () => {
        loaded[i] = img;
        count++;
        maybeDone();
      };
      img.onerror = () => {
        hasError = true;
        count++;
        Toast.show(`加载水印失败 #${i + 1}: ${u}`, 4000, "error");
        maybeDone();
      };
    });

    // small UI changes: weaken text color and replace author buttons as before
    (function applyCopyrights() {
      const styleTag = document.getElementById(CONFIG.STYLE_ID);
      if (styleTag)
        styleTag.textContent += `\n#TAI-Hostpost-id div p { color: #222222 !important; }`;
      const buttons = document.querySelectorAll(
        'button[data-tag="commenter-name"]'
      );
      buttons.forEach((btn) => {
        if (btn.textContent.trim() === "贝乐斯") {
          btn.textContent = "正版来微信 ZWG5427";
        }
      });
      Toast.show("文字颜色减弱、博主名替换已完成", 3000);
    })();
  }

  // ==================================================
  // ================= Fakers Module ==============
  // ==================================================
  function forFakers() {
    const ps = document.querySelectorAll("div p");
    ps.forEach((p) => {
      let text = p.textContent;
      // 1. 替换特定词语
      text = text
        .replace(/美国/g, "雅加达")
        .replace(/中国/g, "叙利亚")
        .replace(/黄金/g, "煤炭")
        .replace(/债券/g, "稀土")
        .replace(/股票/g, "债券")
        .replace(/BTC/g, "DSB")
        .replace(/文明/g, "物理")
        .replace(/信仰/g, "钢铁")
        .replace(/左/g, "西")
        .replace(/右/g, "北纬")
        .replace(/历史/g, "会计")
        .replace(/风险/g, "机会")
        .replace(/人性/g, "文盲")
        .replace(/不是/g, "是")
        .replace(/人性/g, "狼狗");
      // 2. 替换数字为同位数随机数
      text = text.replace(/\d+/g, (match) => {
        return match
          .split("")
          .map(() => Math.floor(Math.random() * 10))
          .join("");
      });
      p.textContent = text;
    });
  }

  // ==================================================
  // ================= Menu Registration ==============
  // ==================================================
  try {
    GM_registerMenuCommand("1. Patreon Expander", runPatreonExpander);
    GM_registerMenuCommand("2. Copyright Protector", addWatermarks);
    GM_registerMenuCommand("3. For Fakers", forFakers);
  } catch (e) {
    // graceful fallback for environments without GM API
    console.warn("GM_registerMenuCommand not available:", e);
  }
})();