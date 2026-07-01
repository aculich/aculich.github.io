/**
 * Cookie consent (Osano cookieconsent v3) + Google Consent Mode v2 + gated GA4/Cloudflare.
 * Requires window.PHASE_SHIFT_SITE from js/site-config.js (generated at build).
 */
(function () {
  "use strict";

  var cfg = window.PHASE_SHIFT_SITE || {};
  var analyticsLoaded = false;

  function gpcOptOut() {
    return navigator.globalPrivacyControl === true;
  }

  function grantAnalytics() {
    if (typeof gtag === "function") {
      gtag("consent", "update", {
        ad_storage: "denied",
        analytics_storage: "granted",
        personalization_storage: "denied",
      });
    }
    loadAnalyticsScripts();
  }

  function denyAnalytics() {
    if (typeof gtag === "function") {
      gtag("consent", "update", {
        ad_storage: "denied",
        analytics_storage: "denied",
        personalization_storage: "denied",
      });
    }
  }

  function loadAnalyticsScripts() {
    if (analyticsLoaded) return;
    var ga4Id = cfg.ga4MeasurementId;
    var cfToken = cfg.cloudflareBeaconToken;
    if (!ga4Id && !cfToken) return;

    analyticsLoaded = true;

    if (ga4Id) {
      var gtagScript = document.createElement("script");
      gtagScript.async = true;
      gtagScript.src =
        "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ga4Id);
      document.head.appendChild(gtagScript);

      gtag("js", new Date());
      gtag("config", ga4Id, { anonymize_ip: true });
    }

    if (cfToken) {
      var cfScript = document.createElement("script");
      cfScript.defer = true;
      cfScript.src = "https://static.cloudflareinsights.com/beacon.min.js";
      cfScript.setAttribute(
        "data-cf-beacon",
        JSON.stringify({ token: cfToken })
      );
      document.body.appendChild(cfScript);
    }
  }

  function initCookieBanner() {
    if (typeof window.cookieconsent === "undefined") return;

    window.cookieconsent.initialise({
      palette: {
        popup: { background: "#ffffff", text: "#333333" },
        button: { background: cfg.accentColor || "#5a7247", text: "#ffffff" },
      },
      type: "opt-in",
      position: "bottom",
      static: true,
      content: {
        message:
          "This site uses cookies for anonymous analytics so I can see which pages help readers. No ads, no sale of personal data.",
        allow: "Accept",
        deny: "Decline",
        link: "Privacy",
        href: cfg.privacyPath || "/blog/privacy/",
      },
      onStatusChange: function (status) {
        if (status === "allow") grantAnalytics();
        else if (status === "deny") denyAnalytics();
      },
      onInitialise: function (status) {
        if (status === "allow") grantAnalytics();
      },
    });
  }

  function scheduleBanner() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initCookieBanner);
    } else {
      initCookieBanner();
    }
  }

  function init() {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };

    gtag("consent", "default", {
      ad_storage: "denied",
      analytics_storage: "denied",
      functionality_storage: "granted",
      personalization_storage: "denied",
      security_storage: "granted",
      wait_for_update: 500,
    });

    if (gpcOptOut()) {
      denyAnalytics();
      return;
    }

    scheduleBanner();
  }

  init();
})();
