---
title: "你是否设想过在浏览器里玩千恋万花"
published: 2025-08-03
description: "傻瓜式web版千恋万花本地部署教程Ciallo～"
image: "./serenbanka-web.webp"
tags: [千恋万花,Ciallo,serenbanka,MySQL]
category: "教程"
draft: false
series: 千恋万花
---

# 傻瓜式web版千恋万花本地部署教程Ciallo～

本项目内容仅供交流学习  
> 该项目原作者仓库  
> https://github.com/zungya/serenbanka-Vue

> 原作者bilibili  
> 【网页开发作业《千恋万花》Web版-哔哩哔哩】 https://b23.tv/VHnku6g

## MySQL 数据库配置

本项目推荐使用 MySQL 5.7.44，经测试 8.x 版本同样兼容。关于 MySQL 的安装方法，可以参考我的另一篇博文，这里不再过多赘述。

### 数据库初始化步骤

#### 1. 将 [MySql备份文件](https://raw.githubusercontent.com/yCENzh/serenbanka-server/main/serenbanka_sql.sql) 下载到当前目录

```bash
wget https://raw.githubusercontent.com/yCENzh/serenbanka-server/main/serenbanka_sql.sql
```

> 💡 提示：如果系统中没有 `wget`，可以使用 `curl -O` 替代

#### 2. 创建数据库

首先确保已安装 MySQL 客户端：

```bash
sudo apt install mysql-client
```

**本地 MySQL（非 Docker）连接方式：**

```bash
mysql -u <USER> -p<PASSWORD> -e "CREATE DATABASE serenbanka;"
```

> 注意：`-p` 后可直接跟密码（无空格），或省略密码进行交互式输入

**远程数据库或 Docker 环境连接方式：**

```bash
mysql -h <HOST> -P <PORT> -u <USER> -p<PASSWORD> -e "CREATE DATABASE serenbanka;"
```

:::note
本地 Docker 环境一般使用 `-h 127.0.0.1` 而非 `localhost`，避免走 Unix socket 导致连接失败，具体host由运行环境决定
:::

#### 3. 导入数据库结构

```bash
mysql -h <HOST> -P <PORT> -u <USER> -p<PASSWORD> serenbanka < serenbanka_sql.sql
```

## 后端服务部署

> 💡 建议：如果前后端都部署在本地，推荐使用 tmux 管理会话
> - 创建会话：`tmux new -s <session-name>`
> - 恢复会话：`tmux attach -t <session-name>`
> - 分离会话：`Ctrl+B` 然后按 `D`

### 使用git clone[后端仓库](https://github.com/yCENzh/serenbanka-server)

```bash
git clone https://github.com/yCENzh/serenbanka-server.git
cd serenbanka-server
```

### 配置与启动

1. **（可选）配置跨域地址**
   
   编辑 `server.js`，将 `origin: 'http://localhost:5173'` 修改为您的前端地址

2. **安装依赖并启动**

```bash
# 安装依赖（仅首次需要）
pnpm install

# 启动服务（默认端口）
pnpm start

# 或指定自定义端口
PORT=3000 pnpm start
```

> ✅ 启动成功标志：控制台显示以下信息后无其他输出
> ```
> Server running on port <端口号>
> Connected to database
> ```

## 前端服务部署

### 使用git clone[前端仓库](https://github.com/yCENzh/serenbanka-client)

```bash
git clone https://github.com/yCENzh/serenbanka-client.git
cd serenbanka-client
```

### 配置与启动

1. **（可选）配置后端地址**
   
   编辑 `vite.config.js`，修改后端 API 地址

2. **安装依赖并启动**

```bash
# 安装依赖
pnpm install

# 启动开发服务器（自定义端口示例：1145）
pnpm dev --host 0.0.0.0 --port 1145
```

> ✅ 启动成功标志：类似如下
> ```
> VITE v5.x.x ready in xxx ms
> ➜  Network: http://0.0.0.0:1145/
> ```

现在可以通过浏览器访问 `http://localhost:1145` 使用应用了。Ciallo～

## 附录：一键启动脚本

为了简化启动流程，可以创建以下脚本：

1. 在项目根目录创建 `start.sh`：

```bash
#!/bin/bash

# 启动后端服务
tmux new-session -d -s backend 'cd serenbanka-server && pnpm start'

# 启动前端服务
tmux new-session -d -s frontend 'cd serenbanka-client && pnpm dev --host 0.0.0.0 --port 1145'

echo "✨ 所有服务已启动 吧"
echo "📌 进入tmux查看后端日志: tmux attach -t backend"
echo "📌 进入tmux查看前端日志: tmux attach -t frontend"
```

2. 赋予执行权限：

```bash
chmod +x start.sh
```

3. 一键启动：

```bash
./start.sh
```

Ciallo～