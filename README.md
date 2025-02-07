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

# Overview ([ZH](README_zh.md), EN)

Xray subscription generator running on Cloudflare Worker

# Quick Start

**1. Clone this repo**

```shell
git clone https://github.com/FatttSnake/xray-sub
```

**2. Install dependencies**

```shell
npm install
```

**3. Modify the content of [wrangler.json](wrangler.json) file**

```text
"CLOUD_FLARE_YES_API": "{Replace with the real API url}"
"CLOUD_FLARE_YES_KEY": "{Replace with the real API key}"
```

**4. Regenerate the [worker-configuration.d.ts](worker-configuration.d.ts) file**

```shell
npm run cf-typegen
```

**5. Publish to Cloudflare Workers**

```shell
npm run deploy
```

# How to use

## Swagger

```text
https://{Your Cloudflare worker domain}/doc
```

## API Doc

### CloudFlareYes

| Endpoint     | /CloudFlareYes                           |
|--------------|------------------------------------------|
| Method       | GET                                      |
| Description  | Generate xray url list via CloudFlareYes |
| Accept       | \*/*                                     |
| Content-Type | text/plain;charset=UTF-8                 |

#### Request Parameters

| Parameter | Type               | Default | Required | Description                                                                                                                           |
|-----------|--------------------|---------|----------|---------------------------------------------------------------------------------------------------------------------------------------|
| lang      | 'EN' \| 'ZH'       |         | ×        | Language of remark                                                                                                                    |
| remark    | string             | {NAME}  | ✔        | Remark's template, in placeholder format. See [Remark Template](#remark-template)                                                     |
| name      | string             |         | ✔        | Name of the node                                                                                                                      |
| protocol  | 'vmess' \| 'vless' |         | ✔        | Protocol of the node                                                                                                                  |
| uuid      | string             |         | ✔        | UUID of the node                                                                                                                      |
| ...       |                    |         |          | Other parameters,  will be added to Xray url. <br>See [VMessAEAD / VLESS 分享链接标准提案](https://github.com/XTLS/Xray-core/discussions/716) |

#### Remark Template

| Placeholder | Description            | Example                              |
|-------------|------------------------|--------------------------------------|
| {NAME}      | Name of the node       | Xray                                 |
| {PROTOCOL}  | Protocol of the node   | vless                                |
| {UUID}      | UUID of the node       | 63fd1162-132e-4ce0-bd77-b58d7712a876 |
| {COLO}      | Colocation Center Code | HKG                                  |
| {IP}        | Cloudflare IP          | 1.1.1.1                              |
| {LATENCY}   | Latency                | 160ms                                |
| {LINE}      | Line supplier          | CM                                   |
| {LOSS}      | Packet loss rate       | 0%                                   |
| {NODE}      | Cloudflare node        | 51C_SDCM                             |
| {SPEED}     | Download speed         | 340KB/s                              |
| {TIME}      | Update time            | 1900-01-01 00:00:00                  |

#### Example

```text
https://example.workers.dev/CloudFlareYes?lang=ZH&remark=%7BNAME%7D%20-%20%7BLINE%7D%20-%20%7BLATENCY%7D%20-%20%7BSPEED%7D%20-%20%7BCOLO%7D%20-%20%7BNODE%7D%20-%20%7BTIME%7D&name=Xray&protocol=vless&uuid=63fd1162-132e-4ce0-bd77-b58d7712a876&encryption=none&security=tls&sni=example.com&alpn=http%2F1.1&type=ws&host=example.com&path=%2F%3Fed%3D2048
```
