import { usePage } from '@inertiajs/react';

interface UnitSchedule {
    open: string;
    close: string;
    is_open: boolean;
}

interface UnitSettings {
    is_active: boolean;
    schedule: Record<string, UnitSchedule>;
}

export function useOperationalStatus(unitName: string) {
    const { settings } = usePage().props as any;
    
    // Default return if no settings found (fallback to always open to avoid breaking)
    if (!settings || !settings[unitName]) {
        return { isOpen: true, message: '' };
    }

    const unitSettings = settings[unitName] as UnitSettings;

    if (!unitSettings.is_active) {
        return { isOpen: false, message: 'Layanan ini sedang tidak aktif.' };
    }

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const today = new Date();
    const dayName = days[today.getDay()];
    
    const todaySchedule = unitSettings.schedule[dayName];

    if (!todaySchedule || !todaySchedule.is_open) {
        return { isOpen: false, message: 'Toko libur hari ini.' };
    }

    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const currentTime = currentHour + currentMinute / 60;

    const [openHour, openMinute] = todaySchedule.open.split(':').map(Number);
    const openTime = openHour + (openMinute || 0) / 60;

    const [closeHour, closeMinute] = todaySchedule.close.split(':').map(Number);
    const closeTime = closeHour + (closeMinute || 0) / 60;

    if (currentTime < openTime || currentTime >= closeTime) {
        return { isOpen: false, message: `Buka pukul ${todaySchedule.open} - ${todaySchedule.close} WIB.` };
    }

    return { isOpen: true, message: '' };
}
