[CmdletBinding()]
param(
    [Parameter(Mandatory)][switch]$ConfirmAuthorized,
    [string]$WorkRoot = (Join-Path (Split-Path $PSScriptRoot -Parent | Split-Path -Parent) 'brewgo-reconstruction-work'),
    [string]$InputRoot,
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
Add-Type -AssemblyName System.IO.Compression.FileSystem

$repositoryRoot = [System.IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
$resolvedWorkRoot = [System.IO.Path]::GetFullPath($WorkRoot).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
$workPrefix = "$resolvedWorkRoot$([System.IO.Path]::DirectorySeparatorChar)"
$resolvedInput = [System.IO.Path]::GetFullPath($(if ($InputRoot) { $InputRoot } else { Join-Path $resolvedWorkRoot 'input\apk' }))
$resolvedOutput = [System.IO.Path]::GetFullPath($(if ($OutputPath) { $OutputPath } else { Join-Path $resolvedWorkRoot 'inventory\raw-intake.json' }))

if (-not $resolvedInput.StartsWith($workPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'APK input must be inside the external BrewGo work directory.'
}
if ($resolvedOutput.StartsWith("$repositoryRoot$([System.IO.Path]::DirectorySeparatorChar)", [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'APK inventory output must remain outside the Git repository.'
}
if (-not (Test-Path -LiteralPath $resolvedInput -PathType Container)) {
    throw 'APK input directory does not exist.'
}

$unsupportedPackages = Get-ChildItem -LiteralPath $resolvedInput -Recurse -File | Where-Object {
    $_.Extension.ToLowerInvariant() -in @('.aab', '.apks', '.xapk', '.ipa')
}
if ($unsupportedPackages) {
    throw "Unsupported package format found: $($unsupportedPackages[0].Name)"
}

$apkFiles = @(Get-ChildItem -LiteralPath $resolvedInput -Recurse -File -Filter '*.apk' | Sort-Object FullName)
if ($apkFiles.Count -eq 0) {
    throw 'No APK files were found in the authorized intake directory.'
}

$duplicateNames = $apkFiles | Group-Object { $_.Name.ToLowerInvariant() } | Where-Object Count -GT 1
if ($duplicateNames) {
    throw "Duplicate APK filename found: $($duplicateNames[0].Name)"
}

$baseCandidates = @($apkFiles | Where-Object Name -IEQ 'base.apk')
if ($baseCandidates.Count -gt 1) {
    throw 'More than one base.apk candidate was found.'
}
$basePath = if ($baseCandidates.Count -eq 1) {
    $baseCandidates[0].FullName
} elseif ($apkFiles.Count -eq 1) {
    $apkFiles[0].FullName
} else {
    $null
}

$artifacts = foreach ($file in $apkFiles) {
    $beforeLength = $file.Length
    $beforeWriteTime = $file.LastWriteTimeUtc
    $entries = @()
    $archive = $null
    try {
        $archive = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
        $entries = @($archive.Entries | ForEach-Object FullName)
    } catch {
        throw "Invalid APK ZIP structure: $($file.Name)"
    } finally {
        if ($archive) { $archive.Dispose() }
    }

    if ($entries -notcontains 'AndroidManifest.xml') {
        throw "APK is missing AndroidManifest.xml: $($file.Name)"
    }
    if ($entries | Where-Object { $_ -match '(^|/)\.\.(/|$)' }) {
        throw "APK contains an unsafe archive entry path: $($file.Name)"
    }

    $entryText = $entries -join "`n"
    $indicators = [ordered]@{
        flutter = [bool]($entryText -match '(?im)^lib/[^/]+/(libflutter|libapp)\.so$')
        reactNative = [bool]($entryText -match '(?im)^(assets/index\.android\.bundle|lib/[^/]+/libreactnativejni\.so)$')
        webViewBundle = [bool]($entryText -match '(?im)^(assets/(www|public)/|assets/.+cordova\.js$)')
        dex = [bool]($entryText -match '(?im)^classes\d*\.dex$')
    }
    $technology = if ($indicators.flutter) {
        'flutter'
    } elseif ($indicators.reactNative) {
        'react-native'
    } elseif ($indicators.webViewBundle) {
        'hybrid-webview'
    } elseif ($indicators.dex) {
        'android-native-or-obfuscated'
    } else {
        'unknown'
    }

    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $file.FullName).Hash.ToLowerInvariant()
    $after = Get-Item -LiteralPath $file.FullName
    if ($after.Length -ne $beforeLength -or $after.LastWriteTimeUtc -ne $beforeWriteTime) {
        throw "APK changed during inspection: $($file.Name)"
    }

    [PSCustomObject][ordered]@{
        file = [System.IO.Path]::GetRelativePath($resolvedInput, $file.FullName).Replace('\', '/')
        role = if ($basePath -and $file.FullName -eq $basePath) { 'base' } else { 'split-or-unknown' }
        bytes = $file.Length
        sha256 = $hash
        zipEntryCount = $entries.Count
        manifestPresent = $true
        technology = $technology
        indicators = $indicators
    }
}

$result = [ordered]@{
    schemaVersion = 1
    authorizationConfirmed = [bool]$ConfirmAuthorized
    artifactCount = $artifacts.Count
    baseIdentified = [bool]$basePath
    artifacts = @($artifacts)
}

$outputDirectory = Split-Path $resolvedOutput -Parent
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$json = $result | ConvertTo-Json -Depth 8
[System.IO.File]::WriteAllText($resolvedOutput, "$json`n", [System.Text.UTF8Encoding]::new($false))
$json
