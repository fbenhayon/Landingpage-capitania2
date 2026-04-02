// Production config for external landing + Beehiiv integration.
// ✅ beehiivIframeSrc confirmed from Beehiiv embed code.
// ⚠️ publicationUrl: update if your Beehiiv subdomain differs from 'capitania'.
// ⚠️ ndaFormUrl: replace with your NDA/Data Room form URL (Typeform, Tally, etc.).
const CONFIG = {
  publicationUrl: "https://capitania.beehiiv.com",
  beehiivIframeSrc: "https://subscribe-forms.beehiiv.com/0b865016-1ecc-4a37-8ac8-958205fb638e",
  beehiivEmbedScriptSrc: "https://subscribe-forms.beehiiv.com/embed.js",
  beehiivAttributionScriptSrc: "https://subscribe-forms.beehiiv.com/attribution.js",
  ndaFormUrl: "mailto:bni.imoveis@hotmail.com",
  contactEmail: "bni.imoveis@hotmail.com",
};

function looksConfigured(value) {
  return Boolean(value && !value.includes("SEU-") && !value.includes("SEU_"));
}

function normalizeBaseUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

function loadExternalScript(src) {
  if (!looksConfigured(src)) return;
  if (document.querySelector(`script[src="${src}"]`)) return;

  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
}

function initBeehiivBlock() {
  const fallbackLink = document.getElementById("fallbackSubscribe");
  const embedContainer = document.getElementById("beehiivEmbedContainer");
  const embedStatus = document.getElementById("embedStatus");

  const publicationBase = normalizeBaseUrl(CONFIG.publicationUrl);
  if (looksConfigured(publicationBase)) {
    fallbackLink.href = publicationBase + "/subscribe";
  } else if (looksConfigured(CONFIG.beehiivIframeSrc)) {
    fallbackLink.href = CONFIG.beehiivIframeSrc;
  } else {
    fallbackLink.href = "#";
    fallbackLink.setAttribute("aria-disabled", "true");
    fallbackLink.style.opacity = "0.7";
  }

  if (!looksConfigured(CONFIG.beehiivIframeSrc)) {
    embedStatus.textContent =
      "Beehiiv iframe not configured yet. Fallback button is active if publication URL is set.";
    embedContainer.innerHTML =
      "<p style='margin:0;color:#d7e0db;font-size:0.86rem;'>Add your Beehiiv iframe src in <code>app.js</code> to enable inline subscribe.</p>";
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.src = CONFIG.beehiivIframeSrc;
  iframe.loading = "lazy";
  iframe.setAttribute("title", "Beehiiv subscribe form");
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("data-test-id", "beehiiv-embed");
  iframe.setAttribute("style", "width:100%;height:220px;margin:0;border-radius:8px;background:#fff;");

  embedContainer.innerHTML = "";
  embedContainer.appendChild(iframe);
  embedStatus.textContent = "Beehiiv inline form active.";

  loadExternalScript(CONFIG.beehiivEmbedScriptSrc);
  loadExternalScript(CONFIG.beehiivAttributionScriptSrc);
}

function initSecondaryActions() {
  const ndaLink = document.getElementById("ndaLink");
  const contactEmail = document.getElementById("contactEmail");

  if (looksConfigured(CONFIG.ndaFormUrl) && !CONFIG.ndaFormUrl.startsWith("mailto:")) {
    ndaLink.href = CONFIG.ndaFormUrl;
  } else {
    ndaLink.href = "mailto:" + CONFIG.contactEmail;
    ndaLink.textContent = "Request NDA via Email";
  }

  contactEmail.href = "mailto:" + CONFIG.contactEmail;
  contactEmail.textContent = CONFIG.contactEmail;
}

function initFooterYear() {
  const yearEl = document.getElementById("currentYear");
  yearEl.textContent = new Date().getFullYear();
}

function init() {
  initBeehiivBlock();
  initSecondaryActions();
  initFooterYear();
}

init();
