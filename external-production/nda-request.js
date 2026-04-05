const NDA_CONFIG = {
  contactEmail: "bni.imoveis@hotmail.com",
  subjectPrefix: "Capitania Resort NDA Request",
};

function escapeMailto(value) {
  return encodeURIComponent(String(value || "").trim());
}

function formToRequestText(formData) {
  const lines = [
    "Capitania Resort NDA / Data Room Request",
    "",
    "Full Name: " + (formData.get("fullName") || ""),
    "Professional Email: " + (formData.get("email") || ""),
    "Company / Fund: " + (formData.get("company") || ""),
    "Role / Title: " + (formData.get("title") || ""),
    "Phone / WhatsApp: " + (formData.get("phone") || ""),
    "Country / Jurisdiction: " + (formData.get("jurisdiction") || ""),
    "Investor Type: " + (formData.get("investorType") || ""),
    "Capital Profile: " + (formData.get("capitalProfile") || ""),
    "",
    "Investment Thesis / Notes:",
    formData.get("notes") || "",
    "",
    "Consent confirmed: Yes",
  ];

  return lines.join("\n").trim();
}

function buildMailtoUrl(formData) {
  const subject = `${NDA_CONFIG.subjectPrefix} - ${formData.get("company") || formData.get("fullName") || "New Lead"}`;
  const body = formToRequestText(formData);
  return `mailto:${NDA_CONFIG.contactEmail}?subject=${escapeMailto(subject)}&body=${escapeMailto(body)}`;
}

async function copyRequestText(formData, statusEl) {
  const requestText = formToRequestText(formData);

  try {
    await navigator.clipboard.writeText(requestText);
    statusEl.textContent = "Request copied. You can paste it into an email to the investor desk.";
  } catch (error) {
    statusEl.textContent = "Copy failed on this browser. Send the request to " + NDA_CONFIG.contactEmail + ".";
  }
}

function setValidityState(form, statusEl) {
  if (form.checkValidity()) {
    statusEl.textContent = "";
    return true;
  }

  form.reportValidity();
  statusEl.textContent = "Please complete the required fields before continuing.";
  return false;
}

function initNdaRequestForm() {
  const form = document.getElementById("ndaRequestForm");
  const copyButton = document.getElementById("copyRequest");
  const statusEl = document.getElementById("formStatus");

  if (!form || !copyButton || !statusEl) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!setValidityState(form, statusEl)) {
      return;
    }

    const formData = new FormData(form);
    window.location.href = buildMailtoUrl(formData);
    statusEl.textContent =
      "Your email client should open with the request drafted. If it does not, use the copy button below.";
  });

  copyButton.addEventListener("click", async () => {
    if (!setValidityState(form, statusEl)) {
      return;
    }

    const formData = new FormData(form);
    await copyRequestText(formData, statusEl);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNdaRequestForm);
} else {
  initNdaRequestForm();
}
