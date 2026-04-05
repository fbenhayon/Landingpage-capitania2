# Capitania Landing Deployment

Use Netlify connected to this GitHub repository.
Netlify is configured to publish only `external-production`, not the repository root.

## Final entry files

- `external-production/index.html`: production landing page.
- `external-production/welcome.html`: post-subscription confirmation page.
- `external-production/app.js`: front-end Beehiiv integration.
- `external-production/styles.css`: main stylesheet.
- `external-production/nda-request.html`: optional qualification page for NDA and Data Room intake.
- `netlify.toml`: tells Netlify exactly what to publish.

## Where each piece enters

- `Netlify`: hosts the landing page and delivers the static files.
- `index.html`: page the investor sees first.
- `app.js`: browser script that loads the Beehiiv form and wires the action links.
- `Beehiiv`: receives the subscriber and sends the welcome email.
- `welcome.html`: confirmation page shown right after signup.
- `nda-request.html`: optional next step for confidential follow-up.

## Exact flow

1. Netlify publishes `external-production`.
2. Visitor opens `index.html`.
3. Visitor submits the Beehiiv form.
4. Beehiiv redirects to `/welcome.html`.
5. Beehiiv sends the welcome email.
6. The welcome email contains the full investment composite link.

## Important

The landing code does not send the welcome email by itself.
That email is sent by Beehiiv and must be enabled in Beehiiv settings.

## Beehiiv settings you must enable

1. In Beehiiv, open the subscribe form used by this landing.
2. Set the post-submit redirect to your deployed `https://YOUR-DOMAIN/welcome.html`.
3. In Beehiiv `Settings > Emails > Welcome Email`, enable the welcome email.
4. Put the composite link inside the welcome email body.

Official references:

- `Setting up your welcome email`: https://www.beehiiv.com/support/article/12314772394519-setting-up-your-welcome-email
- `Netlify build settings and publish directory`: https://docs.netlify.com/configure-builds/overview/
