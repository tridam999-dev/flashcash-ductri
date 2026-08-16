Set-Location $PSScriptRoot
Start-Process "http://localhost:8080"
if (Get-Command py -ErrorAction SilentlyContinue) {
  py -m http.server 8080
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
  python -m http.server 8080
} else {
  Write-Host "Khong tim thay Python. Hay mo truc tiep index.html."
  Read-Host "Nhan Enter de thoat"
}
