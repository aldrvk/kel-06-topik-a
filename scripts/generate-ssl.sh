#!/bin/bash
# ==============================================================================
# generate-ssl.sh — Self-Signed SSL Certificate Generator (Keamanan Tinggi)
# ==============================================================================
# Kelompok 06 — Topik A | Keamanan Server & Jaringan
#
# Script ini men-generate:
#   1. Private Key RSA 4096-bit (keamanan tinggi)
#   2. Self-Signed Certificate dengan SHA-256 + SAN (Subject Alternative Name)
#   3. DH Parameters 2048-bit untuk Perfect Forward Secrecy (PFS)
#
# Penggunaan:
#   chmod +x scripts/generate-ssl.sh
#   sudo bash scripts/generate-ssl.sh
#
# Output directory: ./docker/nginx/ssl/
# ==============================================================================

set -euo pipefail  # Exit on error, undefined var, pipe failure (defensive scripting)

# ======================== KONFIGURASI ========================

# Direktori output sertifikat (relatif terhadap root project)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SSL_DIR="${PROJECT_ROOT}/docker/nginx/ssl"

# Parameter sertifikat
KEY_SIZE=4096                          # RSA key size (4096-bit = keamanan tinggi)
CERT_DAYS=365                          # Masa berlaku sertifikat (1 tahun)
DH_PARAM_SIZE=2048                     # DH parameters untuk PFS
COUNTRY="ID"                           # Kode negara (Indonesia)
STATE="Jawa Barat"                     # Provinsi
LOCALITY="Bandung"                     # Kota
ORGANIZATION="Kelompok 06"             # Nama organisasi/kelompok
ORG_UNIT="Keamanan Server & Jaringan"  # Unit organisasi
COMMON_NAME="kel06.local"              # Domain utama (Common Name)

# File output
PRIVATE_KEY="${SSL_DIR}/server.key"
CERTIFICATE="${SSL_DIR}/server.crt"
DH_PARAMS="${SSL_DIR}/dhparam.pem"
OPENSSL_CNF="${SSL_DIR}/openssl-san.cnf"

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

# ======================== VALIDASI PRA-SYARAT ========================

log_header "SSL Certificate Generator — Kelompok 06"

# Cek apakah openssl terinstall
if ! command -v openssl &> /dev/null; then
    log_error "OpenSSL tidak ditemukan! Install terlebih dahulu."
    log_info  "  Ubuntu/Debian : sudo apt install openssl"
    log_info  "  Alpine        : apk add openssl"
    exit 1
fi

log_info "OpenSSL version: $(openssl version)"

# ======================== PERSIAPAN DIREKTORI ========================

log_header "Langkah 1/4 — Persiapan Direktori"

if [ -d "$SSL_DIR" ]; then
    log_warn "Direktori SSL sudah ada: ${SSL_DIR}"
    log_warn "File sertifikat lama akan di-overwrite!"
else
    mkdir -p "$SSL_DIR"
    log_success "Direktori SSL dibuat: ${SSL_DIR}"
fi

# ======================== GENERATE OPENSSL CONFIG DENGAN SAN ========================

log_header "Langkah 2/4 — Generate OpenSSL Config (SAN)"

# SAN (Subject Alternative Name) diperlukan agar sertifikat valid di browser modern
# Browser modern (Chrome 58+) mengabaikan CN dan hanya memeriksa SAN
cat > "$OPENSSL_CNF" <<EOF
[req]
default_bits       = ${KEY_SIZE}
default_md         = sha256
distinguished_name = req_distinguished_name
req_extensions     = v3_req
x509_extensions    = v3_ca
prompt             = no

[req_distinguished_name]
C  = ${COUNTRY}
ST = ${STATE}
L  = ${LOCALITY}
O  = ${ORGANIZATION}
OU = ${ORG_UNIT}
CN = ${COMMON_NAME}

[v3_req]
basicConstraints     = CA:FALSE
keyUsage             = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName       = @alt_names
extendedKeyUsage     = serverAuth

[v3_ca]
basicConstraints     = critical, CA:FALSE
keyUsage             = critical, digitalSignature, keyEncipherment
extendedKeyUsage     = serverAuth
subjectAltName       = @alt_names
subjectKeyIdentifier = hash

[alt_names]
DNS.1 = ${COMMON_NAME}
DNS.2 = localhost
DNS.3 = kel06-proxy
IP.1  = 127.0.0.1
IP.2  = 10.0.0.1
EOF

log_success "OpenSSL config dengan SAN berhasil dibuat"
log_info "  SAN entries: ${COMMON_NAME}, localhost, kel06-proxy, 127.0.0.1, 10.0.0.1"

# ======================== GENERATE PRIVATE KEY + CERTIFICATE ========================

log_header "Langkah 3/4 — Generate Private Key & Certificate"

log_info "Generating RSA ${KEY_SIZE}-bit private key..."
openssl genrsa -out "$PRIVATE_KEY" "$KEY_SIZE" 2>/dev/null
log_success "Private key berhasil di-generate: ${PRIVATE_KEY}"

log_info "Generating self-signed certificate (valid ${CERT_DAYS} hari)..."
openssl req -new -x509 \
    -key "$PRIVATE_KEY" \
    -out "$CERTIFICATE" \
    -days "$CERT_DAYS" \
    -config "$OPENSSL_CNF" \
    -extensions v3_ca \
    -sha256 2>/dev/null
log_success "Certificate berhasil di-generate: ${CERTIFICATE}"

log_info "Generating DH parameters (${DH_PARAM_SIZE}-bit) untuk Perfect Forward Secrecy..."
log_warn "Proses ini membutuhkan waktu beberapa saat, harap tunggu..."
openssl dhparam -out "$DH_PARAMS" "$DH_PARAM_SIZE" 2>/dev/null
log_success "DH parameters berhasil di-generate: ${DH_PARAMS}"

# ======================== SET PERMISSION KETAT ========================

log_header "Langkah 4/4 — Hardening File Permissions"

# Private key: hanya owner yang boleh baca (sangat sensitif)
chmod 600 "$PRIVATE_KEY"
log_success "Permission private key: 600 (owner read/write only)"

# Certificate: boleh dibaca semua (publik)
chmod 644 "$CERTIFICATE"
log_success "Permission certificate: 644 (world readable)"

# DH params: hanya owner dan group
chmod 640 "$DH_PARAMS"
log_success "Permission DH params: 640 (owner+group read)"

# OpenSSL config: hanya owner
chmod 600 "$OPENSSL_CNF"
log_success "Permission OpenSSL config: 600 (owner only)"

# ======================== VALIDASI HASIL ========================

log_header "Validasi Sertifikat"

echo -e "${CYAN}Subject:${NC}"
openssl x509 -in "$CERTIFICATE" -noout -subject | sed 's/^/  /'

echo -e "\n${CYAN}Issuer:${NC}"
openssl x509 -in "$CERTIFICATE" -noout -issuer | sed 's/^/  /'

echo -e "\n${CYAN}Validity:${NC}"
openssl x509 -in "$CERTIFICATE" -noout -dates | sed 's/^/  /'

echo -e "\n${CYAN}Key Strength:${NC}"
echo "  $(openssl rsa -in "$PRIVATE_KEY" -text -noout 2>/dev/null | head -1)"

echo -e "\n${CYAN}Signature Algorithm:${NC}"
openssl x509 -in "$CERTIFICATE" -noout -text | grep "Signature Algorithm" | head -1 | sed 's/^[ \t]*/  /'

echo -e "\n${CYAN}Subject Alternative Names (SAN):${NC}"
openssl x509 -in "$CERTIFICATE" -noout -text | grep -A1 "Subject Alternative Name" | tail -1 | sed 's/^[ \t]*/  /'

echo -e "\n${CYAN}Fingerprint (SHA-256):${NC}"
openssl x509 -in "$CERTIFICATE" -noout -fingerprint -sha256 | sed 's/^/  /'

# ======================== RINGKASAN ========================

log_header "Selesai! Ringkasan File SSL"

echo -e "  ${GREEN}├── ${BOLD}${PRIVATE_KEY}${NC}"
echo -e "  ${GREEN}│   ${NC}RSA ${KEY_SIZE}-bit private key (chmod 600)"
echo -e "  ${GREEN}├── ${BOLD}${CERTIFICATE}${NC}"
echo -e "  ${GREEN}│   ${NC}Self-signed certificate, valid ${CERT_DAYS} hari (chmod 644)"
echo -e "  ${GREEN}├── ${BOLD}${DH_PARAMS}${NC}"
echo -e "  ${GREEN}│   ${NC}DH parameters ${DH_PARAM_SIZE}-bit untuk PFS (chmod 640)"
echo -e "  ${GREEN}└── ${BOLD}${OPENSSL_CNF}${NC}"
echo -e "      OpenSSL config dengan SAN (chmod 600)"

echo ""
log_info "Selanjutnya, jalankan: ${BOLD}docker compose up -d --build${NC}"
log_info "Akses aplikasi via: ${BOLD}https://localhost${NC}"
echo ""
