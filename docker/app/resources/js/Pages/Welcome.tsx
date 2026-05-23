import { useState } from 'react';
import { Head } from '@inertiajs/react';

// Komponen Layout
import Footer from '../Components/Footer';
import Hero from '../Components/HomeHero';
import HomeMain from '../Components/HomeMain';
import Navbar from '../Components/Navbar';

// TODO: File auth milik Leondo tidak terdeteksi di folder Pages. 
// Import dinonaktifkan sementara agar tidak crash.
import Login from './auth/Login';
import Register from './auth/Register';
import ForgotPassword from './auth/ForgotPassword';

type AuthModalType = 'login' | 'register' | 'forgot-password' | null;

export default function LandingPage() {
    const [authModal, setAuthModal] = useState<AuthModalType>(null);

    return (
        <div className="min-h-screen bg-background relative">
            <Head title="Venus Hub - Smart Management System" />
            
            {/* NAVBAR */}
            <Navbar onOpenAuthModal={(type) => setAuthModal(type)} />

            {/* HERO */}
            <Hero />

            {/* HOMEMAIN */}
            <div className='shadow-md'>
                <HomeMain />
            </div>

            {/* FOOTER */}
            <Footer />

            {/* TODO: Render modal dinonaktifkan sementara sampai file auth tersedia */} 
            <Login 
                isOpen={authModal === 'login'} 
                onClose={() => setAuthModal(null)} 
                onSwitch={(type) => setAuthModal(type)} 
            />
            <Register 
                isOpen={authModal === 'register'} 
                onClose={() => setAuthModal(null)} 
                onSwitch={(type) => setAuthModal(type)} 
            />
            <ForgotPassword 
                isOpen={authModal === 'forgot-password'} 
                onClose={() => setAuthModal(null)} 
                onSwitch={(type) => setAuthModal(type)} 
            /> 
           
        </div>
    );
}
