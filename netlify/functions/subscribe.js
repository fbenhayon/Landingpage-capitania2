const BEEHIIV_BASE_URL = "https://api.beehiiv.com/v2";

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(payload),
  };
}

function normalizeBoolean(value, defaultValue) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  return String(value).toLowerCase() === "true";
}

function csvToList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildCustomFields(data) {
  const fields = [
    ["First Name", data.firstName],
    ["Last Name", data.lastName],
    ["Company", data.company],
    ["Job Title", data.jobtitle],
    ["Country", data.country],
    ["Investor Profile", data.profile],
    ["LinkedIn", data.linkedin],
    ["Message", data.message],
  ];

  return fields
    .filter(([, value]) => Boolean(value))
    .map(([name, value]) => ({ name, value }));
}

async function beehiivRequest(path, options, apiKey) {
  return fetch(`${BEEHIIV_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch (error) {
    return {};
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !publicationId) {
    return jsonResponse(500, {
      error:
        "BNI subscription integration is not configured in Netlify yet. Add the required environment variables.",
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (error) {
    return jsonResponse(400, { error: "Invalid JSON payload." });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!email) {
    return jsonResponse(400, { error: "Email is required." });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return jsonResponse(400, { error: "Invalid email address." });
  }

  const tracking = body.tracking || {};
  const customFields = buildCustomFields(body);

  try {
    const lookupResponse = await beehiivRequest(
      `/publications/${publicationId}/subscriptions/by_email/${encodeURIComponent(email)}`,
      { method: "GET", headers: { "Content-Type": "application/json" } },
      apiKey
    );

    if (lookupResponse.ok) {
      const lookupPayload = await parseJsonSafely(lookupResponse);
      const existing = lookupPayload.data || {};

      if (existing.id && customFields.length) {
        await beehiivRequest(
          `/publications/${publicationId}/subscriptions/${existing.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              email,
              custom_fields: customFields,
            }),
          },
          apiKey
        );
      }

      return jsonResponse(200, {
        ok: true,
        existing: true,
        status: existing.status || "active",
      });
    }
  } catch (error) {
    console.warn("Beehiiv lookup failed, continuing to create", error);
  }

  const createPayload = {
    email,
    reactivate_existing: false,
    send_welcome_email: normalizeBoolean(
      process.env.BEEHIIV_SEND_WELCOME_EMAIL,
      true
    ),
    double_opt_override:
      process.env.BEEHIIV_DOUBLE_OPT_OVERRIDE || "not_set",
    utm_source: tracking.utm_source || "capitania-landing",
    utm_medium: tracking.utm_medium || "external-landing",
    utm_campaign: tracking.utm_campaign || "capitania-resort",
    utm_term: tracking.utm_term || "",
    utm_content: tracking.utm_content || "",
    referring_site: tracking.referring_site || "",
  };

  if (customFields.length) {
    createPayload.custom_fields = customFields;
  }

  const newsletterListIds = csvToList(process.env.BEEHIIV_NEWSLETTER_LIST_IDS);
  if (newsletterListIds.length) {
    createPayload.newsletter_list_ids = newsletterListIds;
  }

  const automationIds = csvToList(process.env.BEEHIIV_AUTOMATION_IDS);
  if (automationIds.length) {
    createPayload.automation_ids = automationIds;
  }

  try {
    const createResponse = await beehiivRequest(
      `/publications/${publicationId}/subscriptions`,
      {
        method: "POST",
        body: JSON.stringify(createPayload),
      },
      apiKey
    );

    const createBody = await parseJsonSafely(createResponse);

    if (!createResponse.ok) {
      const message =
        createBody.error ||
        createBody.message ||
        "BNI rejected the subscription request.";
      return jsonResponse(createResponse.status, { error: message });
    }

    return jsonResponse(200, {
      ok: true,
      existing: false,
      status: createBody.data && createBody.data.status
        ? createBody.data.status
        : "submitted",
    });
  } catch (error) {
    console.error("Beehiiv create subscription failed", error);
    return jsonResponse(500, {
      error: "Unable to reach the BNI subscription service right now. Please try again.",
    });
  }
};
