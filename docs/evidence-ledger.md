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

## Entry rules

Each future behavior claim must:

1. reference at least one ledger ID;
2. state whether it is observed, derived, inferred, or unknown;
3. include a confidence level and relevant coverage boundary;
4. avoid target branding, proprietary content, credentials, endpoints, and raw decompiled text;
5. mark product choices without evidence as independent BrewGo design decisions.
