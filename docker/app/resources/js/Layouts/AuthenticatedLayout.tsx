import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { useFlashToast } from "../hooks/useFlashToast";
import { usePage } from "@inertiajs/react";
import ButtonLogout from "../Components/Buttons/ButtonLogout";

// Mendefinisikan tipe data untuk props
interface AuthenticatedLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function AuthenticatedLayout({
    children,
}: AuthenticatedLayoutProps) {
    // Menampilkan flash message dari Laravel session secara otomatis
    useFlashToast();

    const { auth } = usePage<any>().props;

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            

            {/* Tempat Komponen NavBar buatanmu nanti */}
            <nav className="bg-card border-b border-border h-16 flex items-center justify-between px-6 sticky top-0 z-50">
                <h1 className="font-heading font-bold text-primary">
                    Venus Hub
                </h1>
                <div className="flex items-center space-x-4">
                    {auth?.user && (
                        <>
                            <span className="text-body-m text-foreground/70">
                                {auth.user.name}
                            </span>
                            <ButtonLogout
                                variant="danger"
                                className="scale-75"
                            />
                        </>
                    )}
                </div>
            </nav>

            {/* Wrapper utama untuk konten halaman */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
