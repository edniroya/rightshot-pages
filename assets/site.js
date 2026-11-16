// The navigation gains a hairline once the page scrolls.
(function () {
  var nav = document.querySelector(".nav");
  if (!nav) return;
  var update = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
  update();
  window.addEventListener("scroll", update, { passive: true });
})();

// The hero shows a right-drag capture: the pointer drags over the chart, the box flashes,
// the toolbar opens, an arrow is drawn and the capture is copied. Then it starts again.
(function () {
  var stage = document.getElementById("stage");
  if (!stage) return;
  var target = document.getElementById("target");
  var sel = document.getElementById("sel");
  var cursor = document.getElementById("cursor");
  var bar = document.getElementById("bar");
  var toast = document.getElementById("toast");
  var mark = document.getElementById("mark");
  var arrowTool = document.getElementById("arrowTool");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timers = [];

  function box() {
    var s = stage.getBoundingClientRect();
    var t = target.getBoundingClientRect();
    var pad = Math.max(10, t.width * 0.03);
    return { x: t.left - s.left - pad, y: t.top - s.top - pad, w: t.width + pad * 2, h: t.height + pad * 2, sw: s.width, sh: s.height };
  }
  function moveCursor(x, y, ms) {
    cursor.style.transitionDuration = (ms || 0) + "ms";
    cursor.style.transform = "translate(" + x + "px," + y + "px)";
  }
  function setSel(x, y, w, h) {
    sel.style.left = x + "px"; sel.style.top = y + "px";
    sel.style.width = Math.max(0, w) + "px"; sel.style.height = Math.max(0, h) + "px";
  }
  function placeBar(b) {
    var bw = bar.offsetWidth || 300;
    var left = Math.min(Math.max(8, b.x + b.w / 2 - bw / 2), b.sw - bw - 8);
    var top = Math.min(b.y + b.h + 10, b.sh - 48);
    bar.style.left = left + "px"; bar.style.top = top + "px";
  }
  function placeMark(b) {
    mark.style.left = (b.x + b.w * 0.52) + "px";
    mark.style.top = (b.y + b.h * 0.22) + "px";
  }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clear() { timers.forEach(clearTimeout); timers = []; }

  function finalState() {
    var b = box();
    setSel(b.x, b.y, b.w, b.h); sel.style.opacity = 1;
    placeBar(b); bar.classList.add("on");
    placeMark(b); mark.classList.add("on");
    moveCursor(b.x + b.w, b.y + b.h, 0);
  }

  function run() {
    clear();
    var b = box();
    sel.style.opacity = 0; setSel(b.x, b.y, 0, 0);
    bar.classList.remove("on"); toast.classList.remove("on"); mark.classList.remove("on");
    arrowTool.classList.remove("on"); cursor.classList.remove("down");
    moveCursor(b.sw * 0.82, b.sh * 0.86, 0);
    later(function () { moveCursor(b.x, b.y, 900); }, 400);
    later(function () {
      cursor.classList.add("down");
      sel.style.opacity = 1;
      var start = performance.now(), dur = 1100;
      (function step(now) {
        var p = Math.min(1, (now - start) / dur);
        var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        setSel(b.x, b.y, b.w * e, b.h * e);
        moveCursor(b.x + b.w * e, b.y + b.h * e, 0);
        if (p < 1) requestAnimationFrame(step);
      })(start);
    }, 1450);
    later(function () {
      cursor.classList.remove("down");
      sel.classList.remove("flash"); void sel.offsetWidth; sel.classList.add("flash");
      placeBar(b); bar.classList.add("on");
      toast.textContent = "Copied"; toast.classList.add("on");
    }, 2700);
    later(function () { toast.classList.remove("on"); }, 4000);
    later(function () {
      var r = arrowTool.getBoundingClientRect(), s = stage.getBoundingClientRect();
      moveCursor(r.left - s.left + 8, r.top - s.top + 8, 700);
    }, 3600);
    later(function () { arrowTool.classList.add("on"); }, 4400);
    later(function () { moveCursor(b.x + b.w * 0.55, b.y + b.h * 0.6, 700); }, 4700);
    later(function () { placeMark(b); mark.classList.add("on"); toast.textContent = "Copied edits"; toast.classList.add("on"); }, 5500);
    later(function () { toast.classList.remove("on"); }, 6800);
    later(function () { sel.style.opacity = 0; bar.classList.remove("on"); mark.classList.remove("on"); }, 7600);
    later(run, 8300);
  }

  if (reduce) {
    finalState();
    window.addEventListener("resize", finalState);
    return;
  }
  var started = false;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !started) { started = true; run(); }
      else if (!entry.isIntersecting && started) { started = false; clear(); }
    });
  }, { threshold: 0.3 });
  io.observe(stage);
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { if (started) run(); }, 200);
  });
})();
