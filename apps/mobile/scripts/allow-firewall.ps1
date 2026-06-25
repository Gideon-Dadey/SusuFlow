# Allow Metro / Expo through Windows Firewall (run once as Administrator).
# Usage: powershell -ExecutionPolicy Bypass -File scripts/allow-firewall.ps1

$ruleName = "SusuFlow Expo Metro (TCP 8083)"
$port = 8083

$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Firewall rule already exists: $ruleName"
  exit 0
}

New-NetFirewallRule `
  -DisplayName $ruleName `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort $port `
  -Profile Private, Domain

Write-Host "Added inbound firewall rule for TCP port $port."
