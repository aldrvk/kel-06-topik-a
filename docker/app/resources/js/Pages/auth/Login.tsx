import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface AuthModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSwitch?: (modal: 'login' | 'register' | 'forgot-password') => void;
}

export default function Login({ isOpen = true, onClose, onSwitch }: AuthModalProps) {
    const [isLoaded, setIsLoaded]         = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email:    '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setIsLoaded(true), 50);
        } else {
            setIsLoaded(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.email || !data.password) {
            toast.error('Email dan kata sandi tidak boleh kosong!');
            return;
        }
        if (!data.email.endsWith('@gmail.com')) {
            toast.error('Email harus menggunakan alamat @gmail.com');
            return;
        }

        post('/login', {
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

    return (
        <>
            <Head title="Masuk" />


            {/* Modal Overlay */}
            <div className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-super-black/20 backdrop-blur-3xl p-3 sm:p-6 lg:p-8 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}>

                {/* Dekorasi blob latar belakang */}
                <div className={`absolute top-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary rounded-full mix-blend-multiply filter blur-[80px] sm:blur-[100px] opacity-40 transition-transform duration-[2000ms] ${isLoaded ? 'translate-x-0 translate-y-0' : '-translate-x-20 -translate-y-20'}`} />
                <div className={`absolute bottom-0 right-0 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-secondary rounded-full mix-blend-multiply filter blur-[90px] sm:blur-[120px] opacity-30 transition-transform duration-[2000ms] ${isLoaded ? 'translate-x-0 translate-y-0' : 'translate-x-20 translate-y-20'}`} />

                {/* Card Modal */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`relative flex flex-col w-full max-w-[480px] min-h-[auto] rounded-venus overflow-hidden shadow-2xl border border-border bg-background transition-all duration-1000 ease-out transform ${
                        isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'
                    }`}
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
                    <div className="w-full flex items-center justify-center p-6 sm:p-10 bg-background">
                        <div className="w-full">
                            <h2 className={`text-h3 text-super-black mb-8 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                Masuk ke akun Anda
                            </h2>

                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* Email */}
                                <div className={`relative transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                                    <input
                                        type="email"
                                        id="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="block px-5 pb-3 pt-6 w-full text-body text-foreground bg-surface rounded-venus border border-border appearance-none focus:outline-none focus:ring-2 focus:ring-primary peer transition-all duration-300 shadow-sm"
                                        placeholder=" "
                                    />
                                    <label
                                        htmlFor="email"
                                        className="absolute text-labelSm text-primary duration-300 transform -translate-y-3 scale-85 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-85 peer-focus:-translate-y-3 peer-focus:text-primary"
                                    >
                                        ALAMAT EMAIL
                                    </label>
                                    {errors.email && <p className="text-error text-bodyM mt-1 ml-1">{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div className={`transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                                    <div className="flex justify-end mb-1">
                                        {onSwitch ? (
                                            <button type="button" onClick={() => onSwitch('forgot-password')} className="text-primary text-labelSm hover:opacity-80 transition-colors">
                                                LUPA KATA SANDI?
                                            </button>
                                        ) : (
                                            <Link href="/forgot-password" className="text-primary text-labelSm hover:opacity-80 transition-colors">
                                                LUPA KATA SANDI?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="block px-5 pb-3 pt-6 w-full text-body text-foreground bg-surface rounded-venus border border-border appearance-none focus:outline-none focus:ring-2 focus:ring-primary peer transition-all duration-300 shadow-sm"
                                            placeholder=" "
                                        />
                                        <label
                                            htmlFor="password"
                                            className="absolute text-labelSm text-primary duration-300 transform -translate-y-3 scale-85 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-85 peer-focus:-translate-y-3 peer-focus:text-primary"
                                        >
                                            KATA SANDI
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground hover:text-primary focus:outline-none transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-error text-bodyM mt-1 ml-1">{errors.password}</p>}
                                </div>

                                {/* Ingat Saya */}
                                <div className={`flex items-center transition-all duration-700 delay-[800ms] ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 bg-surface border-border rounded focus:ring-primary focus:ring-2 text-primary"
                                    />
                                    <label htmlFor="remember" className="ml-2 text-bodyM text-foreground cursor-pointer">
                                        Ingat Saya
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full bg-primary text-primary-foreground text-labelSm uppercase font-bold py-4 rounded-venus transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                >
                                    {processing ? 'Memproses...' : 'Masuk'}
                                </button>
                            </form>

                            <p className={`mt-8 text-center text-body text-foreground transition-all duration-700 delay-[1200ms] ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                                Belum punya akun?{' '}
                                {onSwitch ? (
                                    <button
                                        type="button"
                                        onClick={() => onSwitch('register')}
                                        className="text-primary hover:opacity-80 transition-opacity font-bold"
                                    >
                                        Daftar di sini!
                                    </button>
                                ) : (
                                    <Link
                                        href="/register"
                                        className="text-primary hover:opacity-80 transition-opacity font-bold"
                                    >
                                        Daftar di sini!
                                    </Link>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
