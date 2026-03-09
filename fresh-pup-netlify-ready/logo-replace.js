(function () {
  function applyLogo() {
    var logoPath = "/images/logo.png";

    var imgs = document.querySelectorAll(
      "img[alt*='logo' i], img[class*='logo' i], [class*='logo' i] img, header img, nav img"
    );
    if (imgs.length) {
      imgs[0].setAttribute("src", logoPath);
      imgs[0].setAttribute("alt", "Fresh Pup Logo");
      return;
    }

    var nodes = document.querySelectorAll("a, span, h1, h2, div");
    for (var i = 0; i < nodes.length; i += 1) {
      var txt = (nodes[i].textContent || "").trim();
      if (/fresh\s*pup/i.test(txt)) {
        nodes[i].innerHTML =
          '<img src="' +
          logoPath +
          '" alt="Fresh Pup Logo" style="height:56px;width:auto;display:block"/>';
        return;
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyLogo);
  } else {
    applyLogo();
  }
})();
