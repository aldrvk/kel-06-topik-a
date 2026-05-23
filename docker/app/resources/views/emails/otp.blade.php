<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Kode OTP Reset Kata Sandi</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3cdbc0 0%, #065f51 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .content {
            padding: 30px;
            color: #333333;
        }
        .content p {
            margin: 0 0 15px 0;
            line-height: 1.6;
        }
        .otp-box {
            background-color: #f0f9f7;
            border: 2px solid #3cdbc0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #3cdbc0;
            letter-spacing: 4px;
            margin: 0;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 15px 0;
            border-radius: 4px;
            font-size: 13px;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #666666;
            font-size: 12px;
            border-top: 1px solid #eeeeee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Venus Hub</h1>
            <p style="margin: 5px 0 0 0;">Reset Kata Sandi</p>
        </div>

        <div class="content">
            <p>Halo,</p>
            <p>Kami menerima permintaan untuk mereset kata sandi akun Anda. Gunakan kode OTP berikut untuk melanjutkan proses reset kata sandi:</p>

            <div class="otp-box">
                <p class="otp-code">{{ $otpCode }}</p>
            </div>

            <p><strong>Kode OTP ini berlaku selama 10 menit.</strong></p>

            <div class="warning">
                ⚠️ <strong>Penting:</strong> Jangan pernah bagikan kode ini kepada siapa pun. Tim Venus Hub tidak akan pernah meminta kode OTP Anda.
            </div>

            <p>Jika Anda tidak merasa meminta reset kata sandi, abaikan email ini atau hubungi tim support kami.</p>

            <p>Terima kasih,<br><strong>Tim Venus Hub</strong></p>
        </div>

        <div class="footer">
            <p>&copy; {{ now()->year }} Venus Hub. Semua hak dilindungi.</p>
            <p>Jl. Setia Budi No. 435</p>
        </div>
    </div>
</body>
</html>
