$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
Add-Type -AssemblyName System.IO.Compression.FileSystem

$repositoryRoot = Split-Path $PSScriptRoot -Parent
$scriptPath = Join-Path $repositoryRoot 'scripts\inspect-apk-intake.ps1'
$systemTemp = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
$testRoot = Join-Path $systemTemp "brewgo-apk-intake-tests-$([Guid]::NewGuid().ToString('N'))"

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
}

function Assert-Throws {
    param([scriptblock]$Action, [string]$Pattern)
    try {
        & $Action
        throw "Expected an exception matching: $Pattern"
    } catch {
        if ($_.Exception.Message -notmatch $Pattern) { throw }
    }
}

function New-SyntheticApk {
    param([string]$Path, [string[]]$Entries)
    New-Item -ItemType Directory -Force -Path (Split-Path $Path -Parent) | Out-Null
    $stream = [System.IO.File]::Open($Path, [System.IO.FileMode]::Create)
    try {
        $archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
        try {
            foreach ($entryName in $Entries) {
                $entry = $archive.CreateEntry($entryName)
                $writer = [System.IO.StreamWriter]::new($entry.Open())
                try { $writer.Write('synthetic fixture') } finally { $writer.Dispose() }
            }
        } finally {
            $archive.Dispose()
        }
    } finally {
        $stream.Dispose()
    }
}

function New-SyntheticXapk {
    param([string]$Path, [string]$BaseApkPath, [string]$SplitApkPath)
    New-Item -ItemType Directory -Force -Path (Split-Path $Path -Parent) | Out-Null
    $stream = [System.IO.File]::Open($Path, [System.IO.FileMode]::Create)
    try {
        $archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
        try {
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $BaseApkPath, 'app.apk') | Out-Null
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $SplitApkPath, 'config.en.apk') | Out-Null
            $manifestEntry = $archive.CreateEntry('manifest.json')
            $writer = [System.IO.StreamWriter]::new($manifestEntry.Open())
            try { $writer.Write('{"split_apks":[{"file":"app.apk","id":"base"},{"file":"config.en.apk","id":"config.en"}]}') } finally { $writer.Dispose() }
        } finally {
            $archive.Dispose()
        }
    } finally {
        $stream.Dispose()
    }
}

try {
    New-Item -ItemType Directory -Force -Path $testRoot | Out-Null

    $emptyRoot = Join-Path $testRoot 'empty\input\apk'
    New-Item -ItemType Directory -Force -Path $emptyRoot | Out-Null
    Assert-Throws -Pattern 'No APK files' -Action {
        & $scriptPath -ConfirmAuthorized -WorkRoot (Join-Path $testRoot 'empty') -InputRoot $emptyRoot | Out-Null
    }

    $malformedRoot = Join-Path $testRoot 'malformed\input\apk'
    New-Item -ItemType Directory -Force -Path $malformedRoot | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $malformedRoot 'base.apk'), 'not a zip archive')
    Assert-Throws -Pattern 'Invalid APK ZIP structure' -Action {
        & $scriptPath -ConfirmAuthorized -WorkRoot (Join-Path $testRoot 'malformed') -InputRoot $malformedRoot | Out-Null
    }

    $unsupportedRoot = Join-Path $testRoot 'unsupported\input\apk'
    New-Item -ItemType Directory -Force -Path $unsupportedRoot | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $unsupportedRoot 'bundle.aab'), 'unsupported fixture')
    Assert-Throws -Pattern 'Unsupported package format' -Action {
        & $scriptPath -ConfirmAuthorized -WorkRoot (Join-Path $testRoot 'unsupported') -InputRoot $unsupportedRoot | Out-Null
    }

    $xapkWork = Join-Path $testRoot 'xapk'
    $xapkRoot = Join-Path $xapkWork 'input\apk'
    $xapkFixtureRoot = Join-Path $testRoot 'xapk-fixtures'
    $xapkBase = Join-Path $xapkFixtureRoot 'app.apk'
    $xapkSplit = Join-Path $xapkFixtureRoot 'config.en.apk'
    New-SyntheticApk -Path $xapkBase -Entries @('AndroidManifest.xml', 'classes.dex')
    New-SyntheticApk -Path $xapkSplit -Entries @('AndroidManifest.xml', 'resources.arsc')
    $xapkPath = Join-Path $xapkRoot 'bundle.xapk'
    New-SyntheticXapk -Path $xapkPath -BaseApkPath $xapkBase -SplitApkPath $xapkSplit
    $xapkBeforeHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $xapkPath).Hash
    $xapkJson = & $scriptPath -ConfirmAuthorized -WorkRoot $xapkWork -InputRoot $xapkRoot
    $xapkAfterHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $xapkPath).Hash
    $xapkResult = $xapkJson | ConvertFrom-Json
    Assert-True ($xapkBeforeHash -eq $xapkAfterHash) 'Validator modified its input XAPK.'
    Assert-True ($xapkResult.artifactCount -eq 2) 'Expected two APK artifacts in the XAPK.'
    Assert-True ($xapkResult.baseIdentified) 'XAPK manifest base declaration was not honored.'
    Assert-True (($xapkResult.artifacts | Where-Object role -EQ 'base').Count -eq 1) 'Expected one XAPK base artifact.'
    Assert-True (-not ($xapkJson -match [Regex]::Escape($testRoot))) 'XAPK JSON exposed an absolute test path.'

    $duplicateRoot = Join-Path $testRoot 'duplicate\input\apk'
    New-SyntheticApk -Path (Join-Path $duplicateRoot 'one\split.apk') -Entries @('AndroidManifest.xml')
    New-SyntheticApk -Path (Join-Path $duplicateRoot 'two\split.apk') -Entries @('AndroidManifest.xml')
    Assert-Throws -Pattern 'Duplicate APK filename' -Action {
        & $scriptPath -ConfirmAuthorized -WorkRoot (Join-Path $testRoot 'duplicate') -InputRoot $duplicateRoot | Out-Null
    }

    $validWork = Join-Path $testRoot 'valid'
    $validRoot = Join-Path $validWork 'input\apk'
    $validApk = Join-Path $validRoot 'base.apk'
    New-SyntheticApk -Path $validApk -Entries @(
        'AndroidManifest.xml',
        'classes.dex',
        'assets/index.android.bundle'
    )
    $beforeHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $validApk).Hash
    $outputPath = Join-Path $validWork 'inventory\result.json'
    $json = & $scriptPath -ConfirmAuthorized -WorkRoot $validWork -InputRoot $validRoot -OutputPath $outputPath
    $afterHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $validApk).Hash
    $result = $json | ConvertFrom-Json

    Assert-True ($beforeHash -eq $afterHash) 'Validator modified its input APK.'
    Assert-True ($result.artifactCount -eq 1) 'Expected exactly one artifact.'
    Assert-True ($result.artifacts[0].technology -eq 'react-native') 'React Native indicator was not detected.'
    Assert-True ($result.artifacts[0].role -eq 'base') 'base.apk was not identified as the base artifact.'
    Assert-True (-not ($json -match [Regex]::Escape($testRoot))) 'Sanitized JSON exposed an absolute test path.'

    Write-Output 'APK intake tests passed.'
} finally {
    $resolvedTestRoot = [System.IO.Path]::GetFullPath($testRoot)
    $expectedPrefix = "$systemTemp$([System.IO.Path]::DirectorySeparatorChar)brewgo-apk-intake-tests-"
    if ($resolvedTestRoot.StartsWith($expectedPrefix, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedTestRoot)) {
        Remove-Item -LiteralPath $resolvedTestRoot -Recurse -Force
    }
}
