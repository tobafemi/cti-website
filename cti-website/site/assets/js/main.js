/* CTI website script. No libraries. Everything here is an enhancement:
   the page works and all content is visible without JavaScript. */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Set to true on preview copies of the site, where the form has nowhere to send to.
  var isPreview = window.CTI_PREVIEW === true;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    initHeader();
    initMenu();
    initReveal();
    initMap();
    initReviewBar();
    initTips();
    initCtaBar();
    initInterestLinks();
    initForm();
  });

  /* ---------- Header border on scroll ---------- */
  function initHeader() {
    var header = document.getElementById("header");
    if (!header) return;
    var update = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;
    var label = toggle.querySelector(".visually-hidden");

    function setOpen(open, returnFocus) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      if (label) label.textContent = open ? "Close menu" : "Open menu";
      if (open) {
        var first = nav.querySelector("a");
        if (first) first.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true", false);
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false, false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) setOpen(false, true);
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false, false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 960 && nav.classList.contains("is-open")) setOpen(false, false);
    });
  }

  /* ---------- Fade sections in as they scroll into view ----------
     Only elements below the first screen are hidden, so the first view is always complete. */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    var fold = window.innerHeight;
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < fold) el.classList.add("is-visible");
      else io.observe(el);
    });
  }

  /* ---------- Hero map: country names on hover/tap, and a slow cycle of
     highlighted countries so the map feels alive ---------- */
  function initMap() {
    var map = document.querySelector(".map");
    var label = document.getElementById("map-country");
    if (!map) return;
    var countries = Array.prototype.slice.call(map.querySelectorAll(".m-af path[data-name]"));
    if (!countries.length) return;

    var canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
    var hint = canHover ? "Hover over a country" : "Tap a country";
    var picked = null;
    var hovering = null;

    function setLabel(text, active) {
      if (!label) return;
      label.textContent = text;
      label.classList.toggle("is-active", !!active);
    }
    function current() {
      var el = hovering || picked;
      if (el) setLabel(el.getAttribute("data-name"), true);
      else setLabel(hint, false);
    }
    current();

    map.addEventListener("mouseover", function (e) {
      var el = e.target.closest && e.target.closest("path[data-name]");
      if (el && el.closest(".m-af")) { hovering = el; current(); }
    });
    map.addEventListener("mouseleave", function () { hovering = null; current(); });
    map.addEventListener("click", function (e) {
      var el = e.target.closest && e.target.closest(".m-af path[data-name]");
      if (!el) return;
      if (picked) picked.classList.remove("is-picked");
      picked = picked === el ? null : el;
      if (picked) picked.classList.add("is-picked");
      current();
    });

    if (reduceMotion) return;

    // Swap the fixed highlights for a gentle cycle through all 54 countries.
    var accents = ["a1", "a2", "a3", "a4"];
    countries.forEach(function (c) { accents.forEach(function (a) { c.classList.remove(a); }); });
    var order = countries.slice();
    for (var i = order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
    }
    var lit = [];
    var n = 0;
    function step() {
      if (document.hidden) return;
      var el = order[n % order.length];
      var acc = accents[n % accents.length];
      n++;
      el.classList.add(acc);
      lit.push([el, acc]);
      if (lit.length > 5) {
        var old = lit.shift();
        old[0].classList.remove(old[1]);
      }
    }
    for (var k = 0; k < 5; k++) step();
    setInterval(step, 1400);
  }

  /* ---------- Mobile sticky "Register" bar: shows after the hero,
     hides while the contact form is on screen ---------- */
  function initCtaBar() {
    var bar = document.getElementById("cta-bar");
    var hero = document.querySelector(".hero");
    var contact = document.getElementById("contact");
    if (!bar || !hero || !contact || !("IntersectionObserver" in window)) return;
    bar.hidden = false;
    var pastHero = false, atContact = false;
    function update() {
      var on = pastHero && !atContact;
      bar.classList.toggle("is-on", on);
      document.body.classList.toggle("has-cta-bar", on);
    }
    new IntersectionObserver(function (e) { pastHero = !e[0].isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(function (e) { atContact = e[0].isIntersecting; update(); }, { rootMargin: "0px 0px -20% 0px" }).observe(contact);
  }

  /* ---------- Chart tooltips: any element with data-tip ---------- */
  function initTips() {
    var items = document.querySelectorAll("[data-tip]");
    if (!items.length) return;
    var tip = document.createElement("div");
    tip.className = "tip";
    tip.setAttribute("role", "tooltip");
    tip.setAttribute("aria-hidden", "true");
    document.body.appendChild(tip);
    function place(x, y) {
      var w = tip.offsetWidth, h = tip.offsetHeight;
      var left = Math.min(Math.max(8, x - w / 2), window.innerWidth - w - 8);
      var top = y - h - 12;
      if (top < 8) top = y + 16;
      tip.style.left = left + "px";
      tip.style.top = top + "px";
    }
    function show(el, x, y) {
      tip.textContent = el.getAttribute("data-tip");
      tip.classList.add("is-on");
      if (x === undefined) {
        var r = el.getBoundingClientRect();
        x = r.left + r.width / 2; y = r.top;
      }
      place(x, y);
    }
    function hide() { tip.classList.remove("is-on"); }
    items.forEach(function (el) {
      el.setAttribute("aria-label", el.getAttribute("data-tip"));
      el.addEventListener("mousemove", function (e) { show(el, e.clientX, e.clientY); });
      el.addEventListener("mouseleave", hide);
      el.addEventListener("focus", function () { show(el); });
      el.addEventListener("blur", hide);
      el.addEventListener("click", function () { show(el); });
    });
    window.addEventListener("scroll", hide, { passive: true });
  }

  /* ---------- Colour option switcher (review copies only) ---------- */
  function initReviewBar() {
    // Set to false once the team has picked an option (and set data-theme in the HTML).
    var SHOW_THEME_SWITCHER = true;
    var show = SHOW_THEME_SWITCHER || isPreview;
    try { show = show || new URLSearchParams(location.search).has("review"); } catch (e) {}
    if (!show) return;
    var themes = [["a", "A · Light"], ["b", "B · Hybrid"], ["c", "C · Dark"]];
    var bar = document.createElement("div");
    bar.className = "review-bar";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Colour option");
    var lab = document.createElement("span");
    lab.textContent = "Colour option";
    bar.appendChild(lab);
    themes.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = t[1];
      b.setAttribute("data-theme", t[0]);
      bar.appendChild(b);
    });
    function sync() {
      var cur = root.getAttribute("data-theme");
      bar.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-theme") === cur));
      });
    }
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      root.setAttribute("data-theme", b.getAttribute("data-theme"));
      try { localStorage.setItem("cti-theme", b.getAttribute("data-theme")); } catch (err) {}
      sync();
    });
    sync();
    document.body.appendChild(bar);
  }

  /* ---------- Audience buttons preselect the form ---------- */
  function initInterestLinks() {
    var select = document.getElementById("f-interest");
    if (!select) return;

    function preselect(value) {
      var exists = Array.prototype.some.call(select.options, function (o) { return o.value === value; });
      if (exists) {
        select.value = value;
        select.dispatchEvent(new Event("change"));
      }
      return exists;
    }

    document.querySelectorAll("[data-interest]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var form = document.getElementById("contact-form");
        if (!form || form.hidden) return;
        e.preventDefault();
        preselect(link.getAttribute("data-interest"));
        var target = document.getElementById("contact");
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        var firstEmpty = Array.prototype.find.call(
          form.querySelectorAll("input[required], select[required]"),
          function (f) { return !f.value.trim(); }
        );
        setTimeout(function () { (firstEmpty || select).focus({ preventScroll: true }); }, reduceMotion ? 0 : 450);
      });
    });

    try {
      var param = new URLSearchParams(window.location.search).get("interest");
      if (param) preselect(param);
    } catch (err) { /* ignore */ }
  }

  /* ---------- Contact form ---------- */
  function initForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var MAX = 2000;
    var submit = document.getElementById("form-submit");
    var alertBox = document.getElementById("form-alert");
    var success = document.getElementById("form-success");
    var message = document.getElementById("f-message");
    var counter = document.getElementById("f-message-count");
    var attempted = false;

    var rules = {
      "f-name": function (v) { return v ? "" : "Enter your full name"; },
      "f-email": function (v) {
        if (!v) return "Enter your email address";
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter an email address like name@company.com";
      },
      "f-interest": function (v) { return v ? "" : "Choose what you're interested in"; },
      "f-message": function (v) { return v.length > MAX ? "Keep your message under 2,000 characters" : ""; }
    };

    var errorIcon = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>';

    function showError(field, text) {
      var box = document.getElementById(field.id + "-error");
      if (!box) return;
      if (text) {
        field.setAttribute("aria-invalid", "true");
        box.innerHTML = errorIcon; // static icon only; the message is set as text below
        var span = document.createElement("span");
        span.textContent = text;
        box.appendChild(span);
        box.hidden = false;
      } else {
        field.removeAttribute("aria-invalid");
        box.textContent = "";
        box.hidden = true;
      }
    }

    function validateField(field) {
      var rule = rules[field.id];
      if (!rule) return true;
      var msg = rule(field.value.trim());
      showError(field, msg);
      return !msg;
    }

    function validateAll() {
      var firstBad = null;
      Object.keys(rules).forEach(function (id) {
        var field = document.getElementById(id);
        if (field && !validateField(field) && !firstBad) firstBad = field;
      });
      return firstBad;
    }

    Object.keys(rules).forEach(function (id) {
      var field = document.getElementById(id);
      if (!field) return;
      field.addEventListener("blur", function () { if (attempted) validateField(field); });
      field.addEventListener("change", function () { if (attempted) validateField(field); });
    });

    function updateCount() {
      var n = message.value.length;
      counter.textContent = n.toLocaleString("en-GB") + " / 2,000";
      counter.classList.toggle("is-over", n > MAX);
    }
    if (message && counter) {
      message.addEventListener("input", updateCount);
      updateCount();
    }

    function showSuccess() {
      form.hidden = true;
      success.hidden = false;
      var note = document.getElementById("preview-note");
      if (note) note.hidden = !isPreview;
      success.focus();
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      attempted = true;
      alertBox.hidden = true;

      var firstBad = validateAll();
      if (firstBad) { firstBad.focus(); return; }

      // Honeypot filled in: quietly pretend it worked and send nothing.
      var trap = form.querySelector('[name="bot-field"]');
      if (trap && trap.value) { showSuccess(); return; }

      if (isPreview) { showSuccess(); return; }

      // Trim values and send as JSON to the contact function.
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = typeof v === "string" ? v.trim() : v; });
      var endpoint = (form.getAttribute("data-endpoint") || "/api/contact").trim();
      var request = fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      });

      submit.disabled = true;
      submit.textContent = "Sending…";

      request
        .then(function (res) { if (!res.ok) throw new Error("Status " + res.status); showSuccess(); })
        .catch(function () {
          alertBox.hidden = false;
          submit.disabled = false;
          submit.textContent = "Send";
        });
    });
  }
})();

