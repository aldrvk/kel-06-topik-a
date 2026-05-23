import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function useFlashToast() {
    const { flash } = usePage<any>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                duration: 4000,
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
                iconTheme: { primary: '#3cdbc0', secondary: '#fff' },
            });
        }
        if (flash?.error) {
            toast.error(flash.error, {
                duration: 4000,
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
        }
    }, [flash]);
}
