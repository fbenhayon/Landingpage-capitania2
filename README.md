# Capitania Landing Deployment

This repository has one canonical deploy target:

- `external-production/`

Netlify must publish only that folder.

## Production files

- `external-production/index.html`: main landing page
- `external-production/app.js`: Beehiiv embed and CTA wiring
- `external-production/style.css`: visual styling
- `external-production/welcome.html`: post-signup confirmation page
- `external-production/nda-request.html`: optional NDA/Data Room step
- `external-production/nda-request.js`: NDA form behavior
- `external-production/assets/images/capa.jpg`: hero image
- `netlify.toml`: Netlify publish configuration

## Flow

1. Netlify serves `external-production/index.html`.
2. The investor submits the Beehiiv form.
3. Beehiiv redirects to `/welcome.html`.
4. Beehiiv sends the welcome email.
5. The welcome email contains the composite link.

## Important

The landing code does not send emails.
Beehiiv sends the welcome email and must be configured in the Beehiiv dashboard.
