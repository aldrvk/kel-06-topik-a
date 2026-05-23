import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "../../Layouts/AdminLayout";
import {
    PageHeader,
} from "../../Components/AdminUI";

type PeriodTab = "Hari Ini" | "Minggu Ini" | "Bulan Ini";



const unitBadgeColor: Record<string, string> = {
    Doorsmeer: "bg-primary/15 text-secondary border border-primary/30",
    Bengkel: "bg-orange-100 text-orange-700 border border-orange-200",
    "Coffee Shop": "bg-amber-100 text-amber-700 border border-amber-200",
    "Rental PS": "bg-purple-100 text-purple-700 border border-purple-200",
    "Vape Store": "bg-indigo-100 text-indigo-700 border border-indigo-200",
};

export default function Laporan({ 
    initialTransactions = [], 
    initialRevenueByUnit = [], 
    initialPeriod = "Hari Ini",
    kpi = { totalRevenue: 0, totalBookings: 0, pendingAmount: 0, pendingCount: 0 },
    chartData = []
}: any) {
    const [activePeriod, setActivePeriod] = useState<PeriodTab>(initialPeriod as PeriodTab);
    const periods: PeriodTab[] = ["Hari Ini", "Minggu Ini", "Bulan Ini"];

    const totalRevenue = kpi?.totalRevenue || 0;
    const totalBookings = kpi?.totalBookings || 0;
    const maxChartValue = Math.max(...(chartData || []).map((d: any) => d.value || 0), 1);

    const handlePeriodChange = (p: PeriodTab) => {
        setActivePeriod(p);
        router.get('/admin/laporan', { period: p }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="Laporan Eksekutif – Venus Hub Admin" />
            
            {/* Header Mewah */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative">
                {/* Decorative background blur */}
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-super-black to-foreground/70 tracking-tight">
                        Laporan Eksekutif
                    </h1>
                    <p className="text-foreground/60 mt-2 font-medium">Ringkasan performa bisnis dan aliran pendapatan terpusat.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex bg-card/60 backdrop-blur-md p-1.5 rounded-full border border-border shadow-sm">
                        {periods.map((p) => (
                            <button
                                key={p}
                                onClick={() => handlePeriodChange(p)}
                                className={`px-5 py-2 rounded-full transition-all duration-300 text-sm font-semibold ${
                                    activePeriod === p 
                                    ? "bg-secondary text-white shadow-md transform scale-105" 
                                    : "text-foreground/60 hover:text-super-black hover:bg-surface"
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => window.location.href = `/admin/laporan/export?period=${activePeriod}`}
                        className="flex items-center gap-2 border border-border text-foreground/70 px-6 py-2.5 rounded-full hover:bg-surface hover:text-super-black transition-all text-sm font-bold w-full sm:w-auto justify-center"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Unduh PDF
                    </button>
                </div>
            </div>

            {/* Top KPI Cards (Glassmorphism & Gradient accents) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                    {
                        label: "Total Pendapatan",
                        value: `Rp ${(totalRevenue / 1000).toFixed(0)}k`,
                        sub: "Dari status Lunas",
                        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
                        gradient: "from-primary to-primary/80",
                        glow: "group-hover:shadow-primary/20",
                        positive: true,
                    },
                    {
                        label: "Total Transaksi",
                        value: totalBookings,
                        sub: `${initialTransactions.length} tercatat`,
                        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
                        gradient: "from-secondary to-secondary/80",
                        glow: "group-hover:shadow-secondary/20",
                        positive: true,
                    },
                    {
                        label: "Rata-rata Transaksi",
                        value: totalBookings > 0 ? `Rp ${Math.round(totalRevenue / totalBookings / 1000)}k` : 'Rp 0',
                        sub: "Per booking",
                        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
                        gradient: "from-primary/60 to-primary",
                        glow: "group-hover:shadow-primary/20",
                        positive: true,
                    },
                    {
                        label: "Pending Pembayaran",
                        value: `Rp ${((kpi?.pendingAmount || 0) / 1000).toFixed(0)}k`,
                        sub: `${kpi?.pendingCount || 0} transaksi menunggu`,
                        icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                        gradient: "from-rose-500 to-red-600",
                        glow: "group-hover:shadow-rose-500/20",
                        positive: false,
                    },
                ].map((k, i) => (
                    <div
                        key={i}
                        className={`group relative bg-card/80 backdrop-blur-lg border border-border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${k.glow} overflow-hidden`}
                    >
                        {/* Decorative subtle gradient background */}
                        <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${k.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
                        
                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${k.gradient} text-white flex items-center justify-center shadow-md`}>
                                {k.icon}
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-surface border border-border ${k.positive ? "text-foreground/70" : "text-rose-500"}`}>
                                {k.sub}
                            </span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-1">
                                {k.label}
                            </p>
                            <p className="text-3xl font-extrabold text-super-black tracking-tight">
                                {k.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue by Unit */}
                <div className="lg:col-span-1 bg-card/80 backdrop-blur-lg border border-border rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-6 bg-gradient-to-b from-primary to-secondary rounded-full" />
                        <h3 className="text-xl font-extrabold text-super-black tracking-tight">
                            Distribusi Unit
                        </h3>
                    </div>
                    
                    <div className="space-y-5 flex-1">
                        {initialRevenueByUnit.map((u: any, i: number) => (
                            <div key={u.unit} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-foreground group-hover:text-super-black transition-colors">
                                        {u.unit}
                                    </span>
                                    <span className="text-sm font-extrabold text-super-black">
                                        Rp {(u.amount / 1000).toFixed(0)}k
                                    </span>
                                </div>
                                <div className="h-2.5 bg-surface rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full ${u.color} rounded-full transition-all duration-1000 ease-out relative`}
                                        style={{ width: `${u.pct}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_infinite]" />
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-foreground/40 mt-1.5 flex justify-between">
                                    <span>{u.bookings} transaksi</span>
                                    <span>{u.pct}%</span>
                                </p>
                            </div>
                        ))}
                    </div>
                    
                    {/* Total summary */}
                    <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground/50 uppercase tracking-wider">
                            Total Eksekutif
                        </span>
                        <span className="text-2xl font-extrabold text-secondary">
                            Rp {(totalRevenue / 1000).toFixed(0)}k
                        </span>
                    </div>
                </div>

                {/* Bar Chart (visual representation) */}
                <div className="col-span-2 bg-card/80 backdrop-blur-lg border border-border rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-6 bg-gradient-to-b from-secondary to-primary rounded-full" />
                            <h3 className="text-xl font-extrabold text-super-black tracking-tight">
                                Tren Transaksi
                            </h3>
                        </div>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                            {activePeriod}
                        </span>
                    </div>
                    
                    <div className="flex items-end justify-between gap-1 sm:gap-3 h-56 mt-auto">
                        {chartData.map((d: any, i: number) => {
                            const heightPct = (d.value / maxChartValue) * 100;
                            const gradients = [
                                "from-primary to-primary/80",
                                "from-secondary to-secondary/80",
                                "from-primary/70 to-primary/50",
                                "from-secondary/70 to-secondary/50",
                            ];
                            const currentGradient = gradients[i % gradients.length];
                            
                            return (
                                <div
                                    key={d.label}
                                    className="flex-1 flex flex-col items-center gap-2 group"
                                >
                                    <div
                                        className="w-full relative flex items-end justify-center"
                                        style={{ height: "180px" }}
                                    >
                                        <div className={`absolute -bottom-2 w-full h-4 bg-gradient-to-r ${currentGradient} blur-md opacity-0 group-hover:opacity-40 transition-opacity`} />
                                        <div
                                            className={`w-full max-w-[40px] rounded-t-lg bg-gradient-to-t ${currentGradient} opacity-70 group-hover:opacity-100 transition-all duration-300 cursor-pointer relative shadow-inner`}
                                            style={{ height: `${heightPct || 3}%` }}
                                            title={`${d.label}: ${d.value} transaksi`}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-super-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                                {d.value} trx
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-semibold text-foreground/50 group-hover:text-super-black transition-colors whitespace-nowrap">
                                        {d.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
