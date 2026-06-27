# Store Submission Guide — Wenze Tii Ndaku

This document covers everything needed to publish the app to the Apple App Store and Google Play Store using EAS.

---

## Prerequisites

1. **EAS CLI** installed: `npm install -g eas-cli`
2. **Logged in**: `eas login` (use the `ccubenetvix-tech` Expo account)
3. **Apple Developer Account** enrolled at [developer.apple.com](https://developer.apple.com)
4. **Google Play Console** account with app created at [play.google.com/console](https://play.google.com/console)

---

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in all values (API URL, Google OAuth IDs, Sentry DSN)
3. For production builds, env vars are injected automatically via `eas.json` — no `.env.local` needed on CI

---

## Build Profiles

| Profile | Distribution | Mock Data | API URL | Use For |
|---|---|---|---|---|
| `development` | Internal | ✅ On | api-dev | Local dev with dev client |
| `preview` | Internal | ❌ Off | api-staging | Internal QA / TestFlight |
| `production` | Store | ❌ Off | api.wenzetiindaku.com | App Store / Play Store |

---

## Build Commands

```bash
# Development build (simulator + device)
eas build --profile development --platform all

# Preview / QA build (real devices, internal distribution)
eas build --profile preview --platform all

# Production build (store submission)
eas build --profile production --platform all
```

---

## iOS — App Store Connect

### Before First Build
1. Open `eas.json` → `submit.production.ios`
2. Fill in:
   - `appleId` — your Apple ID email
   - `ascAppId` — App ID from App Store Connect → My Apps
   - `appleTeamId` — from developer.apple.com → Membership
3. EAS will auto-manage provisioning profiles and signing certificates

### Submit
```bash
eas submit --profile production --platform ios
```

### App Store Connect Checklist
- [ ] App name: **Wenze Tii Ndaku**
- [ ] Category: **Shopping**
- [ ] Age rating: **4+**
- [ ] Privacy Policy URL: `https://wenzetiindaku.com/privacy-policy`
- [ ] Support URL: `https://wenzetiindaku.com/help`
- [ ] Screenshots: 6.9" (iPhone 16 Pro Max), 12.9" (iPad Pro) — minimum required
- [ ] App description (see below)
- [ ] Keywords (max 100 chars)
- [ ] Review notes: test account credentials if login is required for review

---

## Android — Google Play Console

### Service Account Setup (one time)
1. Go to Google Play Console → Setup → API access
2. Link to a Google Cloud project
3. Create a service account with **Release Manager** role
4. Download the JSON key → save as `./google-play-service-account.json`
5. Add to `.gitignore` (already included)

### Submit
```bash
eas submit --profile production --platform android
```

### Play Console Checklist
- [ ] App name: **Wenze Tii Ndaku**
- [ ] Category: **Shopping**
- [ ] Content rating questionnaire completed
- [ ] Privacy Policy URL set
- [ ] Store listing: short description + full description
- [ ] Feature graphic: 1024 × 500 px
- [ ] Screenshots: phone (at least 2), tablet optional
- [ ] App signing: use Play-managed signing
- [ ] Target API level: 35+ (required for 2025 submissions)
- [ ] Data safety form completed (collect: name, email, device ID, location)

---

## App Description (Use for Both Stores)

**Short (80 chars):**
> Your premier multi-vendor marketplace — shop Africa's best vendors.

**Full:**
> Wenze Tii Ndaku connects you with the best local and international vendors across Africa and beyond. Browse thousands of products across categories, discover top-rated stores, enjoy seamless checkout, and track your orders — all in one app.
>
> ✅ Shop from multiple vendors in a single cart
> ✅ Secure payment with multiple methods
> ✅ Real-time order tracking
> ✅ Save favourites to your wishlist
> ✅ Manage delivery addresses
> ✅ Google Sign-In for fast onboarding

---

## OTA Updates (After Launch)

Use EAS Update to push JS-only fixes without a full store build:

```bash
# Push a hotfix to production users
eas update --branch production --message "Fix: cart total calculation"

# Push to preview/QA testers only
eas update --branch preview --message "Test: new checkout flow"
```

---

## Post-Launch Monitoring

1. **Sentry** — set `EXPO_PUBLIC_SENTRY_DSN` and install `@sentry/react-native`
2. **EAS Insights** — free crash/ANR reporting in Expo dashboard
3. **Google Play Android Vitals** — monitor ANR rate and crash rate (must stay < 1.09% for "good standing")
4. **App Store Connect Crashes** — under TestFlight & App Analytics
