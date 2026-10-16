# BrewGo product scope and brand

BrewGo is an original, offline-first coffee-ordering demo. It demonstrates the core journey from synthetic store selection to a locally tracked mock order without authentication, production services, or real payments.

## Product promise

**Tagline:** Good coffee, already on its way.

**Voice:** clear, warm, brief, and practical. BrewGo explains what happened and what the user can do next without promotional pressure.

Examples:

- Empty cart: “Your next favorite is waiting.”
- Store unavailable: “This café is taking a short pause.”
- Coupon rejected: “That offer doesn’t fit this order yet.”
- Confirmation: “Order confirmed. We’ll take it from here.”

All UI copy is written for BrewGo. No target copy is reused.

## Visual identity

### Color tokens

| Token | Hex | Use |
| --- | --- | --- |
| `ink` | `#1D2528` | Primary text and dark controls |
| `paper` | `#FFFDF8` | Main background |
| `cream` | `#F5EFE3` | Cards and secondary surfaces |
| `ember` | `#E85D32` | Primary action and active state |
| `emberDark` | `#B83F21` | Pressed primary action |
| `teal` | `#167D73` | Success and fulfillment accents |
| `sky` | `#DCEFF1` | Informational surface |
| `sand` | `#D8C8AE` | Borders and separators |
| `muted` | `#667277` | Secondary text |
| `danger` | `#B83A3A` | Error and destructive state |
| `white` | `#FFFFFF` | Text on strong fills |

Contrast-sensitive text uses `ink` on light surfaces and `white` only on `emberDark`, `teal`, or darker fills. Final implementation must verify WCAG AA contrast.

### Typography

BrewGo uses the device system sans-serif stack to avoid shipping copied or unnecessary font files.

| Style | Size / line height | Weight |
| --- | --- | --- |
| Display | 32 / 38 | 700 |
| Title | 24 / 30 | 700 |
| Section | 18 / 24 | 700 |
| Body | 16 / 24 | 400 |
| Label | 14 / 20 | 600 |
| Caption | 12 / 16 | 400 |

### Shape, spacing, and motion

- Base spacing unit: 4 px; common gaps: 8, 12, 16, 24, and 32 px.
- Card radius: 18 px; controls: 14 px; pills: fully rounded.
- Minimum touch target: 44 × 44 px.
- Motion: 160–240 ms ease-out for local transitions; respect reduced-motion preference.
- Shadows are subtle and paired with visible borders so hierarchy does not depend on elevation.

### Icons and illustration

- Use a permissively licensed platform icon set through the Expo dependency graph.
- Use rounded, single-color line icons at 20–24 px; active navigation may use the filled companion glyph.
- BrewGo’s mark is a simple original steaming cup formed from geometric shapes in code or SVG.
- Do not trace, recolor, imitate, or ship target logos, mascots, photography, packaging, or icon assets.

## Synthetic store catalog

| Store ID | Display name | Fulfillment | Hours | Note |
| --- | --- | --- | --- | --- |
| `store-harbor` | Harbor Point | Pickup, delivery | 07:00–21:00 | Full catalog |
| `store-orchard` | Orchard Gate | Pickup | 08:00–20:00 | Compact counter |
| `store-riverside` | Riverside Lab | Pickup, delivery | 07:30–22:00 | Seasonal drinks |

Addresses, coordinates, hours, distances, and availability are fictional fixtures.

## Synthetic products

Money is stored as integer fen; display values below are illustrative CNY formatting.

| Product ID | Product name | Category | Base price |
| --- | --- | --- | ---: |
| `drink-oat-latte` | Velvet Oat Latte | Espresso | ¥28.00 |
| `drink-citrus-coldbrew` | Citrus Cold Brew | Cold Brew | ¥26.00 |
| `drink-cloud-cappuccino` | Cloud Cappuccino | Espresso | ¥24.00 |
| `drink-cocoa-drift` | Cocoa Drift | Chocolate | ¥29.00 |
| `drink-jasmine-sparkler` | Jasmine Sparkler | Tea | ¥25.00 |
| `drink-matcha-cloud` | Matcha Cloud | Tea | ¥27.00 |
| `food-almond-croissant` | Toasted Almond Croissant | Bakery | ¥18.00 |
| `food-sesame-cookie` | Black Sesame Cookie | Bakery | ¥12.00 |

Modifier examples are also original:

- size: Regular (+¥0), Grand (+¥4);
- temperature: Iced, Warm, Hot;
- sweetness: No added sugar, Light, Balanced;
- milk: Whole (+¥0), Oat (+¥3), Coconut (+¥3);
- espresso shot: 0–2 extra shots (+¥4 each).

Product descriptions and any placeholder artwork will be independently created for BrewGo.

## v0.1.0 scope

Included:

- synthetic store selection and pickup/delivery choice;
- catalog categories, search/filter, product detail, and original modifiers;
- cart quantity editing, stable customized-line identity, and integer-fen totals;
- deterministic synthetic coupons with rejection reasons;
- checkout review and simulated confirmation;
- local cart recovery, order history, and deterministic fulfillment progression;
- loading, empty, unavailable, error, and corrupted-data recovery states;
- Android-targeted Expo app and web preview.

Excluded:

- sign-in, accounts, loyalty, referrals, analytics, advertising, or experimentation;
- live location, maps, real stores, live inventory, or production catalogs;
- backend infrastructure, remote configuration, push notifications, or live tracking;
- real payment, refunds, cancellation, taxation, receipts, or regulated flows;
- target branding, content, assets, endpoints, credentials, or service interaction.

## Clean-room rule

Implementation decisions come from this BrewGo specification and the classified requirements, never by copying raw decompiled code or proprietary resources. Where the evidence is incomplete, BrewGo favors the smallest deterministic behavior needed for the demo and labels it independent or mock-only.
