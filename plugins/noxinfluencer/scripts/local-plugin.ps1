param(
  [ValidateSet('bootstrap', 'install', 'update', 'status')]
  [string]$Action = 'update',
  [string]$PythonPath = $env:NOX_CODEX_PLUGIN_PYTHON,
  [string]$CodexPath = $env:NOX_CODEX_PLUGIN_CLI
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot '..\..'))
$marketplacePath = Join-Path $repositoryRoot '.agents\plugins\marketplace.json'
$sourceManifestPath = Join-Path $projectRoot '.codex-plugin\plugin.json'
$sourceManifest = Get-Content -Raw -Encoding UTF8 -LiteralPath $sourceManifestPath |
  ConvertFrom-Json
$pluginName = [string]$sourceManifest.name

if ([string]::IsNullOrWhiteSpace($pluginName)) {
  throw 'Source plugin manifest must contain a non-empty name.'
}

$userProfilePath = [Environment]::GetFolderPath('UserProfile')
if ([string]::IsNullOrWhiteSpace($userProfilePath)) {
  $userProfilePath = [Environment]::GetEnvironmentVariable('USERPROFILE', 'Process')
}
if ([string]::IsNullOrWhiteSpace($userProfilePath)) {
  throw 'Unable to resolve the current Windows user profile directory.'
}

$pluginCreatorRoot = Join-Path $userProfilePath '.codex\skills\.system\plugin-creator'
$cachebusterScript = Join-Path $pluginCreatorRoot 'scripts\update_plugin_cachebuster.py'
$readMarketplaceNameScript = Join-Path $pluginCreatorRoot 'scripts\read_marketplace_name.py'
$validatePluginScript = Join-Path $pluginCreatorRoot 'scripts\validate_plugin.py'
$localPythonPackages = Join-Path $projectRoot '.codex-local\python'

if ([string]::IsNullOrWhiteSpace($PythonPath)) {
  $bundledPythonPath = Join-Path $userProfilePath '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
  $PythonPath = if (Test-Path -LiteralPath $bundledPythonPath -PathType Leaf) {
    $bundledPythonPath
  } else {
    'python'
  }
}

$pluginAppServerCodexPath = Join-Path $userProfilePath '.codex\plugins\.plugin-appserver\codex.exe'
if ([string]::IsNullOrWhiteSpace($CodexPath)) {
  $CodexPath = if (Test-Path -LiteralPath $pluginAppServerCodexPath -PathType Leaf) {
    $pluginAppServerCodexPath
  } else {
    'codex'
  }
}
if (
  (Test-Path -LiteralPath $pluginAppServerCodexPath -PathType Leaf) -and
  ([System.IO.Path]::GetFullPath($CodexPath) -eq [System.IO.Path]::GetFullPath($pluginAppServerCodexPath)) -and
  [string]::IsNullOrWhiteSpace(
    [Environment]::GetEnvironmentVariable('CODEX_HOME', 'Process')
  )
) {
  [Environment]::SetEnvironmentVariable(
    'CODEX_HOME',
    (Join-Path $userProfilePath '.codex'),
    'Process'
  )
}

if (Test-Path -LiteralPath $localPythonPackages -PathType Container) {
  $existingPythonPath = [Environment]::GetEnvironmentVariable('PYTHONPATH', 'Process')
  $nextPythonPath = $localPythonPackages
  if (![string]::IsNullOrWhiteSpace($existingPythonPath)) {
    $nextPythonPath += [System.IO.Path]::PathSeparator + $existingPythonPath
  }
  [Environment]::SetEnvironmentVariable('PYTHONPATH', $nextPythonPath, 'Process')
}

function Invoke-CheckedCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Command,
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code ${LASTEXITCODE}: $Command $($Arguments -join ' ')"
  }
}

function Assert-PythonReady {
  & $PythonPath -c 'import yaml'
  if ($LASTEXITCODE -ne 0) {
    throw 'Python cannot import PyYAML. Run npm run plugin:local:deps, then retry.'
  }
}

function Assert-RequiredFiles {
  foreach ($requiredPath in @(
    $marketplacePath,
    $sourceManifestPath,
    $cachebusterScript,
    $readMarketplaceNameScript,
    $validatePluginScript
  )) {
    if (!(Test-Path -LiteralPath $requiredPath -PathType Leaf)) {
      throw "Required file is missing: $requiredPath"
    }
  }
}

function Get-RepositoryMarketplaceName {
  $name = & $PythonPath $readMarketplaceNameScript --marketplace-path $marketplacePath
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($name)) {
    throw "Unable to read the repository marketplace name from $marketplacePath."
  }
  return $name.Trim()
}

function Assert-PluginSource {
  Invoke-CheckedCommand -Command 'node' -Arguments @(
    (Join-Path $projectRoot 'scripts\sync-plugin-skill.mjs'),
    '--check'
  )
  Invoke-CheckedCommand -Command 'node' -Arguments @(
    (Join-Path $projectRoot 'scripts\validate-marketplace.mjs')
  )
  Invoke-CheckedCommand -Command $PythonPath -Arguments @(
    $validatePluginScript,
    $projectRoot
  )
}

function Update-PluginCachebuster {
  Invoke-CheckedCommand -Command $PythonPath -Arguments @(
    $cachebusterScript,
    $projectRoot
  )
}

function Register-RepositoryMarketplace {
  Invoke-CheckedCommand -Command $CodexPath -Arguments @(
    'plugin',
    'marketplace',
    'add',
    $repositoryRoot
  )
}

function Install-RepositoryPlugin {
  $marketplaceName = Get-RepositoryMarketplaceName
  Invoke-CheckedCommand -Command $CodexPath -Arguments @(
    'plugin',
    'add',
    "$pluginName@$marketplaceName"
  )
}

function Get-LocalStatus {
  $marketplaceName = Get-RepositoryMarketplaceName
  $currentManifest = Get-Content -Raw -Encoding UTF8 -LiteralPath $sourceManifestPath |
    ConvertFrom-Json

  Write-Output "Plugin: $pluginName"
  Write-Output "Source: $projectRoot"
  Write-Output "Source version: $($currentManifest.version)"
  Write-Output "Repository marketplace: $marketplacePath"
  Write-Output "Marketplace name: $marketplaceName"
  Write-Output "Install target: $pluginName@$marketplaceName"
}

Assert-RequiredFiles

if ($Action -eq 'status') {
  Get-LocalStatus
  exit 0
}

Assert-PythonReady

if ($Action -eq 'bootstrap') {
  Assert-PluginSource
  Register-RepositoryMarketplace
  Install-RepositoryPlugin
} elseif ($Action -eq 'install') {
  Assert-PluginSource
  Install-RepositoryPlugin
} elseif ($Action -eq 'update') {
  Invoke-CheckedCommand -Command 'node' -Arguments @(
    (Join-Path $projectRoot 'scripts\sync-plugin-skill.mjs'),
    '--check'
  )
  Invoke-CheckedCommand -Command 'node' -Arguments @(
    (Join-Path $projectRoot 'scripts\validate-marketplace.mjs')
  )
  Update-PluginCachebuster
  Invoke-CheckedCommand -Command $PythonPath -Arguments @(
    $validatePluginScript,
    $projectRoot
  )
  Install-RepositoryPlugin
}

Get-LocalStatus
Write-Output 'Local repository plugin installation is ready. Start a new Codex thread to load the updated Skill and MCP configuration.'
