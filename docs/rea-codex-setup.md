# Reviewed REA registration for Codex

REA registration is a two-phase operation. The default command is always a dry run:

```powershell
.\scripts\setup-rea-codex.ps1
```

It writes the complete plan outside Git and prints its SHA-256 digest. Review the operations and destinations in that plan. Apply exactly that plan by supplying its digest:

```powershell
.\scripts\setup-rea-codex.ps1 `
  -Apply `
  -ReviewedPlanSha256 '<digest from the reviewed dry-run>'
```

The wrapper regenerates the plan immediately before applying. It refuses to continue if the plan has changed, preventing approval of one plan from being reused for another.

REA's canonical Codex registration invokes `npx`. After applying the reviewed setup, the wrapper preserves that canonical command and adds a server-local `PATH` beginning with the verified portable Node directory. This prevents an older system Node installation from launching the MCP server while keeping REA's registration identity aligned.

After a successful apply:

1. Fully restart or reconnect Codex so it loads the new MCP registration and skill.
2. Run `.\scripts\test-rea-registration.ps1`.
3. Confirm the active Codex session advertises REA's Android package tools before analyzing an APK.

Setup results and doctor output remain in the sibling `brewgo-reconstruction-work` directory. They may contain host-specific configuration details and must not be committed.
