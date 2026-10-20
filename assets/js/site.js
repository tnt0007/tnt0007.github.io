/* مصنع الحمد — حركة الموقع واللغة | Al Hamad — site motion and language */
(function () {
  "use strict";

  // ── إعداد واحد: رقم واتساب بالصيغة الدولية بلا + ولا مسافات، مثل 9715xxxxxxxx.
  //    فارغ = يُخفى زر واتساب. | One setting: the WhatsApp number in international
  //    form with no + or spaces (e.g. 9715xxxxxxxx). Empty = the button is hidden.
  var WHATSAPP = "971509650648";      // (20-10-2026) +971 50 965 0648

  var html = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  html.classList.add("js");

  // ── اللغة | language ──────────────────────────────────────────────
  var TITLES = {
    ar: "مصنع الحمد لسحب الألمنيوم | Al Hamad Aluminium Extrusions",
    en: "Al Hamad Aluminium Extrusions | مصنع الحمد لسحب الألمنيوم"
  };
  function setLang(l) {
    html.lang = l; html.dir = l === "ar" ? "rtl" : "ltr";
    document.title = TITLES[l];
    try { localStorage.setItem("ahx-lang", l); } catch (e) {}
    waLinks();
    if (typeof layoutLine === "function") layoutLine();
  }
  var q = (location.search.match(/[?&]lang=(ar|en)/) || [])[1];
  var saved = null;
  try { saved = localStorage.getItem("ahx-lang"); } catch (e) {}
  // العربية أولاً كبرامج المصنع | Arabic first, like the factory's programs
  var first = q || saved || "ar";

  document.getElementById("lang").addEventListener("click", function () {
    document.body.style.transition = "opacity .25s"; document.body.style.opacity = "0";
    setTimeout(function () { setLang(html.lang === "ar" ? "en" : "ar"); document.body.style.opacity = "1"; }, 230);
  });

  // ── واتساب | WhatsApp ─────────────────────────────────────────────
  function waLinks() {
    var on = /^\d{8,15}$/.test(WHATSAPP);
    var msg = html.lang === "ar" ? "مرحباً، أود الاستفسار عن مقاطع الألمنيوم / طلب عرض سعر."
                                 : "Hello, I would like to enquire about aluminium profiles / request a quotation.";
    ["waBtn", "waFloat"].forEach(function (id) {
      var a = document.getElementById(id);
      if (!a) return;
      a.hidden = !on;
      if (on) a.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
    });
  }

  // ── شاشة البداية | intro ──────────────────────────────────────────
  var intro = document.getElementById("intro");
  function start() {
    if (intro.classList.contains("done")) return;
    intro.classList.add("done");
    setTimeout(function () { html.classList.add("go"); }, 150);
  }
  window.addEventListener("load", function () { setTimeout(start, reduce ? 0 : 450); });
  setTimeout(start, 2500);                   // ضمان: لا تبقى الشاشة إن تأخّر التحميل | safety net

  // ── الرأس | header ────────────────────────────────────────────────
  var nav = document.getElementById("nav");
  function onScroll() { nav.classList.toggle("solid", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  document.getElementById("burger").addEventListener("click", function () { nav.classList.toggle("open"); });
  document.querySelectorAll("#links a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("open"); });
  });
  if ("IntersectionObserver" in window) {
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        document.querySelectorAll("#links a").forEach(function (a) {
          a.classList.toggle("act", a.getAttribute("href") === "#" + e.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { secIO.observe(s); });
  }

  // ── شرائح البطل | hero slideshow ───────────────────────────────────
  var slides = [].slice.call(document.querySelectorAll(".slide"));
  var dots = document.getElementById("heroDots"), cur = 0, timer = null;
  slides.forEach(function (_s, i) {
    var b = document.createElement("button");
    b.type = "button"; b.setAttribute("aria-label", "slide " + (i + 1));
    b.addEventListener("click", function () { show(i); restart(); });
    dots.appendChild(b);
  });
  function show(i) {
    slides[cur].classList.remove("on"); dots.children[cur].classList.remove("on");
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add("on"); dots.children[cur].classList.add("on");
  }
  function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { show(cur + 1); }, 6500); }
  dots.children[0].classList.add("on"); restart();

  // ── شرر المعدن | metal sparks ─────────────────────────────────────
  var cv = document.getElementById("sparks"), cx = cv.getContext("2d"), parts = [], W = 0, H = 0, live = true;
  function size() { var d = Math.min(window.devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight;
                    cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  function spawn() {
    return { x: Math.random() * W, y: H + 10, vx: (Math.random() - .5) * .6, vy: -(0.6 + Math.random() * 1.6),
             r: .6 + Math.random() * 1.8, life: 0, max: 160 + Math.random() * 220 };
  }
  function tick() {
    if (!live) return;
    cx.clearRect(0, 0, W, H);
    var n = W < 640 ? 38 : 80;
    while (parts.length < n) parts.push(spawn());
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.x += p.vx + Math.sin((p.life + i) / 30) * .25; p.y += p.vy; p.life++;
      var a = Math.max(0, 1 - p.life / p.max);
      if (a <= 0 || p.y < -10) { parts.splice(i, 1); continue; }
      var g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, "rgba(255,236,190," + a + ")"); g.addColorStop(.4, "rgba(255,140,40," + a * .7 + ")");
      g.addColorStop(1, "rgba(255,90,0,0)");
      cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, p.r * 4, 0, 6.283); cx.fill();
    }
    requestAnimationFrame(tick);
  }
  if (!reduce) {
    size(); window.addEventListener("resize", size);
    new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v && !live) { live = true; tick(); } live = v; })
      .observe(document.querySelector(".hero"));
    tick();
  }

  // ── الظهور والعدّادات | reveal and counters ────────────────────────
  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }
  function count(el) {
    var to = +el.dataset.to, suf = el.dataset.suffix || "", plain = el.dataset.plain, t0 = null;
    if (reduce) { el.textContent = (plain ? to : fmt(to)) + suf; return; }
    var from = plain ? to - 40 : 0;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / 1800), e = 1 - Math.pow(1 - k, 3), v = from + (to - from) * e;
      el.textContent = (plain ? Math.round(v) : fmt(v)) + (k === 1 ? suf : "");
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        e.target.querySelectorAll(".num").forEach(count);
        io.unobserve(e.target);
      });
    }, { threshold: .15 });
    document.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.transitionDelay = ((i % 4) * 0.09) + "s"; io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  // ── خط الإنتاج يتبع التمرير | the production line follows the scroll ─
  var lineEl = document.getElementById("line"), billet = document.getElementById("billet"),
      fill = document.getElementById("fill"), steps = [].slice.call(document.querySelectorAll(".steps li"));
  function layoutLine() {
    var r = lineEl.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (vh * .7)));
    var rail = billet.parentNode.clientWidth, x = p * (rail - billet.offsetWidth);
    billet.style.transform = "translateX(" + (html.dir === "rtl" ? -x : x) + "px)";
    fill.style.width = (p * 100) + "%";
    var lit = Math.round(p * steps.length);
    steps.forEach(function (s, i) { s.classList.toggle("lit", i < Math.max(1, lit)); });
  }
  window.layoutLine = layoutLine;
  window.addEventListener("scroll", layoutLine, { passive: true });
  window.addEventListener("resize", layoutLine);

  // ── ميلان البطاقات | card tilt (desktop only) ──────────────────────
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".tilt").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
        el.style.transform = "perspective(900px) rotateY(" + (x * 8) + "deg) rotateX(" + (-y * 8) + "deg) translateY(-4px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  // ── المعرض بلا فراغ | seamless gallery ─────────────────────────────
  var gal = document.getElementById("gal");
  gal.innerHTML += gal.innerHTML;

  // ── زوم من الكرة الأرضية إلى المصنع | Earth zoom to the factory ─────
  // كرة أرضية بصور Sentinel-2 (EOX، رخصة CC BY 4.0) تدور ثم تنزل إلى أم الثعوب،
  // ثم تظهر صورة القمر الصناعي القريبة من خرائط جوجل. بلا WebGL: الصورة القريبة فوراً.
  // A Sentinel-2 globe (EOX, CC BY 4.0) spins then dives to Umm Al Thuoob, then the
  // close Google satellite view fades in. Without WebGL: the close view at once.
  var FAC = [55.67180, 25.54576];             // من برنامج التتبع | from the tracker
  var box = document.getElementById("earthBox"), gmap = document.getElementById("gmap"), earthMap = null, flying = false;
  function showClose() {
    if (!gmap.src) gmap.src = gmap.dataset.src;
    box.classList.add("arrived", "near");
  }
  function loadLib(cb) {
    if (window.maplibregl) return cb();
    var css = document.createElement("link"); css.rel = "stylesheet";
    css.href = "https://unpkg.com/maplibre-gl@5.0.0/dist/maplibre-gl.css"; document.head.appendChild(css);
    var js = document.createElement("script"); js.src = "https://unpkg.com/maplibre-gl@5.0.0/dist/maplibre-gl.js";
    js.onload = cb; js.onerror = showClose; document.head.appendChild(js);
  }
  function dive() {
    if (!earthMap || flying) return;
    flying = true;
    box.classList.remove("arrived", "near");
    earthMap.jumpTo({ center: [20, 18], zoom: 0.9, pitch: 0, bearing: 0 });
    var t0 = performance.now();
    (function spin(t) {                       // دورة قصيرة قبل النزول | a short spin first
      var k = (t - t0) / 2200;
      if (k < 1) { earthMap.jumpTo({ center: [20 + k * 32, 18 + k * 6], zoom: 0.9 }); return requestAnimationFrame(spin); }
      earthMap.flyTo({ center: FAC, zoom: 13.6, pitch: 55, bearing: -25, duration: reduce ? 0 : 7500, curve: 1.7, essential: true });
      earthMap.once("moveend", function () {
        flying = false; box.classList.add("arrived");
        setTimeout(showClose, 1400);
      });
    })(t0);
  }
  function initEarth() {
    var c = document.createElement("canvas");
    if (!(c.getContext("webgl2") || c.getContext("webgl"))) return showClose();
    loadLib(function () {
      try {
        earthMap = new maplibregl.Map({
          container: "earth", interactive: false, attributionControl: { compact: true },
          center: [20, 18], zoom: 0.9,
          style: {
            version: 8, projection: { type: "globe" },
            sources: { s2: { type: "raster", tileSize: 256, maxzoom: 14,
              tiles: ["https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg"],
              attribution: '<a href="https://s2maps.eu" target="_blank" rel="noopener">Sentinel-2 cloudless</a> by EOX (Copernicus Sentinel data 2016)' } },
            layers: [{ id: "space", type: "background", paint: { "background-color": "#02050c" } },
                     { id: "s2", type: "raster", source: "s2" }],
            sky: { "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 7, 0] }
          }
        });
        var pin = document.createElement("div"); pin.className = "fac-pin";
        new maplibregl.Marker({ element: pin }).setLngLat(FAC).addTo(earthMap);
        earthMap.once("load", dive);
      } catch (e) { showClose(); }
    });
  }
  document.getElementById("earthReplay").addEventListener("click", function () { if (earthMap) dive(); });
  if ("IntersectionObserver" in window) {
    var eIO = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      eIO.disconnect(); initEarth();
    }, { threshold: .35 });
    eIO.observe(box);
  } else { showClose(); }

  document.getElementById("yr").textContent = new Date().getFullYear();
  setLang(first);
  layoutLine();
})();
