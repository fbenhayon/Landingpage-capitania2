// Production config for external landing + Beehiiv integration.
// The browser never talks directly to the Beehiiv API.
// Netlify Function /.netlify/functions/subscribe handles the secure API call.
const CONFIG = {
  publicationUrl: "https://capitania.beehiiv.com",
  subscribeEndpoint: "/.netlify/functions/subscribe",
  welcomeUrl: "./welcome.html",
  ndaFormUrl: "./nda-request.html",
  contactEmail: "bni.imoveis@hotmail.com",
};

function looksConfigured(value) {
  return Boolean(value && !value.includes("SEU-") && !value.includes("SEU_"));
}

function normalizeBaseUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

function initFallbackLink() {
  const fallbackLink = document.getElementById("fallbackSubscribe");

  if (!fallbackLink) {
    return;
  }

  const publicationBase = normalizeBaseUrl(CONFIG.publicationUrl);
  if (looksConfigured(publicationBase)) {
    fallbackLink.href = publicationBase + "/subscribe";
  } else {
    fallbackLink.href = "#";
    fallbackLink.setAttribute("aria-disabled", "true");
    fallbackLink.style.opacity = "0.7";
  }
}

function initSecondaryActions() {
  const ndaLink = document.getElementById("ndaLink");
  const contactEmail = document.getElementById("contactEmail");

  if (!ndaLink || !contactEmail) {
    return;
  }

  if (looksConfigured(CONFIG.ndaFormUrl) && !CONFIG.ndaFormUrl.startsWith("mailto:")) {
    ndaLink.href = CONFIG.ndaFormUrl;
  } else {
    ndaLink.href = "mailto:" + CONFIG.contactEmail;
    ndaLink.textContent = "Request NDA via Email";
  }

  contactEmail.href = "mailto:" + CONFIG.contactEmail;
  contactEmail.textContent = CONFIG.contactEmail;
}

function showAlert(type, message) {
  const alertEl = document.getElementById("form-alert");
  if (!alertEl) {
    return;
  }

  alertEl.textContent = message;
  alertEl.className = "form-alert";

  if (type === "error") {
    alertEl.classList.add("error");
  } else if (type === "info") {
    alertEl.classList.add("info");
  }
}

function hideAlert() {
  const alertEl = document.getElementById("form-alert");
  if (!alertEl) {
    return;
  }

  alertEl.textContent = "";
  alertEl.className = "form-alert";
}

function setSubmitting(isSubmitting) {
  const button = document.getElementById("submitBtn");
  const spinner = document.getElementById("spinner");
  const buttonText = document.getElementById("btnText");

  if (!button || !spinner || !buttonText) {
    return;
  }

  button.disabled = isSubmitting;
  spinner.style.display = isSubmitting ? "block" : "none";
  buttonText.textContent = isSubmitting
    ? "Submitting..."
    : "Subscribe · Receive Composite →";
}

function getFieldValue(id) {
  const el = document.getElementById(id);
  return el ? String(el.value || "").trim() : "";
}

function collectFormData() {
  return {
    firstName: getFieldValue("firstName"),
    lastName: getFieldValue("lastName"),
    email: getFieldValue("email").toLowerCase(),
    company: getFieldValue("company"),
    jobtitle: getFieldValue("jobtitle"),
    country: getFieldValue("country"),
    profile: getFieldValue("profile"),
    linkedin: getFieldValue("linkedin"),
    message: getFieldValue("message"),
  };
}

function validateFormData(data) {
  const requiredFields = [
    ["firstName", "First Name"],
    ["lastName", "Last Name"],
    ["email", "Corporate Email"],
    ["company", "Company / Fund Name"],
  ];

  for (const [key, label] of requiredFields) {
    if (!data[key]) {
      return `${label} is required.`;
    }
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(data.email)) {
    return "Please enter a valid email address.";
  }

  return "";
}

function collectTrackingData() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "capitania-landing",
    utm_medium: params.get("utm_medium") || "external-landing",
    utm_campaign: params.get("utm_campaign") || "capitania-resort",
    utm_term: params.get("utm_term") || "",
    utm_content: params.get("utm_content") || "",
    referring_site: window.location.href,
  };
}

async function archiveLeadForNetlify(data) {
  const formData = new URLSearchParams();
  formData.set("form-name", "investor-subscribe");

  Object.entries(data).forEach(([key, value]) => {
    formData.set(key, value || "");
  });

  try {
    await fetch("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
  } catch (error) {
    console.warn("Netlify archival submit failed", error);
  }
}

async function submitSubscription(data) {
  const response = await fetch(CONFIG.subscribeEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      tracking: collectTrackingData(),
    }),
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch (error) {
    console.warn("Subscription response was not JSON", error);
  }

  if (!response.ok) {
    throw new Error(payload.error || "Subscription failed.");
  }

  return payload;
}

function showSuccessState(result) {
  const formContent = document.getElementById("form-content");
  const successBox = document.getElementById("success-msg");
  const successCopy = document.getElementById("success-copy");

  if (formContent) {
    formContent.style.display = "none";
  }

  if (!successBox) {
    window.location.href = CONFIG.welcomeUrl;
    return;
  }

  if (successCopy) {
    successCopy.textContent = result && result.existing
      ? "This email was already present in the investor audience. We are taking you to the welcome page now."
      : "Your subscription was received successfully. We are taking you to the welcome page now while Beehiiv processes the welcome email with the composite link.";
  }

  successBox.style.display = "block";

  window.setTimeout(() => {
    window.location.href = CONFIG.welcomeUrl;
  }, 1400);
}

async function handleSubscriptionSubmit(event) {
  event.preventDefault();

  hideAlert();

  const data = collectFormData();
  const validationError = validateFormData(data);
  if (validationError) {
    showAlert("error", validationError);
    return;
  }

  try {
    setSubmitting(true);
    showAlert("info", "Submitting your subscription...");

    const result = await submitSubscription(data);
    await archiveLeadForNetlify(data);
    hideAlert();
    showSuccessState(result);
  } catch (error) {
    console.error("Subscription error:", error);
    showAlert(
      "error",
      error.message ||
        "We could not process the subscription right now. Please use the Beehiiv fallback link below."
    );
  } finally {
    setSubmitting(false);
  }
}

function initSubscriptionForm() {
  const form = document.getElementById("subscriptionForm");
  if (!form) {
    return;
  }

  form.addEventListener("submit", handleSubscriptionSubmit);
}

function initFooterYear() {
  const yearEl = document.getElementById("currentYear");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function init() {
  initFallbackLink();
  initSecondaryActions();
  initSubscriptionForm();
  initFooterYear();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
