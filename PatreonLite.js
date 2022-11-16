// ==UserScript==
// @name         PatreonLite
// @namespace    https://github.com/frosn0w/iOSscripts
// @version      1.1.5
// @description  Author post only, all comments removed.
// @author       frosn0w
// @match        *://*.patreon.com/*
// @run-at       document-end
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAhGVYSWZNTQAqAAAACAAFARIAAwAAAAEAAQAAARoABQAAAAEAAABKARsABQAAAAEAAABSASgAAwAAAAEAAgAAh2kABAAAAAEAAABaAAAAAAAAAEgAAAABAAAASAAAAAEAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAQKADAAQAAAABAAAAQAAAAAC1ay+zAAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgoZXuEHAAAGJ0lEQVR4Ae1ZW09UVxT+5syAMOAg6CAVEEmbtE1RRMTSVN98g4fCQ03sU+mbTXywSf0J9sEnU3+ANbHWpmBC/QX6pFxLFV9aREehgOEizHCZGbq+DXtgxmNkZvYg5pyd7HPZZ9/Wt7691t7rePYFK1bh4GQ5WHYluguAywCHI+AuAYcTAC4DXAY4HAF3CTicAK4RdJeAuwQcjoDPtPwez6YeJdKwlWBDUpv15qtbabhpqEwfjQGwKjPOz8uDL0+65OxFqtV4HItLy2+em6oHWJYXXu9ajsfiiMaiiMmdfXrs0Hlzj2l/MQIAJ+rzeTE29lwmkKw6iTi9NinKtLISxZ6SAIp3F2NhYQEj/45KvahkDw7V1qK4SMrDYUxPzyBPQCVWuUhGAKDw0zOv8HlzMyr271ca9IpWl5aW0Nc/iLgwwbKEESIEwaK2q6oO4O+hvxIy1dc3oLq6Ci/GxtDX25Morzt8BFNTLwWwFVgeKwXeRLWMHzzZxgRXolEcrKrE0NAguru70draqjRaUFCAiYkJNH/xJcbHJ7G/fK9oNAJ/YYFoNA8jI//gq7Y2fNfRgc/q6lBWWopdu3ZheXlZtD6N4eFh/HL9On69cUOAqVFLan5+QTHNJBuyZ4DMhtplogBMfr9frd3CwkJ1p9bjkouL/AhHFhEKPcUfnZ1obWlBfn6+aqMvBC4QCKCmpganT5/GN2fPKlAL/QGUl+/D3NwrxSBdP9u7gY2QUHt9FqQ6UywWS7rzhQaSbJmaHEdPTw/aRfsUnm2YCZLOuszn86FFQBoaGkIkPCfMmEWRgJhqZ9RgGV4MALAxcqrF1u9RETwQ2I2xFyHcvXsXjY2NCiQKbFmWyqyrsy7jd4JZJ0vk/v37mJt9KSwqUmzaGDW7J6MA2E2F7Kg9VI3BwQFcuvQTTp48qTRNITVAdu1Yxu80mGREU1MTrly5gsePH4k9Cao+3tQunfKcA2CJEPQGTGfOfK3u1OzbhFcVUy7t7e2qZM0Y+qSPlAoZvOYcABq158+f4dy575Vh4xyp/XSSrl9ZWYkLF37As6dPlEGNx7X1Sae35LrpzSS57ZbeCsXtMR0/3qgEJ50zSbrdsWMNqjk9jDa2mfSn2+QcAK29YLBcj5nVPRgMqvbsV1ZS1innAOgZmliv7CsT26HnYHfPOQCautwVmkiTk5OqG/ZrAtScA7C4uKgm3Nvbl3B/mQChl1J/f79qHlmMGNkR5hyAiGx9D1RW4+rVnzE6yhMflF9XD1u8aBaFQiFcvnwZ1QcPYX4+LEY1ez+YcwB4BihYPyPcuvW7EpnrmHuBdFNXV5dqUlxcBO4uM+jitSFzDgB19GQ0hCNHjuLixR9x7949Zcio1beBoLfCpP+DBz04f/48Pv7kUzllThkzhjkHgJBbXguv5ufxwYEqnDp1Cn19fWr9kgn05RoMCszMd5bzO7fCDx8+xIkTTQiUlMlRO2zE+GkqbAsAFITnfJ7uyvaWq8NQ1+3bqowCUsOsozPfWc7T45937qjDkC/fj9LSPSqmwKiRqZR9PGArM5HlTqGovSKJFZSUfKSOw21t7ejo+DYRECFA1DzDYI+GH+HatWv47eZNHKypVSIzFsDok4m1r6e9PQBwNAHBK0shHBH3tWyJ0IfR1dWpMj8fPdqA0rIyzM7OJoXEWG8tJBY1LjzH3T4AOJqAQJrzEDM+PqE0WyKB0bAwY2Bgzb+zWm3thypYSo2zHtuQQSY1z3GYtheAtTHVlT48LFFfCsnIEGnOozPdJlkyPTOrNK6DqZuaGn00CkCqW0t+T/b7a9r0KMNIqx+WgOnmRHvAlAutbx7HgBeQ4MZ6j6QpEy345rs4N3Jfle20S9YA6DVNwXTkh9SOiQuLCJWpQRXPl4dkDuwMKLL+L0AxaN35Y6Shvg4VFeWyTY2pzc+y/BZL/TGyM8TemIURALjW6Z//Gx+TnpP1bPdrbGP4d/9kBACKQRDS/jn67uU35wZpC7h15Z/dREomQ6J4Jz0YdYMUjEbvfUpZe4H3SVi7uboA2KHipDKXAU7Stp2sLgPsUHFSmcsAJ2nbTlaXAXaoOKnMZYCTtG0nq8sAO1QcVLb6P2kvYwj9F4kIAAAAAElFTkSuQmCC
// @grant        none
// @license MIT
// @updateURL    https://raw.githubusercontent.com/frosn0w/iOSscripts/main/PatreonLite.js
// @downloadURL  https://raw.githubusercontent.com/frosn0w/iOSscripts/main/PatreonLite.js
// ==/UserScript==
setInterval(function () {
  "use strict";
  var btns = document.querySelectorAll("button");
  var divs = document.querySelectorAll("div");
  //btns process
  for (let i = 0; i < btns.length; i++) {
    //remove lock icon
    if (btns[i].innerText === "已解锁") {
      btns[i].remove();
    }
    //remove header
    else if (
      btns[i].getAttribute("aria-label") === "筛选条件选项" &&
      btns[i].getAttribute("data-tag") === "menuToggleDiv"
    ) {
      btns[i].parentNode.parentNode.parentNode.parentNode.remove();
    }
    //remove toolbar
    else if (btns[i].getAttribute("aria-label") === "更多操作") {
      btns[i].parentNode.parentNode.parentNode.parentNode.parentNode.remove();
    }
    //expand posts
    else if (btns[i].innerText === "继续阅读") {
      btns[i].click();
    }
    //continue
    else {
      continue;
    }
  }
  for (let j = 0; j < divs.length; j++) {
    //remove all comments block using comeent-box
    if (divs[j].getAttribute("data-tag") === "comment-field-box") {
      divs[
        j
      ].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.remove();
    }
    //continue
    else {
      continue;
    }
  }
}, 500);
