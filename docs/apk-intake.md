# Authorized APK intake

Place an APK, split-APK set, or XAPK bundle you are authorized to inspect under:

```text
D:\Projects\brewgo-reconstruction-work\input\apk
```

Run the read-only validator with an explicit authorization confirmation:

```powershell
.\scripts\inspect-apk-intake.ps1 -ConfirmAuthorized
```

The validator:

- accepts `.apk` files and `.xapk` split bundles;
- expands XAPK members under the ignored external analysis directory with sanitized filenames;
- uses an XAPK `manifest.json` base declaration when present;
- rejects unsupported package containers and duplicate APK identities;
- verifies ZIP readability, `AndroidManifest.xml`, and safe archive entry names;
- identifies a conventional `base.apk` or a single-file base candidate;
- records byte size and SHA-256 without modifying the input;
- detects static Flutter, React Native, hybrid WebView, and DEX indicators;
- writes raw intake results only to the external work directory.

Package identity, SDK levels, components, permissions, and definitive framework attribution are added later from REA evidence. Archive indicators alone are not treated as proof of runtime behavior.
