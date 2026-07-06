# 宝塔 Windows 部署 / 更新全流程

服务器：`49.232.129.88`  
代码目录：`C:\wwwroot\49.232.129.88`  
Node：`C:\BtSoft\nodejs\v20.20.2`  
访问：`http://49.232.129.88`（HTTP，无 HTTPS）

---

## 架构

```
浏览器 http://49.232.129.88:80
  → Nginx 反向代理（网站目录为空文件夹）
  → http://127.0.0.1:3000
  → PM2 运行 .next\standalone\server.js
  → CloudBase（浏览器 SDK 登录/短信）
```

---

## 一、首次配置（只做一次）

### 1.1 环境变量

```cmd
copy deploy\tencent-cloud\env.production.example .env.production
```

编辑 `C:\wwwroot\49.232.129.88\.env.production`：

```env
NEXT_PUBLIC_CLOUDBASE_ENV_ID=你的环境ID
NEXT_PUBLIC_CLOUDBASE_PUBLISHABLE_KEY=你的PublishableKey
DEEPSEEK_API_KEY=sk-你的Key

# HTTP 访问不要设为 true；上 HTTPS 后再加这一行
# COOKIE_SECURE=true
```

> `NEXT_PUBLIC_*` 必须在 **npm run build 之前** 写好，否则前端 CloudBase 报错。

### 1.2 空网站目录

新建空文件夹：

```
C:\wwwroot\49.232.129.88-proxy
```

### 1.3 Nginx 网站配置

宝塔 → 网站 → `49.232.129.88` → 配置文件  
**整段替换** 为 `deploy/baota-windows/nginx-vhost.conf` 内容。

删除旧片段（若存在）：

```
C:\BtSoft\nginx\conf\vhost\proxy\49.232.129.88\*
C:\BtSoft\nginx\conf\vhost\static_cache\49.232.129.88\*
```

### 1.4 CloudBase 跨域（登录必配）

控制台 → 跨域设置 → 添加域名（**不能填裸 IP**，任选其一）：

- 自有域名：`iep.example.com`（DNS A 记录 → `49.232.129.88`）
- 临时测试：`49.232.129.88.nip.io`（宝塔 server_name 也要加）

身份认证 → 登录方式：开启 **手机号密码** + **短信验证码**。

### 1.5 不要用宝塔 PM2 管理器

只用终端 PM2 或 `redeploy.bat`，避免 cluster / 旧配置。

---

## 二、完整更新流程（每次改代码后）

### 步骤 0：本地 push（在你电脑上）

```powershell
cd C:\Users\www22\ai-iep-platform
git add .
git commit -m "your message"
git push origin main
```

GitHub 连不上时：打包代码（不含 `node_modules`、`.next`）上传到服务器覆盖，**保留** `.env.production`。

---

### 步骤 1：宝塔面板（释放文件锁）

1. **网站** → `49.232.129.88` → **停止**
2. **软件商店** → **Nginx** → **停止**

---

### 步骤 2：PowerShell 一键部署

宝塔 → 终端 → **PowerShell**，执行：

```powershell
$env:PATH = "C:\Windows\System32;C:\Windows;C:\Program Files\Git\bin;C:\BtSoft\nodejs\v20.20.2;C:\BtSoft\pm2;" + $env:PATH
Set-Location C:\wwwroot\49.232.129.88

# 拉代码（失败可跳过，改用手动上传）
git pull origin main

# 停进程
if (Test-Path "C:\BtSoft\nginx\nginx.exe") { & C:\BtSoft\nginx\nginx.exe -s stop 2>$null }
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
pm2 delete all 2>$null; pm2 kill 2>$null
Start-Sleep -Seconds 5

# 备份旧构建
if (Test-Path .next) {
  Rename-Item .next ".next.bak.$(Get-Date -Format 'yyyyMMddHHmmss')" -ErrorAction SilentlyContinue
}

# 构建（NEXT_PUBLIC_* 从 .env.production 自动读取）
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "BUILD FAILED"; exit 1 }

# 准备 standalone
Copy-Item -Recurse -Force public .next\standalone\public
New-Item -ItemType Directory -Force -Path .next\standalone\.next | Out-Null
Copy-Item -Recurse -Force .next\static .next\standalone\.next\static
Copy-Item -Force .env.production .next\standalone\.env.production

# 启动 PM2
$env:APP_DIR = "C:\wwwroot\49.232.129.88"
pm2 start deploy\tencent-cloud\ecosystem.config.cjs
pm2 save

# 启动 Nginx
if (Test-Path "C:\BtSoft\nginx\nginx.exe") { Start-Process "C:\BtSoft\nginx\nginx.exe" }

pm2 status
```

`ren .next` 失败 → **重启服务器** 后从 `# 备份旧构建` 重做。

---

### 步骤 3：宝塔恢复

1. **Nginx** → **启动**
2. **网站** → **启动**

---

### 步骤 4：服务器验证

PowerShell 一行一行：

```powershell
$r = Invoke-WebRequest 'http://49.232.129.88/auth/login' -UseBasicParsing
Write-Host "StatusCode:" $r.StatusCode
Write-Host "turbopack:" $r.Content.Contains('turbopack')
Write-Host "tel-national:" $r.Content.Contains('tel-national')
Write-Host "you@example.com:" $r.Content.Contains('you@example.com')
```

预期：

```
StatusCode: 200
turbopack: False
tel-national: True
you@example.com: False
```

```powershell
Test-Path C:\wwwroot\49.232.129.88\.next\standalone\server.js
pm2 show ai-iep-platform
```

script path 必须是 `...\standalone\server.js`。

---

### 步骤 5：浏览器验证

1. **Ctrl+Shift+Delete** 清除 `49.232.129.88` 站点数据
2. 无痕打开：`http://49.232.129.88/auth/login`
3. 确认：**手机号 + 密码登录/验证码登录** Tab
4. **验证码登录** 或 **密码登录** → 应跳转 `/dashboard`
5. **F12 → Application → Cookies** → 有 `cloudbase_session`

Network 里 **不应有** `turbopack-*.js`。

---

## 三、关键修复说明（本次更新）

| 问题 | 修复 |
|------|------|
| 验证码/密码登录后不跳转 | HTTP 下 Cookie 不能 `secure:true`；用 `COOKIE_SECURE` 环境变量 |
| 旧邮箱登录页 | 重新 build + Nginx 去掉 static_cache |
| CloudBase 红字 | `.env.production` 填真实值 + rebuild |
| 跨域 / 登录失败 | 跨域设置加 **域名**（非裸 IP） |

---

## 四、常用命令

```cmd
pm2 status
pm2 logs ai-iep-platform --lines 50
pm2 restart ai-iep-platform
```

---

## 五、上 HTTPS 后

1. 宝塔申请 SSL，开启 HTTPS
2. `.env.production` 加：`COOKIE_SECURE=true`
3. 重新执行 **第二节完整更新流程**
4. CloudBase 跨域添加你的 HTTPS 域名

---

## 六、故障速查

| 现象 | 处理 |
|------|------|
| EBUSY build 失败 | 停 Nginx/PM2/Node，或重启服务器 |
| turbopack 在 Network | 删 static_cache，Nginx 整站代理 |
| 登录不跳转 | 确认未设 `COOKIE_SECURE=true`（HTTP） |
| 验证码发不出 | CloudBase 跨域 + 短信登录已开启 |
| git pull 失败 | 本地上传代码后 rebuild |
