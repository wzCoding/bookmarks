# Services 模块调用参考手册

> 本文档涵盖 `services/` 目录下所有对外公开的方法，包含签名、参数说明、返回值、代码示例以及源码跳转链接。

---

## 目录

- [文件结构](#文件结构)
- [快速开始：典型场景](#快速开始典型场景)
- [index.ts — AgentClient（鉴权通信）](#indexts--agentclient鉴权通信)
  - [工厂函数](#工厂函数)
  - [AgentClient 实例方法](#agentclient-实例方法)
- [snapshot.ts — ScreenshotManager（截图业务）](#snapshotts--screenshotmanager截图业务)
  - [工厂函数](#工厂函数-1)
  - [ScreenshotManager 实例方法](#screenshotmanager-实例方法)
- [类型参考](#类型参考)

---

## 文件结构

```
services/
├── index.ts      # AgentClient — HTTP 鉴权通信客户端
├── snapshot.ts   # ScreenshotManager — 书签截图业务管理
└── README.md     # 本文档
```

---

## 快速开始：典型场景

### 场景 1：检测 Agent 是否在线

```ts
import { checkAgentOnline } from '@/services'

const online = await checkAgentOnline()
if (online) {
  console.log('Agent 服务正常')
}
```

### 场景 2：对书签链接截图

```ts
import { screenshotBookmark } from '@/services/snapshot'

const task = await screenshotBookmark('https://example.com')
if (task.status === 'done') {
  console.log('截图成功:', task.result?.filePath)
} else if (task.status === 'error') {
  console.error('截图失败:', task.error)
}
```

### 场景 3：读取截图缓存

```ts
import { getBookmarkScreenshot } from '@/services/snapshot'

const cached = await getBookmarkScreenshot('https://example.com')
if (cached) {
  console.log('已有缓存截图，创建于:', cached.createdAt)
}
```

### 场景 4：自定义 Agent 地址

```ts
import { AgentClient } from '@/services'

const client = new AgentClient({
  baseUrl: 'http://192.168.1.100:3789',
  timeout: 30000,
})
const online = await client.isAgentOnline()
```

---

## index.ts — AgentClient（鉴权通信）

源码：[`./index.ts`](./index.ts)

### 工厂函数

---

#### `getAgentClient()`

> 获取全局单例 `AgentClient` 实例。首次调用自动创建，后续调用复用同一实例。

| 项目 | 内容 |
|------|------|
| **签名** | `function getAgentClient(): AgentClient` |
| **参数** | 无 |
| **返回值** | `AgentClient` — 全局单例客户端 |
| **源码** | [`./index.ts`](./index.ts) |

```ts
import { getAgentClient } from '@/services'

const client = getAgentClient()
const online = await client.isAgentOnline()
```

---

#### `checkAgentOnline(baseUrl?)`

> 快速检测 Agent 服务是否在线（独立使用，无需持有 `AgentClient` 实例）。

| 项目 | 内容 |
|------|------|
| **签名** | `function checkAgentOnline(baseUrl?: string): Promise<boolean>` |
| **参数** | `baseUrl` — 可选，Agent 服务地址，默认 `http://127.0.0.1:3789` |
| **返回值** | `true` 表示 Agent 可达，`false` 表示离线或超时 |
| **源码** | [`./index.ts`](./index.ts) |

```ts
import { checkAgentOnline } from '@/services'

if (await checkAgentOnline()) {
  // Agent 在线，可以执行截图等操作
}
```

---

### AgentClient 实例方法

#### `new AgentClient(config?)`

> 创建 `AgentClient` 实例。

| 项目 | 内容 |
|------|------|
| **签名** | `constructor(config?: Partial<AgentConfig>)` |
| **参数** | `config.baseUrl` — Agent 地址，默认 `http://127.0.0.1:3789` |
|  | `config.timeout` — 请求超时（毫秒），默认 `15000` |
| **源码** | [`./index.ts`](./index.ts) |

---

#### `client.getConfig()`

> 获取当前配置（返回副本，修改不影响实例）。

| 项目 | 内容 |
|------|------|
| **签名** | `getConfig(): AgentConfig` |
| **返回值** | `{ baseUrl: string, timeout: number }` |
| **源码** | [`./index.ts`](./index.ts) |

---

#### `client.updateConfig(partial)`

> 更新部分配置，未传入的字段保持不变。

| 项目 | 内容 |
|------|------|
| **签名** | `updateConfig(partial: Partial<AgentConfig>): void` |
| **参数** | `partial.baseUrl?` / `partial.timeout?` |
| **源码** | [`./index.ts`](./index.ts) |

```ts
client.updateConfig({ timeout: 30000 })
```

---

#### `client.ensureAuth()`

> 确保已通过 Agent JWT 认证。自动处理 token 加载 → 过期判断 → 刷新 → 重新认证。**大多数情况下无需手动调用**，`requestScreenshot` / `listSnapshots` 等方法内部会自动调用。

| 项目 | 内容 |
|------|------|
| **签名** | `ensureAuth(): Promise<void>` |
| **异常** | 网络不通、Agent 未启动、认证响应异常时抛出 |
| **源码** | [`./index.ts`](./index.ts) |

```ts
await client.ensureAuth()
console.log('认证就绪，可以调用 API')
```

---

#### `client.revokeAuth()`

> 撤销当前 token，断开与 Agent 的连接（主动登出）。

| 项目 | 内容 |
|------|------|
| **签名** | `revokeAuth(): Promise<boolean>` |
| **返回值** | `true` 撤销成功；`false` 无可撤销的 token |
| **源码** | [`./index.ts`](./index.ts) |

```ts
const revoked = await client.revokeAuth()
// 撤销后客户端恢复未认证状态
```

---

#### `client.authenticatedRequest<T>(path, options?, retryOnAuthError?)`

> 发起带 Bearer Token 的 HTTP 请求。内置 401 自动重试（刷新 token）。

| 项目 | 内容 |
|------|------|
| **签名** | `authenticatedRequest<T>(path: string, options?: RequestInit, retryOnAuthError?: boolean): Promise<T>` |
| **参数** | `path` — API 路径，如 `/snapshot` |
|  | `options` — 标准 `fetch` 配置（method / body / headers） |
|  | `retryOnAuthError` — 遇 401 是否自动刷新重试，默认 `true` |
| **源码** | [`./index.ts`](./index.ts) |

```ts
// 直接调用任意 Agent API
const data = await client.authenticatedRequest<{ foo: string }>('/some-custom-endpoint', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' }),
})
```

---

#### `client.requestScreenshot(params)`

> 请求 Agent 对指定 URL 截图。对应 Agent `POST /snapshot`。

| 项目 | 内容 |
|------|------|
| **签名** | `requestScreenshot(params: SnapshotRequest): Promise<SnapshotResponse>` |
| **参数** | `params.url` — 目标网页 URL（必填，需 http/https） |
|  | `params.fullPage` — 是否全页截图，默认 `true` |
| **返回值** | `SnapshotResponse` — `{ success, path, url, createdAt, record }` |
| **异常** | URL 为空、网络错误、Agent 截图失败 |
| **源码** | [`./index.ts`](./index.ts) |

```ts
const resp = await client.requestScreenshot({
  url: 'https://example.com',
  fullPage: true,
})
console.log('截图保存至:', resp.path)
console.log('记录 ID:', resp.record.id)
```

---

#### `client.listSnapshots(options?)`

> 查询历史截图记录（分页）。对应 Agent `GET /snapshots`。

| 项目 | 内容 |
|------|------|
| **签名** | `listSnapshots(options?: { url?, page?, pageSize? }): Promise<SnapshotListResponse>` |
| **参数** | `options.url` — 按 URL 筛选（可选） |
|  | `options.page` — 页码，默认 `1` |
|  | `options.pageSize` — 每页条数，默认 `20`，最大 `100` |
| **返回值** | `SnapshotListResponse` — `{ success, data: SnapshotRecord[], total, page, pageSize }` |
| **源码** | [`./index.ts`](./index.ts) |

```ts
// 查询全部（分页）
const { data, total } = await client.listSnapshots({ page: 1, pageSize: 10 })

// 按 URL 查询
const { data } = await client.listSnapshots({ url: 'https://example.com' })
data.forEach(r => console.log(r.imagePath, r.createdAt))
```

---

#### `client.healthCheck()`

> 调用 Agent 健康检查接口。**无需鉴权**。对应 Agent `GET /health`。

| 项目 | 内容 |
|------|------|
| **签名** | `healthCheck(): Promise<HealthResponse>` |
| **返回值** | `HealthResponse` — `{ status, version, activePages, maxPages, uptime }` |
| **异常** | Agent 不可达或响应异常 |
| **源码** | [`./index.ts`](./index.ts) |

---

#### `client.isAgentOnline()`

> 快速检测 Agent 是否在线（封装 `healthCheck`，吞异常）。

| 项目 | 内容 |
|------|------|
| **签名** | `isAgentOnline(): Promise<boolean>` |
| **返回值** | `true` 在线；`false` 离线 |
| **源码** | [`./index.ts`](./index.ts) |

```ts
if (await client.isAgentOnline()) {
  await client.requestScreenshot({ url: 'https://example.com' })
}
```

---

## snapshot.ts — ScreenshotManager（截图业务）

源码：[`./snapshot.ts`](./snapshot.ts)

> 在 `AgentClient` 基础上封装了缓存、去重、批量等业务逻辑。**推荐优先使用本模块的便捷函数。**

### 工厂函数

---

#### `getScreenshotManager()`

> 获取全局单例 `ScreenshotManager` 实例。首次调用自动创建并异步加载缓存。

| 项目 | 内容 |
|------|------|
| **签名** | `function getScreenshotManager(): ScreenshotManager` |
| **返回值** | `ScreenshotManager` 单例 |
| **源码** | [`./snapshot.ts`](./snapshot.ts) |

---

#### `screenshotBookmark(url, options?)`

> **最常用入口**：对书签链接截图（使用默认管理器）。

| 项目 | 内容 |
|------|------|
| **签名** | `function screenshotBookmark(url: string, options?: { force?, fullPage? }): Promise<ScreenshotTask>` |
| **参数** | `url` — 书签 URL |
|  | `options.force` — 强制重新截图（忽略当天缓存），默认 `false` |
|  | `options.fullPage` — 全页截图，默认 `true` |
| **返回值** | `ScreenshotTask` — 任务状态对象 |
| **源码** | [`./snapshot.ts`](./snapshot.ts) |

```ts
import { screenshotBookmark } from '@/services/snapshot'

const task = await screenshotBookmark('https://example.com', { force: true })

// task.status 可能的值：
//   'done'      → task.result 中有截图数据
//   'capturing' → 正在截图（并发去重，返回已有任务）
//   'error'     → task.error 中有错误信息
```

---

#### `getBookmarkScreenshot(url)`

> 从缓存中读取书签截图（不发起新请求）。

| 项目 | 内容 |
|------|------|
| **签名** | `function getBookmarkScreenshot(url: string): Promise<ScreenshotResult | null>` |
| **返回值** | 缓存的截图结果，无缓存返回 `null` |
| **源码** | [`./snapshot.ts`](./snapshot.ts) |

```ts
import { getBookmarkScreenshot } from '@/services/snapshot'

const cached = await getBookmarkScreenshot('https://example.com')
if (cached) {
  // 显示缓存的截图
  console.log(cached.filePath, cached.createdAt)
}
```

---

### ScreenshotManager 实例方法

#### `new ScreenshotManager(client?)`

> 创建截图管理器。可传入自定义 `AgentClient`。

| 项目 | 内容 |
|------|------|
| **签名** | `constructor(client?: AgentClient)` |
| **参数** | `client` — 可选，自定义客户端；默认使用 `getAgentClient()` |
| **源码** | [`./snapshot.ts`](./snapshot.ts) |

---

#### `manager.getClient()`

> 获取内部持有的 `AgentClient` 实例。

| 项目 | 内容 |
|------|------|
| **签名** | `getClient(): AgentClient` |
| **源码** | [`./snapshot.ts`](./snapshot.ts) |

---

#### `manager.loadCache()`

> 从 `chrome.storage.local` 加载截图缓存到内存。`getScreenshotManager()` 会自动调用，一般无需手动调用。

| 项目 | 内容 |
|------|------|
| **签名** | `loadCache(): Promise<void>` |
| **源码** | [`./snapshot.ts`](./snapshot.ts) |

---

#### `manager.getCachedScreenshot(url)`

> 从缓存中查找指定 URL 的截图。

| 项目 | 内容 |
|------|------|
| **签名** | `getCachedScreenshot(url: string): Promise<ScreenshotResult | null>` |
| **返回值** | 缓存命中返回 `ScreenshotResult`，否则 `null` |
| **源码** | [`./snapshot.ts`](./snapshot.ts) |

---

#### `manager.getCachedScreenshots(urls)`

> 批量从缓存中查找截图。

| 项目 | 内容 |
|------|------|
| **签名** | `getCachedScreenshots(urls: string[]): Promise<Map<string, ScreenshotResult>>` |
| **返回值** | `Map<原始URL, ScreenshotResult>`，仅包含缓存命中的 URL |
| **源码** | [`./snapshot.ts`](./snapshot.ts) |

```ts
const cacheMap = await manager.getCachedScreenshots([
  'https://example.com',
  'https://github.com',
])
console.log(`命中 ${cacheMap.size} 条缓存`)
```

---

#### `manager.clearCachedScreenshot(url)`

> 清除指定 URL 的截图缓存。

| 项目 | 内容 |
|------|------|
| **签名** | `clearCachedScreenshot(url: string): Promise<void>` |
| **源码** | [`./snapshot.ts`](./snapshot.ts) |

---

#### `manager.clearAllCache()`

> 清除全部截图缓存（内存 + `chrome.storage.local`）。

| 项目 | 内容 |
|------|------|
| **签名** | `clearAllCache(): Promise<void>` |
| **源码** | [`./snapshot.ts`](./snapshot.ts) |

---

#### `manager.captureBookmark(url, options?)`

> 对书签 URL 执行截图（核心方法）。内置：URL 校验 → 缓存检查 → 任务去重 → Agent 截图 → 缓存结果。

| 项目 | 内容 |
|------|------|
| **签名** | `captureBookmark(url: string, options?: { force?, fullPage? }): Promise<ScreenshotTask>` |
| **参数** | `url` — 书签 URL |
|  | `options.force` — 强制重新截图，默认 `false` |
|  | `options.fullPage` — 全页截图，默认 `true` |
| **返回值** | `ScreenshotTask` — `{ url, status, result?, error?, startedAt }` |
| **源码** | [`./snapshot.ts`](./snapshot.ts) |

```ts
const task = await manager.captureBookmark('https://example.com', { force: true })

switch (task.status) {
  case 'done':
    console.log('截图完成:', task.result!.filePath)
    break
  case 'capturing':
    console.log('正在截图中...')
    break
  case 'error':
    console.error('截图失败:', task.error)
    break
}
```

---

#### `manager.captureBookmarks(urls, options?)`

> 批量截图（串行执行，避免 Agent 过载）。

| 项目 | 内容 |
|------|------|
| **签名** | `captureBookmarks(urls: string[], options?: { force?, fullPage? }): Promise<ScreenshotTask[]>` |
| **返回值** | 每个 URL 对应一个 `ScreenshotTask` |
| **源码** | [`./snapshot.ts`](./snapshot.ts) |

```ts
const tasks = await manager.captureBookmarks(
  ['https://a.com', 'https://b.com'],
  { fullPage: false }
)

const doneCount = tasks.filter(t => t.status === 'done').length
console.log(`成功: ${doneCount} / ${tasks.length}`)
```

---

#### `manager.getTaskStatus(url)`

> 获取指定 URL 的截图任务状态（同步方法，查询内存中的活跃任务）。

| 项目 | 内容 |
|------|------|
| **签名** | `getTaskStatus(url: string): ScreenshotTask | null` |
| **返回值** | 活跃任务对象；无活跃任务返回 `null` |
| **源码** | [`./snapshot.ts`](./snapshot.ts) |

---

#### `manager.getHistorySnapshots(url)`

> 从 Agent 数据库查询指定 URL 的历史截图记录。

| 项目 | 内容 |
|------|------|
| **签名** | `getHistorySnapshots(url: string): Promise<SnapshotRecord[]>` |
| **返回值** | 数据库中的 `SnapshotRecord` 数组（最多 10 条） |
| **源码** | [`./snapshot.ts`](./snapshot.ts) |

```ts
const history = await manager.getHistorySnapshots('https://example.com')
history.forEach(r => {
  console.log(`[${r.createdAt}] ${r.imagePath}`)
})
```

---

## 类型参考

所有类型定义集中在 [`@/types/service`](../types/service.ts)，主要类型：

| 类型 | 说明 | 定义位置 |
|------|------|---------|
| `AgentConfig` | Agent 连接配置 `{ baseUrl, timeout }` | [`types/service.ts`](../types/service.ts) |
| `SnapshotRequest` | 截图请求 `{ url, fullPage? }` | [`types/service.ts`](../types/service.ts) |
| `SnapshotResponse` | 截图响应 `{ success, path, url, createdAt, record }` | [`types/service.ts`](../types/service.ts) |
| `SnapshotRecord` | 数据库截图记录 `{ id, url, imagePath, createdAt }` | [`types/service.ts`](../types/service.ts) |
| `SnapshotListResponse` | 分页查询响应 `{ success, data, total, page, pageSize }` | [`types/service.ts`](../types/service.ts) |
| `HealthResponse` | 健康检查响应 `{ status, version, activePages, maxPages, uptime }` | [`types/service.ts`](../types/service.ts) |
| `ScreenshotResult` | 插件侧截图结果 `{ url, filePath, createdAt, recordId, dataUrl? }` | [`types/service.ts`](../types/service.ts) |
| `ScreenshotStatus` | 任务状态枚举 `'idle' \| 'capturing' \| 'done' \| 'error'` | [`types/service.ts`](../types/service.ts) |
| `ScreenshotTask` | 截图任务对象 `{ url, status, result?, error?, startedAt }` | [`types/service.ts`](../types/service.ts) |
