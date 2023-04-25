// ==UserScript==
// @name         CheckinSuite
// @namespace    https://github.com/frosn0w/iOSscripts
// @version      1.1
// @description  Checkin all in one
// @author       frosn0w
// @match        https://xue.alibaba-inc.com/trs/xue/home*
// @match        https://hifini.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=alibaba-inc.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // 定义一个定时器，每隔一秒检测元素是否存在
    var timer = setInterval(function(){
        // find all spans
        var spans = document.querySelectorAll("span");
        for (var i = 0; i < spans.length; i++) {
            //alilearn
            if (spans[i].getAttribute("class") === "next-btn-helper" || spans[i].innerText === "签到") {
                spans[i].click();
            }
            //hifini
            else if (spans[i].getAttribute("class") === "mibbs_signpanel JD_sign " || spans[i].innerText === "签到") {
                spans[i].click();
            }
            else continue;
        }
    }, 1500);
})();
