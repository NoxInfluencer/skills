param(
  [ValidateSet('bootstrap', 'install', 'update', 'status')]
  [string]$Action = 'status',
  [string]$CodexPath = $env:NOX_CODEX_PLUGIN_CLI
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot '..\..'))
$manifestPath = Join-Path $projectRoot '.codex-plugin\plugin.json'
$commonManifestPath = Join-Path $projectRoot '.plugin\plugin.json'
$marketplacePath = Join-Path $repositoryRoot '.agents\plugins\marketplace.json'
$manifest = Get-Content -Raw -Encoding UTF8 -LiteralPath $manifestPath | ConvertFrom-Json
$marketplace = Get-Content -Raw -Encoding UTF8 -LiteralPath $marketplacePath | ConvertFrom-Json
$pluginRef = "$($manifest.name)@$($marketplace.name)"

function Invoke-CheckedCommand([string]$Command, [string[]]$Arguments) {
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) { throw "Command failed ($LASTEXITCODE): $Command" }
}

function Assert-Source {
  Invoke-CheckedCommand 'node' @((Join-Path $PSScriptRoot 'verify-plugin.mjs'))
  Invoke-CheckedCommand 'node' @((Join-Path $PSScriptRoot 'validate-marketplace.mjs'))
}

if ($Action -ne 'status') {
  Assert-Source
  if ([string]::IsNullOrWhiteSpace($CodexPath)) {
    $profileDirectory = [Environment]::GetFolderPath('UserProfile')
    $bundledCli = Join-Path $profileDirectory '.codex\plugins\.plugin-appserver\codex.exe'
    $CodexPath = if (Test-Path -LiteralPath $bundledCli -PathType Leaf) { $bundledCli } else { 'codex' }
    if ($CodexPath -eq $bundledCli -and [string]::IsNullOrWhiteSpace($env:CODEX_HOME)) {
      $env:CODEX_HOME = Join-Path $profileDirectory '.codex'
    }
  }
  if ($Action -eq 'update') {
    # Keep both source manifests aligned; never change Skill contents.
    $baseVersion = ([string]$manifest.version).Split('+')[0]
    $version = "$baseVersion+codex.local-$([DateTime]::UtcNow.ToString('yyyyMMddHHmmssfff'))"
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    foreach ($path in @($manifestPath, $commonManifestPath)) {
      $entry = Get-Content -Raw -Encoding UTF8 -LiteralPath $path | ConvertFrom-Json
      $entry.version = $version
      [IO.File]::WriteAllText($path, (($entry | ConvertTo-Json -Depth 30) -replace "`r`n", "`n") + "`n", $utf8)
    }
    Assert-Source
  }
  if ($Action -eq 'bootstrap') {
    Invoke-CheckedCommand $CodexPath @('plugin', 'marketplace', 'add', $repositoryRoot)
  }
  Invoke-CheckedCommand $CodexPath @('plugin', 'add', $pluginRef)
}

$current = Get-Content -Raw -Encoding UTF8 -LiteralPath $manifestPath | ConvertFrom-Json
Write-Output "Plugin: $pluginRef"
Write-Output "Source: $projectRoot"
Write-Output "Version: $($current.version)"
if ($Action -ne 'status') { Write-Output 'Start a new Codex chat to load this development configuration.' }
