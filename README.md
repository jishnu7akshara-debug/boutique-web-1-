# Vellora House (Boutique Hotel Web One)

Client-demo template for a boutique heritage hotel that also runs estate homestays (Coorg setting). Plain HTML, CSS and JavaScript, no build step. Animations use GSAP + ScrollTrigger and Lenis, bundled locally in `js/vendor`.

## Preview
Serve the folder (needed for video autoplay and range requests):

    npx serve .

Double-clicking `index.html` also works.

## What moves
- Opening: louvred green shutters swing open onto the hero film.
- Hero title rises line by line; the booking bar sends dates, guests and stay type to WhatsApp.
- Story paragraph lights up word by word; the bungalow photo widens from a narrow arch.
- Suites: pinned horizontal corridor on desktop (swipe carousel on phones).
- Homestays: video band with parallax, tabbed homestays with wipe-in photos, side-scroll reveals.
- Gatherings: drag to compare the lawn by day and at night.
- Gallery marquee speeds up with scroll velocity and slows on hover.
- `prefers-reduced-motion` turns all of it off and shows a static page.

## Customise for a client
- Name, phone, WhatsApp: search `index.html` for `Vellora` and `98000`, and set `WHATSAPP` at the top of `js/main.js`.
- Suites, prices, homestays: edit the copy in `index.html`.
- Colours and type: variables at the top of `css/styles.css`.
- Photos and video: replace files in `assets/img` and `assets/video`, keeping the names.

## Deploy
Push to GitHub and import in Vercel (`vercel.json` included), or drag the folder into Netlify.
