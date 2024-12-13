$processName = "main" #entre parentesis va el nombre del archivo .exe
$pathToExe = "C:\Users\jasc1\OneDrive\Escritorio\dist\main.exe"

while ($true) {
    # Verifica si el proceso está en ejecución
    if (-not (Get-Process -Name $processName -ErrorAction SilentlyContinue)) {
        Start-Process $pathToExe
        Write-Output "$(Get-Date): $processName reiniciado." | Out-File -Append MonitorLog.txt
    }
    Start-Sleep -Seconds 2 # Tiempo entre chequeos
}
