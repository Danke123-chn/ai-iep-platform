#Requires -Version 5.1
<#
.SYNOPSIS
  Baota Windows access log daily PV / UV summary

.EXAMPLE
  .\analyze-access-log.ps1
  .\analyze-access-log.ps1 -ReportDate "2026-06-30"
  .\analyze-access-log.ps1 -ExportCsv "C:\BtSoft\wwwlogs\daily-summary.csv"
  .\analyze-access-log.ps1 -ReportDate "2026-06-30" -Detail
#>
[CmdletBinding()]
param(
    [string]$LogPath = "C:\BtSoft\wwwlogs\49.232.129.88.log",
    [string]$ReportDate = "",
    [switch]$Detail,
    [int]$MaxRows,
    [string]$ExportCsv = ""
)

if (-not $PSBoundParameters.ContainsKey("MaxRows") -or $MaxRows -lt 1) {
    $MaxRows = 15
}

$ErrorActionPreference = "Stop"

function Format-Number {
    param([long]$Value)
    return $Value.ToString("N0", [System.Globalization.CultureInfo]::InvariantCulture)
}

function Parse-LogDate {
    param([string]$Token)
    return [datetime]::ParseExact($Token, "dd/MMM/yyyy", [System.Globalization.CultureInfo]::InvariantCulture)
}

function Get-DayKey {
    param([datetime]$Day)
    return $Day.ToString("yyyy-MM-dd")
}

function Test-BotUserAgent {
    param([string]$UserAgent)
    if ([string]::IsNullOrWhiteSpace($UserAgent) -or $UserAgent -eq "-") { return $true }
    return $UserAgent -match '(?i)(bot|spider|crawl|zgrab|nmap|censys|cyberconvoy|internetmeasurement|python-requests|Go-http-client|Hello,\sWorld|compatible;\s*$|scanner|scan|masscan|libwww-perl|curl/|wget/)'
}

if (-not (Test-Path -LiteralPath $LogPath)) {
    Write-Error "Log file not found: $LogPath"
}

$filterDay = $null
if (-not [string]::IsNullOrWhiteSpace($ReportDate)) {
    $filterDay = [datetime]::ParseExact($ReportDate, "yyyy-MM-dd", [System.Globalization.CultureInfo]::InvariantCulture)
}

Write-Host ""
Write-Host "========================================"
Write-Host " Daily PV / UV Summary"
Write-Host "========================================"
Write-Host "Log file : $LogPath"
if ($filterDay) {
    Write-Host ("Filter   : {0}" -f (Get-DayKey $filterDay))
} else {
    Write-Host "Filter   : all days in log"
}
Write-Host ""

$linePattern = '^(?<ip>\S+)\s+\S+\s+\S+\s+\[(?<day>\d{2}/\w{3}/\d{4}):(?<clock>\d{2}:\d{2}:\d{2})[^\]]*\]\s+"(?<method>\S+)\s+(?<path>\S+)\s+[^"]*"\s+(?<status>\d{3})\s+(?<size>\d+|-)\s+"(?<referer>[^"]*)"\s+"(?<ua>[^"]*)"'

$dailyStats = @{}
$skippedLines = 0

Get-Content -LiteralPath $LogPath -Encoding UTF8 -ReadCount 500 | ForEach-Object {
    foreach ($line in $_) {
        $m = [regex]::Match($line, $linePattern)
        if (-not $m.Success) {
            $skippedLines++
            continue
        }

        $dayKey = $null
        try {
            $dayKey = Get-DayKey (Parse-LogDate $m.Groups["day"].Value)
        } catch {
            $skippedLines++
            continue
        }

        if ($filterDay -and $dayKey -ne (Get-DayKey $filterDay)) { continue }

        $ip = $m.Groups["ip"].Value
        if (-not $dailyStats.ContainsKey($dayKey)) {
            $dailyStats[$dayKey] = @{
                PV  = 0
                IPs = @{}
            }
        }

        $dailyStats[$dayKey].PV++
        $dailyStats[$dayKey].IPs[$ip] = $true
    }
}

if ($dailyStats.Count -eq 0) {
    Write-Host "No matching log entries found."
    exit 0
}

$summaryRows = foreach ($entry in ($dailyStats.GetEnumerator() | Sort-Object Name)) {
    [pscustomobject]@{
        Date = $entry.Key
        PV   = $entry.Value.PV
        UV   = $entry.Value.IPs.Count
    }
}

$totalPv = ($summaryRows | Measure-Object -Property PV -Sum).Sum

Write-Host ("{0,-12} {1,10} {2,10}" -f "Date", "PV", "UV")
Write-Host ("{0,-12} {1,10} {2,10}" -f "------------", "----------", "----------")

foreach ($row in $summaryRows) {
    Write-Host ("{0,-12} {1,10} {2,10}" -f $row.Date, (Format-Number $row.PV), (Format-Number $row.UV))
}

Write-Host ("{0,-12} {1,10} {2,10}" -f "------------", "----------", "----------")
if ($summaryRows.Count -gt 1) {
    Write-Host ("{0,-12} {1,10} {2,10}" -f "TOTAL", (Format-Number $totalPv), "-")
} else {
    Write-Host ""
    Write-Host ("Day PV: {0}   UV: {1}" -f (Format-Number $summaryRows[0].PV), (Format-Number $summaryRows[0].UV))
}
Write-Host ""
Write-Host ("Skipped lines: {0}" -f (Format-Number $skippedLines))
Write-Host ""

if ($ExportCsv) {
    $summaryRows | Export-Csv -LiteralPath $ExportCsv -NoTypeInformation -Encoding UTF8
    Write-Host ("CSV exported: {0}" -f $ExportCsv)
    Write-Host ""
}

if (-not $Detail) {
    Write-Host "Done."
    Write-Host ""
    return
}

$detailDayKey = if ($filterDay) {
    Get-DayKey $filterDay
} else {
    ($dailyStats.Keys | Sort-Object | Select-Object -Last 1)
}

$ipStats = @{}
$pathStats = @{}

Get-Content -LiteralPath $LogPath -Encoding UTF8 -ReadCount 500 | ForEach-Object {
    foreach ($line in $_) {
        $m = [regex]::Match($line, $linePattern)
        if (-not $m.Success) { continue }

        $dayKey = Get-DayKey (Parse-LogDate $m.Groups["day"].Value)
        if ($dayKey -ne $detailDayKey) { continue }

        $ip = $m.Groups["ip"].Value
        $path = $m.Groups["path"].Value
        $ua = $m.Groups["ua"].Value

        if (-not $ipStats.ContainsKey($ip)) {
            $ipStats[$ip] = [ordered]@{ Count = 0; Bot = $false }
        }
        $ipStats[$ip].Count++
        if (Test-BotUserAgent $ua) { $ipStats[$ip].Bot = $true }

        if (-not $pathStats.ContainsKey($path)) { $pathStats[$path] = 0 }
        $pathStats[$path]++
    }
}

Write-Host ("---- Detail: {0} ----" -f $detailDayKey)
Write-Host ("Top {0} paths" -f $MaxRows)
$pathStats.GetEnumerator() |
    Sort-Object Value -Descending |
    Select-Object -First $MaxRows |
    ForEach-Object {
        Write-Host ("  {0,6}  {1}" -f (Format-Number $_.Value), $_.Key)
    }
Write-Host ""

Write-Host ("Top {0} IPs" -f $MaxRows)
$ipStats.GetEnumerator() |
    Sort-Object { $_.Value.Count } -Descending |
    Select-Object -First $MaxRows |
    ForEach-Object {
        $tag = if ($_.Value.Bot) { "[BOT]" } else { "[USR]" }
        Write-Host ("  {0,6}  {1,-18} {2}" -f (Format-Number $_.Value.Count), $_.Key, $tag)
    }
Write-Host ""

Write-Host "Done."
Write-Host ""
