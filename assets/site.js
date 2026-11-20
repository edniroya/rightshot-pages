// The navigation gains a hairline once the page scrolls.
(function () {
  var nav = document.querySelector(".nav");
  if (!nav) return;
  var update = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
  update();
  window.addEventListener("scroll", update, { passive: true });
})();

// On small screens the menu button opens the links as a list under the header.
(function () {
  var nav = document.querySelector(".nav");
  var btn = document.querySelector(".menu-btn");
  var menu = document.getElementById("nav-menu");
  if (!nav || !btn || !menu) return;
  function set(open) {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Menu");
  }
  btn.addEventListener("click", function () { set(!nav.classList.contains("open")); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) { set(false); btn.focus(); }
  });
  document.addEventListener("click", function (e) { if (!nav.contains(e.target)) set(false); });
  window.matchMedia("(min-width: 901px)").addEventListener("change", function (m) { if (m.matches) set(false); });
})();

// The film loads only when someone presses Play, then shows the normal video controls.
(function () {
  var film = document.getElementById("film");
  var video = document.getElementById("filmVideo");
  var play = document.getElementById("play");
  var sound = document.getElementById("sound");
  if (!film || !video || !play) return;

  // Sound on or off, remembered on this browser for next time. "Off" means nothing can be heard,
  // whether the film is muted or its volume is at zero.
  var key = "rightshot-film-muted";
  function silent() { return video.muted || video.volume === 0; }
  function show() {
    var off = silent();
    if (sound) {
      sound.classList.toggle("off", off);
      sound.querySelector("span").textContent = off ? "Sound off" : "Sound on";
    }
    try { localStorage.setItem(key, off ? "1" : "0"); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem(key); } catch (e) {}
  video.muted = saved === "1";
  show();
  if (sound) sound.addEventListener("click", function () {
    if (silent()) {
      if (video.volume === 0) video.volume = 1;
      video.muted = false;
    } else {
      video.muted = true;
    }
  });
  // Covers the button and the video's own mute and volume controls alike.
  video.addEventListener("volumechange", show);

  play.addEventListener("click", function () {
    film.classList.add("playing");
    video.controls = true;
    var started = video.play();
    // A browser may refuse or pause playback, for example in a background tab. The controls still work.
    if (started && started.catch) started.catch(function () {});
  });
})();

// Features showcase: each button shows its own screenshot.
(function () {
  var tabs = document.querySelectorAll('.show-tab');
  var imgs = document.querySelectorAll('.stage img');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var i = t.getAttribute('data-i');
      tabs.forEach(function (x) { var on = x === t; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var stage = document.querySelector('.stage');
      if (stage && stage.getBoundingClientRect().top < 64) stage.scrollIntoView({ block: 'start' });
      imgs.forEach(function (im) { var on = im.getAttribute('data-i') === i; im.classList.toggle('on', on); if (on) im.removeAttribute('aria-hidden'); else im.setAttribute('aria-hidden', 'true'); });
    });
  });
})();
