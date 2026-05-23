import { useForm } from '@inertiajs/react';
import { useState, useEffect, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

interface User {
    id: number;
    name: string;
    email: string;
}

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
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

interface FloatingInputProps {
    id: string;
    label: string;
    type: string;
    value: string;
    onChange: (v: string) => void;
    eye?: boolean;
    onToggleEye?: () => void;
    disabled?: boolean;
}

const FloatingInput = ({ id, label, type, value, onChange, eye, onToggleEye, disabled = false }: FloatingInputProps) => (
    <div className="relative">
        <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder=" "
            className={`block px-5 pb-3 pt-6 w-full text-body text-foreground bg-surface rounded-venus border border-border appearance-none focus:outline-none focus:ring-2 focus:ring-primary peer transition-all duration-300 shadow-sm ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                disabled={disabled}
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

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [mounted, setMounted] = useState(false);
    const [strength, setStrength] = useState<StrengthResult>(checkStrength(''));

    // Form data untuk Profile
    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
    });

    // Form data untuk Password
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            setTimeout(() => setIsLoaded(true), 50);
            profileForm.setData({
                name: user.name || '',
                email: user.email || '',
            });
            passwordForm.reset();
            setActiveTab('profile');
        } else {
            setIsLoaded(false);
        }
    }, [isOpen, user]);

    if (!mounted || !isOpen) return null;

    const handleProfileSubmit = (e: FormEvent) => {
        e.preventDefault();
        profileForm.patch('/profile', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profil berhasil diperbarui!');
                onClose();
            },
            onError: (errs) => {
                const first = Object.values(errs)[0];
                if (first) toast.error(first as string);
            }
        });
    };

    const handleNewPasswordChange = (val: string) => {
        passwordForm.setData('password', val);
        setStrength(checkStrength(val));
    };

    const handlePasswordSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        if (passwordForm.data.current_password === passwordForm.data.password) {
            toast.error('Kata sandi baru tidak boleh sama dengan kata sandi lama!');
            return;
        }

        if (strength.level === 'weak' || strength.level === 'empty') {
            toast.error('Kata sandi terlalu lemah. Perkuat kata sandi Anda terlebih dahulu!');
            return;
        }
        
        if (passwordForm.data.password !== passwordForm.data.password_confirmation) {
            toast.error('Kata sandi baru dan konfirmasi tidak cocok!');
            return;
        }

        passwordForm.put('/profile/password', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kata sandi berhasil diubah!');
                passwordForm.reset();
                onClose();
            },
            onError: (errs) => {
                const first = Object.values(errs)[0];
                if (first) toast.error(first as string);
            }
        });
    };

    const cfg = strengthConfig[strength.level];

    return createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-super-black/40 backdrop-blur-md p-4 sm:p-6 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}>
            {/* Modal Card */}
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative flex flex-col w-full max-w-[500px] max-h-[90vh] rounded-venus overflow-hidden shadow-2xl border border-border bg-background transition-all duration-500 ease-out transform ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card">
                    <h2 className="text-h3 text-super-black">Edit Profil</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-surface text-foreground hover:text-error transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border bg-background">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-4 text-labelSm uppercase tracking-wider font-bold transition-colors border-b-2 ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-foreground/50 hover:text-foreground'}`}
                    >
                        Data Diri
                    </button>
                    <button 
                        onClick={() => setActiveTab('password')}
                        className={`flex-1 py-4 text-labelSm uppercase tracking-wider font-bold transition-colors border-b-2 ${activeTab === 'password' ? 'border-primary text-primary' : 'border-transparent text-foreground/50 hover:text-foreground'}`}
                    >
                        Kata Sandi
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 sm:p-8 bg-background">
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div>
                                <FloatingInput
                                    id="name" label="NAMA LENGKAP" type="text"
                                    value={profileForm.data.name} onChange={(v) => profileForm.setData('name', v)}
                                />
                                {profileForm.errors.name && <p className="text-error text-bodyM mt-1 ml-1">{profileForm.errors.name}</p>}
                            </div>
                            
                            <div>
                                <FloatingInput
                                    id="email" label="ALAMAT EMAIL" type="email"
                                    value={profileForm.data.email} onChange={(v) => profileForm.setData('email', v)}
                                />
                                {profileForm.errors.email && <p className="text-error text-bodyM mt-1 ml-1">{profileForm.errors.email}</p>}
                                <p className="text-bodyM text-foreground/50 mt-2 ml-1">
                                    Catatan: Mengubah email mungkin akan memerlukan verifikasi ulang.
                                </p>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="w-full bg-primary text-primary-foreground text-labelSm uppercase font-bold py-4 rounded-venus transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <FloatingInput
                                    id="current_password" label="KATA SANDI SAAT INI"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={passwordForm.data.current_password} onChange={(v) => passwordForm.setData('current_password', v)}
                                    eye onToggleEye={() => setShowCurrentPassword(!showCurrentPassword)}
                                />
                                {passwordForm.errors.current_password && <p className="text-error text-bodyM mt-1 ml-1">{passwordForm.errors.current_password}</p>}
                            </div>
                            
                            <div className="pt-2">
                                <FloatingInput
                                    id="password" label="KATA SANDI BARU"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={passwordForm.data.password} onChange={handleNewPasswordChange}
                                    eye onToggleEye={() => setShowNewPassword(!showNewPassword)}
                                />
                                {passwordForm.errors.password && <p className="text-error text-bodyM mt-1 ml-1">{passwordForm.errors.password}</p>}
                                
                                {/* Bar kekuatan */}
                                {passwordForm.data.password.length > 0 && (
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
                                {passwordForm.data.password.length > 0 && (
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

                            <div>
                                <FloatingInput
                                    id="password_confirmation" label="KONFIRMASI KATA SANDI BARU"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={passwordForm.data.password_confirmation} onChange={(v) => passwordForm.setData('password_confirmation', v)}
                                    eye onToggleEye={() => setShowConfirmPassword(!showConfirmPassword)}
                                />
                                {passwordForm.errors.password_confirmation && <p className="text-error text-bodyM mt-1 ml-1">{passwordForm.errors.password_confirmation}</p>}
                                {passwordForm.data.password_confirmation.length > 0 && (
                                    <p className={`text-labelSm mt-1 ml-1 transition-colors ${passwordForm.data.password === passwordForm.data.password_confirmation ? 'text-primary' : 'text-foreground'}`}>
                                        {passwordForm.data.password === passwordForm.data.password_confirmation ? '✓ Kata sandi cocok' : '✗ Kata sandi tidak cocok'}
                                    </p>
                                )}
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="w-full bg-primary text-primary-foreground text-labelSm uppercase font-bold py-4 rounded-venus transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {passwordForm.processing ? 'Menyimpan...' : 'Ganti Kata Sandi'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
