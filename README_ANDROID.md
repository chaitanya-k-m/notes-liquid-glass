# Native Android build (Capacitor)

This app now ships as a **real native Android app** using
[Capacitor](https://capacitorjs.com), instead of a TWA (Chrome wrapper). That
removes the "Running in Chrome" notification and the address bar, and gives the
app a native splash screen and proper camera/mic access.

Your existing React app is unchanged — Capacitor just wraps the built web
assets (`dist/`) inside a native Android shell (`android/`).

## How the build works

The signed `.aab` (the file you upload to Play) is built **in the cloud by
GitHub Actions** — you don't need Android Studio. Two workflows exist:

- **Android Build Check** — builds an unsigned debug APK to verify everything
  compiles. No secrets needed.
- **Build Android AAB** — builds the **signed** release `.aab` for Play.
  Needs the four signing secrets below.

### Run a build

GitHub → **Actions** tab → pick the workflow → **Run workflow** → choose
`main` → Run. When it finishes, open the run and download the artifact
(`app-release-aab`) from the **Artifacts** section. Unzip it to get
`app-release.aab`, then upload that to Play Console.

## One-time: add the signing secrets

The release must be signed with the **same upload key** Play already expects —
the one PWABuilder generated for your first upload. Reuse it so this ships as an
**update** to your existing listing (same package, same Play App Signing key).

From the PWABuilder zip you downloaded, find the keystore file (often
`signing.keystore` or `android.keystore`) and the readme with its passwords.
Then:

1. Base64-encode the keystore (so it can live in a secret):
   - macOS/Linux: `base64 -i signing.keystore | tr -d '\n' > keystore.b64`
   - Windows (PowerShell): `[Convert]::ToBase64String([IO.File]::ReadAllBytes("signing.keystore")) > keystore.b64`
2. GitHub → repo **Settings → Secrets and variables → Actions → New repository
   secret**, and add these four:

   | Secret name | Value |
   |---|---|
   | `ANDROID_KEYSTORE_BASE64` | the contents of `keystore.b64` |
   | `KEYSTORE_PASSWORD` | the keystore (store) password |
   | `KEY_ALIAS` | the key alias (from the PWABuilder readme) |
   | `KEY_PASSWORD` | the key password |

That's it — run **Build Android AAB** and upload the result.

## Updating the app later

- **UI / content changes:** bump `versionCode` (and `versionName`) in
  `android/app/build.gradle`, push, run **Build Android AAB**, upload the new
  `.aab`. (Unlike the old TWA, web changes now require a new upload.)
- Capacitor config lives in `capacitor.config.json`; native icons/splash were
  generated from `assets/` via `npx @capacitor/assets generate --android`.
