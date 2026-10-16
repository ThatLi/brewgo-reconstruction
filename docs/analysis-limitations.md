# Analysis limitations and unknowns

Step 3 maps only behavior supported by the authorized local artifact and successful static evidence. It is not a claim of source equivalence, runtime parity, backend parity, or complete feature coverage.

## Evidence boundary

The committed analysis uses:

- immutable artifact and member SHA-256 values;
- a sanitized manifest/package summary;
- complete-within-tool class-name inventories;
- selected class member inventories;
- selected incoming static-reference inventories;
- explicit derivations and independent design labels.

The repository does not contain raw manifests, decompiled source, bytecode, native libraries, extracted resources, proprietary copy, target artwork, application identifiers, local paths, credentials, endpoints, or production data.

## What the APK establishes

Within the stated static coverage, the evidence establishes capabilities for:

- a native Android launcher and data-driven main navigation;
- menu and account/profile surfaces;
- recommended and manually selected shop context;
- store opening, business, dispatch, location, and price-level state;
- hierarchical categories, products, variants, packages, and availability-like state;
- persisted and response cart lines, quantities, totals, gifts/promotions, and reset states;
- coupon display, expiry, product association, and campaign metadata;
- preview, payment-selection, order-detail, detail-popup, and repeat-order surfaces.

These are data and structural capabilities. They do not prove that every packaged surface is reachable, that every field is client-enforced, or that observed class names correspond one-to-one with user-visible screens.

## Server-controlled or otherwise unproven behavior

The following remain unknown (`U-002`, `U-004`, `U-006`, `U-007`):

- live stores, distance, hours, deliverability, and inventory;
- product names, descriptions, images, categories, ranking, and search results;
- current prices, price precision, promotions, and experiments;
- modifier schema, required/default choices, min/max selections, and option deltas;
- line-merging identity and cart migration across shops;
- subtotal authority, coupon stacking, thresholds, exclusions, caps, and redemption;
- checkout validation order, idempotency, payment processing, and confirmation timing;
- order-history organization, fulfillment status enum/transitions, polling, push updates, cancellation, and refunds;
- reflection targets, dynamically loaded code, native behavior, WebView content, and uninspected React Native behavior.

None of these unknowns will be converted into parity claims. BrewGo may implement a small deterministic version only when it is labeled independent or mock-only.

## Clean-room controls confirmed

- The supplied package was never executed.
- No emulator, instrumentation, traffic interception, account login, or runtime hook was used.
- No production endpoint or target service was contacted.
- No authentication material, signing secret, token, API key, or private key was sought or extracted.
- No certificate pinning, access control, payment control, entitlement, or security mechanism was bypassed.
- APK signatures were not verified and no provenance claim is made.
- All raw package members and REA output remain outside Git.
- Repository safety scans reject target branding, production domains, binaries, credentials, raw evidence, and oversized files.

## Reconstruction classification

Every BrewGo requirement must use one of these labels:

- **Observed behavior**: directly supported by a successful evidence entry.
- **Derived behavior**: a bounded combination of observed facts with the derivation stated.
- **Independent design**: an original product or engineering choice made without claiming target parity.
- **Mock-only behavior**: deterministic local behavior standing in for a production service.
- **Unknown/out of scope**: not implemented or left unresolved.

## Step 3 gate

| Intended BrewGo area | Traceability result |
| --- | --- |
| Entry and main navigation | Observed/derived; exact remote tab configuration unknown |
| Store selection and fulfillment | Observed/derived; pickup naming and server validation independent |
| Catalog and product presentation | Observed capability; content entirely synthetic |
| Modifiers | Independent design because exact target rules are unknown |
| Cart lines and quantities | Observed capability; stable customized-line key independent |
| Pricing | Observed display capability; integer-fen arithmetic independent |
| Coupons | Observed display capability; eligibility and caps mock-only |
| Checkout | Derived review flow; validation order independent |
| Confirmation and payment | Mock-only; no real payment integration |
| Order details and repeat order | Observed capability; original UI and rules |
| History and fulfillment progression | Independent/mock-only because target transitions are unknown |

The Step 3 behavior gate is satisfied when all four flow documents, this limitations record, and the evidence ledger pass the repository safety workflow together.
