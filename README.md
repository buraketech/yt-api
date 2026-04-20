# yt-resolver

**🌐 Dil / Language / 语言:**
[🇹🇷 Türkçe](#-türkçe) · [🇬🇧 English](#-english) · [🇨🇳 中文](#-中文)

---

## 🇹🇷 Türkçe

YouTube URL'lerini doğrudan ses stream URL'sine çözümleyen hafif bir REST API servisi. YouTube sesini doğrudan oynatmak için tasarlanmıştır.

### Özellikler

- YouTube URL formatlarını destekler: `youtube.com/watch`, `youtu.be`, `/shorts/`, `/embed/`, `/v/`
- En iyi kaliteli ses formatını otomatik seçer
- 5 saatlik in-memory önbellekleme (cache)
- Token tabanlı basit kimlik doğrulama
- 15 saniyelik zaman aşımı koruması

### Gereksinimler

- [Node.js](https://nodejs.org/) >= 18
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) sisteminizde kurulu olmalı

**yt-dlp kurulumu:**

```bash
# Linux / macOS
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# Windows (winget)
winget install yt-dlp

# pip ile (tüm platformlar)
pip install yt-dlp
```

### Kurulum

```bash
git clone https://github.com/kullanici/yt-resolver.git
cd yt-resolver

# Node modüllerini yükle
npm install
```

`.env.example` dosyasını kopyalayıp düzenleyin:

```bash
cp .env.example .env
```

```env
PORT=3939
API_TOKEN=change-me
```

### Çalıştırma

```bash
npm start
```

### API

#### `GET /health`

Servisin ayakta olup olmadığını kontrol eder. Token gerektirmez.

```json
{ "ok": true }
```

#### `GET /resolve?url=<youtube_url>`

YouTube URL'sini ses stream URL'sine çözümler.

**Header:**
```
x-api-token: <API_TOKEN>
```

**Örnek:**
```bash
curl "http://localhost:3939/resolve?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ" \
  -H "x-api-token: change-me"
```

**Başarılı yanıt:**
```json
{
  "ok": true,
  "cached": false,
  "videoId": "dQw4w9WgXcQ",
  "streamUrl": "https://...",
  "title": "Rick Astley - Never Gonna Give You Up",
  "durationSec": 212
}
```

**Hata yanıtları:**

| HTTP | `error` | Açıklama |
|------|---------|----------|
| 401 | `unauthorized` | Token eksik veya hatalı |
| 400 | `invalid-url` | Geçersiz veya desteklenmeyen URL |
| 502 | `resolve-failed` | yt-dlp çözümleyemedi |

### Önbellekleme

Her video ID'si için çözümlenen URL **5 saat** boyunca bellekte tutulur. Önbellekten dönen yanıtlarda `"cached": true` gelir. Maksimum önbellek boyutu 512 videodur.

### Lisans

[MIT](LICENSE)

---

## 🇬🇧 English

A lightweight REST API service that resolves YouTube URLs into direct audio stream URLs. Designed for use in applications like `srp_interior` to play YouTube audio directly.

### Features

- Supports YouTube URL formats: `youtube.com/watch`, `youtu.be`, `/shorts/`, `/embed/`, `/v/`
- Automatically selects the best quality audio format
- 5-hour in-memory caching
- Simple token-based authentication
- 15-second timeout protection

### Requirements

- [Node.js](https://nodejs.org/) >= 18
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) must be installed on your system

**Installing yt-dlp:**

```bash
# Linux / macOS
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# Windows (winget)
winget install yt-dlp

# All platforms (pip)
pip install yt-dlp
```

### Installation

```bash
git clone https://github.com/kullanici/yt-resolver.git
cd yt-resolver

# Install Node modules
npm install
```

Copy and edit the environment file:

```bash
cp .env.example .env
```

```env
PORT=3939
API_TOKEN=change-me
```

### Running

```bash
npm start
```

### API

#### `GET /health`

Check if the service is running. No token required.

```json
{ "ok": true }
```

#### `GET /resolve?url=<youtube_url>`

Resolves a YouTube URL into an audio stream URL.

**Header:**
```
x-api-token: <API_TOKEN>
```

**Example:**
```bash
curl "http://localhost:3939/resolve?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ" \
  -H "x-api-token: change-me"
```

**Successful response:**
```json
{
  "ok": true,
  "cached": false,
  "videoId": "dQw4w9WgXcQ",
  "streamUrl": "https://...",
  "title": "Rick Astley - Never Gonna Give You Up",
  "durationSec": 212
}
```

**Error responses:**

| HTTP | `error` | Description |
|------|---------|-------------|
| 401 | `unauthorized` | Missing or invalid token |
| 400 | `invalid-url` | Invalid or unsupported URL |
| 502 | `resolve-failed` | yt-dlp could not resolve |

### Caching

Resolved URLs are cached in memory for **5 hours** per video ID. Cached responses include `"cached": true`. Maximum cache size is 512 videos.

### License

[MIT](LICENSE)

---

## 🇨🇳 中文

一个轻量级 REST API 服务，将 YouTube URL 解析为直接音频流 URL。专为 `srp_interior` 等应用程序直接播放 YouTube 音频而设计。

### 功能特点

- 支持 YouTube URL 格式：`youtube.com/watch`、`youtu.be`、`/shorts/`、`/embed/`、`/v/`
- 自动选择最佳音频格式
- 5 小时内存缓存
- 简单的 Token 身份验证
- 15 秒超时保护

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- 系统中必须安装 [yt-dlp](https://github.com/yt-dlp/yt-dlp)

**安装 yt-dlp：**

```bash
# Linux / macOS
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# Windows (winget)
winget install yt-dlp

# 所有平台 (pip)
pip install yt-dlp
```

### 安装

```bash
git clone https://github.com/kullanici/yt-resolver.git
cd yt-resolver

# 安装 Node 模块
npm install
```

复制并编辑环境文件：

```bash
cp .env.example .env
```

```env
PORT=3939
API_TOKEN=change-me
```

### 运行

```bash
npm start
```

### API 接口

#### `GET /health`

检查服务是否正在运行。无需 Token。

```json
{ "ok": true }
```

#### `GET /resolve?url=<youtube_url>`

将 YouTube URL 解析为音频流 URL。

**请求头：**
```
x-api-token: <API_TOKEN>
```

**示例：**
```bash
curl "http://localhost:3939/resolve?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ" \
  -H "x-api-token: change-me"
```

**成功响应：**
```json
{
  "ok": true,
  "cached": false,
  "videoId": "dQw4w9WgXcQ",
  "streamUrl": "https://...",
  "title": "Rick Astley - Never Gonna Give You Up",
  "durationSec": 212
}
```

**错误响应：**

| HTTP | `error` | 说明 |
|------|---------|------|
| 401 | `unauthorized` | Token 缺失或无效 |
| 400 | `invalid-url` | URL 无效或不支持 |
| 502 | `resolve-failed` | yt-dlp 无法解析 |

### 缓存机制

每个视频 ID 的解析结果在内存中缓存 **5 小时**。来自缓存的响应包含 `"cached": true`。最大缓存容量为 512 个视频。

### 许可证

[MIT](LICENSE)
