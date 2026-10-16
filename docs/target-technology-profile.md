# Target technology profile

This is the sanitized static profile for the authorized Android artifact set. Raw manifests, class output, extracted members, application identifiers, and proprietary content remain in the external analysis workspace.

## Artifact identity

- Container: one XAPK, SHA-256 `6a32302b6c399fca754ffc8263ebfaf9fd9c6d8bf60f03c73dc0c61e47818b4c`
- Members: one base APK and three configuration splits (32-bit ARM ABI, English locale, and medium-density resources)
- Base APK SHA-256: `751f033dc469b425f002c66812bade2af1bd060108d91b3034602971193aacfe`
- Artifact-set digest: `c370f4e054ab9a365a254d8cceebf51ec961dc6b97aa465c4500c0cde4b4df41`
- Version: `1.4.70` (`119`)
- SDK range: minimum 24, target 35
- Package identifier: intentionally redacted from Git

The artifact-set digest is SHA-256 over the four lowercase member SHA-256 values in XAPK manifest order, each followed by LF.

## Technology route

The selected primary route is **native Android (Java/Kotlin) through JADX** with medium confidence.

Observed static indicators:

- The base contains DEX bytecode and a target-owned launcher activity with standard Android lifecycle methods.
- Kotlin runtime classes are present.
- React Native and Jetpack Compose class families are present in the complete class inventory.
- WebView activity implementations are present.
- No Flutter namespace matched the complete class inventory.
- The target-owned launcher inventory contains many shortened member names, consistent with identifier obfuscation.

Interpretation:

- Native Android is the route for entry points, manifest declarations, and primary flow mapping.
- React Native, Compose, and WebView are recorded as bundled capabilities. Static presence alone does not establish which user flows use them.
- Flutter is not selected because neither archive indicators nor class inventory produced a Flutter match.

## Coverage and limitations

- REA/JADX indexed 25,575 classes and reported 5,974 base resources.
- The decoded base manifest was complete within the provider result.
- All splits declared by the supplied XAPK manifest were present.
- APK signatures were not verified.
- Native libraries in the ABI split were inventoried by hash but not analyzed.
- Static analysis does not establish runtime behavior, reflection targets, dynamically loaded code, server-controlled behavior, or backend policy.
- One focused method-decompilation request returned unreadable provider output; the route decision does not rely on that failed result.

## Evidence ledger

| Evidence | Confidence | Supports |
| --- | --- | --- |
| `ev_6fecbaeb9daed9f3312ee68832161adb324f426fe2f62514a042241dc4a9553e` | Derived | Package metadata, manifest coverage, SDKs, class/resource totals |
| `ev_1a8f22dd79bf4f04cc06017ffd2d4aae73daa5d319ad606bc9664044d1cb50e2` | Observed | React Native class-family presence |
| `ev_4fa8b52ccaf316e58bd9178d1fb952359ac60040ee39606949b78633f43f6490` | Observed | No Flutter namespace match |
| `ev_390a5227518786e77fedd808b6401fa3450946d52dcc702334828f320364d6fe` | Observed | Kotlin class-family presence |
| `ev_e492fc936af77fa30e2c2b2f2395b7615b9d61a611ade268850c93020dc9fbf9` | Observed | Compose class-family presence |
| `ev_80de4dce22e6f16b8417d878e48ac172ae50e382fe043300716d77139634b75b` | Observed | WebView activity-family presence |
| `ev_22fcf09b3ba4b8ab4283008baae1a5a1d74779cc8807a64da6e5b0a43625f803` | Observed | Launcher activity lifecycle and obfuscation indicators |

Evidence identifiers refer to the local REA session. They expose no raw code or proprietary asset in this repository.
