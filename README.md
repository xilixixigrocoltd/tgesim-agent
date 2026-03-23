# tgesim Agent Portal

代理商后台管理系统，基于 Next.js 14 + Supabase 构建。

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS（Pages Router）
- **数据库**: Supabase（PostgreSQL）
- **认证**: 自定义 JWT（bcryptjs + jsonwebtoken）
- **部署**: Vercel

## 功能

### 代理商功能
- 邀请码注册、邮箱登录
- 查看账户余额
- USDT 充值申请（TRC20）
- 浏览 tgesim 产品列表
- 下单购买 eSIM（自动发货）
- 查看订单历史和 eSIM 激活码
- 余额流水记录
- 查看个人 API Key

### 管理员功能（/admin）
- 代理商注册审核
- 充值记录确认/拒绝
- 邀请码生成管理
- 数据总览

## 快速开始

### 1. 创建 Supabase 项目

1. 前往 [supabase.com](https://supabase.com) 创建免费项目
2. 在 SQL Editor 运行 `supabase/schema.sql`
3. 获取项目 URL 和 API Keys

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=your-random-secret-key-here
```

### 3. 创建管理员账号

在 Supabase SQL Editor 运行：

```sql
-- 先生成密码 hash（在本地运行）
-- node -e "const b=require('bcryptjs'); b.hash('yourpassword',12).then(console.log)"

INSERT INTO agents (email, password_hash, name, role, status) 
VALUES ('admin@tgesim.com', '生成的hash', 'Admin', 'admin', 'active');
```

### 4. 安装依赖并运行

```bash
npm install
npm run dev
```

### 5. 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

在 Vercel 项目设置中配置相同的环境变量。

## 项目结构

```
tgesim-agent/
├── pages/
│   ├── index.tsx          # 首页（跳转）
│   ├── login.tsx          # 登录
│   ├── register.tsx       # 注册（需邀请码）
│   ├── pending.tsx        # 等待审核
│   ├── dashboard.tsx      # 代理商首页
│   ├── products.tsx       # 产品列表
│   ├── orders.tsx         # 我的订单
│   ├── recharge.tsx       # 充值
│   ├── balance.tsx        # 余额记录
│   ├── profile.tsx        # 个人资料
│   └── admin/
│       ├── index.tsx      # 管理总览
│       ├── agents.tsx     # 代理商管理
│       ├── recharges.tsx  # 充值审核
│       └── invites.tsx    # 邀请码管理
├── lib/
│   ├── supabase.ts        # Supabase 客户端
│   ├── tgesim-api.ts      # tgesim API 封装
│   ├── auth.ts            # 认证逻辑（JWT）
│   └── middleware.ts      # 路由保护
├── components/
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── supabase/
│   └── schema.sql         # 数据库建表语句
└── .env.example           # 环境变量模板
```

## tgesim API

API 配置在 `lib/tgesim-api.ts`，使用 HMAC-SHA256 签名：

```
Base URL: https://api.xigrocoltd.com
API Key: ak_95d86e46bd2628dd253b0b15d5aab1d97998787d
```

## USDT 收款地址

```
TBuhpRpFPV1HkdfaPEdxsKgTE43jV911rL（TRC20）
```
