# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hollow — 个人摄影作品集网站。Next.js 16 App Router 全栈应用，包含公开的照片浏览前端和受保护的管理后台。

## Commands

```bash
npm run dev          # 开发服务器 (localhost:3000)
npm run build        # 生产构建
npm run start        # 生产运行
npm run lint         # ESLint 检查
npx prisma migrate dev --name <name>   # 创建 migration
npx prisma migrate deploy              # 部署 migration
npx prisma generate                    # 生成 Prisma Client
npx prisma studio                      # 数据库可视化管理
```

## Architecture

**Stack**: Next.js 16 (App Router, RSC) + Prisma 7 + SQLite (libsql) + NextAuth v5 (beta) + Tailwind CSS 4 + shadcn/ui (base-nova)

**数据库**: SQLite via `@prisma/adapter-libsql`。开发用 `prisma/dev.db`，生产用 `data/prod.db`（Docker volume）。Prisma 单例模式防止 dev 热重载连接泄漏（`src/lib/db.ts`）。

**认证**: NextAuth v5 Credentials Provider，管理员账号由环境变量 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 控制，JWT session（1h 过期），登录页 `/login`。写操作统一通过 `auth()` 校验 session。

**路由结构**:
- `/` — 照片瀑布流首页，支持搜索（`?q=`）
- `/categories` — 分类列表
- `/category/[slug]` — 分类详情
- `/photo/[id]` — 照片详情
- `/login` — 登录页
- `/admin/**` — 管理后台（layout 层 `auth()` 守卫，未登录重定向 `/login`）
- `/api/upload` — 文件上传（SHA256 去重，sharp 缩略图 800px，EXIF 方向修正）
- `/api/photos` / `/api/categories` / `/api/slogans` — CRUD API

**文件上传**: 图片存 `public/uploads/`（gitignored），上传时自动生成缩略图（`-thumb` 后缀），用 sharp 做 EXIF 方向旋转和缩放。SVG 不做处理。`fileHash` 字段做 SHA256 去重。

**Path alias**: `@/*` → `./src/*`

**Prisma 生成的客户端**: `src/generated/prisma`（gitignored），修改 schema 后必须 `npx prisma generate`。

## Key Conventions

- 管理后台 API 的写操作（POST/PUT/DELETE）都需要 `auth()` 校验
- 数据模型使用 `@@map` 做表名映射（categories/slogans/photos）
- Photo 的 `tags` 字段存 JSON string，读写时需要 `JSON.parse` / `JSON.stringify`
- Category 的 `slug` 自动从 name 生成（小写+连字符）
- Slogan API 的 GET 随机返回一条活跃 slogan
- 首页照片按 `sort ASC, createdAt DESC` 排序，只显示 `isPublic: true`

## Deployment

Docker 部署（`docker-compose.yml`）：node:24-alpine，构建时 `npm ci` + `prisma generate` + `npm run build`，运行时 `npm start`。数据持久化通过 volume（`./data` + `./public/uploads`）。

## Environment Variables

| 变量 | 用途 |
|------|------|
| `DATABASE_URL` | SQLite 文件路径（默认 `file:./dev.db`） |
| `AUTH_SECRET` | NextAuth JWT 签名密钥 |
| `NEXTAUTH_URL` | 站点 URL |
| `ADMIN_EMAIL` | 管理员登录邮箱 |
| `ADMIN_PASSWORD` | 管理员登录密码 |
