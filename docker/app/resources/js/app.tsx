import "./Bootstrap";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import React, { useEffect } from "react";
import { Toaster, useToasterStore, toast } from "react-hot-toast";

const TOAST_LIMIT = 1;

function GlobalToaster() {
    const { toasts } = useToasterStore();

    useEffect(() => {
        toasts
            .filter((t) => t.visible)
            .filter((_, i) => i >= TOAST_LIMIT)
            .forEach((t) => toast.dismiss(t.id));
    }, [toasts]);

    return (
        <Toaster 
            position="top-center" 
            toastOptions={{
                duration: 4000,
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
                success: {
                    iconTheme: { primary: '#3cdbc0', secondary: '#fff' },
                }
            }}
        />
    );
}

createInertiaApp({
    resolve: (name: string) => {
        const pages = import.meta.glob<{ default: React.ComponentType }>(
            "./Pages/**/*.tsx",
            { eager: true },
        );
        return pages[`./Pages/${name}.tsx`]!;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <>
                <GlobalToaster />
                <App {...props} />
            </>
        );
    },
});
