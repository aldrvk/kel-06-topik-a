# Kelompok 06 - Topik A (Laravel & Docker Development)
Link Presentasi : https://drive.google.com/file/d/1n0jRzwbYBMSnEpCdzJA7nMKxN2WHY1x-/view?usp=sharing

Repository ini berisi aplikasi Laravel yang sudah terintegrasi dengan Docker (Nginx, PHP-FPM 8.3, dan MariaDB 10.11) menggunakan arsitektur 3-tier yang aman dan efisien.

---

## 🛠️ Prasyarat (Prerequisites)

Sebelum memulai, pastikan komputer Anda telah terinstal:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (termasuk Docker Compose)
- Git

---

## 🚀 Langkah Pemasangan & Setup (Quick Start)

Ikuti langkah-langkah di bawah ini untuk menjalankan project di komputer Anda:

### 1. Clone Repository
```bash
git clone <url-repository-anda>
cd kel-06-topik-a
```

### 2. Konfigurasi Environment File (`.env`)
Salin file template `.env.example` yang ada di root direktori menjadi `.env`:
```bash
cp .env.example .env
```
*Catatan: Konfigurasi database default di `.env.example` sudah disesuaikan agar langsung terhubung ke container database (`DB_HOST=db`). Anda cukup menyesuaikan nama database atau password sesuai kebutuhan.*

### 3. Build & Jalankan Docker Container
Jalankan perintah berikut di terminal (di root direktori project) untuk membuild dan menjalankan seluruh container:
```bash
docker compose up -d --build
```
Perintah ini akan menyalakan 3 service utama:
- **`kel06-proxy`** (Nginx unprivileged di port `80`)
- **`kel06-app`** (PHP-FPM 8.3 dengan user non-root `laravel`)
- **`kel06-db`** (MariaDB 10.11 terisolasi)

### 4. Install Dependensi Aplikasi (Composer & NPM)
Masuk ke dalam container aplikasi untuk menginstal dependensi PHP dan Node.js:
```bash
# Install PHP dependencies (Composer)
docker compose exec app composer install

# Install Frontend dependencies (NPM)
docker compose exec app npm install

# Build asset frontend (Vite)
docker compose exec app npm run build
```

### 5. Generate Application Key
Generate app key baru untuk Laravel Anda:
```bash
docker compose exec app php artisan key:generate
```

### 6. Jalankan Database Migrations & Seeders
Jalankan migrasi database beserta data awal (seeders):
```bash
docker compose exec app php artisan migrate --seed
```

Aplikasi Anda kini sudah siap! Buka browser dan akses [http://localhost](http://localhost).

---

## 📝 Perintah Docker yang Sering Digunakan (Cheat Sheet)

Semua perintah di bawah ini dijalankan dari root direktori project Anda:

| Perintah | Deskripsi |
| --- | --- |
| `docker compose up -d` | Menjalankan container di background |
| `docker compose down` | Menghentikan dan menghapus container |
| `docker compose ps` | Melihat status container yang sedang berjalan |
| `docker compose logs -f` | Melihat log sistem container secara realtime |
| `docker compose exec app <command>` | Menjalankan perintah di dalam container Laravel |

### Contoh Perintah Artisan & Composer di Dalam Container:
- **Jalankan migrasi baru:**
  ```bash
  docker compose exec app php artisan migrate
  ```
- **Membuat Controller baru:**
  ```bash
  docker compose exec app php artisan make:controller NamaController
  ```
- **Menjalankan Dev Server Vite (jika menggunakan hot reloading):**
  ```bash
  docker compose exec app npm run dev
  ```
