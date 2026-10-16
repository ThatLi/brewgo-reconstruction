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
    $_.Extension.ToLowerInvariant() -in @('.aab', '.apks', '.ipa')
}
if ($unsupportedPackages) {
    throw "Unsupported package format found: $($unsupportedPackages[0].Name)"
}

$apkSources = [System.Collections.Generic.List[object]]::new()
foreach ($file in @(Get-ChildItem -LiteralPath $resolvedInput -Recurse -File -Filter '*.apk' | Sort-Object FullName)) {
    $apkSources.Add([PSCustomObject]@{
        File = $file
        DisplayName = [System.IO.Path]::GetRelativePath($resolvedInput, $file.FullName).Replace('\', '/')
        DeclaredRole = if ($file.Name -ieq 'base.apk') { 'base' } else { 'split-or-unknown' }
        ContainerSha256 = $null
    })
}

$xapkFiles = @(Get-ChildItem -LiteralPath $resolvedInput -Recurse -File -Filter '*.xapk' | Sort-Object FullName)
foreach ($xapkFile in $xapkFiles) {
    $beforeLength = $xapkFile.Length
    $beforeWriteTime = $xapkFile.LastWriteTimeUtc
    $containerHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $xapkFile.FullName).Hash.ToLowerInvariant()
    $archive = $null
    try {
        $archive = [System.IO.Compression.ZipFile]::OpenRead($xapkFile.FullName)
        $unsafeEntry = $archive.Entries | Where-Object {
            $_.FullName -match '(^|[\\/])\.\.([\\/]|$)' -or [System.IO.Path]::IsPathRooted($_.FullName)
        } | Select-Object -First 1
        if ($unsafeEntry) { throw "XAPK contains an unsafe archive entry path: $($xapkFile.Name)" }

        $nestedApks = @($archive.Entries | Where-Object { $_.FullName -match '(?i)\.apk$' } | Sort-Object FullName)
        if ($nestedApks.Count -eq 0) { throw "XAPK contains no APK entries: $($xapkFile.Name)" }

        $declaredBase = $null
        $manifestEntry = $archive.GetEntry('manifest.json')
        if ($manifestEntry) {
            $reader = [System.IO.StreamReader]::new($manifestEntry.Open())
            try {
                $manifest = $reader.ReadToEnd() | ConvertFrom-Json
                $baseDeclaration = @($manifest.split_apks | Where-Object id -EQ 'base' | Select-Object -First 1)
                if ($baseDeclaration.Count -eq 1) { $declaredBase = [string]$baseDeclaration[0].file }
            } catch {
                throw "XAPK manifest.json is malformed: $($xapkFile.Name)"
            } finally {
                $reader.Dispose()
            }
        }

        $expansionRoot = Join-Path $resolvedWorkRoot "rea-analysis\intake\xapk-$($containerHash.Substring(0, 16))"
        New-Item -ItemType Directory -Force -Path $expansionRoot | Out-Null
        for ($index = 0; $index -lt $nestedApks.Count; $index++) {
            $entry = $nestedApks[$index]
            $role = if (($declaredBase -and $entry.FullName -ieq $declaredBase) -or $entry.Name -ieq 'base.apk') { 'base' } else { 'split-or-unknown' }
            $outputName = if ($role -eq 'base') { 'base.apk' } else { 'split-{0:D3}.apk' -f ($index + 1) }
            $expandedPath = Join-Path $expansionRoot $outputName
            $inputStream = $entry.Open()
            $outputStream = [System.IO.File]::Open($expandedPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
            try { $inputStream.CopyTo($outputStream) } finally { $outputStream.Dispose(); $inputStream.Dispose() }
            $apkSources.Add([PSCustomObject]@{
                File = Get-Item -LiteralPath $expandedPath
                DisplayName = "$([System.IO.Path]::GetRelativePath($resolvedInput, $xapkFile.FullName).Replace('\', '/'))!/$outputName"
                DeclaredRole = $role
                ContainerSha256 = $containerHash
            })
        }
    } catch {
        if ($_.Exception.Message -match '^XAPK ') { throw }
        throw "Invalid XAPK ZIP structure: $($xapkFile.Name)"
    } finally {
        if ($archive) { $archive.Dispose() }
    }
    $after = Get-Item -LiteralPath $xapkFile.FullName
    if ($after.Length -ne $beforeLength -or $after.LastWriteTimeUtc -ne $beforeWriteTime) {
        throw "XAPK changed during inspection: $($xapkFile.Name)"
    }
}

if ($apkSources.Count -eq 0) {
    throw 'No APK files or XAPK bundles were found in the authorized intake directory.'
}

$duplicateNames = $apkSources | Group-Object { $_.DisplayName.ToLowerInvariant() } | Where-Object Count -GT 1
if ($duplicateNames) {
    throw "Duplicate APK filename found: $($duplicateNames[0].Name)"
}

$baseCandidates = @($apkSources | Where-Object DeclaredRole -EQ 'base')
if ($baseCandidates.Count -gt 1) {
    throw 'More than one base.apk candidate was found.'
}
$basePath = if ($baseCandidates.Count -eq 1) {
    $baseCandidates[0].File.FullName
} elseif ($apkSources.Count -eq 1) {
    $apkSources[0].File.FullName
} else {
    $null
}

$artifacts = foreach ($source in $apkSources) {
    $file = $source.File
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
        file = $source.DisplayName
        role = if ($basePath -and $file.FullName -eq $basePath) { 'base' } else { 'split-or-unknown' }
        containerSha256 = $source.ContainerSha256
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
