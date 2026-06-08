# Publishing to Google Play (Internal Testing)

This app is a PWA wrapped as a **Trusted Web Activity (TWA)** — a thin Android
app that loads the live site (`https://notes-liquid-glass.vercel.app`) full
screen. You generate the Android bundle with **PWABuilder** (no Android Studio,
no command line, no credentials shared with anyone).

The PWA is already package-ready: manifest, icons, service worker, and a
Digital Asset Links file are in place.

---

## One-time: generate the Android package

1. Deploy the latest to Vercel (push to `main` — Vercel auto-deploys).
2. Go to **https://www.pwabuilder.com** and enter your URL:
   `https://notes-liquid-glass.vercel.app`
3. Click **Start** → it scores the PWA (manifest/SW/icons should all pass).
4. Click **Package For Stores → Android → Generate Package**.
   - **Package ID**: e.g. `app.vercel.notes_liquid_glass` (write this down — it's
     permanent for the app).
   - Leave "Signing key" as **Create new** (PWABuilder makes & stores it; keep
     the downloaded `.zip` safe — it contains `signing.keystore` + passwords).
5. Download the zip. It contains:
   - `app-release-signed.aab`  ← upload this to Play
   - `assetlinks.json`         ← contains your signing fingerprint
   - the signing key + a readme

## One-time: verify the domain (removes the URL bar)

6. Open the `assetlinks.json` from the zip, copy its contents into
   `public/.well-known/assetlinks.json` in this repo (replace the placeholders),
   commit, and push so Vercel serves it at
   `https://notes-liquid-glass.vercel.app/.well-known/assetlinks.json`.

## Upload to Play Console (Internal testing)

7. In **Play Console → Create app** (name "Notes", app, free).
8. Left nav → **Testing → Internal testing → Create new release**.
9. Upload `app-release-signed.aab`. Because PWABuilder signed it, enrol in
   **Play App Signing** (recommended/default).
10. Add release notes, **Save → Review → Start rollout to Internal testing**.
11. Under **Testers**, add your Google account (or a tester list / email).
    Copy the **opt-in URL** and open it on your phone to install.

> First time, Play makes you complete a few questionnaires (content rating,
> data safety, target audience, privacy policy). For internal testing these are
> quick; a privacy policy URL is required — a simple page stating "all data is
> stored locally on the device" is enough.

---

## Updating later

- **Content/UI changes**: just push to `main`. Vercel redeploys and the TWA
  shows the new version on next launch — **no new Play upload needed.**
- **App identity changes** (name, icon, package, permissions): regenerate the
  package in PWABuilder and upload a new AAB with a higher version code.

## Notes on data & privacy (for the Data Safety form)

- All notes, audio, photos and files are stored **on the device**
  (localStorage + IndexedDB). Nothing is sent to a server.
- Network is used only to: load the web app (Vercel), fetch fonts (Google
  Fonts), fetch a daily quote (ZenQuotes), and download the on-device AI search
  models (Hugging Face CDN) which then run locally.
