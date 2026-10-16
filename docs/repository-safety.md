# Repository safety guard

Run the guard against staged content before every commit:

```powershell
npm run safety
```

CI scans every tracked file:

```powershell
npm run safety -- --all
```

The guard rejects application packages, native binaries, signing material, raw-analysis paths, reference branding and production domains, common credential formats, unexpected binary content, and files larger than 1.5 MB. Original image and font formats are permitted but remain subject to provenance review and the size limit.

The guard is a backstop, not proof of clean-room compliance. Review staged diffs and asset provenance before every commit.
