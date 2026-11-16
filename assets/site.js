// The navigation gains a hairline once the page scrolls.
(function () {
  var nav = document.querySelector(".nav");
  if (!nav) return;
  var update = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
  update();
  window.addEventListener("scroll", update, { passive: true });
})();

// The film loads only when someone presses Play, then shows the normal video controls.
(function () {
  var film = document.getElementById("film");
  var video = document.getElementById("filmVideo");
  var play = document.getElementById("play");
  if (!film || !video || !play) return;
  play.addEventListener("click", function () {
    film.classList.add("playing");
    video.controls = true;
    video.play();
  });
})();
