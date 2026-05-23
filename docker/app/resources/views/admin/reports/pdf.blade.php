<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Venus Space - {{ $period }}</title>
    <style>
        body {
            font-family: 'Helvetica', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.5;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #1a1a1a;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0 0;
            color: #666;
        }
        .kpi-container {
            margin-bottom: 30px;
            width: 100%;
        }
        .kpi-card {
            width: 23%;
            display: inline-block;
            background: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-right: 1%;
            text-align: center;
        }
        .kpi-card h4 {
            margin: 0;
            font-size: 10px;
            text-transform: uppercase;
            color: #888;
        }
        .kpi-card .value {
            font-size: 18px;
            font-weight: bold;
            margin: 5px 0;
            color: #1a1a1a;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1a1a1a;
            border-left: 4px solid #1a1a1a;
            padding-left: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            background: #f5f5f5;
            text-align: left;
            padding: 10px;
            border-bottom: 1px solid #ddd;
            font-size: 10px;
            text-transform: uppercase;
            color: #666;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #eee;
            font-size: 11px;
        }
        .status {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
        }
        .status-lunas { background: #e6f7ef; color: #10b981; }
        .status-pending { background: #fff7ed; color: #f59e0b; }
        .status-batal { background: #fef2f2; color: #ef4444; }
        .footer {
            margin-top: 50px;
            text-align: right;
            font-size: 10px;
            color: #999;
        }
        .unit-badge {
            font-weight: bold;
            color: #555;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>VENUS SPACE</h1>
        <p>Laporan Pendapatan & Transaksi - Periode: {{ $period }}</p>
        <p style="font-size: 10px;">Dicetak pada: {{ $date_generated }}</p>
    </div>

    <div class="kpi-container">
        <div class="kpi-card">
            <h4>Total Pendapatan</h4>
            <div class="value">Rp {{ number_format($kpi['totalRevenue'], 0, ',', '.') }}</div>
        </div>
        <div class="kpi-card">
            <h4>Total Transaksi</h4>
            <div class="value">{{ $kpi['totalBookings'] }}</div>
        </div>
        <div class="kpi-card">
            <h4>Pending</h4>
            <div class="value">Rp {{ number_format($kpi['pendingAmount'], 0, ',', '.') }}</div>
        </div>
        <div class="kpi-card" style="margin-right: 0;">
            <h4>Unit Aktif</h4>
            <div class="value">{{ count($revenueByUnit) }}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Pendapatan Per Unit</div>
        <table>
            <thead>
                <tr>
                    <th>Unit Usaha</th>
                    <th>Jumlah Booking</th>
                    <th>Pendapatan</th>
                    <th>Persentase</th>
                </tr>
            </thead>
            <tbody>
                @foreach($revenueByUnit as $u)
                <tr>
                    <td class="unit-badge">{{ $u['unit'] }}</td>
                    <td>{{ $u['bookings'] }}</td>
                    <td>Rp {{ number_format($u['amount'], 0, ',', '.') }}</td>
                    <td>{{ $u['pct'] }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Daftar Transaksi Terbaru</div>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Waktu</th>
                    <th>Pelanggan</th>
                    <th>Unit</th>
                    <th>Layanan</th>
                    <th>Jumlah</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($allTransactions as $t)
                <tr>
                    <td style="font-family: monospace;">{{ $t['id'] }}</td>
                    <td>{{ $t['time'] }}</td>
                    <td>{{ $t['customer'] }}</td>
                    <td>{{ $t['unit'] }}</td>
                    <td>{{ $t['service'] }}</td>
                    <td>Rp {{ number_format($t['amount'], 0, ',', '.') }}</td>
                    <td>
                        <span class="status status-{{ strtolower($t['status']) }}">
                            {{ $t['status'] }}
                        </span>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>&copy; {{ date('Y') }} Venus Space Management System</p>
    </div>
</body>
</html>
