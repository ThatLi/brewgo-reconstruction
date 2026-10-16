# Entry navigation and store selection

This map describes only sanitized, statically supported behavior. It does not reproduce target branding, copy, visual assets, endpoints, or production data.

## Flow map

1. **Launch into the main shell** — observed, medium confidence (`E-003`, `E-010`).
   - A target-owned launcher and main view model are present.
   - The view model exposes observable main-tab data and a tab-icon fetch operation.
   - Exact cold-start sequencing, authentication gating, remote configuration, and offline fallback are unknown.

2. **Present main navigation** — derived, medium confidence (`E-010`, `E-011`, `E-012`).
   - Packaged bindings establish menu and account/profile tab surfaces.
   - Main-tab icons are data-driven, so the complete tab set, labels, order, visibility, and artwork cannot be treated as fixed APK behavior.
   - Order-detail surfaces exist, but the evidence does not establish whether order history is always a main tab.

3. **Acquire a recommended or selected shop** — observed, medium confidence (`E-010`, `E-011`, `E-013`, `E-014`).
   - The main view model has a recommended-shop fetch operation.
   - Menu UI inventory includes select-store and store-info surfaces.
   - Store state supports name, address, distance, coordinates, opening hours, availability, and price-level metadata.
   - A short list of recommended shops is represented in the static model inventory.

4. **Choose fulfillment context** — derived, medium confidence (`E-013`, `E-015`).
   - Delivery is directly represented by dispatch availability, dispatch windows/range, and delivery-address state.
   - A non-delivery store context is inferred from store selection and operation-mode fields; the exact numeric mapping and the target's user-facing term for collection/pickup are unknown.
   - BrewGo may model the two independent demo modes as `pickup` and `delivery`, but those enum names are an independent design choice pending stronger evidence.

5. **Propagate shop selection** — observed relationship, medium confidence (`E-014`, `E-015`).
   - The shop model is shared across main, menu, cart, account, and checkout-routing classes.
   - A checkout-shop router and delivery-address references show that shop context can affect later checkout state.
   - The precise event sequence, cart reset behavior, and cross-shop migration rules are unknown.

## Required states for BrewGo

These states are justified by the bounded evidence but will use original BrewGo copy and synthetic data:

- loading main navigation configuration;
- loading a recommended shop;
- no recommended shop available;
- manual store selection;
- shop open and available;
- shop closed or outside its opening window;
- delivery available or unavailable;
- delivery address absent or selected;
- structured store-selection failure with a retry path.

## Failure boundaries

- A structured shop-failure model is observed (`E-016`), but its codes and messages are server-originated and are not copied.
- Opening, business, dispatch, and forced-stop fields are observed (`E-013`), but their precedence is unknown.
- Location permission is declared in the package profile, but permission prompts, denial recovery, and geolocation accuracy were not observed at runtime.
- Network, empty, permission-denied, and stale-selection behavior will be independent BrewGo designs unless later evidence establishes them.

## Acceptance trace

| BrewGo behavior | Basis | Classification |
| --- | --- | --- |
| Main shell with data-driven tab configuration | `E-010`–`E-012` | Derived |
| Menu and account/profile destinations | `E-011`, `E-012` | Observed packaged surfaces |
| Recommended shop plus manual selection | `E-010`, `E-011`, `E-013` | Derived |
| Pickup and delivery demo modes | `E-013`, `E-015` | Independent naming over a derived two-context model |
| Shop availability and delivery availability states | `E-013` | Observed data capability |
| Retryable store-selection error | `E-016` | Derived presentation over observed failure capability |
