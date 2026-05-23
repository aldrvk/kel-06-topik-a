import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "../../Layouts/AdminLayout";
import { PageHeader, PrimaryButton } from "../../Components/AdminUI";

type ViewMode = "week" | "day";

const HOURS = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
];
const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const unitColors: Record<string, string> = {
    doorsmeer: "bg-primary/20 border-l-4 border-primary text-secondary",
    bengkel: "bg-orange-100 border-l-4 border-orange-400 text-orange-700",
    coffee: "bg-amber-100 border-l-4 border-amber-400 text-amber-700",
    rental: "bg-purple-100 border-l-4 border-purple-400 text-purple-700",
};

const scheduleItems = [
    {
        day: 0,
        startHour: 10,
        duration: 1,
        unit: "doorsmeer",
        label: "Budi – Cuci Salju",
        sub: "BK 1234 AB",
    },
    {
        day: 0,
        startHour: 14,
        duration: 2,
        unit: "bengkel",
        label: "Anton – Tune Up",
        sub: "BK 9911 KL",
    },
    {
        day: 1,
        startHour: 9,
        duration: 1,
        unit: "coffee",
        label: "Americano × 3",
        sub: "Walk-in",
    },
    {
        day: 1,
        startHour: 14,
        duration: 3,
        unit: "rental",
        label: "Raka – PS5 (3 Jam)",
        sub: "Meja 01",
    },
    {
        day: 2,
        startHour: 11,
        duration: 2,
        unit: "doorsmeer",
        label: "Lina – Cuci Kolong",
        sub: "BK 8899 LO",
    },
    {
        day: 2,
        startHour: 15,
        duration: 1,
        unit: "bengkel",
        label: "Joko – Servis Berkala",
        sub: "BK 7742 XY",
    },
    {
        day: 3,
        startHour: 10,
        duration: 2,
        unit: "rental",
        label: "Doni – PS5 (2 Jam)",
        sub: "Meja 02",
    },
    {
        day: 4,
        startHour: 13,
        duration: 1,
        unit: "coffee",
        label: "Cappuccino × 5",
        sub: "Walk-in",
    },
    {
        day: 5,
        startHour: 9,
        duration: 3,
        unit: "doorsmeer",
        label: "Andi – Full Detailing",
        sub: "BK 6688 KA",
    },
    {
        day: 6,
        startHour: 16,
        duration: 2,
        unit: "rental",
        label: "Ipul – PS4 (2 Jam)",
        sub: "Meja 03",
    },
];

const upcomingList = [
    {
        time: "10:00",
        unit: "DOORSMEER",
        label: "Budi Kusuma",
        sub: "Cuci Salju · BK 1234 AB",
        color: "border-primary",
    },
    {
        time: "11:00",
        unit: "BENGKEL",
        label: "Andi Siregar",
        sub: "Ganti Oli · BK 9911 KL",
        color: "border-orange-400",
    },
    {
        time: "14:00",
        unit: "RENTAL PS",
        label: "Raka Wijaya",
        sub: "PS5 3 Jam · Meja 01",
        color: "border-purple-400",
    },
    {
        time: "15:30",
        unit: "COFFEE SHOP",
        label: "Walk-in Order",
        sub: "Latte + Croissant × 2",
        color: "border-amber-400",
    },
];

export default function Jadwal() {
    const [viewMode, setViewMode] = useState<ViewMode>("week");
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

    const weekDates = DAYS.map((d, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return {
            label: d,
            date: date.getDate(),
            isToday: date.toDateString() === today.toDateString(),
        };
    });

    return (
        <AdminLayout>
            <Head title="Jadwal – Venus Hub Admin" />

            <PageHeader
                title="Jadwal"
                subtitle="Tampilan kalender semua unit usaha dalam satu minggu."
                action={
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex gap-1 bg-surface rounded-full p-1 border border-border text-xs md:text-label-sm">
                            {(["week", "day"] as ViewMode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={`px-3 md:px-4 py-1.5 rounded-full transition-all capitalize ${viewMode === m ? "bg-secondary text-white shadow" : "text-foreground/60 hover:text-foreground"}`}
                                >
                                    {m === "week" ? "Minggu" : "Hari"}
                                </button>
                            ))}
                        </div>
                        <PrimaryButton>Tambah Jadwal</PrimaryButton>
                    </div>
                }
            />

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-5 text-xs md:text-body-reg">
                {[
                    {
                        label: "Doorsmeer",
                        color: "bg-primary/20 border border-primary",
                    },
                    {
                        label: "Bengkel",
                        color: "bg-orange-100 border border-orange-400",
                    },
                    {
                        label: "Coffee Shop",
                        color: "bg-amber-100 border border-amber-400",
                    },
                    {
                        label: "Rental PS",
                        color: "bg-purple-100 border border-purple-400",
                    },
                ].map((l) => (
                    <div key={l.label} className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-sm ${l.color}`} />
                        <span className="text-foreground/60">{l.label}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
                {/* Calendar Grid */}
                <div className="col-span-2 bg-card border border-border rounded-venus overflow-hidden">
                    {/* Day headers */}
                    <div className="grid grid-cols-8 border-b border-border">
                        <div className="py-3 px-3 text-label-sm text-foreground/30 border-r border-border">
                            WAKTU
                        </div>
                        {weekDates.map((d) => (
                            <div
                                key={d.label}
                                className={`py-3 text-center border-r border-border last:border-r-0 ${d.isToday ? "bg-primary/5" : ""}`}
                            >
                                <p className="text-label-sm text-foreground/40">
                                    {d.label}
                                </p>
                                <p
                                    className={`text-h4 mt-0.5 ${d.isToday ? "text-primary" : "text-super-black"}`}
                                >
                                    {d.date}
                                </p>
                            </div>
                        ))}
                    </div>
                    {/* Time rows */}
                    <div className="overflow-y-auto max-h-[420px]">
                        {HOURS.map((hour, hi) => (
                            <div
                                key={hour}
                                className="grid grid-cols-8 border-b border-border/50 min-h-[52px]"
                            >
                                <div className="px-3 py-2 text-body-reg text-foreground/30 border-r border-border flex items-start pt-2">
                                    {hour}
                                </div>
                                {DAYS.map((_, di) => {
                                    const item = scheduleItems.find(
                                        (s) =>
                                            s.day === di &&
                                            s.startHour === parseInt(hour),
                                    );
                                    return (
                                        <div
                                            key={di}
                                            className={`border-r border-border/50 last:border-r-0 p-1 relative ${weekDates[di]?.isToday ? "bg-primary/[0.02]" : ""}`}
                                        >
                                            {item && (
                                                <div
                                                    className={`rounded-venus px-2 py-1.5 text-[10px] font-semibold leading-tight ${unitColors[item.unit]}`}
                                                    style={{
                                                        minHeight: `${item.duration * 52 - 4}px`,
                                                    }}
                                                >
                                                    <p className="font-bold">
                                                        {item.label}
                                                    </p>
                                                    <p className="opacity-70 mt-0.5">
                                                        {item.sub}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming */}
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-venus p-5">
                        <h3 className="text-h4 text-super-black mb-4">
                            Agenda Hari Ini
                        </h3>
                        <div className="space-y-3">
                            {upcomingList.map((u, i) => (
                                <div
                                    key={i}
                                    className={`border-l-4 ${u.color} pl-3 py-1`}
                                >
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-label-sm text-foreground/50">
                                            {u.time}
                                        </span>
                                        <span className="text-[9px] font-bold tracking-widest bg-surface text-foreground/60 px-1.5 py-0.5 rounded-full">
                                            {u.unit}
                                        </span>
                                    </div>
                                    <p className="text-body-m text-super-black font-semibold">
                                        {u.label}
                                    </p>
                                    <p className="text-body-reg text-foreground/50">
                                        {u.sub}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-secondary rounded-venus p-5 text-white relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
                        <p className="text-label-sm text-white/50 mb-2">
                            RINGKASAN MINGGU INI
                        </p>
                        <div className="space-y-3">
                            {[
                                {
                                    label: "Total Jadwal",
                                    value: scheduleItems.length,
                                },
                                {
                                    label: "Doorsmeer",
                                    value: scheduleItems.filter(
                                        (s) => s.unit === "doorsmeer",
                                    ).length,
                                },
                                {
                                    label: "Bengkel",
                                    value: scheduleItems.filter(
                                        (s) => s.unit === "bengkel",
                                    ).length,
                                },
                                {
                                    label: "Rental PS",
                                    value: scheduleItems.filter(
                                        (s) => s.unit === "rental",
                                    ).length,
                                },
                            ].map((r, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between"
                                >
                                    <span className="text-body-reg text-white/70">
                                        {r.label}
                                    </span>
                                    <span className="text-h4 text-white">
                                        {r.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
