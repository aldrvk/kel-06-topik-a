FROM php:8.3-fpm-alpine

# Direktori kerja di dalam container
WORKDIR /var/www/html

# Install dependensi sistem yang dibutuhkan Laravel & build tool
RUN apk update && apk add --no-cache \
    build-base \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    bash \
    nodejs \
    npm

# Install PHP extensions yang diperlukan untuk Laravel & MariaDB
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql zip gd bcmath opcache

# Copy Composer dari image resmi
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Membuat grup dan user non-root secara aman (Memenuhi Spesifikasi 5)
RUN addgroup -g 1000 laravel && \
    adduser -u 1000 -G laravel -s /bin/sh -D laravel

# Menyalin kode aplikasi ke container dan mengubah kepemilikan menjadi milik user laravel
COPY --chown=laravel:laravel . /var/www/html

# Mengatur permission folder storage dan bootstrap/cache agar bisa ditulis oleh user laravel
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Beralih dari user root ke user non-root laravel sebelum menjalankan app (Mandatori)
USER laravel

# Ekspose port internal PHP-FPM
EXPOSE 9000

CMD ["php-fpm"]
