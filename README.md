# BrewGo

BrewGo is an independently designed, offline-first coffee ordering demo built with Expo, React Native, TypeScript, and SQLite. It uses original branding and synthetic stores, products, modifiers, coupons, and addresses. It never calls an external application API or processes payment.

## What works

- choose one of three synthetic stores and pickup or delivery where supported;
- browse and locally search the original catalog;
- configure required and optional modifiers with integer-fen pricing;
- merge identical customized lines, edit quantities, and remove lines;
- apply deterministic demo coupons with visible rejection reasons;
- validate and confirm a mock checkout without payment;
- restore store, mode, cart, coupon, and immutable order snapshots from SQLite;
- view deterministic pickup or delivery progress and recover from corrupt local rows;
- run on Android-targeted Expo and as a static web export.

## Requirements

- Node.js 24.22.0 (the CI-pinned version)
- npm from that Node distribution
- Git for the repository safety scan
- Android Studio or an Expo-compatible Android device only when launching Android interactively

No backend, account, API key, emulator, or authorized research artifact is required to run BrewGo.

## Install and run

```powershell
cd app
npm ci
npm run check
npm run web
```

Use `npm run android` for an Android development session. The initial app state has no selected store; choose a synthetic location from the Order tab, then configure an item.

## Verification

Run the same quality checks used by CI:

```powershell
cd app
npm ci
npm run check
npx expo export --platform android --output-dir .verify-android
npx expo export --platform web --output-dir .verify-web
cd ..
npm run safety -- --all
```

The two `.verify-*` folders are generated outputs and must not be committed. GitHub Actions runs clean exports into temporary runner directories.

Useful focused commands from `app/`:

```powershell
npm run typecheck
npm run lint
npm run format:check
npm test
npm run test:watch
```

## Architecture

```text
app/src/
├── app/            Expo Router screens and modal/stack routes
├── components/     Original accessible UI primitives
├── data/           Synthetic BrewGo fixtures
├── domain/         Money, cart, coupon, catalog, and status rules
├── repositories/   Typed fixture-backed repository interfaces
├── state/          Catalog and cart/order application state
├── storage/        SQLite and in-memory persistence adapters
└── test/           Unit and integration coverage
```

All money enters domain calculations as nonnegative integer fen. Customized-line identity is a SHA-256 digest of canonical product and modifier identifiers. Orders are immutable local snapshots; fulfillment status is calculated from their creation time and is not live tracking.

See [docs/reconstruction-report.md](docs/reconstruction-report.md) for provenance, design classification, architecture decisions, verification, and limitations. Product behavior is locked in [docs/product/acceptance.md](docs/product/acceptance.md).

## Clean-room boundary

Only independently written BrewGo source, original assets, synthetic data, and sanitized behavioral specifications belong in this repository. Application packages, extracted resources, decompiled output, production endpoints, credentials, signing material, and raw reverse-engineering evidence remain outside Git.

The repository safety guard runs locally and in CI. See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/repository-safety.md](docs/repository-safety.md) before contributing.

## License

Original BrewGo code and documentation are licensed under the MIT License. This license does not grant rights to third-party software or intellectual property used as authorized research input.
