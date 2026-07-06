# 腾讯云部署指南（轻量应用服务器）

适用于 **Next.js 全栈应用**（SSR + API Routes），国内访问稳定。

## 一、购买腾讯云轻量服务器

1. 打开 [腾讯云轻量应用服务器](https://cloud.tencent.com/product/lighthouse)
2. 推荐配置：
   - **地域**：上海 / 广州 / 北京（离用户近即可）
   - **镜像**：Ubuntu 22.04 LTS
   - **套餐**：2核 2GB 内存起（够用）
3. 购买后在控制台记下 **公网 IP**
4. 在 **防火墙** 中放行端口：**22、80、443**

## 二、SSH 登录服务器

Windows PowerShell：

```powershell
ssh root@你的公网IP
```

首次登录按提示输入密码（控制台可重置密码）。

## 三、一键初始化服务器（仅首次）

```bash
git clone https://github.com/Danke123-chn/ai-iep-platform.git /var/www/ai-iep-platform
cd /var/www/ai-iep-platform
bash deploy/tencent-cloud/setup-server.sh
```

## 四、配置环境变量

```bash
cd /var/www/ai-iep-platform
cp deploy/tencent-cloud/env.production.example .env.production
nano .env.production
```

填入与本地 `.env.local` 相同的值：

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_CLOUDBASE_ENV_ID` | CloudBase PG 环境 ID |
| `NEXT_PUBLIC_CLOUDBASE_PUBLISHABLE_KEY` | CloudBase Publishable Key（身份认证 → API Key） |
| `DEEPSEEK_API_KEY` | DeepSeek API Key |

保存：`Ctrl+O` → 回车 → `Ctrl+X`

## 五、构建并启动应用

```bash
cd /var/www/ai-iep-platform
bash deploy/tencent-cloud/deploy-app.sh
```

成功后应用运行在 `http://127.0.0.1:3000`（仅服务器内部）。

## 六、配置 Nginx 反向代理

### 方式 A：仅用 IP 访问（测试用）

```bash
cd /var/www/ai-iep-platform
sudo bash deploy/tencent-cloud/setup-nginx.sh
```

浏览器访问：`http://你的公网IP`

### 方式 B：绑定域名（推荐）

1. 在域名 DNS 添加 **A 记录** 指向服务器公网 IP
2. 配置 nginx：

```bash
cd /var/www/ai-iep-platform
sudo bash deploy/tencent-cloud/setup-nginx.sh app.example.com
```

3. 申请免费 HTTPS（Let's Encrypt）：

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.example.com
```

## 七、配置 CloudBase 安全域名

CloudBase 控制台 → **环境配置** → **安全来源** → **安全域名**，添加：

- `localhost:3000`（本地开发）
- `你的公网IP` 或 `app.example.com`（生产访问域名，不含协议）

并在 **身份认证 → 登录方式** 中启用 **短信验证码登录**（上海地域环境）。

> 若使用与本地相同的 CloudBase 环境，数据库迁移通常已在本地执行过，无需在服务器重复跑。若生产环境是独立 CloudBase 实例，在服务器执行一次：`npm run cloudbase:migrate`。

## 八、后续更新代码

本地改完代码并 push 到 GitHub 后，在服务器执行：

```bash
cd /var/www/ai-iep-platform
git pull origin main
bash deploy/tencent-cloud/deploy-app.sh
```

## 常用运维命令

```bash
pm2 status                    # 查看进程状态
pm2 logs ai-iep-platform      # 查看日志
pm2 restart ai-iep-platform   # 重启应用
sudo systemctl status nginx   # 查看 Nginx 状态
```

## 故障排查

| 现象 | 处理 |
|------|------|
| 浏览器无法打开 | 检查腾讯云防火墙是否放行 80/443 |
| 502 Bad Gateway | `pm2 status` 确认应用在运行；`pm2 logs` 看报错 |
| 登录失败 | 检查 `.env.production`；CloudBase 控制台 → 安全域名是否已添加服务器 IP 或域名 |
| 上传报告失败 | Nginx `client_max_body_size` 已为 20m；检查 CloudBase 与 DeepSeek API Key |
| 构建内存不足 | 升级套餐到 4GB，或 `setup-server.sh` 已自动添加 2GB swap |

## 与 Vercel 的区别

- 腾讯云自行维护服务器（系统更新、SSL 续期）
- 无 `maxDuration`  Hobby 限制，API 最长可跑 300s（可在代码中调整）
- 国内访问速度明显优于 Vercel 免费域名
