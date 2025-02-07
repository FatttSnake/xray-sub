<div align="center">
    <h1>
        <span>Xray Subscription Generation</span>
    </h1>
</div>
<div align="center">
    <a href="LICENSE">
        <img alt="LICENSE" src="https://img.shields.io/github/license/FatttSnake/xray-sub">
    </a>
</div>

# Overview (ZH, [EN](README.md))

Xray 订阅生成器，运行在 Cloudflare Worker 上

# Quick Start

**1. 克隆此仓库**

```shell
git clone https://github.com/FatttSnake/xray-sub
```

**2. 安装依赖**

```shell
npm install
```

**3. 修改 [wrangler.json](wrangler.json) 文件的内容**

```text
"CLOUD_FLARE_YES_API": "{Replace with the real API url}"
"CLOUD_FLARE_YES_KEY": "{Replace with the real API key}"
```

**4. 重新生成 [worker-configuration.d.ts](worker-configuration.d.ts) 文件**

```shell
npm run cf-typegen
```

**5. 发布到 Cloudflare Workers**

```shell
npm run deploy
```

# 如何使用

## Swagger

```text
https://{Your Cloudflare worker domain}/doc
```

## API 文档

### CloudFlareYes

| 端点           | /CloudFlareYes                           |
|--------------|------------------------------------------|
| 请求方式         | GET                                      |
| 描述           | Generate xray url list via CloudFlareYes |
| Accept       | \*/*                                     |
| Content-Type | text/plain;charset=UTF-8                 |

#### 请求参数

| 参数       | 类型                 | 默认值    | 必填  | 描述                                                                                                           |
|----------|--------------------|--------|-----|--------------------------------------------------------------------------------------------------------------|
| lang     | 'EN' \| 'ZH'       |        | ×   | 备注语言                                                                                                         |
| remark   | string             | {NAME} | ✔   | 备注模板，使用占位符格式。见 [备注模板](#备注模板)                                                                                 |
| name     | string             |        | ✔   | 节点名称                                                                                                         |
| protocol | 'vmess' \| 'vless' |        | ✔   | 节点协议                                                                                                         |
| uuid     | string             |        | ✔   | 节点 UUID                                                                                                      |
| ...      |                    |        |     | 其他参数，将会被添加到 Xray URL中。 <br>见 [VMessAEAD / VLESS 分享链接标准提案](https://github.com/XTLS/Xray-core/discussions/716) |

#### 备注模板

| 占位符        | 描述            | 例子                                   |
|------------|---------------|--------------------------------------|
| {NAME}     | 节点名称          | Xray                                 |
| {PROTOCOL} | 节点协议          | vless                                |
| {UUID}     | 节点 UUID       | 63fd1162-132e-4ce0-bd77-b58d7712a876 |
| {COLO}     | 托管中心代码        | HKG                                  |
| {IP}       | Cloudflare IP | 1.1.1.1                              |
| {LATENCY}  | 延迟            | 160ms                                |
| {LINE}     | 线路供应商         | CM                                   |
| {LOSS}     | 丢包率           | 0%                                   |
| {NODE}     | Cloudflare 节点 | 51C_SDCM                             |
| {SPEED}    | 下载速度          | 340KB/s                              |
| {TIME}     | 更新时间          | 1900-01-01 00:00:00                  |

#### 例子

```text
https://example.workers.dev/CloudFlareYes?lang=ZH&remark=%7BNAME%7D%20-%20%7BLINE%7D%20-%20%7BLATENCY%7D%20-%20%7BSPEED%7D%20-%20%7BCOLO%7D%20-%20%7BNODE%7D%20-%20%7BTIME%7D&name=Xray&protocol=vless&uuid=63fd1162-132e-4ce0-bd77-b58d7712a876&encryption=none&security=tls&sni=example.com&alpn=http%2F1.1&type=ws&host=example.com&path=%2F%3Fed%3D2048
```
