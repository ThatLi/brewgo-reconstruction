# Reproducible local tooling

The repository tracks only scripts and a pinned manifest. Downloaded executables, archives, and JAR files live in the sibling `brewgo-reconstruction-work/tools` directory and are never committed.

## Bootstrap

From PowerShell:

```powershell
.\scripts\bootstrap-tools.ps1
```

The script downloads each official release asset, verifies its pinned SHA-256 digest, and stops on any mismatch. It does not modify the system `PATH`, install system packages, or set persistent environment variables.

REA is pinned as an npm package in `config/toolchain.json` and is run through the portable Node installation during diagnostics and setup.

## Tool sources

- Node.js: official Node.js distribution archive
- JADX headless MCP: official `1013503897/jadx-headless-mcp` release
- Apktool: official `iBotPeaches/Apktool` release
- GitHub CLI: official `cli/cli` release
- REA: published `rea-agents` npm package

Update the manifest and checksums in a dedicated reviewed commit when upgrading any tool.
