param(
  [ValidateSet('bootstrap', 'install', 'update', 'status')]
  [string]$Action = 'update',
  [string]$PythonPath = $env:NOX_CODEX_PLUGIN_PYTHON,
  [string]$CodexPath = $env:NOX_CODEX_PLUGIN_CLI
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
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
$personalPluginsRoot = [System.IO.Path]::GetFullPath(
  (Join-Path $userProfilePath 'plugins')
)
$localPluginPath = [System.IO.Path]::GetFullPath(
  (Join-Path $personalPluginsRoot $pluginName)
)
$marketplacePath = [System.IO.Path]::GetFullPath(
  (Join-Path $userProfilePath '.agents\plugins\marketplace.json')
)
$pluginCreatorRoot = Join-Path $userProfilePath '.codex\skills\.system\plugin-creator'
$createPluginScript = Join-Path $pluginCreatorRoot 'scripts\create_basic_plugin.py'
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

function Assert-LocalPluginTarget {
  $pluginsRootWithSeparator = $personalPluginsRoot.TrimEnd(
    [System.IO.Path]::DirectorySeparatorChar,
    [System.IO.Path]::AltDirectorySeparatorChar
  ) + [System.IO.Path]::DirectorySeparatorChar

  if (
    !$localPluginPath.StartsWith(
      $pluginsRootWithSeparator,
      [System.StringComparison]::OrdinalIgnoreCase
    ) -or
    [System.IO.Path]::GetFileName($localPluginPath) -ne $pluginName
  ) {
    throw "Refusing to replace an unsafe local plugin target: $localPluginPath"
  }
}

function Get-MarketplaceEntry {
  if (!(Test-Path -LiteralPath $marketplacePath -PathType Leaf)) {
    return $null
  }
  $marketplace = Get-Content -Raw -Encoding UTF8 -LiteralPath $marketplacePath |
    ConvertFrom-Json
  return @($marketplace.plugins) |
    Where-Object { $_.name -eq $pluginName } |
    Select-Object -First 1
}

function Assert-MarketplaceEntry {
  $entry = Get-MarketplaceEntry
  if ($null -eq $entry) {
    throw "Personal marketplace entry '$pluginName' is missing. Run npm run plugin:local:bootstrap first."
  }

  $expectedSourcePath = "./plugins/$pluginName"
  if (
    $entry.source.source -ne 'local' -or
    $entry.source.path -ne $expectedSourcePath
  ) {
    throw "Marketplace entry '$pluginName' must point to local source '$expectedSourcePath'."
  }
  if (
    $entry.policy.installation -ne 'AVAILABLE' -or
    $entry.policy.authentication -ne 'ON_INSTALL'
  ) {
    throw "Marketplace entry '$pluginName' must use AVAILABLE and ON_INSTALL policies."
  }
}

function Initialize-PersonalMarketplace {
  if ($null -ne (Get-MarketplaceEntry)) {
    return
  }
  if (Test-Path -LiteralPath $localPluginPath) {
    throw "Local plugin source exists without a matching marketplace entry: $localPluginPath"
  }
  foreach ($requiredScript in @($createPluginScript, $readMarketplaceNameScript)) {
    if (!(Test-Path -LiteralPath $requiredScript -PathType Leaf)) {
      throw "plugin-creator helper is missing: $requiredScript"
    }
  }

  Invoke-CheckedCommand -Command $PythonPath -Arguments @(
    $createPluginScript,
    $pluginName,
    '--with-marketplace',
    '--category',
    'Marketing'
  )
}

function Assert-PythonReady {
  & $PythonPath -c 'import yaml'
  if ($LASTEXITCODE -ne 0) {
    throw 'Python cannot import PyYAML. Run npm run plugin:local:deps, then retry.'
  }
}

function Get-LocalStatus {
  $marketplaceEntry = Get-MarketplaceEntry
  $installedManifestPath = Join-Path $localPluginPath '.codex-plugin\plugin.json'
  $installedVersion = '(not prepared)'
  if (Test-Path -LiteralPath $installedManifestPath -PathType Leaf) {
    $installedManifest = Get-Content -Raw -Encoding UTF8 -LiteralPath $installedManifestPath |
      ConvertFrom-Json
    $installedVersion = [string]$installedManifest.version
  }

  Write-Output "Plugin: $pluginName"
  Write-Output "Source: $projectRoot"
  Write-Output "Source version: $($sourceManifest.version)"
  Write-Output "Personal marketplace: $marketplacePath"
  Write-Output "Marketplace entry: $(if ($null -eq $marketplaceEntry) { 'missing' } else { 'ready' })"
  Write-Output "Local install source: $localPluginPath"
  Write-Output "Prepared version: $installedVersion"
}

function Build-LocalPluginSnapshot {
  Assert-LocalPluginTarget
  Assert-MarketplaceEntry

  Invoke-CheckedCommand -Command 'node' -Arguments @(
    (Join-Path $projectRoot 'scripts\package-plugin.mjs'),
    '--dev'
  )

  $artifact = Get-ChildItem -LiteralPath (Join-Path $projectRoot 'dist') -File |
    Where-Object { $_.Name -like "$pluginName-*.zip" } |
    Sort-Object LastWriteTimeUtc -Descending |
    Select-Object -First 1
  if ($null -eq $artifact) {
    throw 'Development package was not generated.'
  }

  $operationId = [Guid]::NewGuid().ToString('N')
  $incomingPath = Join-Path $personalPluginsRoot ".$pluginName.incoming-$operationId"
  $backupPath = Join-Path $personalPluginsRoot ".$pluginName.backup-$operationId"
  mkdir $personalPluginsRoot -Force | Out-Null

  try {
    Expand-Archive -LiteralPath $artifact.FullName -DestinationPath $incomingPath

    $incomingManifestPath = Join-Path $incomingPath '.codex-plugin\plugin.json'
    $runtimeMarkerPath = Join-Path $incomingPath 'skills\noxinfluencer\references\codex-plugin-runtime.md'
    if (!(Test-Path -LiteralPath $incomingManifestPath -PathType Leaf)) {
      throw 'Prepared plugin is missing .codex-plugin/plugin.json.'
    }
    if (!(Test-Path -LiteralPath $runtimeMarkerPath -PathType Leaf)) {
      throw 'Prepared plugin is missing the Codex Plugin runtime marker.'
    }

    $incomingManifest = Get-Content -Raw -Encoding UTF8 -LiteralPath $incomingManifestPath |
      ConvertFrom-Json
    if ($incomingManifest.name -ne $pluginName) {
      throw "Prepared plugin name '$($incomingManifest.name)' does not match '$pluginName'."
    }
    if ([string]$incomingManifest.version -notmatch '\+codex\.local-[0-9]{14}$') {
      throw "Prepared plugin version lacks the expected cachebuster: $($incomingManifest.version)"
    }

    Invoke-CheckedCommand -Command $PythonPath -Arguments @(
      $cachebusterScript,
      $incomingPath
    )
    Invoke-CheckedCommand -Command $PythonPath -Arguments @(
      $validatePluginScript,
      $incomingPath
    )

    if (Test-Path -LiteralPath $localPluginPath) {
      Move-Item -LiteralPath $localPluginPath -Destination $backupPath
    }
    Move-Item -LiteralPath $incomingPath -Destination $localPluginPath
    if (Test-Path -LiteralPath $backupPath) {
      Remove-Item -LiteralPath $backupPath -Recurse -Force
    }
  } catch {
    if (
      !(Test-Path -LiteralPath $localPluginPath) -and
      (Test-Path -LiteralPath $backupPath)
    ) {
      Move-Item -LiteralPath $backupPath -Destination $localPluginPath
    }
    throw
  } finally {
    if (Test-Path -LiteralPath $incomingPath) {
      Remove-Item -LiteralPath $incomingPath -Recurse -Force
    }
    if (Test-Path -LiteralPath $backupPath) {
      Remove-Item -LiteralPath $backupPath -Recurse -Force
    }
  }
}

function Install-LocalPlugin {
  $marketplaceName = & $PythonPath $readMarketplaceNameScript
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($marketplaceName)) {
    throw 'Unable to read the personal marketplace name.'
  }
  Invoke-CheckedCommand -Command $CodexPath -Arguments @(
    'plugin',
    'add',
    "$pluginName@$($marketplaceName.Trim())"
  )
}

if ($Action -eq 'status') {
  Get-LocalStatus
  exit 0
}

Assert-PythonReady
if ($Action -eq 'bootstrap') {
  Initialize-PersonalMarketplace
}

Assert-MarketplaceEntry
Build-LocalPluginSnapshot
Install-LocalPlugin
Get-LocalStatus
Write-Output 'Local plugin installation is ready. Start a new Codex thread to load the updated Skill and MCP configuration.'
