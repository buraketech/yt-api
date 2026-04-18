# yt-resolver

YouTube URL'lerini doğrudan ses stream URL'sine çözümleyen hafif bir REST API servisi. `srp_interior` gibi uygulamalarda YouTube sesini doğrudan oynatmak için tasarlanmıştır.

---

## Özellikler

- YouTube URL formatlarını destekler: `youtube.com/watch`, `youtu.be`, `/shorts/`, `/embed/`, `/v/`
- En iyi kaliteli ses formatını otomatik seçer
- 5 saatlik in-memory önbellekleme (cache)
- Token tabanlı basit kimlik doğrulama
- 15 saniyelik zaman aşımı koruması

---

## Kurulum

**Gereksinimler:** Node.js >= 18, [yt-dlp](https://github.com/yt-dlp/yt-dlp) sisteminizde kurulu olmalı.

```bash
git clone https://github.com/kullanici/yt-resolver.git
cd yt-resolver
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

---

## Kullanım

```bash
npm start
```

---

## API

### `GET /health`

Servisin ayakta olup olmadığını kontrol eder. Token gerektirmez.

**Yanıt:**
```json
{ "ok": true }
```

---

### `GET /resolve?url=<youtube_url>`

YouTube URL'sini ses stream URL'sine çözümler.

**Header:**
```
x-api-token: <API_TOKEN>
```

**Örnek istek:**
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

| HTTP | `error` değeri | Açıklama |
|------|----------------|----------|
| 401 | `unauthorized` | Token eksik veya hatalı |
| 400 | `invalid-url` | Geçersiz veya desteklenmeyen URL |
| 502 | `resolve-failed` | yt-dlp çözümleyemedi |

---

## Önbellekleme

Her video ID'si için çözümlenen URL **5 saat** boyunca bellekte tutulur. Önbellekten dönen yanıtlarda `"cached": true` gelir. Maksimum önbellek boyutu 512 video ile sınırlıdır.

---

## Lisans

MIT
