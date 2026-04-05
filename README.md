# Capitania Landing Deployment

This repository has one canonical deploy target:

- `external-production/`

Netlify must publish only that folder.

## Production files

- `external-production/index.html`: main landing page
- `external-production/app.js`: custom subscription form and CTA wiring
- `external-production/style.css`: visual styling
- `external-production/welcome.html`: post-signup confirmation page
- `external-production/nda-request.html`: optional NDA/Data Room step
- `external-production/nda-request.js`: NDA form behavior
- `external-production/assets/images/capa.jpg`: hero image
- `netlify/functions/subscribe.js`: secure server-side Beehiiv subscription bridge
- `netlify.toml`: Netlify publish configuration

## Flow

1. Netlify serves `external-production/index.html`.
2. The investor submits the custom form on the landing.
3. The Netlify function creates the Beehiiv subscription securely.
4. Beehiiv sends the welcome email.
5. The landing redirects the subscriber to `/welcome.html`.
6. The welcome email contains the composite link.

## Important

The landing code does not send emails.
Beehiiv sends the welcome email and must be configured in the Beehiiv dashboard.

## Netlify environment variables

Add these variables in Netlify before testing the live subscribe flow:

- `BEEHIIV_API_KEY`: Beehiiv API key with subscription write access
- `BEEHIIV_PUBLICATION_ID`: publication ID in the format `pub_...`
- `BEEHIIV_DOUBLE_OPT_OVERRIDE`: optional, use `not_set`, `on`, or `off`
- `BEEHIIV_SEND_WELCOME_EMAIL`: optional, `true` or `false`
- `BEEHIIV_NEWSLETTER_LIST_IDS`: optional comma-separated Beehiiv list IDs
- `BEEHIIV_AUTOMATION_IDS`: optional comma-separated Beehiiv automation IDs
