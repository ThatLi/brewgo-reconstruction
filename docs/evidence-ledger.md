# Evidence ledger

This ledger is the traceability boundary between local reverse-engineering work and the clean-room BrewGo specification. It contains only artifact digests, REA evidence identifiers, sanitized selectors, conclusions, confidence, and limitations. Raw manifests, code, resources, proprietary copy, endpoints, and local paths remain outside Git.

## Confidence model

| Classification | Meaning | Permitted use |
| --- | --- | --- |
| Observed | Directly reported from the authorized artifact by a static tool with bounded coverage. | May support a requirement within the stated coverage. |
| Derived | Deterministic projection or combination of observed facts, such as a sanitized manifest summary or artifact-set digest. | May support a requirement when its inputs and derivation are recorded. |
| Inferred | A reasoned interpretation that is consistent with evidence but not directly established by it. | Must be labeled and cannot be treated as parity behavior. |
| Unknown | Not established because evidence is absent, incomplete, dynamic, server-controlled, or intentionally out of scope. | Must remain unresolved or become an independent BrewGo design choice. |

Confidence is separate from classification:

- **High**: direct, unambiguous observation with complete relevant coverage.
- **Medium**: multiple consistent observations or one bounded observation with material residual unknowns.
- **Low**: plausible inference with limited corroboration.
- **Unknown**: no defensible conclusion.

Static evidence never proves runtime execution, backend policy, production data, or the absence of reflective and dynamically loaded behavior.

## Artifact set

- Artifact-set digest: `c370f4e054ab9a365a254d8cceebf51ec961dc6b97aa465c4500c0cde4b4df41`
- Base artifact SHA-256: `751f033dc469b425f002c66812bade2af1bd060108d91b3034602971193aacfe`
- Scope: one base APK and three declared configuration splits

## Entries

| ID | Classification | Confidence | Evidence | Sanitized selector | Conclusion | Limitations |
| --- | --- | --- | --- | --- | --- | --- |
| `E-001` | Observed | High | `ev_6fecbaeb9daed9f3312ee68832161adb324f426fe2f62514a042241dc4a9553e` | package summary | The base manifest is available and the static class inventory contains 25,575 classes. | Signatures and runtime behavior were not verified. |
| `E-002` | Derived | High | intake member hashes | XAPK manifest order | The supplied set has one base member and three declared configuration splits; all four were present. | Establishes supplied-set completeness only, not store provenance. |
| `E-003` | Observed | High | `ev_22fcf09b3ba4b8ab4283008baae1a5a1d74779cc8807a64da6e5b0a43625f803` | launcher class inventory | A target-owned launcher exposes standard Android lifecycle methods and shortened member names. | Superclass and runtime dispatch are not established by this inventory. |
| `E-004` | Observed | High | `ev_390a5227518786e77fedd808b6401fa3450946d52dcc702334828f320364d6fe` | Kotlin namespace query | Kotlin runtime classes are present. | Dependency presence does not identify implementation language for every target class. |
| `E-005` | Observed | High | `ev_1a8f22dd79bf4f04cc06017ffd2d4aae73daa5d319ad606bc9664044d1cb50e2` | React Native namespace query | React Native classes are present. | Does not prove that any mapped flow is rendered by React Native. |
| `E-006` | Observed | High | `ev_e492fc936af77fa30e2c2b2f2395b7615b9d61a611ade268850c93020dc9fbf9` | Compose namespace query | Jetpack Compose classes are present. | Does not prove that any mapped flow is rendered by Compose. |
| `E-007` | Observed | High | `ev_80de4dce22e6f16b8417d878e48ac172ae50e382fe043300716d77139634b75b` | WebView activity query | WebView activity implementations are present. | Does not establish loaded content, URLs, or flow ownership. |
| `E-008` | Observed | High | `ev_4fa8b52ccaf316e58bd9178d1fb952359ac60040ee39606949b78633f43f6490` | Flutter namespace query | No Flutter class matched the complete class inventory. | Absence is bounded to the indexed base artifact and this namespace query. |
| `E-009` | Inferred | Medium | `E-003`, `E-004`, `E-005`, `E-006`, `E-007`, `E-008` | technology routing | Native Android through JADX is the primary analysis route; other present UI technologies are secondary until tied to a target flow. | Mixed-framework or dynamically loaded screens remain possible. |
| `U-001` | Unknown | Unknown | provider limitation | method body extraction | A focused launcher method request returned unreadable provider output. | Do not infer behavior from the failed request. |
| `U-002` | Unknown | Unknown | static-analysis boundary | runtime and backend | Reflection, dynamic loading, remote configuration, server validation, and backend state are not established. | Requires authorized runtime evidence or remains out of scope. |
| `E-010` | Observed | High | `ev_1396191fb72019c313d9bccf28a5476c04cf7f7c372a394f962acf10c642dfb7` | main view-model inventory | The main shell exposes observable tab data, fetches tab icons, and fetches a recommended shop. | Returned data, tab labels, ordering, and fallback behavior are not established. |
| `E-011` | Observed | High | `ev_8ff61cdd3d7a12cca55f49b0f14377d06018fe27924d28f031d81fa2b9ca712a` | menu package inventory | Menu-tab, product-menu, select-store, and store-info bindings are present. | Bindings establish packaged UI surfaces, not runtime reachability. |
| `E-012` | Observed | High | `ev_5b3b4e09dfc1b5b2906aa3238a1d7c013f0923630038e2394009c0195c6038fc` | account package inventory | An account-tab binding and main-tab badge event are present. | Exact label, position, and visibility rules are unknown. |
| `E-013` | Observed | High | `ev_b76b4e1a103240a9a746a3879345e1b44abbe345ff345187575aa218105703c6` | shop model inventory | Shop state includes address, distance, coordinates, opening window, business status, dispatch availability/window/range, operation mode, and price-level fields. | Numeric value meanings and server enforcement are unknown. |
| `E-014` | Observed | High | `ev_783f50d3e558639f2b6f7f0899a812332e7d1898aaca7d40453ba440971028fc` | shop model references | The shop model is statically referenced by the launcher, main view model, menu view models, cart view model, account view model, and checkout-shop router. | Incoming static references do not prove execution order. |
| `E-015` | Observed | High | `ev_d6db2bbf69ff82abc7f36c3cc95aab569ff7b442e64bc05e32053e55297a18a6` | delivery-address references | Delivery address state is referenced by menu and checkout-shop routing classes. | Address validation and deliverability are server-controlled or otherwise unproven. |
| `E-016` | Observed | High | `ev_c528d756a418bbb8fefa3aeba29d74ba77da8bc40a34ffae58f62bfd8b738bc9` | shop failure model | Store acquisition can be represented by a structured code, business code, and message failure object. | Trigger conditions and user-facing copy are unknown. |
| `E-017` | Observed | High | `ev_a740ba37eda003e503d95d0b8a653bd2ec178ddb501dd435f085502c7ed762c8` | product-content model | Catalog content includes a first-level menu list, currency, menu identifiers, rule text fields, cache timestamp, and experiment metadata. | Actual catalog content and experiment behavior are server-controlled and excluded. |
| `E-018` | Observed | High | `ev_dc28f43f34dfc77a24ce0a230938fe3c4e6addbf5e5ff1976a18f2e5c929b03e` | category model | Categories include identifiers, names, product count, min/max prices, availability-like state, and a third-level menu list. | Numeric state meaning and hierarchy rendering rules are not established. |
| `E-019` | Observed | High | `ev_e9eadb44c7e598978e90e3aefaa8e472c2c2689fd6ce30e345995cd4762235b5` | product model | Products include category links, product/variant codes, original and discounted prices, currency, type, maximum amount, tags, and sugar metadata. | Price precision, maximum-amount semantics, and server validation are unknown. |
| `E-020` | Observed | High | `ev_fa725cb313f94b5205110bce5658d0efdd899c25bd51d9886ef327a745f36eff` | product presentation model | Product lists support headers, regular products, packages, second-level sections, grouped sections, banners, hidden rows, and folded state. | Does not establish exact visual order or which item types occur in a given response. |
| `E-021` | Observed | High | `ev_85f0e8c6d93f7ee324c147194695e0a772126a9128f43c72fef3fb601124422f` | sugar metadata model | Sugar-level flags and nutrition metadata are attached to product presentation. | This is metadata, not proof of a selectable modifier group. |
| `E-022` | Observed | High | `ev_5b153bc06321185842de8588943883972229cde65db7148d4cf577a0564da347` | persisted cart-product model | Persisted cart products retain product and variant codes, quantity, mode, enabled state, product type/group, and nested package products. | Modifier selections are not represented by named fields in this model. |
| `U-003` | Unknown | Unknown | `ev_394a943ae257ebc8c53c43f22292f45eaf2a788349ac2ad3c3e6af857c324d1f`, `ev_bb03c275ddea0e1a92f8e991ade817fe8cad2b2ee2716bd1139a8fee57fef7d2`, `ev_d2188fe9c4adbc49ffe352ed71a048f99a3e1e3e8c87a322f5ba19477e74d262` | modifier-name queries | No target-owned modifier-group or option class was identified by these focused name queries. | Obfuscation, alternate naming, remote schemas, or another framework may contain the behavior. |
| `E-023` | Observed | High | `ev_3b4dedd48a8dd745356cdaeefb971a17951fe01b7f6326d74899df7fce69c048` | cart response-line model | Cart response lines include quantity, product/variant identifiers, original/final prices, mode, enabled state, grouping, gift/add-on flags, and nested combo lines. | Does not establish the client calculation or line-merge algorithm. |
| `E-024` | Observed | High | `ev_898aade00f1c71e139bde99f56c7041e3ea921d4f77bf270f34a0a3c15139d0f` | cart response model | Cart content includes line items, currency, initial and discounted totals, product count/rows, promotion/delivery descriptions, sold-out description, gifts, and a menu-reload flag. | Values may be server-computed; arithmetic provenance is unknown. |
| `E-025` | Observed | High | `ev_19b505b127d18c7a79946a72ae44abf9177d35c9ba7a39cbe8f1342cc12f8e6e` | cart view-model inventory | Cart state is observable, requested as data, saved locally, and can reset for empty-cart or shop-unready reasons. | Exact reset triggers and persistence transaction behavior are unknown. |
| `E-026` | Observed | High | `ev_f6c46cc4592b001659724eb9b0420f08f438d34561cdc79e89b74ac55b58ac98` | coupon display model | Coupon presentation includes an identifier, display label, discount label, expiry time/label, and tactic/proposal identifiers. | Labels and campaign identifiers are server content and excluded. |
| `E-027` | Observed | High | `ev_6fbfa545b64349381745a489e5caa9dcb4fc5067557df0cc5b6e447dbe7e502d` | coupon-product model | A coupon can be associated with a list of products and a currency. | Association does not prove final eligibility or discount arithmetic. |
| `E-028` | Observed | High | `ev_32d9546ba98932f0b561a4725c79c82ab6b19eecd39149346b03400c28453b8b` | expiring-coupon model | Expiring coupons include expiry time, remaining-time text, countdown visibility, and a use-now visibility flag. | Countdown calculation and eligibility authority are unknown. |
| `E-029` | Observed | High | `ev_0ac73d5b168385ce8a5ac6e5771c91a205672b3199d54149b32d37e95cd26e15` | cart-limit model | Cart limits distinguish global, pickup-in-progress/outstanding, and delivery-in-progress/outstanding counts. | Exact enforcement points and numeric values are server-controlled. |
| `U-004` | Unknown | Unknown | `E-023`–`E-029` | cart and coupon policy | Line merging, subtotal arithmetic, coupon stacking, eligibility, discount caps, and final validation are not established by model inventories. | Treat as independent BrewGo rules and mock-only validation. |

## Entry rules

Each future behavior claim must:

1. reference at least one ledger ID;
2. state whether it is observed, derived, inferred, or unknown;
3. include a confidence level and relevant coverage boundary;
4. avoid target branding, proprietary content, credentials, endpoints, and raw decompiled text;
5. mark product choices without evidence as independent BrewGo design decisions.
