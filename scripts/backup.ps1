$sourceDir = "D:\Mundo IA\Antigravity\Web_1"
$backupName = "Web_1_Backup_$(Get-Date -Format 'yyyyMMdd_HHmm')"
$zipPath = "D:\Mundo IA\Antigravity\$backupName.zip"
$tempPath = "D:\Mundo IA\Antigravity\TempBackup"

if (Test-Path $tempPath) { Remove-Item -Recurse -Force $tempPath }
New-Item -ItemType Directory -Path $tempPath

# Copy only relevant folders/files
Copy-Item "$sourceDir\src" -Destination "$tempPath\src" -Recurse
Copy-Item "$sourceDir\public" -Destination "$tempPath\public" -Recurse
Copy-Item "$sourceDir\package.json" -Destination "$tempPath\"
Copy-Item "$sourceDir\package-lock.json" -Destination "$tempPath\"
Copy-Item "$sourceDir\next.config.ts" -Destination "$tempPath\"
Copy-Item "$sourceDir\tsconfig.json" -Destination "$tempPath\"
Copy-Item "$sourceDir\tailwind.config.js" -Destination "$tempPath\" 2>$null
Copy-Item "$sourceDir\postcss.config.mjs" -Destination "$tempPath\" 2>$null

Compress-Archive -Path "$tempPath\*" -DestinationPath $zipPath -Force
Remove-Item -Recurse -Force $tempPath

Write-Output "Backup created: $zipPath"
