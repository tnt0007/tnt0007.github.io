/* كتالوج مصنع الحمد — بحث وتصفّح | Al Hamad catalogue — search and browse
   البيانات كلها من data.json الذي يبنيه catalogue_build.py | all data comes from data.json */
(function () {
  "use strict";
  var WHATSAPP = "971509650648";   // نفس رقم الموقع في assets/js/site.js | same as the site
  var html = document.documentElement, D = null, V = "";
  var $ = function (id) { return document.getElementById(id); };

  // ── اللغة | language (shared key with the main site) ──
  function setLang(l) {
    html.lang = l; html.dir = l === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem("ahx-lang", l); } catch (e) {}
  }
  var q0 = (location.search.match(/[?&]lang=(ar|en)/) || [])[1], saved = null;
  try { saved = localStorage.getItem("ahx-lang"); } catch (e) {}
  setLang(q0 || saved || "ar");
  $("lang").onclick = function () { setLang(html.lang === "ar" ? "en" : "ar"); route(); };

  function t(ar, en) { return '<span class="ar">' + ar + '</span><span class="en">' + en + "</span>"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function img(dir, p) { return dir + "/p" + ("00" + p).slice(-3) + ".webp?v=" + V; }

  var secBy = {}, pageBy = {}, profBy = {}, profsOnPage = {};

  fetch("data.json?v=" + Date.now()).then(function (r) { return r.json(); }).then(function (d) {
    D = d; V = d.build;
    d.sections.forEach(function (s) { secBy[s.slug] = s; });
    d.pages.forEach(function (p) { pageBy[p.p] = p; });
    d.profiles.forEach(function (pr) {
      profBy[pr.no] = pr;
      pr.at.forEach(function (a) { (profsOnPage[a.p] = profsOnPage[a.p] || []).push({ no: pr.no, kg: pr.kg, b: a.b }); });
    });
    $("pdfBtn").href = d.pdf + "?v=" + V;
    $("pdfMb").textContent = d.pdf_mb + " MB";
    $("stats").innerHTML = t(d.profiles.length.toLocaleString("en") + " قطاعاً في " + topSecs().length + " قسماً · " + d.pages.length + " صفحة",
      d.profiles.length.toLocaleString("en") + " profiles · " + topSecs().length + " sections · " + d.pages.length + " pages");
    $("built").innerHTML = t("آخر تحديث للكتالوج: " + d.built, "Catalogue updated: " + d.built);
    window.addEventListener("hashchange", route);
    route();
  }).catch(function () {
    $("home").innerHTML = '<p class="empty">' + t("تعذّر تحميل الكتالوج.", "The catalogue could not be loaded.") + "</p>";
  });

  function topSecs() { return D.sections.filter(function (s) { return !s.sub && s.slug !== "introduction" && s.slug !== "specification" && s.slug !== "index"; }); }
  function kids(slug) { return D.sections.filter(function (s) { return s.parent === slug; }); }
  function pagesOf(slug) {
    var set = {}; set[slug] = 1; kids(slug).forEach(function (k) { set[k.slug] = 1; });
    return D.pages.filter(function (p) { return set[p.s]; }).map(function (p) { return p.p; });
  }
  function nProfiles(slug) {
    return pagesOf(slug).reduce(function (n, p) { return n + (profsOnPage[p] || []).length; }, 0);
  }
  function secName(s) { return s ? t(esc(s.ar), esc(s.en)) : ""; }

  // ── التوجيه بالرابط | hash routing: #s=slug  #p=61&h=1733 ──
  function params() {
    var o = {}; location.hash.replace(/^#/, "").split("&").forEach(function (kv) { var a = kv.split("="); if (a[0]) o[a[0]] = decodeURIComponent(a[1] || ""); });
    return o;
  }
  function show(id) {
    ["home", "section", "viewer"].forEach(function (x) { $(x).hidden = x !== id; });
    $("results").hidden = id !== "home" || !$("q").value.trim();
  }
  function route() {
    if (!D) return;
    var p = params();
    if (p.p) viewer(+p.p, p.h);
    else if (p.s && secBy[p.s]) section(p.s);
    else home();
  }

  function card(href, thumbP, title, sub) {
    return '<a class="card" href="' + href + '"><div class="th"><img loading="lazy" alt="" src="' + img("thumbs", thumbP) + '"></div>' +
      '<div class="tx"><b>' + title + "</b>" + (sub ? "<small>" + sub + "</small>" : "") + "</div></a>";
  }

  function home() {
    show("home");
    var h = "";
    topSecs().forEach(function (s) {
      var n = nProfiles(s.slug), pc = pagesOf(s.slug).length;
      h += card("#s=" + s.slug, s.cover, secName(s), t(pc + " صفحة" + (n ? " · " + n + " قطاعاً" : ""), pc + " pages" + (n ? " · " + n + " profiles" : "")));
    });
    var idx = secBy["index"];
    if (idx) h += card("#s=index", idx.cover, secName(idx), t("أرقام القطاعات وصفحاتها", "Profile numbers and pages"));
    $("home").innerHTML = h;
    window.scrollTo(0, 0);
  }

  function section(slug) {
    show("section");
    var s = secBy[slug], parent = s.parent ? secBy[s.parent] : null, ks = kids(parent ? parent.slug : slug);
    var h = '<div class="head"><h2>' + secName(s) + '</h2><a class="back" href="' + (parent ? "#s=" + parent.slug : "#") + '">' +
      t(parent ? "→ " + esc(parent.ar) : "→ كل الأقسام", parent ? "← " + esc(parent.en) : "← All sections") + "</a></div>";
    if (ks.length) {
      h += '<div class="chips">' + ks.map(function (k) {
        return '<a class="chip' + (k.slug === slug ? " on" : "") + '" href="#s=' + k.slug + '">' + secName(k) + "</a>";
      }).join("") + "</div>";
    }
    h += '<div class="grid pages">';
    pagesOf(slug).forEach(function (p) {
      var pg = pageBy[p], n = (profsOnPage[p] || []).length;
      h += card("#p=" + p, p, pg.l ? "PAGE " + pg.l : t("غلاف", "Cover"), n ? t(n + " قطاع", n + " profiles") : "");
    });
    $("section").innerHTML = h + "</div>";
    window.scrollTo(0, 0);
  }

  function viewer(p, hl) {
    var pg = pageBy[p];
    if (!pg) return home();
    show("viewer");
    var s = secBy[pg.s];
    var here = profsOnPage[p] || [], mark = "";
    here.forEach(function (x) {
      if (x.no === hl) {
        var b = x.b, padX = 0.012, padY = 0.006;
        mark = '<div class="mark" style="left:' + ((b[0] - padX) * 100) + "%;top:" + ((b[1] - padY) * 100) + "%;width:" +
          ((b[2] - b[0] + 2 * padX) * 100) + "%;height:" + ((b[3] - b[1] + 2 * padY) * 100) + '%"></div>';
      }
    });
    var hp = hl && here.some(function (x) { return x.no === hl; }) && profBy[hl];
    var msg = hp ? (html.lang === "ar" ? "مرحباً، أود الاستفسار عن القطاع رقم " + hl + " (كتالوج PAGE " + (pg.l || p) + ")."
                                       : "Hello, I would like to ask about profile no. " + hl + " (catalogue PAGE " + (pg.l || p) + ").")
                 : (html.lang === "ar" ? "مرحباً، أود الاستفسار عن مقاطع كتالوج PAGE " + (pg.l || p) + "."
                                       : "Hello, I would like to ask about catalogue PAGE " + (pg.l || p) + ".");
    var h = '<div class="head"><h2>' + (pg.l ? "PAGE " + pg.l : t("غلاف", "Cover")) + ' <small class="mut small">' + secName(s) + '</small></h2>' +
      '<a class="back" href="#s=' + (s ? s.slug : "") + '">' + t("→ صفحات القسم", "← Section pages") + "</a></div>" +
      '<div class="view"><div class="sheet" id="sheet" style="aspect-ratio:1/' + D.aspect + '"><img alt="PAGE ' + esc(pg.l || p) + '" src="' + img("pages", p) + '">' + mark + "</div>" +
      '<aside class="side"><div class="nav2"><button id="prev" type="button"' + (p <= 1 ? " disabled" : "") + ">" + t("→ السابقة", "← Prev") +
      '</button><button id="next" type="button"' + (p >= D.pages.length ? " disabled" : "") + ">" + t("التالية ←", "Next →") + "</button></div>";
    if (hp) h += '<div class="box"><div class="lbl">' + t("القطاع", "Profile") + '</div><div class="big">' + esc(hl) +
      '</div><div class="lbl">' + t("الوزن", "Weight") + '</div><div class="big">' + esc(hp.kg) + ' <small class="mut small">kg/m</small></div></div>';
    if (here.length) h += '<div class="box"><div class="lbl">' + t("قطاعات هذه الصفحة", "Profiles on this page") + '</div><div class="chips">' +
      here.map(function (x) { return '<a class="chip' + (x.no === hl ? " on" : "") + '" href="#p=' + p + "&h=" + x.no + '"><bdi dir="ltr">' + x.no + " · " + x.kg + "</bdi></a>"; }).join("") + "</div></div>";
    h += '<a class="wa" target="_blank" rel="noopener" href="https://wa.me/' + WHATSAPP + "?text=" + encodeURIComponent(msg) + '">' + t("استفسر عبر واتساب", "Ask on WhatsApp") + "</a>";
    h += '<a class="pill" style="justify-content:center" target="_blank" rel="noopener" href="' + D.pdf + "?v=" + V + "#page=" + p + '">' + t("افتح الصفحة في PDF", "Open this page in the PDF") + "</a></aside></div>";
    $("viewer").innerHTML = h;
    $("prev").onclick = function () { go(p - 1); };
    $("next").onclick = function () { go(p + 1); };
    var m = $("viewer").querySelector(".mark");
    if (m) setTimeout(function () { m.scrollIntoView({ block: "center", behavior: "smooth" }); }, 250);
    else window.scrollTo(0, 0);
    // السحب على الجوال | swipe on phones
    var sx = null, sh = $("sheet");
    sh.addEventListener("touchstart", function (e) { sx = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    sh.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) < 60) return;
      var fwd = html.dir === "rtl" ? dx > 0 : dx < 0;
      go(fwd ? p + 1 : p - 1);
    });
    // تحميل الصفحتين المجاورتين مسبقاً | preload neighbours
    [p - 1, p + 1].forEach(function (n) { if (pageBy[n]) (new Image()).src = img("pages", n); });
  }
  function go(p) { if (pageBy[p]) location.hash = "#p=" + p; }
  document.addEventListener("keydown", function (e) {
    var p = params().p;
    if (!p || e.target.tagName === "INPUT") return;
    var rtl = html.dir === "rtl";
    if (e.key === "ArrowLeft") go(+p + (rtl ? 1 : -1));
    if (e.key === "ArrowRight") go(+p + (rtl ? -1 : 1));
  });

  // ── البحث | search: number prefix, or weight ±0.03 ──
  var timer;
  $("q").addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(search, 120); });
  function search() {
    var q = $("q").value.trim().toUpperCase().replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace("٫", ".");
    var box = $("results");
    if (!q || !D) { box.hidden = true; box.innerHTML = ""; return; }
    if (location.hash) { history.replaceState(null, "", location.pathname + location.search); home(); }
    var hits = [], isKg = /^\d*\.\d*$/.test(q) && q !== ".";
    if (isKg) {
      var w = parseFloat(q);
      if (!isNaN(w)) hits = D.profiles.filter(function (p) { return Math.abs(parseFloat(p.kg) - w) <= 0.03; })
        .sort(function (a, b) { return Math.abs(a.kg - w) - Math.abs(b.kg - w); });
    } else {
      hits = D.profiles.filter(function (p) { return p.no.indexOf(q) === 0; });
      if (!hits.length) hits = D.profiles.filter(function (p) { return p.no.indexOf(q) > 0; });
    }
    var h = "<h3>" + t(hits.length + " نتيجة" + (isKg ? " بوزن قريب من " + esc(q) + " كجم/م" : ""),
      hits.length + " result" + (hits.length === 1 ? "" : "s") + (isKg ? " near " + esc(q) + " kg/m" : "")) + "</h3>";
    if (!hits.length) h += '<p class="empty">' + t("لا يوجد قطاع بهذا الرقم في الكتالوج. راسلنا ونخبرك.", "No profile with this number in the catalogue. Message us and we will check.") + "</p>";
    h += '<div class="grid res">';
    hits.slice(0, 60).forEach(function (p) {
      var a = p.at[0], s = secBy[a.s], pg = pageBy[a.p];
      h += '<a class="card" href="#p=' + a.p + "&h=" + p.no + '"><div class="th"><img loading="lazy" alt="" src="' + img("thumbs", a.p) + '"></div>' +
        '<div class="tx"><span class="no">' + p.no + "</span><small><bdi dir=\"ltr\">" + p.kg + " kg/m · PAGE " + esc(pg.l || a.p) + "</bdi></small><small>" + secName(s) + "</small></div></a>";
    });
    box.innerHTML = h + "</div>";
    box.hidden = false;
  }
})();
