import { useForm } from "@inertiajs/react";
import ButtonInitiate from "./ButtonInitiate";
import { useState } from "react";

interface ButtonLogoutProps {
    className?: string;
    variant?: "primary" | "secondary" | "tertiary" | "danger";
}

export default function ButtonLogout({
    className = "",
    variant = "danger",
}: ButtonLogoutProps) {
    const { post, processing } = useForm();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        post("/logout", {
            preserveState: false,
            preserveScroll: false,
        });
    };

    return (
        <ButtonInitiate
            variant={variant}
            onClick={handleLogout}
            disabled={processing || isLoggingOut}
            className={className}
        >
            {processing || isLoggingOut ? "Keluar..." : "Keluar"}
        </ButtonInitiate>
    );
}
