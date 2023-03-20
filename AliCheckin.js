// ==UserScript==
// @name         AliLearn Checkin
// @namespace    https://github.com/frosn0w/iOSscripts
// @version      1.0.1
// @description  Alibaba Product checkin
// @author       frosn0w
// @match        https://xue.alibaba-inc.com/trs/xue/home
// @icon         https://www.google.com/s2/favicons?sz=64&domain=alibaba-inc.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 定义一个定时器，每隔一秒检测元素是否存在
    var timer = setInterval(function(){
        // 获取所有span元素中，class=next-btn-helper的元素
        var spans = document.querySelectorAll("span.next-btn-helper");
        // 遍历这些元素
        for (var i = 0; i < spans.length; i++) {
            // 如果元素的文本内容为“签到”
            if (spans[i].innerText === "签到") {
                // 点击元素
                spans[i].click();
                // 清除定时器，不再执行
                clearInterval(timer);
            }
        }
    }, 1000);
})();
