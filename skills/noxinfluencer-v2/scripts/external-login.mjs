import { spawn, spawnSync } from 'node:child_process';

const windowsOpen = `
$ErrorActionPreference = 'Stop'
$chromePaths = @(
  (Get-ItemPropertyValue -LiteralPath 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe' -Name '(default)' -ErrorAction SilentlyContinue)
  (Get-ItemPropertyValue -LiteralPath 'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe' -Name '(default)' -ErrorAction SilentlyContinue)
  foreach ($directory in ($env:ProgramW6432, $env:ProgramFiles, [Environment]::GetEnvironmentVariable('ProgramFiles(x86)'), $env:LOCALAPPDATA)) {
    if ($directory) { Join-Path $directory 'Google\\Chrome\\Application\\chrome.exe' }
  }
)
$chrome = $chromePaths | Where-Object { $_ -and (Test-Path -LiteralPath $_ -PathType Leaf) } | Select-Object -First 1
if ($chrome) {
  Start-Process -FilePath $chrome -ArgumentList $env:NOX_V2_EXTERNAL_LOGIN_URL
} else {
  Start-Process -FilePath $env:NOX_V2_EXTERNAL_LOGIN_URL
}
`;

async function launchBrowser(command, args, { env, waitForLauncher = false }) {
  if (waitForLauncher) {
    return spawnSync(command, args, { env, windowsHide: true, stdio: 'ignore', timeout: 15_000 }).status === 0;
  }
  return new Promise(resolve => {
    const child = spawn(command, args, { env, detached: true, stdio: 'ignore' });
    child.once('error', () => resolve(false));
    child.once('spawn', () => {
      child.unref();
      resolve(true);
    });
  });
}

export async function openExternalBrowser(url, { env = process.env, platform = process.platform, launch = launchBrowser } = {}) {
  if (platform === 'win32') {
    return launch('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', windowsOpen], {
      env: { ...env, NOX_V2_EXTERNAL_LOGIN_URL: url }, waitForLauncher: true,
    });
  }
  if (platform === 'darwin') {
    const options = { env, waitForLauncher: true };
    return await launch('open', ['-b', 'com.google.Chrome', url], options) || launch('open', [url], options);
  }
  if (platform === 'linux' && (env.DISPLAY || env.WAYLAND_DISPLAY)) {
    for (const command of ['google-chrome', 'google-chrome-stable', 'xdg-open']) {
      if (await launch(command, [url], { env })) return true;
    }
  }
  return false;
}

function verificationUrl(value) {
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error('CLI did not provide a valid authorization page.'); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port
      || !/(^|\.)noxinfluencer\.com$/.test(parsed.hostname)
      || !/^\/oauth\/device\/?$/.test(parsed.pathname)) {
    throw new Error('CLI did not provide a valid NoxInfluencer device authorization page.');
  }
  return parsed.href;
}

function deviceLoginCommand(entry, args, env, timeout) {
  const result = spawnSync(process.execPath, [entry, ...args, '--json'], {
    windowsHide: true, env, encoding: 'utf8', timeout,
  });
  let response;
  try { response = JSON.parse(result.stdout ?? ''); } catch { /* Keep raw CLI output private. */ }
  if (response?.status === 'denied') throw new Error('Authorization was declined in the browser.');
  if (response?.status === 'expired') throw new Error('Device authorization expired before completion.');
  if (result.error?.code === 'ETIMEDOUT') throw new Error('The authorization wait timed out.');
  if (result.status !== 0 || response?.success !== true) {
    throw new Error(args[1] === 'start' ? 'CLI could not start device authorization.' : 'CLI authorization did not complete.');
  }
  return response;
}

export async function loginInExternalBrowser(entry, env, { force = false, run = deviceLoginCommand,
  open = openExternalBrowser, report = console.log } = {}) {
  const start = await run(entry, force ? ['login', 'start', '--force'] : ['login', 'start'], env, 120_000);
  if (start.already_authenticated === true) {
    report('The CLI already has credentials.');
    return;
  }
  if (start.status !== 'pending' || typeof start.login_id !== 'string' || !/^login_[A-Za-z0-9_-]+$/.test(start.login_id)) {
    throw new Error('CLI did not return a pending device authorization.');
  }
  if (!await open(verificationUrl(start.verification_uri_complete), { env })) {
    throw new Error('Could not open the external browser for CLI authorization.');
  }
  report('Authorization page requested in your external browser. Complete sign-in and consent there.');
  const result = await run(entry, ['login', 'wait', start.login_id], env, 31 * 60_000);
  if (result.success !== true || result.status === 'pending') throw new Error('CLI authorization did not complete.');
  report('CLI authorization completed.');
}
