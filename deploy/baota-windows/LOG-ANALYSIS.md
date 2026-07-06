# 宝塔 Windows 访问日志 - 每日 PV / UV 汇总

默认日志路径：`C:\BtSoft\wwwlogs\49.232.129.88.log`

## 快速使用

```powershell
# 汇总日志中所有日期的 PV / UV
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\wwwroot\49.232.129.88\scripts\analyze-access-log.ps1"

# 只看某一天
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\wwwroot\49.232.129.88\scripts\analyze-access-log.ps1" -ReportDate "2026-06-30"

# 导出每日汇总 CSV
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\wwwroot\49.232.129.88\scripts\analyze-access-log.ps1" -ExportCsv "C:\BtSoft\wwwlogs\daily-summary.csv"
```

## 输出示例

```
Date                 PV         UV
------------ ---------- ----------
2026-06-29          3          2
2026-06-30          2          2
------------ ---------- ----------
TOTAL               5          -
```

- **PV**：当天总请求数
- **UV**：当天独立 IP 数

## 可选：查看明细

需要 Top 路径、Top IP 时加 `-Detail`：

```powershell
powershell -File analyze-access-log.ps1 -ReportDate "2026-06-30" -Detail
```

## 计划任务（每日汇总）

```powershell
$out = "C:\BtSoft\wwwlogs\daily-summary.csv"
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\wwwroot\49.232.129.88\scripts\analyze-access-log.ps1" -ExportCsv $out
```
