param(
  [string]$PythonPath = $env:NOX_CODEX_PLUGIN_PYTHON
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($PythonPath)) {
  $userProfilePath = [Environment]::GetFolderPath('UserProfile')
  if ([string]::IsNullOrWhiteSpace($userProfilePath)) {
    $userProfilePath = [Environment]::GetEnvironmentVariable('USERPROFILE', 'Process')
  }
  if ([string]::IsNullOrWhiteSpace($userProfilePath)) {
    throw 'Unable to resolve the current Windows user profile directory.'
  }
  $bundledPythonPath = Join-Path $userProfilePath '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
  $PythonPath = if (Test-Path -LiteralPath $bundledPythonPath -PathType Leaf) {
    $bundledPythonPath
  } else {
    'python'
  }
}

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$requirementsPath = Join-Path $PSScriptRoot 'local-plugin-requirements.txt'
$targetPath = Join-Path $projectRoot '.codex-local\python'

New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
& $PythonPath -m pip install `
  --disable-pip-version-check `
  --upgrade `
  --target $targetPath `
  --requirement $requirementsPath
if ($LASTEXITCODE -ne 0) {
  throw "Unable to install local Plugin development dependencies with $PythonPath."
}

Write-Output "Local Plugin Python dependencies installed: $targetPath"
