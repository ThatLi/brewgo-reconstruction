# Environment diagnostics

Run the sanitized diagnostic after bootstrapping tools:

```powershell
.\scripts\test-environment.ps1 `
  -OutputPath ..\brewgo-reconstruction-work\diagnostics\environment.json
```

The result contains only versions, expected versions, boolean verification states, and an overall status. It deliberately excludes absolute paths, usernames, hostnames, tokens, environment-variable values, and application artifacts.

The command fails when a required executable is missing, a subprocess exits unsuccessfully, or the JADX digest differs from the pinned manifest. The output path is rejected if it resolves inside the Git repository.
