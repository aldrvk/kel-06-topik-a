import React from 'react';
import { Link } from '@inertiajs/react';

export default function Footer() {
  return (
    <footer className="dark w-full bg-background pt-20 pb-10 px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
          
          {/* Brand & Description (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <h2 className="text-h2 text-foreground">VENUS</h2>
            <p className="text-body-reg">
              The global benchmark for integrated lifestyle and automotive excellence. Curating premium experiences since 2024.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border hover:opacity-80 transition-opacity">
                <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border hover:opacity-80 transition-opacity">
                <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border hover:opacity-80 transition-opacity">
                <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation (2 cols) */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <h3 className="text-label-sm text-foreground">NAVIGATION</h3>
            <ul className="flex flex-col gap-4">
              <li><Link href="/doorsmeer" className="text-body-reg hover:text-foreground transition-colors">Doorsmeer</Link></li>
              <li><Link href="/coffee-shop" className="text-body-reg hover:text-foreground transition-colors">Coffee Shop</Link></li>
              <li><Link href="/vape-store" className="text-body-reg hover:text-foreground transition-colors">Vape Store</Link></li>
              <li><Link href="/bengkel" className="text-body-reg hover:text-foreground transition-colors">Bengkel</Link></li>
              <li><Link href="/rental-ps" className="text-body-reg hover:text-foreground transition-colors">Rental PS</Link></li>
            </ul>
          </div>

          {/* Reach Us (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <h3 className="text-label-sm text-foreground">REACH US</h3>
            <ul className="flex flex-col gap-5">
              <li className="flex items-start gap-3">
                 <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
                 <span className="text-body-reg">Jl. Setia Budi No.435, Tj. Sari, Kec. Medan Selayang, Kota Medan, Sumatera Utara 20133</span>
              </li>
              <li className="flex items-center gap-3">
                 <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                 </svg>
                 <span className="text-body-reg">+1 (555) 000-VENUS</span>
              </li>
              <li className="flex items-center gap-3">
                 <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 <span className="text-body-reg">Mon - Sun: 08:00 - 23:00</span>
              </li>
            </ul>
          </div>

          {/* Our Hub Map (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <h3 className="text-label-sm text-foreground">OUR HUB</h3>
            
            {/* Map Container */}
            {/* SOLUSI MAP: Menggunakan iframe Google Maps embed dengan filter grayscale sebagai placeholder interaktif dan ringan. 
                Nantinya element iframe ini bisa langsung diganti menjadi <GoogleMap> dari library @react-google-maps/api jika API Key sudah siap. */}
            <div className="w-full h-40 bg-surface rounded-venus overflow-hidden relative border border-border group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.172016965029!2d98.62780169999999!3d3.5477762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30312f0077b14d81%3A0xda07b437a4942d41!2sVenus%20Carwash%20Medan!5e0!3m2!1sen!2sid!4v1777192346714!5m2!1sen!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              ></iframe>
            </div>
            <p className="text-body-reg italic">Valet parking available for all members.</p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-label-sm">© 2024 VENUS CURATOR. ALL RIGHTS RESERVED.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="#" className="text-label-sm hover:text-foreground transition-colors">PRIVACY POLICY</Link>
            <Link href="#" className="text-label-sm hover:text-foreground transition-colors">TERMS OF SERVICE</Link>
            <Link href="#" className="text-label-sm text-primary hover:opacity-80 transition-opacity">PREMIUM ECOSYSTEM</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
