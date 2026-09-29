# Orbit Pay

Scan → amount → paying → paid → compact pill, built from the Figma file, with the orbit and success animation drawn natively in Skia. The **real Dynamic Island** is also supported through a Live Activity.

## Two ways to run it

| | Expo Go (quick) | Your own build (real Dynamic Island) |
|---|---|---|
| Install | Expo Go from the App Store | build on GitHub, sideload with Sideloadly |
| Live Activity | ✗ (skipped silently) | ✓ island + Lock Screen |
| Start the server | `npm run go` | `npm run tunnel` |

## A. Expo Go

```bash
npm install
npm run go
```
Scan the QR code with the iPhone Camera app.

## B. Real Dynamic Island (free Apple ID, no Mac)

### 1. Put the project on GitHub
1. Create a free account at github.com, then click **New repository**. A **public** repo gets unlimited free build minutes; a private one gets roughly 8–10 builds a month.
2. Upload this whole folder, **without** `node_modules`. The easiest way is GitHub Desktop: *Add existing repository* → *Publish*.

### 2. Build the app
1. In the repo, open **Actions**. If asked, click *I understand… enable workflows*.
2. Choose **Build iOS (unsigned IPA)** → **Run workflow** → keep **Debug** → **Run**.
3. Wait about 15–25 minutes. Open the finished run and download **OrbitPay-ipa** under *Artifacts*, then unzip it to get `OrbitPay-Debug.ipa`.

If the run fails, open it, copy the red error lines (or download *xcodebuild-log*) and send them over.

### 3. Install with Sideloadly (Windows)
1. Install **iTunes** and **iCloud** from Apple's website. The Microsoft Store versions don't work with Sideloadly.
2. Install **Sideloadly** from sideloadly.io.
3. Plug in the iPhone and tap *Trust* on the phone.
4. Drag `OrbitPay-Debug.ipa` into Sideloadly, enter your Apple ID and press **Start**.
5. On the iPhone:
   - turn on **Settings → Privacy & Security → Developer Mode** (the phone restarts)
   - then trust your Apple ID in **Settings → General → VPN & Device Management**

A free Apple ID build lasts **7 days**. Re-run step 4 to refresh it. The app plus its Live Activity use 2 of the 3 app slots a free account allows.

### 4. Run it
```bash
npm install
npm run tunnel
```
Open **Orbit Pay** on the phone and scan the QR code (or pick the server from the list). Code changes reload live, just like Expo Go. You only need to rebuild the app when the Swift files in `targets/` or `modules/` change.

**Release** builds (pick *Release* in step 2) have the JavaScript built in and run without your PC.

### Seeing the island
Pay inside the app, then swipe up to the Home Screen. The island shows **✓ Paid · ₹240**. Long-press it for the expanded view; the Lock Screen shows the full card. iOS hides an app's own Live Activity while that app is open, which is standard system behaviour. Starting a new scan ends it.

## The flow (inside the app)
1. **Scan**: a live camera fills the viewfinder, placed automatically below your island (`EXTRA_ISLAND_CLEARANCE` adds room). Any QR code advances; long-press to skip.
2. **Amount**: the caret is orange while empty and mint while typing. Pay enables above ₹0.
3. **Paying**: the orbits align for 1.8 s (`PROCESSING_MS`), and the Live Activity starts.
4. **Paid**: the green check appears, a success haptic plays, and the Live Activity switches to *Paid*.
5. **Compact**: after 1.4 s (`PAID_HOLD_MS`) the card tucks into the black capsule around the island. Tap it to start over.

**Background**: long-press any empty area and choose a screenshot of your home screen.

## Where things live
- `src/design.ts`: all Figma values (colours, gradients, positions, blur, shadow, timing).
- `src/skia/`: card drawing (`scene.ts`), orbit and success (`orbit.ts`), Figma gradients (`paint.ts`).
- `src/components/`: the screens and the backdrop.
- `targets/OrbitActivity/`: the Live Activity UI in SwiftUI (island compact, expanded and minimal views, plus the Lock Screen).
- `modules/orbit-live-activity/`: the bridge that starts, updates and ends the Live Activity from JavaScript.
- `.github/workflows/build-ios.yml`: the free cloud build.
- `src/fonts.ts`: fonts (see the note there for Aeonik Soft Pro).
