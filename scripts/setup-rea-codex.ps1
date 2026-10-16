[CmdletBinding()]
param(
    [switch]$Apply,
    [string]$ReviewedPlanSha256,
    [string]$WorkRoot = (Join-Path (Split-Path $PSScriptRoot -Parent | Split-Path -Parent) 'brewgo-reconstruction-work')
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repositoryRoot = Split-Path $PSScriptRoot -Parent
$manifest = Get-Content -Raw -LiteralPath (Join-Path $repositoryRoot 'config\toolchain.json') | ConvertFrom-Json
$toolRoot = Join-Path $WorkRoot 'tools'
$nodeRoot = Join-Path $toolRoot "node\$($manifest.tools.node.archiveDirectory)"
$npxExecutable = Join-Path $nodeRoot 'npx.cmd'
$setupRoot = Join-Path $WorkRoot 'setup'
$planPath = Join-Path $setupRoot 'rea-codex-plan.json'
$appliedPath = Join-Path $setupRoot 'rea-codex-applied.json'

New-Item -ItemType Directory -Force -Path $setupRoot | Out-Null

$previousJadx = $env:REA_JADX_MCP_JAR
$previousApktool = $env:REA_APKTOOL_COMMAND
$previousCache = $env:npm_config_cache
$previousPath = $env:PATH
$env:REA_JADX_MCP_JAR = Join-Path $toolRoot "jadx\$($manifest.tools.jadx.fileName)"
$env:REA_APKTOOL_COMMAND = Join-Path $toolRoot 'apktool\apktool.cmd'
$env:npm_config_cache = Join-Path $WorkRoot 'npm-cache'
$env:PATH = "$nodeRoot;$previousPath"

try {
    $planOutput = & $npxExecutable --yes $manifest.tools.rea.package setup --client codex --dry-run --format json 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "REA setup dry-run failed with exit code $LASTEXITCODE."
    }

    $planText = ($planOutput | Out-String).Trim()
    [System.IO.File]::WriteAllText($planPath, "$planText`n", [System.Text.UTF8Encoding]::new($false))
    $planHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $planPath).Hash.ToLowerInvariant()

    if (-not $Apply) {
        [PSCustomObject]@{
            mode = 'dry-run'
            planSha256 = $planHash
            plan = $planText | ConvertFrom-Json
        } | ConvertTo-Json -Depth 20
        return
    }

    if (-not $ReviewedPlanSha256) {
        throw 'Apply requires -ReviewedPlanSha256 from the reviewed dry-run.'
    }
    if ($ReviewedPlanSha256.ToLowerInvariant() -ne $planHash) {
        throw "The reviewed plan hash does not match the current dry-run. Review the new plan: $planHash"
    }

    $applyOutput = & $npxExecutable --yes $manifest.tools.rea.package setup --client codex --yes --format json 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "REA setup failed with exit code $LASTEXITCODE."
    }

    $applyText = ($applyOutput | Out-String).Trim()
    [System.IO.File]::WriteAllText($appliedPath, "$applyText`n", [System.Text.UTF8Encoding]::new($false))
    [PSCustomObject]@{
        mode = 'applied'
        reviewedPlanSha256 = $planHash
        result = $applyText | ConvertFrom-Json
    } | ConvertTo-Json -Depth 20
} finally {
    $env:REA_JADX_MCP_JAR = $previousJadx
    $env:REA_APKTOOL_COMMAND = $previousApktool
    $env:npm_config_cache = $previousCache
    $env:PATH = $previousPath
}
