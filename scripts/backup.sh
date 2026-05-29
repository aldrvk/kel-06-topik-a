#!/bin/bash
# ==============================================================================
# backup.sh — Script Backup Otomatis Database & Konfigurasi Project Docker
# ==============================================================================
# Kelompok 06 — Topik A | Keamanan Server & Jaringan
#
# Script ini melakukan:
#   1. Pengecekan prasyarat (root, disk space, dependensi, container status)
#   2. Backup database (MariaDB/MySQL via mysqldump ATAU PostgreSQL via pg_dump)
#   3. Backup file konfigurasi (docker-compose.yml, .env, direktori docker/)
#   4. Kompresi seluruh hasil backup ke arsip .tar.gz
#   5. Pembuatan checksum SHA256 untuk verifikasi integritas
#   6. Pengaturan permission ketat (chmod 600) pada arsip backup
#   7. Retensi otomatis: hapus backup lebih lama dari 7 hari
#   8. Logging seluruh aktivitas ke /var/log/project-backup.log
#   9. Notifikasi Telegram / Email jika backup berhasil atau gagal
#
# Penggunaan:
#   chmod +x scripts/backup.sh
#   sudo bash scripts/backup.sh
#
# Cron Job (setiap hari pukul 01:00 WIB):
#   0 1 * * * /bin/bash /path/to/project/scripts/backup.sh >> /var/log/project-backup.log 2>&1
# ==============================================================================

# ======================== STRICT MODE ========================
# -e : Exit langsung jika ada command yang gagal (non-zero exit code)
# -u : Treat variable yang belum didefinisikan sebagai error
# -o pipefail : Pipe chain mengembalikan exit code dari command yang gagal
set -euo pipefail

# ======================== KONSTANTA & KONFIGURASI ========================

# Path absolut ke direktori project (parent dari scripts/)
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Direktori dan file backup
readonly BACKUP_BASE_DIR="/opt/backups"
readonly LOG_FILE="/var/log/project-backup.log"
readonly TIMESTAMP="$(date +%Y-%m-%d_%H-%M-%S)"
readonly BACKUP_NAME="backup-${TIMESTAMP}"
readonly BACKUP_WORK_DIR="${BACKUP_BASE_DIR}/${BACKUP_NAME}"
readonly BACKUP_ARCHIVE="${BACKUP_BASE_DIR}/${BACKUP_NAME}.tar.gz"
readonly BACKUP_CHECKSUM="${BACKUP_BASE_DIR}/${BACKUP_NAME}.tar.gz.sha256"

# Retensi backup (dalam hari)
readonly RETENTION_DAYS=7

# Batas minimum disk space (dalam MB) — default 500 MB
readonly MIN_DISK_SPACE_MB=500

# ── Notifikasi Telegram (opsional) ──
# Isi variabel berikut di file .env atau ekspor sebagai environment variable
# TELEGRAM_BOT_TOKEN="123456:ABC-DEF..."
# TELEGRAM_CHAT_ID="-1001234567890"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"

# ── Notifikasi Email (opsional) ──
# EMAIL_RECIPIENT="admin@domain.com"
EMAIL_RECIPIENT="${EMAIL_RECIPIENT:-}"

# ======================== WARNA OUTPUT ========================

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m' # No Color

# ======================== FUNGSI LOGGING ========================
# Setiap log ditulis ke stdout (terminal) DAN ke file log dengan timestamp ISO 8601

log() {
    local level="$1"
    shift
    local message="$*"
    local ts
    ts="$(date '+%Y-%m-%d %H:%M:%S %Z')"
    # Tulis ke log file (tanpa ANSI escape code)
    echo "[${ts}] [${level}] ${message}" >> "${LOG_FILE}"
    # Tulis ke terminal (dengan warna)
    case "${level}" in
        INFO)    echo -e "${CYAN}[${ts}]${NC} ${CYAN}[INFO]${NC}    ${message}" ;;
        OK)      echo -e "${CYAN}[${ts}]${NC} ${GREEN}[OK]${NC}      ${message}" ;;
        WARN)    echo -e "${CYAN}[${ts}]${NC} ${YELLOW}[WARN]${NC}    ${message}" ;;
        ERROR)   echo -e "${CYAN}[${ts}]${NC} ${RED}[ERROR]${NC}   ${message}" ;;
        *)       echo -e "${CYAN}[${ts}]${NC} [${level}]  ${message}" ;;
    esac
}

log_header() {
    local title="$1"
    echo "" >> "${LOG_FILE}"
    echo "══════════════════════════════════════════════" >> "${LOG_FILE}"
    echo "  ${title}" >> "${LOG_FILE}"
    echo "══════════════════════════════════════════════" >> "${LOG_FILE}"
    echo ""
    echo -e "${BOLD}${CYAN}══════════════════════════════════════════════${NC}"
    echo -e "${BOLD}  ${title}${NC}"
    echo -e "${BOLD}${CYAN}══════════════════════════════════════════════${NC}"
    echo ""
}

# ======================== FUNGSI NOTIFIKASI ========================

# Kirim notifikasi ke Telegram Bot API
send_telegram() {
    local message="$1"
    if [[ -n "${TELEGRAM_BOT_TOKEN}" && -n "${TELEGRAM_CHAT_ID}" ]]; then
        curl -s -X POST \
            "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=${message}" \
            -d "parse_mode=HTML" \
            --max-time 10 \
            > /dev/null 2>&1 || log "WARN" "Gagal mengirim notifikasi Telegram."
        log "INFO" "Notifikasi Telegram terkirim."
    fi
}

# Kirim notifikasi via Email (menggunakan mail/mailx)
send_email() {
    local subject="$1"
    local body="$2"
    if [[ -n "${EMAIL_RECIPIENT}" ]]; then
        if command -v mail &> /dev/null; then
            echo "${body}" | mail -s "${subject}" "${EMAIL_RECIPIENT}" 2>/dev/null \
                || log "WARN" "Gagal mengirim notifikasi email."
            log "INFO" "Notifikasi email terkirim ke ${EMAIL_RECIPIENT}."
        else
            log "WARN" "Perintah 'mail' tidak tersedia. Lewati notifikasi email."
        fi
    fi
}

# Kirim notifikasi gabungan (Telegram + Email)
notify() {
    local status="$1" # SUCCESS atau FAILED
    local detail="$2"
    local hostname_val
    hostname_val="$(hostname)"
    local subject="[Backup ${status}] ${hostname_val} — ${TIMESTAMP}"

    local telegram_msg="<b>🔔 Backup ${status}</b>
<b>Host:</b> ${hostname_val}
<b>Waktu:</b> ${TIMESTAMP}
<b>Detail:</b> ${detail}"

    send_telegram "${telegram_msg}"
    send_email "${subject}" "Host: ${hostname_val}\nWaktu: ${TIMESTAMP}\nStatus: ${status}\nDetail: ${detail}"
}

# ======================== FUNGSI CLEANUP (TRAP) ========================
# Dipanggil otomatis jika script keluar dengan error (non-zero exit code)
# Membersihkan direktori kerja sementara agar tidak menyisakan sampah

cleanup_on_error() {
    local exit_code=$?
    if [[ ${exit_code} -ne 0 ]]; then
        log "ERROR" "Script dihentikan karena error (exit code: ${exit_code})."
        # Hapus direktori kerja sementara jika ada
        if [[ -d "${BACKUP_WORK_DIR}" ]]; then
            rm -rf "${BACKUP_WORK_DIR}"
            log "INFO" "Direktori sementara ${BACKUP_WORK_DIR} telah dibersihkan."
        fi
        notify "FAILED" "Backup gagal dengan exit code ${exit_code}. Periksa log: ${LOG_FILE}"
    fi
}

# Pasang trap: jalankan cleanup_on_error saat EXIT (baik sukses maupun gagal)
trap cleanup_on_error EXIT

# ======================== VALIDASI PRA-SYARAT ========================

log_header "Backup Otomatis — Kelompok 06 Topik A"
log "INFO" "Memulai proses backup pada ${TIMESTAMP}..."

# ── 1. Validasi: harus dijalankan sebagai root ──
if [[ "${EUID}" -ne 0 ]]; then
    log "ERROR" "Script ini HARUS dijalankan sebagai root (sudo)!"
    log "INFO" "Cara menjalankan: sudo bash ${BASH_SOURCE[0]}"
    exit 1
fi

# ── 2. Validasi: file .env harus ada ──
readonly ENV_FILE="${PROJECT_DIR}/.env"
if [[ ! -f "${ENV_FILE}" ]]; then
    log "ERROR" "File .env tidak ditemukan di ${ENV_FILE}."
    log "INFO" "Salin dari .env.example: cp ${PROJECT_DIR}/.env.example ${PROJECT_DIR}/.env"
    exit 1
fi

# ── 3. Muat konfigurasi dari .env (secara aman) ──
# Hanya export variabel yang dimulai dengan DB_, TELEGRAM_, atau EMAIL_
# Menggunakan grep + export untuk menghindari eksekusi command injection dari .env
log "INFO" "Membaca konfigurasi database dari file .env..."
while IFS='=' read -r key value; do
    # Hapus karakter carriage return (jika .env diedit di Windows)
    key="$(echo "${key}" | tr -d '\r')"
    value="$(echo "${value}" | tr -d '\r')"
    # Hanya proses variabel yang dibutuhkan
    case "${key}" in
        DB_CONNECTION|DB_HOST|DB_PORT|DB_DATABASE|DB_USERNAME|DB_PASSWORD|DB_ROOT_PASSWORD)
            export "${key}=${value}"
            ;;
        TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID|EMAIL_RECIPIENT)
            export "${key}=${value}"
            ;;
    esac
done < <(grep -E '^[A-Za-z_]+=' "${ENV_FILE}" | grep -v '^#')

# ── 4. Tentukan tipe database dan container ──
# DB_CONNECTION dari Laravel: 'mariadb', 'mysql', atau 'pgsql'
readonly DB_TYPE="${DB_CONNECTION:-mariadb}"
readonly DB_CONTAINER="${DB_HOST:-db}"
readonly DB_NAME="${DB_DATABASE:-laravel}"
readonly DB_USER="${DB_USERNAME:-laravel_user}"
readonly DB_PASS="${DB_PASSWORD:-}"

if [[ -z "${DB_PASS}" ]]; then
    log "ERROR" "DB_PASSWORD tidak ditemukan di .env. Backup database tidak dapat dilakukan."
    exit 1
fi

log "INFO" "Tipe database terdeteksi: ${DB_TYPE}"
log "INFO" "Container database target: ${DB_CONTAINER}"
log "INFO" "Nama database: ${DB_NAME}"

# ── 5. Validasi: Docker harus terpasang dan berjalan ──
if ! command -v docker &> /dev/null; then
    log "ERROR" "Docker tidak ditemukan. Pastikan Docker sudah terinstal."
    exit 1
fi

if ! docker info &> /dev/null; then
    log "ERROR" "Docker daemon tidak berjalan. Jalankan: sudo systemctl start docker"
    exit 1
fi

# ── 6. Validasi: container database harus berjalan ──
# Cari container berdasarkan nama service di docker compose
COMPOSE_PROJECT="$(basename "${PROJECT_DIR}")"
DB_CONTAINER_FULL=""

# Coba cari container berdasarkan nama eksplisit dari docker-compose.yml (container_name)
if docker ps --format '{{.Names}}' | grep -q "kel06-db"; then
    DB_CONTAINER_FULL="kel06-db"
elif docker ps --format '{{.Names}}' | grep -q "${DB_CONTAINER}"; then
    DB_CONTAINER_FULL="${DB_CONTAINER}"
elif docker ps --format '{{.Names}}' | grep -q "${COMPOSE_PROJECT}.*db"; then
    DB_CONTAINER_FULL="$(docker ps --format '{{.Names}}' | grep "${COMPOSE_PROJECT}.*db" | head -1)"
else
    log "ERROR" "Container database tidak ditemukan atau tidak berjalan."
    log "INFO" "Pastikan container sudah aktif: docker compose up -d"
    log "INFO" "Container yang aktif saat ini:"
    docker ps --format 'table {{.Names}}\t{{.Status}}' >> "${LOG_FILE}" 2>&1
    docker ps --format 'table {{.Names}}\t{{.Status}}'
    exit 1
fi

log "OK" "Container database terdeteksi: ${DB_CONTAINER_FULL}"

# ── 7. Pengecekan kapasitas disk ──
log "INFO" "Memeriksa kapasitas disk yang tersedia..."
AVAILABLE_SPACE_KB=$(df "${BACKUP_BASE_DIR%/*}" --output=avail 2>/dev/null | tail -1 | tr -d ' ' || echo "0")
# Fallback jika --output tidak didukung
if [[ "${AVAILABLE_SPACE_KB}" == "0" || -z "${AVAILABLE_SPACE_KB}" ]]; then
    AVAILABLE_SPACE_KB=$(df -k "${BACKUP_BASE_DIR%/*}" | awk 'NR==2{print $4}')
fi
AVAILABLE_SPACE_MB=$((AVAILABLE_SPACE_KB / 1024))

if [[ ${AVAILABLE_SPACE_MB} -lt ${MIN_DISK_SPACE_MB} ]]; then
    log "ERROR" "Ruang disk tidak mencukupi! Tersedia: ${AVAILABLE_SPACE_MB} MB, minimum: ${MIN_DISK_SPACE_MB} MB."
    exit 1
fi

log "OK" "Ruang disk mencukupi: ${AVAILABLE_SPACE_MB} MB tersedia (minimum: ${MIN_DISK_SPACE_MB} MB)."

# ======================== PERSIAPAN DIREKTORI BACKUP ========================

log_header "Tahap 1/5 — Persiapan Direktori"

# Buat direktori backup jika belum ada, dengan permission ketat
if [[ ! -d "${BACKUP_BASE_DIR}" ]]; then
    mkdir -p "${BACKUP_BASE_DIR}"
    chmod 700 "${BACKUP_BASE_DIR}"
    chown root:root "${BACKUP_BASE_DIR}"
    log "OK" "Direktori backup dibuat: ${BACKUP_BASE_DIR} (chmod 700, owner root)"
else
    log "INFO" "Direktori backup sudah ada: ${BACKUP_BASE_DIR}"
fi

# Buat direktori kerja sementara untuk menyimpan file sebelum dikompres
mkdir -p "${BACKUP_WORK_DIR}"
log "OK" "Direktori kerja sementara dibuat: ${BACKUP_WORK_DIR}"

# Pastikan log file bisa ditulis
touch "${LOG_FILE}" 2>/dev/null || {
    log "ERROR" "Tidak dapat menulis ke file log: ${LOG_FILE}"
    exit 1
}
chmod 640 "${LOG_FILE}"

# ======================== BACKUP DATABASE ========================

log_header "Tahap 2/5 — Backup Database (${DB_TYPE})"

readonly DB_DUMP_FILE="${BACKUP_WORK_DIR}/database_${DB_NAME}_${TIMESTAMP}.sql"

case "${DB_TYPE}" in
    mariadb|mysql)
        log "INFO" "Menjalankan mysqldump pada container ${DB_CONTAINER_FULL}..."
        # --single-transaction : Konsistensi data tanpa mengunci tabel (InnoDB)
        # --routines           : Sertakan stored procedures & functions
        # --triggers           : Sertakan triggers
        # --events             : Sertakan scheduled events
        # --quick              : Dump baris per baris (hemat memori untuk tabel besar)
        # --add-locks          : Tambahkan LOCK/UNLOCK TABLES untuk restore lebih cepat
        if docker exec "${DB_CONTAINER_FULL}" \
            mysqldump \
                --single-transaction \
                --routines \
                --triggers \
                --events \
                --quick \
                --add-locks \
                -u "${DB_USER}" \
                -p"${DB_PASS}" \
                "${DB_NAME}" \
            > "${DB_DUMP_FILE}" 2>> "${LOG_FILE}"; then
            log "OK" "Backup database MariaDB/MySQL berhasil: ${DB_DUMP_FILE}"
        else
            log "ERROR" "Backup database MariaDB/MySQL GAGAL!"
            exit 1
        fi
        ;;

    pgsql|postgresql)
        log "INFO" "Menjalankan pg_dump pada container ${DB_CONTAINER_FULL}..."
        # PGPASSWORD diekspor sebagai environment variable di dalam container
        # --no-password     : Jangan tanya password (ambil dari PGPASSWORD)
        # --clean           : Tambahkan DROP statement sebelum CREATE (untuk clean restore)
        # --if-exists       : Cegah error jika objek belum ada saat DROP
        # --format=custom   : Format custom PostgreSQL (mendukung selective restore)
        # Catatan: Untuk format custom, gunakan ekstensi .dump
        if docker exec -e PGPASSWORD="${DB_PASS}" "${DB_CONTAINER_FULL}" \
            pg_dump \
                --no-password \
                --clean \
                --if-exists \
                -U "${DB_USER}" \
                -d "${DB_NAME}" \
            > "${DB_DUMP_FILE}" 2>> "${LOG_FILE}"; then
            log "OK" "Backup database PostgreSQL berhasil: ${DB_DUMP_FILE}"
        else
            log "ERROR" "Backup database PostgreSQL GAGAL!"
            exit 1
        fi
        ;;

    *)
        log "ERROR" "Tipe database tidak dikenali: ${DB_TYPE}"
        log "INFO" "Tipe yang didukung: mariadb, mysql, pgsql, postgresql"
        exit 1
        ;;
esac

# Verifikasi file dump tidak kosong (minimal harus > 100 bytes)
DB_DUMP_SIZE=$(stat -c%s "${DB_DUMP_FILE}" 2>/dev/null || echo "0")
if [[ ${DB_DUMP_SIZE} -lt 100 ]]; then
    log "ERROR" "File dump database terlalu kecil (${DB_DUMP_SIZE} bytes). Kemungkinan backup gagal."
    exit 1
fi
log "INFO" "Ukuran dump database: $(numfmt --to=iec ${DB_DUMP_SIZE} 2>/dev/null || echo "${DB_DUMP_SIZE} bytes")"

# ======================== BACKUP FILE KONFIGURASI ========================

log_header "Tahap 3/5 — Backup File Konfigurasi"

readonly CONFIG_DIR="${BACKUP_WORK_DIR}/configs"
mkdir -p "${CONFIG_DIR}"

# Daftar file/direktori yang akan dibackup
declare -a BACKUP_TARGETS=(
    "${PROJECT_DIR}/docker-compose.yml"
    "${PROJECT_DIR}/.env"
    "${PROJECT_DIR}/docker/"
)

for target in "${BACKUP_TARGETS[@]}"; do
    if [[ -e "${target}" ]]; then
        cp -a "${target}" "${CONFIG_DIR}/"
        log "OK" "Berhasil menyalin: $(basename "${target}")"
    else
        log "WARN" "Target tidak ditemukan, dilewati: ${target}"
    fi
done

# Simpan metadata backup (informasi tambahan untuk audit trail)
cat > "${BACKUP_WORK_DIR}/backup-metadata.txt" << EOF
=== BACKUP METADATA ===
Timestamp       : ${TIMESTAMP}
Hostname        : $(hostname)
OS              : $(lsb_release -ds 2>/dev/null || cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d= -f2 | tr -d '"' || echo "Unknown")
Docker Version  : $(docker --version 2>/dev/null || echo "N/A")
DB Type         : ${DB_TYPE}
DB Name         : ${DB_NAME}
DB Container    : ${DB_CONTAINER_FULL}
Project Dir     : ${PROJECT_DIR}
Backup Dir      : ${BACKUP_WORK_DIR}
Operator        : $(whoami)@$(hostname)
========================
EOF
log "OK" "Metadata backup disimpan: backup-metadata.txt"

# ======================== KOMPRESI BACKUP ========================

log_header "Tahap 4/5 — Kompresi & Pengamanan Arsip"

log "INFO" "Mengompres seluruh backup ke arsip .tar.gz..."
if tar -czf "${BACKUP_ARCHIVE}" -C "${BACKUP_BASE_DIR}" "${BACKUP_NAME}" 2>> "${LOG_FILE}"; then
    log "OK" "Kompresi berhasil: ${BACKUP_ARCHIVE}"
else
    log "ERROR" "Kompresi backup GAGAL!"
    exit 1
fi

# Hitung ukuran arsip
ARCHIVE_SIZE=$(stat -c%s "${BACKUP_ARCHIVE}" 2>/dev/null || echo "0")
log "INFO" "Ukuran arsip: $(numfmt --to=iec ${ARCHIVE_SIZE} 2>/dev/null || echo "${ARCHIVE_SIZE} bytes")"

# ── Pengamanan permission arsip ──
# chmod 600 : Hanya root (owner) yang bisa membaca/menulis, tidak ada akses untuk group/others
chmod 600 "${BACKUP_ARCHIVE}"
chown root:root "${BACKUP_ARCHIVE}"
log "OK" "Permission arsip diatur ke 600 (hanya root yang dapat mengakses)."

# ── Pembuatan checksum SHA256 ──
# Checksum digunakan untuk memverifikasi integritas arsip (tidak terkorupsi/termodifikasi)
log "INFO" "Membuat checksum SHA256 untuk verifikasi integritas..."
sha256sum "${BACKUP_ARCHIVE}" > "${BACKUP_CHECKSUM}"
chmod 600 "${BACKUP_CHECKSUM}"
chown root:root "${BACKUP_CHECKSUM}"
CHECKSUM_VALUE=$(awk '{print $1}' "${BACKUP_CHECKSUM}")
log "OK" "Checksum SHA256: ${CHECKSUM_VALUE}"

# ── Hapus direktori kerja sementara (hanya arsip .tar.gz yang disimpan) ──
rm -rf "${BACKUP_WORK_DIR}"
log "INFO" "Direktori sementara dibersihkan. Hanya arsip yang disimpan."

# ======================== RETENSI BACKUP OTOMATIS ========================

log_header "Tahap 5/5 — Retensi & Pembersihan Backup Lama"

log "INFO" "Menghapus backup yang lebih lama dari ${RETENTION_DAYS} hari..."

# Cari dan hapus arsip .tar.gz yang sudah melewati masa retensi
OLD_BACKUPS=$(find "${BACKUP_BASE_DIR}" -name "backup-*.tar.gz" -type f -mtime "+${RETENTION_DAYS}" 2>/dev/null)

if [[ -n "${OLD_BACKUPS}" ]]; then
    DELETED_COUNT=0
    while IFS= read -r old_file; do
        rm -f "${old_file}"
        # Hapus juga file checksum terkait
        rm -f "${old_file}.sha256"
        log "INFO" "Dihapus: $(basename "${old_file}")"
        ((DELETED_COUNT++))
    done <<< "${OLD_BACKUPS}"
    log "OK" "Pembersihan selesai: ${DELETED_COUNT} backup lama dihapus."
else
    log "INFO" "Tidak ada backup lama yang perlu dihapus."
fi

# Tampilkan daftar backup yang tersisa
log "INFO" "Daftar backup tersisa di ${BACKUP_BASE_DIR}:"
ls -lh "${BACKUP_BASE_DIR}"/backup-*.tar.gz 2>/dev/null | while IFS= read -r line; do
    log "INFO" "  ${line}"
done

# ======================== RINGKASAN & NOTIFIKASI ========================

log_header "Backup Selesai!"

SUMMARY="Arsip: ${BACKUP_ARCHIVE}
Ukuran: $(numfmt --to=iec ${ARCHIVE_SIZE} 2>/dev/null || echo "${ARCHIVE_SIZE} bytes")
SHA256: ${CHECKSUM_VALUE}
Database: ${DB_TYPE} (${DB_NAME})
Retensi: ${RETENTION_DAYS} hari"

log "OK" "============================================"
log "OK" "BACKUP BERHASIL DISELESAIKAN"
log "OK" "============================================"
log "INFO" "Arsip   : ${BACKUP_ARCHIVE}"
log "INFO" "Checksum: ${BACKUP_CHECKSUM}"
log "INFO" "SHA256  : ${CHECKSUM_VALUE}"
log "INFO" "Ukuran  : $(numfmt --to=iec ${ARCHIVE_SIZE} 2>/dev/null || echo "${ARCHIVE_SIZE} bytes")"
log "INFO" "Log     : ${LOG_FILE}"

# Kirim notifikasi sukses
notify "SUCCESS" "${SUMMARY}"

log "OK" "Seluruh proses backup selesai pada $(date '+%Y-%m-%d %H:%M:%S %Z')."

# Reset trap agar cleanup_on_error tidak berjalan saat exit normal
trap - EXIT
exit 0
