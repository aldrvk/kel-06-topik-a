#!/bin/bash
# ==============================================================================
# setup.sh — Script Konfigurasi & Hardening Awal VM (SSH & Permission)
# ==============================================================================
# Kelompok 06 — Topik A | Keamanan Server & Jaringan
#
# Script ini melakukan:
#   1. Backup konfigurasi SSH daemon (/etc/ssh/sshd_config)
#   2. Mengubah port default SSH ke port kustom (default: 2206)
#   3. Menonaktifkan login root langsung via SSH
#   4. Menonaktifkan autentikasi password (memaksa key-only auth)
#   5. Memvalidasi sintaks konfigurasi SSH sebelum merestart layanan
#   6. Memperketat izin akses direktori home dan berkas .ssh/authorized_keys
#
# Penggunaan:
#   chmod +x scripts/setup.sh
#   sudo bash scripts/setup.sh [PORT_KUSTOM]
#
# Contoh:
#   sudo bash scripts/setup.sh 2206
# ==============================================================================

set -euo pipefail

SSH_PORT="${1:-2206}"
SSHD_CONFIG="/etc/ssh/sshd_config"
BACKUP_FILE="${SSHD_CONFIG}.bak.$(date +%Y%m%d_%H%M%S)"

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

# Fungsi untuk memperbarui atau menyisipkan konfigurasi sshd_config secara aman (idempotent)
set_sshd_config() {
    local key="$1"
    local value="$2"
    # Memeriksa apakah konfigurasi sudah ada (aktif atau dikomentari)
    if grep -qE "^[#\s]*${key}\b" "$SSHD_CONFIG"; then
        # Mengganti baris konfigurasi yang ada
        sed -i -E "s/^[#\s]*${key}\b.*/${key} ${value}/" "$SSHD_CONFIG"
    else
        # Menambahkan konfigurasi baru di akhir file
        echo "${key} ${value}" >> "$SSHD_CONFIG"
    fi
}

# ======================== VALIDASI PRA-SYARAT ========================

log_header "VM Setup & Hardening SSH — Kelompok 06"

# Memastikan skrip dijalankan sebagai root
if [ "$EUID" -ne 0 ]; then
    log_error "Skrip ini harus dijalankan dengan hak akses root (sudo)!"
    log_info  "Cara jalankan: sudo bash $0 [PORT]"
    exit 1
fi

# Memastikan berkas sshd_config ada
if [ ! -f "$SSHD_CONFIG" ]; then
    log_error "Berkas konfigurasi SSH tidak ditemukan di: ${SSHD_CONFIG}"
    exit 1
fi

# ======================== LANGKAH 1 — SSH HARDENING ========================

log_header "Langkah 1/3 — Konfigurasi Hardening SSH"

log_info "Membuat cadangan konfigurasi SSH ke: ${BACKUP_FILE}"
cp "$SSHD_CONFIG" "$BACKUP_FILE"
log_success "Backup berhasil dibuat."

# Terapkan konfigurasi SSH sesuai standar keamanan
log_info "Mengatur Port SSH ke: ${SSH_PORT}"
set_sshd_config "Port" "${SSH_PORT}"

log_info "Menonaktifkan login root langsung (PermitRootLogin no)..."
set_sshd_config "PermitRootLogin" "no"

log_info "Menonaktifkan autentikasi kata sandi (PasswordAuthentication no)..."
set_sshd_config "PasswordAuthentication" "no"

log_info "Memastikan autentikasi kunci publik aktif (PubkeyAuthentication yes)..."
set_sshd_config "PubkeyAuthentication" "yes"
set_sshd_config "AuthorizedKeysFile" ".ssh/authorized_keys .ssh/authorized_keys2"

# ======================== LANGKAH 2 — VALIDASI & RESTART LAYANAN ========================

log_header "Langkah 2/3 — Validasi & Restart Layanan SSH"

log_info "Menguji sintaks konfigurasi SSH baru..."
if sshd -t; then
    log_success "Sintaks konfigurasi SSH valid dan aman."
    
    log_info "Melakukan restart pada layanan SSH daemon..."
    if systemctl is-active --quiet sshd; then
        systemctl restart sshd
        log_success "Layanan sshd berhasil dimulai ulang."
    elif systemctl is-active --quiet ssh; then
        systemctl restart ssh
        log_success "Layanan ssh berhasil dimulai ulang."
    else
        log_warn "Systemd tidak mendeteksi layanan ssh/sshd yang aktif."
        log_warn "Mencoba metode alternatif restart via service..."
        if service ssh restart &>/dev/null; then
            log_success "Layanan ssh berhasil direstart via service."
        elif service sshd restart &>/dev/null; then
            log_success "Layanan sshd berhasil direstart via service."
        else
            log_error "Gagal merestart layanan SSH secara otomatis."
            log_warn "Silakan jalankan perintah restart layanan SSH secara manual di VM Anda."
        fi
    fi
else
    log_error "Sintaks konfigurasi baru TIDAK VALID!"
    log_warn "Membatalkan perubahan dan mengembalikan konfigurasi cadangan..."
    cp "$BACKUP_FILE" "$SSHD_CONFIG"
    rm -f "$BACKUP_FILE"
    log_success "Rollback selesai. SSH Anda tetap aman menggunakan konfigurasi lama."
    exit 1
fi

# ======================== LANGKAH 3 — HARDENING IZIN AKSES FILE ========================

log_header "Langkah 3/3 — Pengetatan Izin Akses Berkas & Direktori"

# Cari semua pengguna manusia (UID >= 1000, mengecualikan 'nobody')
log_info "Memeriksa dan memperketat izin akses direktori untuk user di sistem..."
awk -F: '$3 >= 1000 && $3 != 65534 {print $1,$6}' /etc/passwd | while read -r username homedir; do
    if [ -d "$homedir" ]; then
        log_info "Memperketat izin home directory untuk user: ${username} (${homedir})"
        chmod 750 "$homedir"
        
        if [ -d "${homedir}/.ssh" ]; then
            log_info "  -> Mengamankan direktori .ssh..."
            chmod 700 "${homedir}/.ssh"
            chown "${username}:${username}" "${homedir}/.ssh"
            
            if [ -f "${homedir}/.ssh/authorized_keys" ]; then
                log_info "  -> Mengamankan berkas authorized_keys..."
                chmod 600 "${homedir}/.ssh/authorized_keys"
                chown "${username}:${username}" "${homedir}/.ssh/authorized_keys"
            fi
            
            # Kunci privat lokal (jika ada) harus 600
            find "${homedir}/.ssh" -type f \( -name "id_*" -o -name "*.pem" \) -exec chmod 600 {} \; 2>/dev/null || true
        fi
    fi
done

# Amankan juga direktori root
if [ -d "/root/.ssh" ]; then
    log_info "Memperketat izin akses direktori /root/.ssh..."
    chmod 700 /root/.ssh
    if [ -f "/root/.ssh/authorized_keys" ]; then
        chmod 600 /root/.ssh/authorized_keys
    fi
fi

log_success "Hardening izin akses berkas selesai."

# ======================== RINGKASAN & PANDUAN PENTING ========================

log_header "Proses Selesai & Tindakan Lanjutan Wajib"

echo -e "  Port SSH Aktif          : ${BOLD}${YELLOW}${SSH_PORT}${NC}"
echo -e "  Login Root via SSH      : ${BOLD}${RED}NONAKTIF (PermitRootLogin no)${NC}"
echo -e "  Autentikasi Password    : ${BOLD}${RED}NONAKTIF (PasswordAuthentication no)${NC}"
echo -e "  Autentikasi Key-Pair    : ${BOLD}${GREEN}AKTIF (PubkeyAuthentication yes)${NC}"
echo ""
log_warn "PENTING: Jangan menutup sesi terminal aktif ini terlebih dahulu!"
log_info "1. Tambahkan aturan UFW untuk mengizinkan port baru (misal: ${BOLD}sudo ufw allow ${SSH_PORT}/tcp${NC})"
log_info "2. Buka terminal atau tab baru, dan coba hubungi server dengan:"
log_info "   ${BOLD}ssh -i /path/ke/kunci_privat.pem -p ${SSH_PORT} user_anda@ip_server${NC}"
log_info "3. Setelah koneksi baru terverifikasi sukses, barulah Anda boleh menutup terminal ini."
echo ""
