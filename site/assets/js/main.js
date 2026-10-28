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
    initCorridor();
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

  /* ---------- Hero grid: country names on hover/tap, plus one gentle sweep on load ---------- */
  function initCorridor() {
    var grid = document.querySelector(".corridor-grid");
    var label = document.getElementById("corridor-country");
    var cells = document.querySelectorAll(".corridor-grid span");
    if (!grid || !cells.length) return;

    var canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
    var hint = canHover ? "Hover over a code" : "Tap a code";
    var picked = null;

    function show(cell) {
      if (!label) return;
      if (cell) {
        label.textContent = cell.textContent + " · " + cell.getAttribute("data-name");
        label.classList.add("is-active");
      } else if (picked) {
        show(picked);
      } else {
        label.textContent = hint;
        label.classList.remove("is-active");
      }
    }
    show(null);

    cells.forEach(function (cell) { cell.title = cell.getAttribute("data-name"); });
    grid.addEventListener("mouseover", function (e) {
      var cell = e.target.closest("span[data-name]");
      if (cell) show(cell);
    });
    grid.addEventListener("mouseleave", function () { show(null); });
    grid.addEventListener("click", function (e) {
      var cell = e.target.closest("span[data-name]");
      if (!cell) return;
      if (picked) picked.classList.remove("is-picked");
      picked = picked === cell ? null : cell;
      if (picked) picked.classList.add("is-picked");
      show(picked);
    });

    if (reduceMotion) return;
    cells.forEach(function (cell, i) {
      setTimeout(function () {
        cell.classList.add("is-lit");
        setTimeout(function () { cell.classList.remove("is-lit"); }, 380);
      }, 500 + i * 32);
    });
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
      "f-org": function (v) { return v ? "" : "Enter your organisation"; },
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

      // Trim values before sending.
      var data = new FormData(form);
      Array.from(data.keys()).forEach(function (k) {
        var v = data.get(k);
        if (typeof v === "string") data.set(k, v.trim());
      });

      var endpoint = (form.getAttribute("data-endpoint") || "").trim();
      var request = endpoint
        ? fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(Object.fromEntries(data))
          })
        : fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(data).toString()
          });

      submit.disabled = true;
      submit.textContent = "Sending…";

      request
        .then(function (res) { if (!res.ok) throw new Error("Status " + res.status); showSuccess(); })
        .catch(function () {
          alertBox.hidden = false;
          submit.disabled = false;
          submit.textContent = "Send message";
        });
    });
  }
})();
