# Keamanan Server & Jaringan — Kelompok 06 (Topik A)
## Tugas Kuliah Universitas Sumatera Utara (USU)

🎥 **Link Presentasi:** [Google Drive](https://drive.google.com/file/d/1n0jRzwbYBMSnEpCdzJA7nMKxN2WHY1x-/view?usp=sharing)


Repository ini berisi proyek implementasi **Arsitektur Server 3-Tier yang Aman (Hardened 3-Tier Architecture)** berbasis Docker (Nginx, PHP-FPM 8.3, dan MariaDB 10.11) untuk aplikasi Laravel, lengkap dengan skrip otomatisasi pengamanan (*hardening*) sistem operasi, SSH, Firewall (UFW), Intrusion Prevention System (Fail2Ban), SSL/TLS enkripsi tinggi, serta sistem backup otomatis dengan notifikasi.

---

## 🏗️ Arsitektur Keamanan 3-Tier

Proyek ini menerapkan konsep *Defense in Depth* dengan membagi infrastruktur ke dalam 3 tier mandiri yang saling terisolasi menggunakan Docker Bridge Networks:

```mermaid
graph TD
    subgraph Host OS (Ubuntu / Debian VM)
        subgraph Docker Engine
            subgraph Frontend Network (frontend-net)
                Proxy[kel06-proxy <br> Nginx Unprivileged]
            end
            subgraph Backend Network (backend-net)
                App[kel06-app <br> PHP-FPM 8.3 / Laravel]
                DB[(kel06-db <br> MariaDB 10.11)]
            end
        end
        UFW[UFW Firewall + Fail2Ban IPS]
        Sysctl[Sysctl Kernel Hardening]
    end

    Internet((Internet / Client)) -->|Port 80/443| UFW
    UFW -->|Passes Clean Traffic| Proxy
    Proxy -->|FastCGI Port 9000| App
    App -->|Internal Port 3306| DB

    style Proxy fill:#d1e7dd,stroke:#0f5132,stroke-width:2px
    style App fill:#cff4fc,stroke:#087990,stroke-width:2px
    style DB fill:#f8d7da,stroke:#842029,stroke-width:2px
```

1. **Tier 1 — Reverse Proxy (`kel06-proxy`):**
   * Menggunakan image **`nginxinc/nginx-unprivileged:alpine`** (berjalan sebagai user non-root untuk mencegah *privilege escalation* jika terjadi *breach*).
   * File system container bersifat **`read_only`** (immutable container), hanya folder `/tmp` dan cache yang writable menggunakan *tmpfs*.
   * Mengamankan komunikasi via HTTPS (TLS 1.2 & 1.3) dan secara otomatis mengalihkan (redirect) seluruh trafik HTTP port 80 ke HTTPS port 443.
2. **Tier 2 — Application Server (`kel06-app`):**
   * Menjalankan container Laravel (PHP-FPM 8.3) sebagai user non-root (`laravel`).
   * Terisolasi dari database melalui bridge network khusus (`backend-net`) dan hanya terhubung ke proxy melalui `frontend-net`.
3. **Tier 3 — Database Server (`kel06-db`):**
   * Menggunakan MariaDB 10.11 terisolasi penuh.
   * **Sangat Aman:** Port `3306` sama sekali tidak di-expose ke Host OS, hanya dapat diakses secara internal oleh container aplikasi (`kel06-app`) melalui `backend-net`.

---

## 🔒 Fitur & Mekanisme Keamanan Utama

### 1. SSL/TLS Hardening & Perfect Forward Secrecy (PFS)
* Pembuatan sertifikat mandiri (*self-signed certificate*) menggunakan kunci **RSA 4096-bit** (tingkat keamanan tinggi) dan **SHA-256**.
* Mendukung **Subject Alternative Name (SAN)** agar sertifikat diakui valid oleh browser modern tanpa memunculkan *common name warning*.
* Menggunakan **DH (Diffie-Hellman) Parameters 2048-bit** untuk menjamin kerahasiaan sesi komunikasi di masa depan (*Perfect Forward Secrecy*).

### 2. Nginx Hardening & Security Headers
Nginx dikonfigurasi secara ketat untuk memitigasi berbagai serangan web umum:
* **Rate Limiting:** Menggunakan pembatasan request per IP (General: 10 req/s, Auth/Login: 5 req/s) untuk mitigasi serangan Brute-Force dan DDoS ringan.
* **Security Headers Lengkap:** Mengaktifkan HSTS (1 tahun), Content Security Policy (CSP), X-Frame-Options (anti-clickjacking), X-Content-Type-Options (anti-sniffing), X-XSS-Protection, Referrer Policy, dan Permissions Policy.
* **Server Hiding:** Menyembunyikan tanda tangan server (`server_tokens off;` dan menyembunyikan header `X-Powered-By`).
* **Proteksi File Sensitif:** Memblokir akses langsung ke file sensitif (seperti `.env`, `.git`, file backup `.bak`/`.sql`, dan direktori tersembunyi).

### 3. SSH & System Hardening (Host OS)
* Pemindahan port default SSH ke port kustom (default: `2206`).
* Menonaktifkan login root langsung via SSH (`PermitRootLogin no`).
* Menonaktifkan autentikasi password, mewajibkan penggunaan autentikasi kunci publik (*key-pair auth*).
* Pengetatan izin akses (*hardening file permissions*) folder `.ssh/authorized_keys` dan direktori *home* pengguna (chmod 700 / 600).

### 4. Firewall (UFW) & Intrusion Prevention System (Fail2Ban)
* Kebijakan firewall *Default Deny* untuk semua koneksi masuk (*incoming*), dan hanya membuka port yang diperlukan (SSH kustom `2206`, HTTP `80`, HTTPS `443`).
* Integrasi aturan kompatibilitas Docker-UFW agar Docker tidak mengabaikan aturan firewall yang ada pada host.
* **Fail2Ban Jails:** Mengaktifkan 5 lapis proteksi aktif:
  1. `sshd`: Memblokir IP yang gagal login SSH (maks 3 kali percobaan, ban 1 jam).
  2. `nginx-http-auth`: Memblokir IP yang gagal autentikasi basic auth Nginx.
  3. `nginx-limit-req`: Memblokir IP yang melanggar batas rate-limiting Nginx (HTTP 429).
  4. `nginx-botsearch`: Memblokir IP bot/scanner yang memindai halaman tak dikenal (seperti mencari `/admin`, `/.env`, dsb., ban 24 jam).
  5. `recidive`: Memblokir IP yang berulang kali terkena ban sebelumnya (ban eskalasi selama 1 minggu).
* **Kernel Sysctl Hardening:** Mengamankan kernel OS dari serangan jaringan (SYN flood protection/SYN cookies, reverse path filtering/anti-spoofing, menolak ICMP redirects/anti-MITM, menolak ICMP broadcasts/anti-Smurf, pembatasan akses dmesg dan kernel pointer, serta mengaktifkan ASLR penuh).

### 5. Sistem Backup Otomatis & Terintegritas
* Skrip backup database secara langsung melalui container Docker secara aman.
* Membackup file konfigurasi penting (`docker-compose.yml`, `.env`, dan direktori `docker/`).
* Melakukan kompresi backup (`.tar.gz`) dengan izin akses super ketat (hanya root yang bisa membaca/menulis - `chmod 600`).
* Membuat verifikasi integritas file cadangan menggunakan **SHA256 Checksum**.
* **Auto-Retention:** Menghapus berkas backup yang sudah berumur lebih dari 7 hari secara otomatis agar menghemat ruang disk.
* **Notifikasi Instan:** Mengirim status backup (sukses/gagal) secara otomatis ke **Telegram Bot** dan **Email** pengelola.

---

## 📂 Struktur Berkas Skrip (`scripts/`)

Proyek ini dilengkapi dengan 4 skrip otomatisasi yang berada di direktori `scripts/`:

| Nama Skrip | Fungsi Utama | Cara Menjalankan |
| --- | --- | --- |
| **[`generate-ssl.sh`](file:///c:/laragon/www/kel-06-topik-a/scripts/generate-ssl.sh)** | Membuat SSL Self-Signed dengan SAN & DH Parameters. | `sudo bash scripts/generate-ssl.sh` |
| **[`setup.sh`](file:///c:/laragon/www/kel-06-topik-a/scripts/setup.sh)** | Mengonfigurasi & mengamankan layanan SSH serta izin direktori pengguna di VM. | `sudo bash scripts/setup.sh [PORT_KUSTOM]` |
| **[`firewall.sh`](file:///c:/laragon/www/kel-06-topik-a/scripts/firewall.sh)** | Setup UFW, Fail2Ban jails, aturan Docker compat, dan sysctl kernel. | `sudo bash scripts/firewall.sh [SSH_PORT]` |
| **[`backup.sh`](file:///c:/laragon/www/kel-06-topik-a/scripts/backup.sh)** | Melakukan pencadangan database & konfigurasi, verifikasi checksum, retensi, dan notifikasi. | `sudo bash scripts/backup.sh` |

---

## 🚀 Langkah Pemasangan & Setup Lengkap (Deployment Guide)

### 1. Persiapan Awal di Host OS / VM (Khusus Linux Server)
Sebelum menjalankan Docker, lakukan pengamanan awal pada sistem operasi VM Anda menggunakan skrip hardening yang telah disediakan.

```bash
# Clone repository
git clone <url-repository-anda>
cd kel-06-topik-a

# 1. Jalankan VM & SSH Hardening (mengubah port SSH ke 2206 dan mewajibkan SSH Key)
chmod +x scripts/*.sh
sudo bash scripts/setup.sh 2206

# 2. Jalankan Firewall, Fail2Ban, & Sysctl Hardening
sudo bash scripts/firewall.sh 2206
```
*Penting: Selalu ikuti petunjuk verifikasi koneksi SSH baru sebelum Anda menutup sesi terminal aktif Anda agar tidak terkunci (lockout).*

### 2. Generate SSL Certificate
Sebelum menyalakan Docker, Anda wajib men-generate sertifikat SSL agar web proxy (Nginx) dapat berjalan dengan protokol HTTPS:

```bash
sudo bash scripts/generate-ssl.sh
```
Skrip ini akan menaruh file `server.crt`, `server.key`, `dhparam.pem`, dan `openssl-san.cnf` ke dalam direktori `./docker/nginx/ssl/`.

### 3. Konfigurasi Environment File (`.env`)
Salin file template `.env.example` menjadi `.env` di root direktori project:
```bash
cp .env.example .env
```
Sesuaikan kredensial database dan tambahkan token Telegram/Email untuk keperluan backup jika diperlukan:
```bash
# Contoh konfigurasi notifikasi backup di .env
TELEGRAM_BOT_TOKEN="token_bot_telegram_anda"
TELEGRAM_CHAT_ID="id_chat_penerima"
EMAIL_RECIPIENT="email_admin@domain.com"
```

### 4. Build & Jalankan Docker Container
Jalankan Docker Compose untuk membuild dan menyalakan container di background:
```bash
docker compose up -d --build
```

### 5. Install Dependensi Aplikasi (Composer & NPM)
Masuk ke container aplikasi (`kel06-app`) untuk menginstal paket dependensi Laravel:
```bash
# Install PHP dependencies (Composer)
docker compose exec app composer install

# Install Frontend dependencies (NPM)
docker compose exec app npm install

# Build asset frontend (Vite)
docker compose exec app npm run build
```

### 6. Generate Key & Migrasi Database
Jalankan perintah berikut untuk menginisialisasi aplikasi Laravel:
```bash
# Generate app key
docker compose exec app php artisan key:generate

# Jalankan migrasi database beserta data awal (seeders)
docker compose exec app php artisan migrate --seed
```

Aplikasi Anda kini sudah aktif dengan protokol aman! Buka browser dan akses **`https://localhost`** atau **`https://kel06.local`**.

---

## 📅 Konfigurasi Otomatisasi Backup (Cron Job)

Untuk menjalankan backup secara otomatis setiap hari pada pukul **01:00 WIB**, Anda dapat menambahkan perintah cron job pada crontab root di Host OS:

```bash
# Buka crontab root
sudo crontab -e
```

Tambahkan baris berikut di bagian akhir file crontab:
```cron
0 1 * * * /bin/bash /absolute/path/to/kel-06-topik-a/scripts/backup.sh >> /var/log/project-backup.log 2>&1
```
*(Ganti `/absolute/path/to/kel-06-topik-a` dengan path absolut lokasi direktori proyek Anda pada server).*

---

## 🔍 Cheat Sheet Perintah Monitoring Keamanan

Untuk mempermudah demonstrasi dan verifikasi di hadapan dosen/penguji tugas, gunakan perintah-perintah berikut:

### 1. Verifikasi Firewall (UFW)
```bash
# Melihat aturan firewall yang aktif dan logging status
sudo ufw status verbose

# Melihat aturan firewall dengan nomor baris
sudo ufw status numbered
```

### 2. Verifikasi Intrusion Prevention (Fail2Ban)
```bash
# Melihat daftar jail yang aktif saat ini
sudo fail2ban-client status

# Melihat statistik dan IP yang sedang diblokir pada jail SSH
sudo fail2ban-client status sshd

# Melihat statistik dan IP yang sedang diblokir karena melanggar rate-limiting Nginx
sudo fail2ban-client status nginx-limit-req

# Membuka blokir (unban) IP tertentu secara manual
sudo fail2ban-client set <nama-jail> unbanip <IP-Address>
```

### 3. Verifikasi Kernel Hardening (Sysctl)
```bash
# Menampilkan seluruh nilai sysctl ipv4 yang sedang aktif
sysctl -a | grep net.ipv4

# Memeriksa apakah proteksi SYN flood aktif (nilainya harus 1)
sysctl net.ipv4.tcp_syncookies
```

### 4. Membaca Log Sistem
```bash
# Melihat log backup realtime
tail -f /var/log/project-backup.log

# Melihat aktivitas log ban/unban Fail2Ban
tail -f /var/log/fail2ban.log
```
