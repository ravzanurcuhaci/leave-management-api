#  İzin Yönetim Sistemi API

**Node.js**, **Express** ve **PostgreSQL** ile geliştirilmiş, çalışanların izin taleplerini yönetmek için RESTful API. Rol tabanlı erişim kontrolü (Çalışan / Yönetici / Admin), **Redis + BullMQ** ile asenkron e-posta bildirimleri ve tam denetim kaydı (audit log) desteği içerir.

## 🎯 Proje Amacı

Bu sistem şunları sağlar:

- **Çalışanlar** kendi izin taleplerini oluşturabilir, güncelleyebilir, silebilir ve görüntüleyebilir
- **Yöneticiler** ekibindeki izin taleplerini onaylayabilir/reddedebilir ve dashboard üzerinden istatistik görebilir
- **Adminler** kullanıcıları, izin türlerini, izin bakiyelerini yönetebilir ve denetim kayıtlarını görüntüleyebilir

Bir yönetici izin talebini onayladığında veya reddettiğinde, çalışana Redis tabanlı iş kuyruğu aracılığıyla **asenkron olarak e-posta** gönderilir.

---

## 🛠️ Teknolojiler

| Teknoloji | Görevi |
|---|---|
| **Node.js** | Çalışma ortamı |
| **Express 5** | Web framework & yönlendirme |
| **PostgreSQL** | İlişkisel veritabanı |
| **Redis** | İş kuyruğu için mesaj broker'ı |
| **BullMQ** | İş kuyruğu kütüphanesi (Redis üzerinde çalışır) |
| **ioredis** | Node.js için Redis istemcisi |
| **Nodemailer** | E-posta gönderimi (Gmail SMTP) |
| **JWT** | Kimlik doğrulama (access + refresh token) |
| **bcrypt** | Şifre hashleme |
| **express-rate-limit** | İstek sınırlama (15 dk'da 100 istek) |
| **Swagger** | API dokümantasyonu (`/api-docs`) |

---


## ⚙️ Ortam Değişkenleri

Proje kök dizininde bir `.env` dosyası oluşturun:

```env
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=leave_management_db
DB_USER=postgres
DB_PASSWORD=sifreniz

# JWT
JWT_SECRET=jwt_gizli_anahtar
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=refresh_gizli_anahtar
JWT_REFRESH_EXPIRES_IN=7d

# E-posta (Gmail SMTP)
EMAIL_USER=email@gmail.com
EMAIL_PASS=uygulama_sifresi

# Redis (isteğe bağlı, varsayılan değerler gösterilmiştir)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 📡 API Endpoint'leri

### 🔐 Kimlik Doğrulama (`/auth`)

| Metod | Endpoint | Açıklama | Auth |
|-------|----------|----------|------|
| POST | `/auth/register` | Yeni kullanıcı kaydı | ❌ |
| POST | `/auth/login` | Giriş yap & token al | ❌ |
| GET | `/auth/me` | Mevcut kullanıcı bilgisi | ✅ |
| POST | `/auth/refresh` | Access token yenile | ❌ |
| POST | `/auth/logout` | Çıkış yap | ❌ |

### 📝 İzin Talepleri (`/leave-requests`) — Çalışan

| Metod | Endpoint | Açıklama | Auth | Rol |
|-------|----------|----------|------|-----|
| POST | `/leave-requests` | İzin talebi oluştur | ✅ | Çalışan |
| GET | `/leave-requests/my` | Kendi taleplerimi listele | ✅ | Herkes |
| GET | `/leave-requests/:id` | Tek talep detayı | ✅ | Herkes |
| PATCH | `/leave-requests/:id` | Talebi güncelle | ✅ | Çalışan |
| DELETE | `/leave-requests/:id` | Talebi sil | ✅ | Çalışan |

### 👔 Yönetici (`/manager`)

| Metod | Endpoint | Açıklama | Auth | Rol |
|-------|----------|----------|------|-----|
| GET | `/manager/leave-requests` | Ekibin izin taleplerini listele | ✅ | Yönetici |
| GET | `/manager/leave-requests/:id` | Tek talep detayı | ✅ | Yönetici |
| PATCH | `/manager/leave-requests/:id/status` | Onayla / Reddet | ✅ | Yönetici |
| GET | `/manager/dashboard` | Dashboard istatistikleri | ✅ | Yönetici |

### 🛡️ Admin — Kullanıcılar (`/admin`)

| Metod | Endpoint | Açıklama | Auth | Rol |
|-------|----------|----------|------|-----|
| POST | `/admin/users` | Kullanıcı oluştur | ✅ | Admin |
| GET | `/admin/users` | Tüm kullanıcıları listele | ✅ | Admin |
| GET | `/admin/users/:id` | Kullanıcı detayı | ✅ | Admin |
| PATCH | `/admin/users/:id` | Kullanıcı güncelle | ✅ | Admin |
| DELETE | `/admin/users/:id` | Kullanıcı sil | ✅ | Admin |
| PATCH | `/admin/users/:id/role` | Rol değiştir | ✅ | Admin |
| PATCH | `/admin/users/:id/manager` | Yönetici değiştir | ✅ | Admin |

### 🛡️ Admin — İzin Türleri (`/leave-types`)

| Metod | Endpoint | Açıklama | Auth | Rol |
|-------|----------|----------|------|-----|
| GET | `/leave-types` | Tüm izin türlerini getir | ✅ | Herkes |
| POST | `/leave-types` | İzin türü oluştur | ✅ | Admin |
| PATCH | `/leave-types/:id` | İzin türü güncelle | ✅ | Admin |
| DELETE | `/leave-types/:id` | İzin türü sil | ✅ | Admin |

### 🛡️ Admin — İzin Bakiyeleri (`/admin`)

| Metod | Endpoint | Açıklama | Auth | Rol |
|-------|----------|----------|------|-----|
| GET | `/admin/users/:userId/leave-balances` | Kullanıcının bakiyelerini getir | ✅ | Admin |
| PATCH | `/admin/users/:userId/leave-balances/:leaveTypeId` | Bakiye güncelle | ✅ | Admin |

### 💰 İzin Bakiyeleri (`/leave-balances`)

| Metod | Endpoint | Açıklama | Auth | Rol |
|-------|----------|----------|------|-----|
| GET | `/leave-balances/my` | Kendi bakiyelerimi getir | ✅ | Herkes |

### 📜 Denetim Kayıtları (`/admin`)

| Metod | Endpoint | Açıklama | Auth | Rol |
|-------|----------|----------|------|-----|
| GET | `/admin/audit-logs` | Denetim kayıtlarını getir | ✅ | Admin |

### 🏥 Sağlık Kontrolü

| Metod | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/health` | API & Veritabanı durumu |

> 📖 **İnteraktif API dokümantasyonu**: `http://localhost:3000/api-docs`

---

## 📬 E-posta Kuyruğu — Nasıl Çalışıyor?

Bu proje, e-posta bildirimlerini **asenkron** olarak göndermek için **Redis + BullMQ** kullanır. İşleyiş şöyle:

```
Yönetici bir izin talebini onaylar/reddeder
         │
         ▼
┌─────────────────────────────┐
│  manager.service.js         │
│  emailQueue.add(...)        │──────►  Redis (localhost:6379)
│  (kuyruğa iş ekler)        │         "email-queue" kuyruğu
└─────────────────────────────┘                │
                                               ▼
                                 ┌──────────────────────────┐
                                 │  email.worker.js          │
                                 │  Redis'ten işi alır ve    │
                                 │  sendLeaveStatusEmail()   │
                                 │  fonksiyonunu çağırır     │
                                 └──────────────────────────┘
                                               │
                                               ▼
                                 ┌──────────────────────────┐
                                 │  email.service.js         │
                                 │  nodemailer ile Gmail     │
                                 │  üzerinden e-posta gönderir│
                                 └──────────────────────────┘
```

### Neden doğrudan e-posta göndermek yerine kuyruk kullanıyoruz?

| Sebep | Açıklama |
|-------|----------|
| **Hız** | API anında yanıt verir. E-posta gönderimi (2-5 sn) arka planda gerçekleşir. |
| **Güvenilirlik** | E-posta başarısız olursa iş kuyrukta kalır ve tekrar denenebilir. |
| **Ölçeklenebilirlik** | E-postaları paralel işlemek için birden fazla worker çalıştırabilirsiniz. |

### Worker'ı Çalıştırma

Worker, API'den **ayrı bir process** olarak çalışır:

```bash
# Terminal 1 — API'yi başlat
npm run dev

# Terminal 2 — E-posta worker'ını başlat
npm run worker
```

> ⚠️ Kuyruğun çalışması için **Redis** `localhost:6379` üzerinde çalışıyor olmalıdır.

---

## 🚀 Kurulum

### Gereksinimler

- Node.js (v18+)
- PostgreSQL
- Redis

### Adımlar

```bash
# 1. Repoyu klonla
git clone https://github.com/ravzanurcuhaci/leave-management-api.git
cd leave-management-api

# 2. Bağımlılıkları yükle
npm install

# 3. Veritabanını kur
psql -U postgres -d leave_management_db -f schema.sql

# 4. .env dosyasını oluştur (yukarıdaki Ortam Değişkenleri bölümüne bak)

# 5. API'yi başlat
npm run dev

# 6. E-posta worker'ını başlat (ayrı terminal)
npm run worker
```

---

## 📁 Proje Yapısı

```
src/
├── app.js                  # Express uygulama giriş noktası
├── swagger.js              # Swagger yapılandırması
├── db/
│   └── pool.js             # PostgreSQL bağlantı havuzu
├── routes/                 # Endpoint tanımları
│   ├── auth.routes.js
│   ├── leave.routes.js
│   ├── manager.routes.js
│   ├── admin.routes.js
│   ├── leaveType.routes.js
│   ├── leaveBalance.routes.js
│   ├── adminLeaveBalance.routes.js
│   └── auditLog.routes.js
├── controllers/            # İstek yönetimi (req → res)
├── services/               # İş mantığı & veritabanı sorguları
│   ├── leave.service.js
│   ├── manager.service.js
│   ├── email.service.js
│   └── ...
├── middlewares/             # Auth, rol kontrolü, hata yönetimi
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── errorHandler.js
│   └── asyncHandler.js
├── errors/                 # Özel hata sınıfları
│   └── AppError.js
├── queues/                 # BullMQ kuyruk tanımları
│   └── email.queue.js
└── workers/                # Arka plan iş işleyicileri
    └── email.worker.js
```

---

## 🔑 Temel Özellikler

- **Rol Tabanlı Erişim Kontrolü** — Çalışan (1), Yönetici (2), Admin (3)
- **JWT Kimlik Doğrulama** — Access token (15dk) + Refresh token (7 gün)
- **Veritabanı Transaction'ları** — BEGIN/COMMIT/ROLLBACK ile atomik onay/red işlemi
- **Race Condition Koruması** — Eşzamanlı isteklerde `SELECT ... FOR UPDATE` kilidi
- **Çakışma Tespiti** — Aynı tarihler için mükerrer izin talebi engellenir
- **Geçmiş Tarih Doğrulaması** — Geçmiş tarihli izin talebi oluşturulamaz
- **İstek Sınırlama** — IP başına 15 dakikada 100 istek
- **Asenkron E-posta Bildirimleri** — Redis + BullMQ kuyruk sistemi
- **Denetim Kaydı** — Yöneticinin tüm onay/red işlemleri loglanır
- **Swagger Dokümantasyonu** — `/api-docs` adresinde interaktif API belgesi


Bu proje şunları göstermektedir:

- Ara katman yazılımı ile rol tabanlı erişim kontrolü
- JWT erişim/yenileme belirteci kimlik doğrulaması
- Atomik işlemler için PostgreSQL işlemleri
- SELECT ... FOR UPDATE ile yarış durumu yönetimi
- Redis + BullMQ ile eşzamansız arka plan işleri
- API süreci ve çalışan sürecinin ayrılması
- Kritik işlemler için denetim kaydı tutma
