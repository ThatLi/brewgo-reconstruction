[CmdletBinding()]
param(
    [string]$WorkRoot = (Join-Path (Split-Path $PSScriptRoot -Parent | Split-Path -Parent) 'brewgo-reconstruction-work'),
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repositoryRoot = Split-Path $PSScriptRoot -Parent
$manifest = Get-Content -Raw -LiteralPath (Join-Path $repositoryRoot 'config\toolchain.json') | ConvertFrom-Json
$toolRoot = Join-Path $WorkRoot 'tools'
$nodeRoot = Join-Path $toolRoot "node\$($manifest.tools.node.archiveDirectory)"
$nodeExecutable = Join-Path $nodeRoot 'node.exe'
$npmExecutable = Join-Path $nodeRoot 'npm.cmd'
$npxExecutable = Join-Path $nodeRoot 'npx.cmd'
$jadxJar = Join-Path $toolRoot "jadx\$($manifest.tools.jadx.fileName)"
$apktoolCommand = Join-Path $toolRoot 'apktool\apktool.cmd'
$githubExecutable = Join-Path $toolRoot "$($manifest.tools.githubCli.archiveDirectory -replace '^', 'github-cli\')\gh.exe"

$resolvedOutput = $null
if ($OutputPath) {
    $resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
    $resolvedRepository = [System.IO.Path]::GetFullPath($repositoryRoot).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
    $repositoryPrefix = "$resolvedRepository$([System.IO.Path]::DirectorySeparatorChar)"
    if ($resolvedOutput.StartsWith($repositoryPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw 'Diagnostic output must be written outside the Git repository.'
    }
}

function Invoke-Captured {
    param(
        [Parameter(Mandatory)][string]$Command,
        [string[]]$Arguments = @()
    )

    if (-not (Test-Path -LiteralPath $Command -PathType Leaf) -and -not (Get-Command $Command -ErrorAction SilentlyContinue)) {
        throw "Required command is unavailable."
    }

    $output = & $Command @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Required command returned exit code $LASTEXITCODE."
    }

    return ($output | Out-String).Trim()
}

$javaCommand = if ($env:JAVA_HOME) {
    Join-Path $env:JAVA_HOME 'bin\java.exe'
} else {
    (Get-Command java -ErrorAction Stop).Source
}
$javacCommand = if ($env:JAVA_HOME) {
    Join-Path $env:JAVA_HOME 'bin\javac.exe'
} else {
    (Get-Command javac -ErrorAction Stop).Source
}

$nodeVersion = Invoke-Captured -Command $nodeExecutable -Arguments @('--version')
$npmVersion = Invoke-Captured -Command $npmExecutable -Arguments @('--version')
$javaVersion = (Invoke-Captured -Command $javaCommand -Arguments @('--version')).Split([Environment]::NewLine)[0]
$javacVersion = Invoke-Captured -Command $javacCommand -Arguments @('--version')
$apktoolVersion = Invoke-Captured -Command $apktoolCommand -Arguments @('--version')
$githubVersion = (Invoke-Captured -Command $githubExecutable -Arguments @('--version')).Split([Environment]::NewLine)[0]

$jadxHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $jadxJar).Hash.ToLowerInvariant()
if ($jadxHash -ne $manifest.tools.jadx.sha256.ToLowerInvariant()) {
    throw 'JADX checksum does not match the pinned manifest.'
}

$previousCache = $env:npm_config_cache
$previousPath = $env:PATH
$env:PATH = "$nodeRoot;$previousPath"
$env:npm_config_cache = Join-Path $WorkRoot 'npm-cache'
try {
    $reaVersionOutput = Invoke-Captured -Command $npxExecutable -Arguments @('--yes', $manifest.tools.rea.package, '--version')
} finally {
    $env:npm_config_cache = $previousCache
    $env:PATH = $previousPath
}

$result = [ordered]@{
    schemaVersion = 1
    status = 'pass'
    tools = [ordered]@{
        node = [ordered]@{ expected = $manifest.tools.node.version; actual = $nodeVersion.TrimStart('v') }
        npm = [ordered]@{ actual = $npmVersion }
        java = [ordered]@{ actual = $javaVersion; compiler = $javacVersion }
        jadx = [ordered]@{ expected = $manifest.tools.jadx.version; sha256Verified = $true }
        apktool = [ordered]@{ expected = $manifest.tools.apktool.version; actual = $apktoolVersion }
        githubCli = [ordered]@{ expected = $manifest.tools.githubCli.version; actual = $githubVersion }
        rea = [ordered]@{ expected = $manifest.tools.rea.version; actual = $reaVersionOutput }
    }
}

$json = $result | ConvertTo-Json -Depth 5
if ($resolvedOutput) {
    $outputDirectory = Split-Path $resolvedOutput -Parent
    New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
    [System.IO.File]::WriteAllText($resolvedOutput, "$json`n", [System.Text.UTF8Encoding]::new($false))
}

$json
