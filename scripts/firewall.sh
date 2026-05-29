#!/bin/bash
# ==============================================================================
# firewall.sh — Konfigurasi UFW Firewall, Fail2Ban & OS Hardening (sysctl)
# ==============================================================================
# Kelompok 06 — Topik A | Keamanan Server & Jaringan
#
# Script ini melakukan:
#   1. Validasi lingkungan (OS, koneksi SSH aktif)
#   2. Menginstal UFW dan Fail2Ban (jika belum terinstal)
#   3. Mengonfigurasi UFW dengan kebijakan default deny incoming
#   4. Membuka hanya port yang diperlukan (SSH kustom, HTTP, HTTPS)
#   5. Mengaktifkan UFW logging dan memverifikasi statusnya
#   6. Menerapkan sysctl hardening (anti-spoofing, ICMP, SYN flood)
#   7. Menulis file konfigurasi /etc/fail2ban/jail.local
#   8. Mengaktifkan Fail2Ban dengan jail untuk SSH dan Nginx
#   9. Menangani kompatibilitas Docker ↔ UFW
#
# Penggunaan:
#   chmod +x scripts/firewall.sh
#   sudo bash scripts/firewall.sh [SSH_PORT]
#
# Contoh:
#   sudo bash scripts/firewall.sh 2206
# ==============================================================================

set -euo pipefail

SSH_PORT="${1:-2206}"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly LOGS_NGINX_DIR="${PROJECT_DIR}/logs/nginx"
JAIL_LOCAL="/etc/fail2ban/jail.local"
JAIL_BACKUP="${JAIL_LOCAL}.bak.$(date +%Y%m%d_%H%M%S)"
SYSCTL_HARDENING="/etc/sysctl.d/99-kel06-hardening.conf"
UFW_AFTER_RULES="/etc/ufw/after.rules"
TIMESTAMP="$(date '+%Y-%m-%d %H:%M:%S %Z')"

# ======================== WARNA OUTPUT ========================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ======================== FUNGSI UTILITAS ========================

log_info()    { echo -e "${CYAN}[INFO]${NC}  $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }
log_header()  { echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════════${NC}"; echo -e "${BOLD}  $1${NC}"; echo -e "${BOLD}${CYAN}══════════════════════════════════════════════${NC}\n"; }

# Fungsi: Hitung jumlah langkah selesai untuk progress tracking
TOTAL_STEPS=7
CURRENT_STEP=0
log_step() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    log_header "Langkah ${CURRENT_STEP}/${TOTAL_STEPS} — $1"
}

# ======================== VALIDASI PRA-SYARAT ========================

log_header "Firewall & Fail2Ban & OS Hardening — Kelompok 06"

echo -e "  ${CYAN}Waktu Eksekusi  :${NC} ${TIMESTAMP}"
echo -e "  ${CYAN}SSH Port Target :${NC} ${SSH_PORT}"
echo -e "  ${CYAN}Hostname        :${NC} $(hostname)"
echo -e "  ${CYAN}OS              :${NC} $(grep PRETTY_NAME /etc/os-release 2>/dev/null | cut -d'"' -f2 || uname -s)"
echo ""

# Memastikan skrip dijalankan sebagai root
if [ "$EUID" -ne 0 ]; then
    log_error "Skrip ini harus dijalankan dengan hak akses root (sudo)!"
    log_info  "Cara jalankan: sudo bash $0 [SSH_PORT]"
    exit 1
fi

# Validasi port SSH (harus angka antara 1024–65535)
if ! [[ "$SSH_PORT" =~ ^[0-9]+$ ]] || [ "$SSH_PORT" -lt 1024 ] || [ "$SSH_PORT" -gt 65535 ]; then
    log_error "Port SSH tidak valid: ${SSH_PORT} (harus antara 1024–65535)"
    exit 1
fi
log_success "Port SSH valid: ${SSH_PORT}"

# Deteksi koneksi SSH aktif (peringatan lockout)
if [ -n "${SSH_CONNECTION:-}" ]; then
    log_warn "Terdeteksi sesi SSH aktif dari: ${SSH_CONNECTION%% *}"
    log_warn "JANGAN tutup sesi ini sampai Anda memverifikasi koneksi baru berhasil!"
    echo ""
fi

# Periksa apakah package manager tersedia
if ! command -v apt-get &> /dev/null; then
    log_error "apt-get tidak ditemukan. Script ini hanya mendukung distro Debian/Ubuntu."
    exit 1
fi

# ======================== LANGKAH 1 — INSTALASI PAKET ========================

log_step "Instalasi Paket Keamanan"

# Update repository
log_info "Memperbarui daftar paket (apt update)..."
apt-get update -qq > /dev/null 2>&1
log_success "Daftar paket berhasil diperbarui."

# Install UFW
if command -v ufw &> /dev/null; then
    log_success "UFW sudah terinstal: $(ufw --version 2>/dev/null || echo 'installed')"
else
    log_info "Menginstal UFW..."
    apt-get install -y -qq ufw > /dev/null 2>&1
    log_success "UFW berhasil diinstal."
fi

# Install Fail2Ban
if command -v fail2ban-server &> /dev/null; then
    log_success "Fail2Ban sudah terinstal: $(fail2ban-server --version 2>/dev/null | head -1)"
else
    log_info "Menginstal Fail2Ban..."
    apt-get install -y -qq fail2ban > /dev/null 2>&1
    log_success "Fail2Ban berhasil diinstal."
fi

# ======================== LANGKAH 2 — KONFIGURASI UFW ========================

log_step "Konfigurasi Firewall UFW"

# Reset UFW ke kondisi awal (untuk idempotent)
log_info "Melakukan reset UFW ke konfigurasi default..."
ufw --force reset > /dev/null 2>&1
log_success "UFW berhasil direset."

# ── Kebijakan Default (Memenuhi Spesifikasi: default deny incoming) ──
log_info "Mengatur kebijakan default: ${BOLD}deny incoming${NC}..."
ufw default deny incoming > /dev/null 2>&1
log_success "Default policy incoming: DENY"

log_info "Mengatur kebijakan default: ${BOLD}allow outgoing${NC}..."
ufw default allow outgoing > /dev/null 2>&1
log_success "Default policy outgoing: ALLOW"

# ── Membuka Port yang Diperlukan ──
# Hanya port yang benar-benar dibutuhkan yang dibuka (prinsip least privilege)

log_info "Mengizinkan port SSH kustom: ${BOLD}${SSH_PORT}/tcp${NC}..."
ufw allow "${SSH_PORT}/tcp" comment "SSH - Port Kustom Kelompok 06" > /dev/null 2>&1
log_success "Port ${SSH_PORT}/tcp (SSH) diizinkan."

# Rate limit untuk SSH — otomatis drop IP yang mencoba > 6 koneksi dalam 30 detik
log_info "Menerapkan rate limiting SSH via UFW..."
ufw limit "${SSH_PORT}/tcp" comment "SSH Rate Limit - Anti Brute-Force" > /dev/null 2>&1
log_success "Rate limiting SSH aktif (maks 6 koneksi/30 detik per IP)."

log_info "Mengizinkan port HTTP: ${BOLD}80/tcp${NC} (redirect ke HTTPS)..."
ufw allow 80/tcp comment "HTTP - Redirect ke HTTPS" > /dev/null 2>&1
log_success "Port 80/tcp (HTTP) diizinkan."

log_info "Mengizinkan port HTTPS: ${BOLD}443/tcp${NC} (layanan utama)..."
ufw allow 443/tcp comment "HTTPS - Layanan Web Utama" > /dev/null 2>&1
log_success "Port 443/tcp (HTTPS) diizinkan."

# ── Mengaktifkan UFW Logging ──
log_info "Mengaktifkan UFW logging level: ${BOLD}low${NC}..."
ufw logging low > /dev/null 2>&1
log_success "UFW logging diaktifkan (level: low)."

# ── Mengaktifkan UFW ──
log_info "Mengaktifkan UFW firewall..."
ufw --force enable > /dev/null 2>&1
log_success "UFW berhasil diaktifkan."

# ======================== LANGKAH 3 — DOCKER ↔ UFW COMPATIBILITY ========================

log_step "Kompatibilitas Docker ↔ UFW"

# Docker memanipulasi iptables secara langsung dan bisa bypass aturan UFW.
# Menambahkan aturan RETURN di chain ufw-after-forward agar Docker tetap
# bisa bekerja tanpa mengabaikan kebijakan firewall UFW.

log_info "Memeriksa konfigurasi Docker-UFW compatibility..."

DOCKER_UFW_MARKER="# KELOMPOK-06: Docker UFW Compatibility"

if grep -q "$DOCKER_UFW_MARKER" "$UFW_AFTER_RULES" 2>/dev/null; then
    log_success "Aturan Docker-UFW compatibility sudah ada. Melewati."
else
    log_info "Menambahkan aturan Docker-UFW compatibility ke ${UFW_AFTER_RULES}..."
    cat >> "$UFW_AFTER_RULES" <<EOF

${DOCKER_UFW_MARKER}
# Mencegah Docker bypass aturan UFW pada container yang di-expose
# Mengalirkan traffic DOCKER-USER ke rantai filter UFW agar IP blocked/Fail2Ban bekerja
*filter
:DOCKER-USER - [0:0]
-A DOCKER-USER -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
-A DOCKER-USER -j ufw-user-input
-A DOCKER-USER -j ufw-user-forward
-A DOCKER-USER -j RETURN
COMMIT
EOF
    log_success "Aturan Docker-UFW compatibility berhasil ditambahkan."
fi

# ======================== LANGKAH 4 — VERIFIKASI STATUS UFW ========================

log_step "Verifikasi Status UFW"

log_info "Menampilkan status UFW verbose...\n"
ufw status verbose
echo ""

# Hitung jumlah aturan aktif
RULE_COUNT=$(ufw status | grep -c "ALLOW\|DENY\|LIMIT" || true)
log_success "Verifikasi selesai. Total ${RULE_COUNT} aturan aktif."
log_info "Pastikan tidak ada port yang terbuka tanpa keperluan."

# ======================== LANGKAH 5 — OS HARDENING (SYSCTL) ========================

log_step "OS Hardening via sysctl"

# Sysctl hardening sesuai spesifikasi penilaian:
# "OS hardening (sysctl), tidak ada port terbuka yang tidak perlu"

log_info "Menulis konfigurasi sysctl hardening ke: ${BOLD}${SYSCTL_HARDENING}${NC}"

cat > "$SYSCTL_HARDENING" <<EOF
# ==============================================================================
# 99-kel06-hardening.conf — Sysctl Kernel Hardening
# ==============================================================================
# Kelompok 06 — Topik A | Keamanan Server & Jaringan
# Dibuat oleh: scripts/firewall.sh pada ${TIMESTAMP}
# ==============================================================================

# ─── PROTEKSI JARINGAN (Network Hardening) ───────────────────────────────────

# Aktifkan proteksi SYN flood (SYN cookies)
# Mencegah serangan SYN flood yang bisa meng-exhaust tabel koneksi server
net.ipv4.tcp_syncookies = 1

# Nonaktifkan IP source routing (anti-spoofing)
# Mencegah penyerang menentukan rute paket secara manual
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# Aktifkan Reverse Path Filtering (anti-spoofing)
# Memverifikasi bahwa paket masuk berasal dari interface yang benar
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Nonaktifkan ICMP redirect (anti-MITM)
# Mencegah penyerang mengalihkan traffic via paket ICMP redirect palsu
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# Nonaktifkan penerimaan ICMP redirect untuk IPv6
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0

# Abaikan ICMP broadcast request (anti-Smurf attack)
# Mencegah server merespon ICMP broadcast yang bisa digunakan untuk amplification attack
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Aktifkan proteksi terhadap ICMP bogus error responses
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Log paket yang mencurigakan (spoofed, source-routed, redirected)
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# ─── PROTEKSI KERNEL ─────────────────────────────────────────────────────────

# Nonaktifkan IP forwarding (server bukan router)
# Catatan: Docker memerlukan forwarding, nilainya di-set oleh Docker daemon
# net.ipv4.ip_forward = 1  ← Dikelola oleh Docker, JANGAN diubah manual

# Batasi akses ke kernel pointer (anti-information disclosure)
# Menyembunyikan alamat kernel dari user non-root
kernel.kptr_restrict = 2

# Batasi akses ke dmesg hanya untuk root
kernel.dmesg_restrict = 1

# Aktifkan ASLR (Address Space Layout Randomization) secara penuh
# Mempersulit eksploitasi memory corruption vulnerability
kernel.randomize_va_space = 2

# Nonaktifkan SysRq key (mencegah debug key abuse)
kernel.sysrq = 0

# Batasi akses ke performance events (anti-side-channel attack)
kernel.perf_event_paranoid = 3

# ─── OPTIMASI TCP (Performance + Security) ───────────────────────────────────

# Kurangi waktu TIME_WAIT untuk koneksi TCP (resource optimization)
net.ipv4.tcp_fin_timeout = 15

# Izinkan reuse TIME_WAIT sockets (untuk koneksi baru ke tujuan yang sama)
net.ipv4.tcp_tw_reuse = 1

# Batasi jumlah koneksi SYN yang pending (anti-SYN flood)
net.ipv4.tcp_max_syn_backlog = 2048

# Kurangi jumlah SYN+ACK retransmit (mempercepat drop koneksi yang gagal)
net.ipv4.tcp_synack_retries = 2
EOF

log_success "Konfigurasi sysctl hardening berhasil ditulis."

# Terapkan konfigurasi sysctl
log_info "Menerapkan konfigurasi sysctl hardening..."
if sysctl --system > /dev/null 2>&1; then
    log_success "Sysctl hardening berhasil diterapkan ke kernel."
else
    log_warn "Beberapa parameter sysctl mungkin gagal diterapkan (normal untuk container/VM tertentu)."
    sysctl -p "$SYSCTL_HARDENING" 2>&1 | grep -i "error\|denied" || true
fi

# Verifikasi beberapa parameter kunci
echo ""
echo -e "  ${CYAN}Parameter sysctl yang diterapkan:${NC}"
echo -e "  ${GREEN}├── ${NC}tcp_syncookies      = $(sysctl -n net.ipv4.tcp_syncookies 2>/dev/null || echo 'N/A')"
echo -e "  ${GREEN}├── ${NC}rp_filter (all)      = $(sysctl -n net.ipv4.conf.all.rp_filter 2>/dev/null || echo 'N/A')"
echo -e "  ${GREEN}├── ${NC}accept_redirects     = $(sysctl -n net.ipv4.conf.all.accept_redirects 2>/dev/null || echo 'N/A')"
echo -e "  ${GREEN}├── ${NC}log_martians         = $(sysctl -n net.ipv4.conf.all.log_martians 2>/dev/null || echo 'N/A')"
echo -e "  ${GREEN}├── ${NC}kptr_restrict        = $(sysctl -n kernel.kptr_restrict 2>/dev/null || echo 'N/A')"
echo -e "  ${GREEN}└── ${NC}randomize_va_space   = $(sysctl -n kernel.randomize_va_space 2>/dev/null || echo 'N/A')"
echo ""

# ======================== LANGKAH 6 — KONFIGURASI FAIL2BAN ========================

log_step "Konfigurasi Fail2Ban (jail.local)"

# Membuat direktori log Nginx di host agar dapat diakses oleh kontainer & Fail2Ban
log_info "Mempersiapkan direktori log Nginx di host..."
mkdir -p "$LOGS_NGINX_DIR"
chmod 777 "$LOGS_NGINX_DIR"
touch "${LOGS_NGINX_DIR}/access.log" "${LOGS_NGINX_DIR}/error.log"
chmod 666 "${LOGS_NGINX_DIR}/access.log" "${LOGS_NGINX_DIR}/error.log"
log_success "Direktori log Nginx di host berhasil dipersiapkan."

# Backup jail.local yang sudah ada (jika ada)
if [ -f "$JAIL_LOCAL" ]; then
    log_info "Mencadangkan konfigurasi jail.local lama ke: ${JAIL_BACKUP}"
    cp "$JAIL_LOCAL" "$JAIL_BACKUP"
    log_success "Backup jail.local berhasil dibuat."
fi

log_info "Menulis konfigurasi baru ke: ${BOLD}${JAIL_LOCAL}${NC}"

# Menggunakan heredoc dengan variabel agar SSH_PORT dinamis (bukan hardcoded)
cat > "$JAIL_LOCAL" <<EOF
# ==============================================================================
# jail.local — Konfigurasi Fail2Ban (Override jail.conf)
# ==============================================================================
# Kelompok 06 — Topik A | Keamanan Server & Jaringan
#
# File ini meng-override pengaturan default di /etc/fail2ban/jail.conf.
# Jangan mengedit jail.conf secara langsung karena akan tertimpa saat update.
#
# Dibuat oleh : scripts/firewall.sh
# Tanggal     : ${TIMESTAMP}
# SSH Port    : ${SSH_PORT}
# ==============================================================================

# ─── KONFIGURASI DEFAULT GLOBAL ─────────────────────────────────────────────
[DEFAULT]

# Waktu ban (dalam detik): 1 jam = 3600 detik
# IP yang terdeteksi akan diblokir selama 1 jam
bantime  = 3600

# Incremental ban: setiap ban berikutnya akan semakin lama
# Formula: bantime * (1 * bantime.factor ^ bantime.multiplier)
# Contoh: ban ke-1 = 1 jam, ban ke-2 = 2 jam, ban ke-3 = 4 jam, dst.
bantime.increment = true
bantime.factor    = 1
bantime.formula   = ban.Time * (1 << (ban.Count if ban.Count < 20 else 20)) * banFactor
bantime.maxtime   = 604800

# Jendela waktu pengamatan (dalam detik): 10 menit
# Fail2Ban mengawasi percobaan gagal dalam rentang waktu ini
findtime = 600

# Jumlah percobaan gagal maksimum sebelum IP di-ban
maxretry = 5

# Backend yang digunakan untuk memantau log
backend = systemd

# Action default: ban via UFW
# Menggunakan UFW karena firewall yang aktif di server ini adalah UFW
banaction = ufw

# Daftar IP yang tidak akan pernah di-ban (whitelist)
# Tambahkan IP management/monitoring Anda di sini
ignoreip = 127.0.0.1/8 ::1

# Alamat email untuk notifikasi (opsional, sesuaikan jika diperlukan)
# destemail = admin@kel06.local
# sender    = fail2ban@kel06.local

# Action yang digunakan saat ban terjadi
# %(action_)s    = hanya ban (default, ringan)
# %(action_mw)s  = ban + kirim email dengan whois
# %(action_mwl)s = ban + kirim email dengan whois + log
action = %(action_)s


# ─── JAIL: SSH (PROTEKSI BRUTE-FORCE LOGIN) ─────────────────────────────────
# Melindungi layanan SSH dari serangan brute-force password/key
# Port disesuaikan dengan konfigurasi SSH kustom di setup.sh
[sshd]
enabled  = true
mode     = aggressive
port     = ${SSH_PORT}
filter   = sshd
logpath  = /var/log/auth.log
maxretry = 3
bantime  = 3600
findtime = 600


# ─── JAIL: NGINX HTTP AUTH (PROTEKSI BASIC AUTH) ────────────────────────────
# Melindungi endpoint yang dilindungi HTTP Basic Authentication
# Mencegah brute-force pada halaman yang memerlukan autentikasi Nginx
[nginx-http-auth]
enabled  = true
port     = http,https
filter   = nginx-http-auth
logpath  = ${LOGS_NGINX_DIR}/error.log
maxretry = 5
bantime  = 3600
findtime = 600


# ─── JAIL: NGINX LIMIT REQ (PROTEKSI RATE LIMITING) ─────────────────────────
# Mendeteksi IP yang terkena rate limiting di Nginx (HTTP 429)
# Bekerja bersama konfigurasi limit_req di default.conf (zone: general & login)
[nginx-limit-req]
enabled  = true
port     = http,https
filter   = nginx-limit-req
logpath  = ${LOGS_NGINX_DIR}/error.log
maxretry = 10
bantime  = 3600
findtime = 600


# ─── JAIL: NGINX BOTSEARCH (PROTEKSI SCANNER/BOT) ───────────────────────────
# Mendeteksi dan memblokir bot/scanner yang mencari halaman/file yang tidak ada
# (contoh: /admin, /wp-login.php, /.env, dll.)
[nginx-botsearch]
enabled  = true
port     = http,https
filter   = nginx-botsearch
logpath  = ${LOGS_NGINX_DIR}/access.log
maxretry = 5
bantime  = 86400
findtime = 600


# ─── JAIL: NGINX BAD REQUEST (PROTEKSI MALFORMED REQUEST) ───────────────────
# Mendeteksi dan memblokir IP yang mengirim request HTTP malformed / mencurigakan
# (contoh: request dengan panjang abnormal, method tidak valid, dll.)
[nginx-badbots]
enabled  = true
port     = http,https
filter   = nginx-badbots
logpath  = ${LOGS_NGINX_DIR}/access.log
maxretry = 3
bantime  = 86400
findtime = 600


# ─── JAIL: RECIDIVE (BAN BERULANG = BAN LEBIH LAMA) ─────────────────────────
# IP yang di-ban berulang kali (recidive) akan mendapat ban lebih lama (1 minggu)
# Ini mencegah penyerang persisten yang terus mencoba setelah ban sebelumnya habis
[recidive]
enabled  = true
filter   = recidive
logpath  = /var/log/fail2ban.log
bantime  = 604800
findtime = 86400
maxretry = 3
EOF

log_success "Konfigurasi jail.local berhasil ditulis."

# ── Tampilkan ringkasan jail yang dikonfigurasi ──
echo ""
echo -e "  ${CYAN}Jail yang dikonfigurasi:${NC}"
echo -e "  ${GREEN}├── ${BOLD}sshd${NC}              — Brute-force SSH (port ${SSH_PORT}, mode: aggressive)"
echo -e "  ${GREEN}├── ${BOLD}nginx-http-auth${NC}   — HTTP Basic Auth brute-force"
echo -e "  ${GREEN}├── ${BOLD}nginx-limit-req${NC}   — Rate limiting violations (HTTP 429)"
echo -e "  ${GREEN}├── ${BOLD}nginx-botsearch${NC}   — Bot/scanner detection"
echo -e "  ${GREEN}├── ${BOLD}nginx-badbots${NC}     — Malformed request / bad bots"
echo -e "  ${GREEN}└── ${BOLD}recidive${NC}          — Repeat offender escalation (1 minggu)"
echo ""
echo -e "  ${YELLOW}Fitur tambahan:${NC}"
echo -e "  ${GREEN}├── ${NC}Incremental ban time (makin sering = makin lama di-ban)"
echo -e "  ${GREEN}├── ${NC}IP whitelist (localhost secara default)"
echo -e "  ${GREEN}└── ${NC}SSH port dinamis (${SSH_PORT}) — tidak hardcoded"
echo ""

# ======================== LANGKAH 7 — AKTIVASI FAIL2BAN ========================

log_step "Aktivasi & Verifikasi Fail2Ban"

# Enable Fail2Ban agar berjalan otomatis saat boot
log_info "Mengaktifkan Fail2Ban agar start otomatis saat boot..."
systemctl enable fail2ban > /dev/null 2>&1
log_success "Fail2Ban diaktifkan untuk auto-start saat boot."

# Restart Fail2Ban untuk memuat konfigurasi baru
log_info "Melakukan restart Fail2Ban untuk memuat konfigurasi baru..."
if systemctl restart fail2ban; then
    log_success "Fail2Ban berhasil direstart."
else
    log_error "Gagal merestart Fail2Ban!"
    log_warn "Periksa log error: journalctl -u fail2ban -n 20"
    log_warn "Kemungkinan penyebab: logpath belum ada (normal jika Nginx/Docker belum berjalan)"
    exit 1
fi

# Verifikasi status Fail2Ban
log_info "Menampilkan status Fail2Ban...\n"
fail2ban-client status
echo ""

# Tampilkan status per-jail (hanya yang aktif)
log_info "Verifikasi jail yang aktif:"
for jail in sshd nginx-http-auth nginx-limit-req nginx-botsearch nginx-badbots recidive; do
    if fail2ban-client status "$jail" &>/dev/null; then
        BANNED=$(fail2ban-client status "$jail" 2>/dev/null | grep "Currently banned" | awk '{print $NF}')
        log_success "  Jail ${BOLD}${jail}${NC} aktif (${BANNED:-0} IP banned)"
    else
        log_warn "  Jail ${BOLD}${jail}${NC} belum aktif (logpath mungkin belum tersedia)"
    fi
done
echo ""

# ======================== RINGKASAN & PANDUAN ========================

log_header "Proses Selesai — Ringkasan Konfigurasi Keamanan"

echo -e "  ${BOLD}${CYAN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}           ${BOLD}KONFIGURASI UFW FIREWALL${NC}                 ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}╠════════════════════════════════════════════════════╣${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Default Incoming    : ${BOLD}${RED}DENY${NC}                      ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Default Outgoing    : ${BOLD}${GREEN}ALLOW${NC}                     ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Port SSH (${SSH_PORT})     : ${BOLD}${GREEN}ALLOW + RATE LIMIT${NC}        ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Port HTTP (80)      : ${BOLD}${GREEN}ALLOW${NC} → redirect HTTPS     ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Port HTTPS (443)    : ${BOLD}${GREEN}ALLOW${NC}                     ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Logging             : ${BOLD}${YELLOW}LOW${NC}                       ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Docker Compat       : ${BOLD}${GREEN}CONFIGURED${NC}                ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}╠════════════════════════════════════════════════════╣${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}           ${BOLD}KONFIGURASI FAIL2BAN${NC}                     ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}╠════════════════════════════════════════════════════╣${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Ban Time Default    : ${BOLD}${YELLOW}1 jam (3600s)${NC}             ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Find Time Default   : ${BOLD}${YELLOW}10 menit (600s)${NC}           ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Max Retry Default   : ${BOLD}${YELLOW}5 percobaan${NC}               ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Incremental Ban     : ${BOLD}${GREEN}AKTIF${NC} (makin lama per ban)  ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Max Ban Time        : ${BOLD}${RED}1 minggu (604800s)${NC}        ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Ban Action          : ${BOLD}${YELLOW}UFW${NC}                       ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Total Jails         : ${BOLD}${YELLOW}6${NC}                         ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}╠════════════════════════════════════════════════════╣${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}           ${BOLD}OS HARDENING (SYSCTL)${NC}                    ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}╠════════════════════════════════════════════════════╣${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  SYN Cookies         : ${BOLD}${GREEN}AKTIF${NC}                     ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Source Route         : ${BOLD}${RED}NONAKTIF${NC}                  ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  ICMP Redirect       : ${BOLD}${RED}NONAKTIF${NC}                  ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Reverse Path Filter : ${BOLD}${GREEN}AKTIF${NC}                     ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  ASLR                : ${BOLD}${GREEN}FULL (level 2)${NC}            ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}║${NC}  Log Martians        : ${BOLD}${GREEN}AKTIF${NC}                     ${BOLD}${CYAN}║${NC}"
echo -e "  ${BOLD}${CYAN}╚════════════════════════════════════════════════════╝${NC}"

echo ""
log_info "File konfigurasi yang dibuat/dimodifikasi:"
echo -e "  ${GREEN}├── ${BOLD}${JAIL_LOCAL}${NC}"
echo -e "  ${GREEN}├── ${BOLD}${SYSCTL_HARDENING}${NC}"
echo -e "  ${GREEN}└── ${BOLD}${UFW_AFTER_RULES}${NC} (Docker compat)"

echo ""
log_info "Perintah monitoring yang berguna:"
echo -e "  ${BOLD}ufw status verbose${NC}                   — Lihat aturan firewall aktif"
echo -e "  ${BOLD}ufw status numbered${NC}                  — Lihat aturan dengan nomor (untuk delete)"
echo -e "  ${BOLD}fail2ban-client status${NC}                — Lihat daftar jail aktif"
echo -e "  ${BOLD}fail2ban-client status sshd${NC}           — Lihat detail jail SSH"
echo -e "  ${BOLD}fail2ban-client set sshd unbanip IP${NC}   — Unban IP tertentu"
echo -e "  ${BOLD}fail2ban-client set sshd banip IP${NC}     — Ban IP secara manual"
echo -e "  ${BOLD}journalctl -u fail2ban -f${NC}             — Lihat log Fail2Ban realtime"
echo -e "  ${BOLD}grep 'Ban\|Unban' /var/log/fail2ban.log${NC} — Riwayat ban/unban"
echo -e "  ${BOLD}sysctl -a | grep net.ipv4${NC}             — Lihat parameter sysctl aktif"

echo ""
log_warn "═══════════════════════════════════════════════════════════"
log_warn " PENTING: JANGAN TUTUP SESI SSH INI SEBELUM MEMVERIFIKASI!"
log_warn "═══════════════════════════════════════════════════════════"
log_info "1. Buka terminal/tab baru"
log_info "2. Coba login: ${BOLD}ssh -p ${SSH_PORT} user@$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'IP_SERVER')${NC}"
log_info "3. Jika berhasil, barulah tutup sesi ini."
echo ""
