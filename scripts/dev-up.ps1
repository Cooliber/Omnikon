Param()

if (-Not (Test-Path .env)) {
  Write-Host "[info] Brak pliku .env – kopiuję .env.example"
  Copy-Item .env.example .env
}

Write-Host "[info] Buduję obrazy i uruchamiam stack..."
docker compose up -d --build

Write-Host "[info] Oczekiwanie na zdrowe usługi..."
$services = @('research-proxy','convex-mock','raynet-adapter','frontend')
foreach ($svc in $services) {
  Write-Host " - $svc"
  for ($i=0; $i -lt 60; $i++) {
    $container = docker ps -qf "name=$svc"
    if ($container) {
      $health = docker inspect --format='{{json .State.Health.Status}}' $container 2>$null
      if ($health -and $health.Contains('healthy')) { Write-Host " ...healthy"; break }
      if (-not $health) {
        $state = docker inspect --format='{{.State.Status}}' $container 2>$null
        if ($state -eq 'running') { Write-Host " ...running"; break }
      }
    }
    Start-Sleep -Seconds 2
    Write-Host -NoNewline "."
  }
}

Write-Host "[ok] Środowisko działa. Frontend: http://localhost:5173"

