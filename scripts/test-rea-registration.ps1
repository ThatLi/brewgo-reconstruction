[CmdletBinding()]
param(
    [string]$WorkRoot = (Join-Path (Split-Path $PSScriptRoot -Parent | Split-Path -Parent) 'brewgo-reconstruction-work')
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repositoryRoot = Split-Path $PSScriptRoot -Parent
$manifest = Get-Content -Raw -LiteralPath (Join-Path $repositoryRoot 'config\toolchain.json') | ConvertFrom-Json
$toolRoot = Join-Path $WorkRoot 'tools'
$nodeRoot = Join-Path $toolRoot "node\$($manifest.tools.node.archiveDirectory)"
$npxExecutable = Join-Path $nodeRoot 'npx.cmd'
$diagnosticRoot = Join-Path $WorkRoot 'diagnostics'
$outputPath = Join-Path $diagnosticRoot 'rea-codex-doctor.json'

New-Item -ItemType Directory -Force -Path $diagnosticRoot | Out-Null
$previousCache = $env:npm_config_cache
$previousPath = $env:PATH
$previousJadx = $env:REA_JADX_MCP_JAR
$env:npm_config_cache = Join-Path $WorkRoot 'npm-cache'
$env:PATH = "$nodeRoot;$previousPath"
$env:REA_JADX_MCP_JAR = Join-Path $toolRoot "jadx\$($manifest.tools.jadx.fileName)"
try {
    $output = & $npxExecutable --yes $manifest.tools.rea.package doctor --client codex --skill --format json 2>&1
    $exitCode = $LASTEXITCODE
    $text = ($output | Out-String).Trim()
    [System.IO.File]::WriteAllText($outputPath, "$text`n", [System.Text.UTF8Encoding]::new($false))
    if ($exitCode -ne 0) {
        throw "REA doctor failed with exit code $exitCode. See the external diagnostic output."
    }
    $text
} finally {
    $env:npm_config_cache = $previousCache
    $env:PATH = $previousPath
    $env:REA_JADX_MCP_JAR = $previousJadx
}
