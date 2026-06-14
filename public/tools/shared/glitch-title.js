(function (global) {
  var CHARS_SOFT = "!<>-_\\/[]{}=+*^?";
  var CHARS_HARD = "!<>-_\\/[]{}=+*^?#░▒▓@$%&|~█▄▀■□▪†§~`";

  function rc(hard) {
    var s = hard ? CHARS_HARD : CHARS_SOFT;
    return s[Math.floor(Math.random() * s.length)];
  }

  function rnd(a, b) {
    return Math.random() * (b - a) + a;
  }

  var SPAN_BASE_STYLE = [
    "font-family: ui-monospace, 'Courier New', monospace",
    "font-size: 15px",
    "letter-spacing: 0.22em",
    "text-transform: uppercase",
    "white-space: nowrap"
  ].join(";");

  function initGlitchTitle(elementId, titleString) {
    var container = document.getElementById(elementId);
    if (!container) {
      console.warn("initGlitchTitle: element not found:", elementId);
      return;
    }

    var uid = elementId + "-gt";

    // Wrapper div
    var wrapper = document.createElement("div");
    wrapper.style.cssText = "position:relative;display:inline-block;overflow:visible;";

    // Red chromatic channel
    var redSpan = document.createElement("span");
    redSpan.setAttribute("aria-hidden", "true");
    redSpan.setAttribute("class", "glitch-ch");
    redSpan.id = uid + "-red";
    redSpan.style.cssText = [
      SPAN_BASE_STYLE,
      "position:absolute",
      "top:0",
      "left:0",
      "color:rgba(255,35,35,0.60)",
      "display:none",
      "pointer-events:none",
      "user-select:none"
    ].join(";");
    redSpan.textContent = titleString;

    // Cyan chromatic channel
    var cyanSpan = document.createElement("span");
    cyanSpan.setAttribute("aria-hidden", "true");
    cyanSpan.setAttribute("class", "glitch-ch");
    cyanSpan.id = uid + "-cyan";
    cyanSpan.style.cssText = [
      SPAN_BASE_STYLE,
      "position:absolute",
      "top:0",
      "left:0",
      "color:rgba(0,215,205,0.60)",
      "display:none",
      "pointer-events:none",
      "user-select:none"
    ].join(";");
    cyanSpan.textContent = titleString;

    // Main text
    var mainSpan = document.createElement("span");
    mainSpan.id = uid + "-main";
    mainSpan.setAttribute("aria-label", titleString);
    mainSpan.style.cssText = [
      SPAN_BASE_STYLE,
      "position:relative",
      "z-index:1",
      "color:#aaa"
    ].join(";");
    mainSpan.textContent = titleString;

    wrapper.appendChild(redSpan);
    wrapper.appendChild(cyanSpan);
    wrapper.appendChild(mainSpan);
    container.appendChild(wrapper);

    // Active tear divs tracked here for cleanup
    var activeTears = [];
    var alive = true;
    var idleTimer = null;
    var microTimers = [];
    var tickerInterval = null;

    function clearTears() {
      for (var i = 0; i < activeTears.length; i++) {
        if (activeTears[i].parentNode) {
          activeTears[i].parentNode.removeChild(activeTears[i]);
        }
      }
      activeTears = [];
    }

    function makeTearEl(y, h, w, x) {
      var d = document.createElement("div");
      d.style.cssText = [
        "position:absolute",
        "left:" + x + "px",
        "top:" + y + "px",
        "width:" + w + "px",
        "height:" + h + "px",
        "background:rgba(200,200,200,0.06)",
        "backdrop-filter:brightness(2)",
        "pointer-events:none",
        "z-index:2"
      ].join(";");
      return d;
    }

    function renderFrame(chars, chromatic, redX, cyanX, skewX, tears) {
      if (!alive) return;

      mainSpan.textContent = chars;
      redSpan.textContent = chars;
      cyanSpan.textContent = chars;

      if (chromatic) {
        wrapper.style.transform = "skewX(" + skewX + "deg)";
        redSpan.style.display = "";
        redSpan.style.transform = "translateX(" + redX + "px)";
        cyanSpan.style.display = "";
        cyanSpan.style.transform = "translateX(" + cyanX + "px)";
      } else {
        wrapper.style.transform = "none";
        redSpan.style.display = "none";
        cyanSpan.style.display = "none";
      }

      clearTears();
      for (var i = 0; i < tears.length; i++) {
        var t = tears[i];
        var el = makeTearEl(t.y, t.h, t.w, t.x);
        wrapper.appendChild(el);
        activeTears.push(el);
      }
    }

    function resetToBase() {
      renderFrame(titleString, false, 0, 0, 0, []);
    }

    function makeTears(n, intense) {
      var result = [];
      for (var i = 0; i < n; i++) {
        result.push({
          y: rnd(intense ? -30 : -8, intense ? 50 : 24),
          h: rnd(1, intense ? 6 : 2.5),
          w: rnd(80, intense ? 520 : 200),
          x: rnd(-40, intense ? 60 : 20)
        });
      }
      return result;
    }

    function glitch() {
      var to = titleString;
      var dur = rnd(600, 1000);
      var t0 = Date.now();

      if (tickerInterval) clearInterval(tickerInterval);

      tickerInterval = setInterval(function () {
        if (!alive) return;
        var p = (Date.now() - t0) / dur;

        if (p >= 1) {
          clearInterval(tickerInterval);
          tickerInterval = null;
          resetToBase();
          schedule();
          return;
        }

        var peak = p > 0.25 && p < 0.78;

        var chars = to.split("").map(function (ch) {
          if (ch === " ") return " ";
          if (p > 0.72) return Math.random() < p ? ch : rc(true);
          if (peak)     return Math.random() < 0.28 ? ch : rc(true);
          return Math.random() < p * 0.9 ? ch : rc(false);
        }).join("");

        var chromatic = peak || Math.random() < 0.3;
        var redX  = peak ? rnd(-14, -5) : rnd(-5, -1);
        var cyanX = peak ? rnd(5, 16)   : rnd(1, 5);
        var skewX = peak ? rnd(-4, 4)   : rnd(-1, 1);
        var tn    = peak ? Math.floor(rnd(3, 8)) : Math.floor(rnd(0, 3));

        renderFrame(chars, chromatic, redX, cyanX, skewX, makeTears(tn, peak));
      }, 28);
    }

    function micro() {
      if (!alive) return;
      var label = titleString;
      var i = Math.floor(Math.random() * label.length);
      var glitched = label.split("").map(function (c, j) {
        return (j === i && c !== " ") ? rc(false) : c;
      }).join("");

      mainSpan.textContent = glitched;
      redSpan.textContent = glitched;
      cyanSpan.textContent = glitched;

      var restoreTimer = setTimeout(function () {
        if (!alive) return;
        mainSpan.textContent = titleString;
        redSpan.textContent = titleString;
        cyanSpan.textContent = titleString;
      }, 70);
      microTimers.push(restoreTimer);
    }

    function schedule() {
      if (!alive) return;
      var delay = rnd(1500, 4000);
      var mc = Math.floor(rnd(1, 4));

      for (var i = 0; i < mc; i++) {
        (function () {
          var t = setTimeout(function () {
            micro();
          }, rnd(150, delay - 300));
          microTimers.push(t);
        })();
      }

      idleTimer = setTimeout(function () {
        if (!alive) return;
        glitch();
      }, delay);
    }

    schedule();

    function cleanup() {
      alive = false;
      if (idleTimer) clearTimeout(idleTimer);
      if (tickerInterval) clearInterval(tickerInterval);
      for (var i = 0; i < microTimers.length; i++) {
        clearTimeout(microTimers[i]);
      }
      microTimers = [];
      clearTears();
    }

    window.addEventListener("beforeunload", cleanup);
  }

  global.initGlitchTitle = initGlitchTitle;
})(window);
