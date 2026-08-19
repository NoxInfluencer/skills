[CmdletBinding()]
param(
  [switch]$ResolveOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Add-Candidate {
  param(
    [System.Collections.Generic.List[string]]$Candidates,
    [string]$Path
  )

  if (
    ![string]::IsNullOrWhiteSpace($Path) -and
    (Test-Path -LiteralPath $Path -PathType Leaf) -and
    !$Candidates.Contains($Path)
  ) {
    $Candidates.Add($Path)
  }
}

$userProfilePath = [Environment]::GetFolderPath('UserProfile')
if ([string]::IsNullOrWhiteSpace($userProfilePath)) {
  $userProfilePath = [Environment]::GetEnvironmentVariable('USERPROFILE', 'Process')
}
$codexHome = [Environment]::GetEnvironmentVariable('CODEX_HOME', 'Process')
if ([string]::IsNullOrWhiteSpace($codexHome) -and ![string]::IsNullOrWhiteSpace($userProfilePath)) {
  $codexHome = Join-Path $userProfilePath '.codex'
}

$candidates = [System.Collections.Generic.List[string]]::new()
if (![string]::IsNullOrWhiteSpace($codexHome)) {
  Add-Candidate $candidates (Join-Path $codexHome 'plugins\.plugin-appserver\codex.exe')
}

$pathCommand = Get-Command codex -CommandType Application -ErrorAction SilentlyContinue |
  Select-Object -First 1
if (
  $null -ne $pathCommand -and
  $pathCommand.Source -notmatch '[\\/]WindowsApps[\\/]'
) {
  Add-Candidate $candidates $pathCommand.Source
}

if ($candidates.Count -eq 0) {
  throw 'No executable Codex Host OAuth CLI is available.'
}

$codexPath = $candidates[0]
if ($ResolveOnly) {
  Write-Output $codexPath
  exit 0
}

if (
  ![string]::IsNullOrWhiteSpace($codexHome) -and
  [string]::IsNullOrWhiteSpace(
    [Environment]::GetEnvironmentVariable('CODEX_HOME', 'Process')
  )
) {
  [Environment]::SetEnvironmentVariable('CODEX_HOME', $codexHome, 'Process')
}

& $codexPath mcp login noxinfluencer `
  --oauth-client-registration dcr `
  --scopes noxinfluencer.codex.user

if ($LASTEXITCODE -ne 0) {
  throw "Codex Host OAuth login failed with exit code $LASTEXITCODE."
}
