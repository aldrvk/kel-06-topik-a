import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// ── Logika kekuatan kata sandi ───────────────────────────────────────────────
type StrengthLevel = 'empty' | 'weak' | 'strong' | 'very-strong';

interface StrengthResult {
    level: StrengthLevel;
    score: number;
    checks: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        number: boolean;
        symbol: boolean;
    };
}

function checkStrength(pwd: string): StrengthResult {
    const checks = {
        length:    pwd.length >= 8,
        uppercase: /[A-Z]/.test(pwd),
        lowercase: /[a-z]/.test(pwd),
        number:    /[0-9]/.test(pwd),
        symbol:    /[^A-Za-z0-9]/.test(pwd),
    };
    const score = Object.values(checks).filter(Boolean).length;
    let level: StrengthLevel = 'empty';
    if (pwd.length === 0)  level = 'empty';
    else if (score <= 2)   level = 'weak';
    else if (score <= 3)   level = 'strong';
    else                    level = 'very-strong';
    return { level, score, checks };
}

const strengthConfig = {
    empty:         { label: '',             bars: 0, color: 'bg-surface',   text: 'text-foreground' },
    weak:          { label: 'Lemah',        bars: 1, color: 'bg-error',     text: 'text-error' },
    strong:        { label: 'Kuat',         bars: 2, color: 'bg-secondary', text: 'text-secondary' },
    'very-strong': { label: 'Sangat Kuat',  bars: 3, color: 'bg-primary',   text: 'text-primary' },
};

// ── Komponen FloatingInput (di luar agar tidak di-recreate tiap render) ──────
interface FloatingInputProps {
    id: string;
    label: string;
    type: string;
    value: string;
    onChange: (v: string) => void;
    eye?: boolean;
    onToggleEye?: () => void;
}

const FloatingInput = ({ id, label, type, value, onChange, eye, onToggleEye }: FloatingInputProps) => (
    <div className="relative">
        <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder=" "
            className="block px-5 pb-3 pt-6 w-full text-body text-foreground bg-surface rounded-venus border border-border appearance-none focus:outline-none focus:ring-2 focus:ring-primary peer transition-all duration-300 shadow-sm"
        />
        <label
            htmlFor={id}
            className="absolute text-labelSm text-primary duration-300 transform -translate-y-3 scale-85 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-85 peer-focus:-translate-y-3 peer-focus:text-primary"
        >
            {label}
        </label>
        {eye && (
            <button
                type="button"
                onClick={onToggleEye}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground hover:text-primary focus:outline-none transition-colors"
            >
                {type === 'text' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
            </button>
        )}
    </div>
);
// ─────────────────────────────────────────────────────────────────────────────

interface AuthModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSwitch?: (modal: 'login' | 'register' | 'forgot-password') => void;
}

export default function Register({ isOpen = true, onClose, onSwitch }: AuthModalProps) {
    const [isLoaded, setIsLoaded]         = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);
    const [agree, setAgree]               = useState(false);
    const [strength, setStrength]         = useState<StrengthResult>(checkStrength(''));

    const { data, setData, post, processing, errors } = useForm({
        name:                  '',
        email:                 '',
        password:              '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setIsLoaded(true), 50);
        } else {
            setIsLoaded(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePasswordChange = (val: string) => {
        setData('password', val);
        setStrength(checkStrength(val));
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();

        if (!agree) {
            toast.error('Anda harus menyetujui Syarat & Ketentuan terlebih dahulu!');
            return;
        }
        if (!data.email.endsWith('@gmail.com')) {
            toast.error('Email harus menggunakan alamat @gmail.com');
            return;
        }
        if (data.password !== data.password_confirmation) {
            toast.error('Kata sandi dan konfirmasi kata sandi tidak cocok!');
            return;
        }
        if (strength.level === 'weak' || strength.level === 'empty') {
            toast.error('Kata sandi terlalu lemah. Perkuat kata sandi Anda terlebih dahulu!');
            return;
        }

        post('/register', {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                if (onClose) onClose();
            },
            onError: (errs) => {
                const first = Object.values(errs)[0];
                if (first) toast.error(first as string);
            },
        });
    };

    const cfg = strengthConfig[strength.level];

    return (
        <>
            <Head title="Daftar" />


            {/* Modal Overlay */}
            <div className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-super-black/20 backdrop-blur-3xl p-3 sm:p-6 lg:p-8 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}>

                {/* Dekorasi blob latar belakang */}
                <div className={`absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary rounded-full mix-blend-multiply filter blur-[80px] sm:blur-[100px] opacity-40 transition-transform duration-[2000ms] ${isLoaded ? 'translate-x-0 translate-y-0' : 'translate-x-20 -translate-y-20'}`} />
                <div className={`absolute bottom-0 left-0 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-secondary rounded-full mix-blend-multiply filter blur-[90px] sm:blur-[120px] opacity-30 transition-transform duration-[2000ms] ${isLoaded ? 'translate-x-0 translate-y-0' : '-translate-x-20 translate-y-20'}`} />

                {/* Card Modal */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`relative flex flex-col w-full max-w-[480px] h-auto rounded-venus overflow-hidden shadow-2xl border border-border bg-background transition-all duration-1000 ease-out transform ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'}`}
                >
                    {/* ── Banner Atas ── */}
                    <div className="relative overflow-hidden rounded-t-venus bg-card border-b border-border">
                        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10">
                            <p className="text-labelSm text-primary mb-1">Venus</p>
                            <h1 className="text-h3 text-super-black">
                                Ayo pergi ke Venus!
                            </h1>
                            <p className="text-body text-foreground mt-2">
                                Kami memiliki lima unit bisnis yang menarik.
                            </p>
                        </div>
                    </div>

                    {/* ── Form Bawah ── */}
                    <div className="w-full flex flex-col bg-background max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
                        <div className="flex-1 flex items-start justify-center p-6 sm:p-10">
                            <div className="w-full py-2">
                            <h2 className={`text-h3 text-super-black mb-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                Buat Akun Baru
                            </h2>

                            <form onSubmit={handleRegister} className="space-y-4">
                                {/* Nama Lengkap */}
                                <div className={`transition-all duration-700 delay-[350ms] ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                                    <FloatingInput
                                        id="name" label="NAMA LENGKAP" type="text"
                                        value={data.name} onChange={(v) => setData('name', v)}
                                    />
                                    {errors.name && <p className="text-error text-bodyM mt-1 ml-1">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div className={`transition-all duration-700 delay-[450ms] ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                                    <FloatingInput
                                        id="email" label="ALAMAT EMAIL (@gmail.com)" type="email"
                                        value={data.email} onChange={(v) => setData('email', v)}
                                    />
                                    {errors.email && <p className="text-error text-bodyM mt-1 ml-1">{errors.email}</p>}
                                </div>

                                {/* Kata Sandi */}
                                <div className={`transition-all duration-700 delay-[550ms] ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                                    <FloatingInput
                                        id="password" label="KATA SANDI"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password} onChange={handlePasswordChange}
                                        eye onToggleEye={() => setShowPassword(!showPassword)}
                                    />
                                    {errors.password && <p className="text-error text-bodyM mt-1 ml-1">{errors.password}</p>}

                                    {/* Bar kekuatan */}
                                    {data.password.length > 0 && (
                                        <div className="mt-2 px-1">
                                            <div className="flex gap-1.5 mb-1">
                                                {[1, 2, 3].map((bar) => (
                                                    <div
                                                        key={bar}
                                                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${cfg.bars >= bar ? cfg.color : 'bg-surface'}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className={`text-labelSm ${cfg.text}`}>{cfg.label}</p>
                                        </div>
                                    )}

                                    {/* Checklist ketentuan */}
                                    {data.password.length > 0 && (
                                        <ul className="mt-2 px-1 space-y-0.5">
                                            {[
                                                { key: 'length',    text: 'Minimal 8 karakter' },
                                                { key: 'uppercase', text: 'Huruf besar (A-Z)' },
                                                { key: 'lowercase', text: 'Huruf kecil (a-z)' },
                                                { key: 'number',    text: 'Angka (0-9)' },
                                                { key: 'symbol',    text: 'Karakter khusus (!@#$...)' },
                                            ].map(({ key, text }) => {
                                                const ok = strength.checks[key as keyof typeof strength.checks];
                                                return (
                                                    <li key={key} className={`flex items-center gap-1.5 text-body transition-colors ${ok ? 'text-primary' : 'text-foreground opacity-50'}`}>
                                                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            {ok
                                                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                            }
                                                        </svg>
                                                        {text}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>

                                {/* Konfirmasi Kata Sandi */}
                                <div className={`transition-all duration-700 delay-[650ms] ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                                    <FloatingInput
                                        id="password_confirmation" label="KONFIRMASI KATA SANDI"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(v) => setData('password_confirmation', v)}
                                        eye onToggleEye={() => setShowConfirm(!showConfirm)}
                                    />
                                    {data.password_confirmation.length > 0 && (
                                        <p className={`text-labelSm mt-1 ml-1 transition-colors ${data.password === data.password_confirmation ? 'text-primary' : 'text-foreground'}`}>
                                            {data.password === data.password_confirmation ? '✓ Kata sandi cocok' : '✗ Kata sandi tidak cocok'}
                                        </p>
                                    )}
                                </div>

                                {/* Persetujuan */}
                                <div className={`flex items-start pt-1 transition-all duration-700 delay-[750ms] ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                                    <input
                                        id="terms" type="checkbox"
                                        checked={agree} onChange={(e) => setAgree(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 bg-surface border-border rounded focus:ring-primary focus:ring-2 text-primary cursor-pointer"
                                    />
                                    <label htmlFor="terms" className="ml-2 text-bodyM text-foreground cursor-pointer">
                                        Saya menyetujui{' '}
                                        <a href="#" className="text-primary hover:opacity-80 transition-opacity">Syarat & Ketentuan</a>
                                        {' '}dan{' '}
                                        <a href="#" className="text-primary hover:opacity-80 transition-opacity">Kebijakan Privasi</a>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full bg-primary text-primary-foreground text-labelSm uppercase font-bold py-4 rounded-venus transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                >
                                    {processing ? 'Memproses...' : 'Daftar Sekarang'}
                                </button>
                            </form>

                            <p className={`mt-6 text-center text-body text-foreground transition-all duration-700 delay-[950ms] ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                                Sudah punya akun?{' '}
                                {onSwitch ? (
                                    <button
                                        type="button"
                                        onClick={() => onSwitch('login')}
                                        className="text-primary hover:opacity-80 transition-opacity font-bold"
                                    >
                                        Masuk di sini
                                    </button>
                                ) : (
                                    <Link href="/login" className="text-primary hover:opacity-80 transition-opacity font-bold">
                                        Masuk di sini
                                    </Link>
                                )}
                            </p>
                            </div> {/* max-w-420 */}
                        </div> {/* flex-1 */}
                    </div> {/* panel kanan */}
                </div> {/* card */}
            </div> {/* outer */}
        </>
    );
}
