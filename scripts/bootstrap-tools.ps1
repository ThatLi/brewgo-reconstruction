[CmdletBinding()]
param(
    [string]$ToolRoot = (Join-Path (Split-Path $PSScriptRoot -Parent | Split-Path -Parent) 'brewgo-reconstruction-work\tools')
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repositoryRoot = Split-Path $PSScriptRoot -Parent
$manifestPath = Join-Path $repositoryRoot 'config\toolchain.json'
$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json

function Install-VerifiedFile {
    param(
        [Parameter(Mandatory)]$Definition,
        [Parameter(Mandatory)][string]$DestinationDirectory
    )

    New-Item -ItemType Directory -Force -Path $DestinationDirectory | Out-Null
    $destination = Join-Path $DestinationDirectory $Definition.fileName

    if (-not (Test-Path -LiteralPath $destination -PathType Leaf)) {
        $partial = "$destination.partial"
        Invoke-WebRequest -Uri $Definition.url -OutFile $partial
        Move-Item -LiteralPath $partial -Destination $destination
    }

    $actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $destination).Hash.ToLowerInvariant()
    if ($actualHash -ne $Definition.sha256.ToLowerInvariant()) {
        throw "Checksum mismatch for $($Definition.fileName). Expected $($Definition.sha256), received $actualHash."
    }

    return $destination
}

function Expand-VerifiedArchive {
    param(
        [Parameter(Mandatory)][string]$Archive,
        [Parameter(Mandatory)][string]$Destination
    )

    if (-not (Test-Path -LiteralPath $Destination -PathType Container)) {
        New-Item -ItemType Directory -Force -Path $Destination | Out-Null
        Expand-Archive -LiteralPath $Archive -DestinationPath $Destination
    }
}

$downloadRoot = Join-Path $ToolRoot 'downloads'
$nodeArchive = Install-VerifiedFile -Definition $manifest.tools.node -DestinationDirectory $downloadRoot
$githubArchive = Install-VerifiedFile -Definition $manifest.tools.githubCli -DestinationDirectory $downloadRoot
$jadxJar = Install-VerifiedFile -Definition $manifest.tools.jadx -DestinationDirectory (Join-Path $ToolRoot 'jadx')
$apktoolJar = Install-VerifiedFile -Definition $manifest.tools.apktool -DestinationDirectory (Join-Path $ToolRoot 'apktool')

$nodeRoot = Join-Path $ToolRoot 'node'
$githubRoot = Join-Path $ToolRoot 'github-cli'
Expand-VerifiedArchive -Archive $nodeArchive -Destination $nodeRoot
Expand-VerifiedArchive -Archive $githubArchive -Destination $githubRoot

$apktoolCommand = Join-Path $ToolRoot 'apktool\apktool.cmd'
$apktoolCommandBody = "@echo off`r`njava -jar `"$apktoolJar`" %*`r`n"
[System.IO.File]::WriteAllText($apktoolCommand, $apktoolCommandBody, [System.Text.UTF8Encoding]::new($false))

$nodeExecutable = Join-Path $nodeRoot "$($manifest.tools.node.archiveDirectory)\node.exe"
$githubExecutable = Join-Path $githubRoot "$($manifest.tools.githubCli.archiveDirectory)\gh.exe"

[PSCustomObject]@{
    toolRoot = [System.IO.Path]::GetFullPath($ToolRoot)
    node = $nodeExecutable
    jadx = $jadxJar
    apktool = $apktoolCommand
    githubCli = $githubExecutable
    reaPackage = $manifest.tools.rea.package
} | ConvertTo-Json
