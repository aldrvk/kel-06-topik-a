import React, { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function HomeMain() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { settings } = usePage().props as any;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      id: 1,
      title: "Doorsmeer",
      description: "Cuci premium dengan presisi tinggi untuk performa kendaraan.",
      href: "/doorsmeer",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Coffee Shop",
      description: "Nikmati kopi specialty sambil bersantai di lounge kami.",
      href: "/coffee-shop",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Vape Store",
      description: "Koleksi liquid dan perangkat eksklusif di ekosistem kami.",
      href: "/vape-store",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      image: "https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "Bengkel",
      description: "Layanan teknis terpercaya oleh mekanik bersertifikat.",
      href: "/bengkel",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Rental PS",
      description: "Area entertainment eksklusif untuk bermain konsol terkini.",
      href: "/rental-ps",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const strengths = [
    {
      id: 1,
      title: "Real-Time Tracking",
      description: "Pantau proses cuci kendaraan, pembuatan kopi, atau status antrian bermain PS secara langsung dari gawai Anda.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 2,
      title: "Pembayaran Digital Instan",
      description: "Mendukung metode pembayaran non-tunai melalui QRIS, E-Wallet, dan layanan perbankan terintegrasi untuk efisiensi maksimal.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 3,
      title: "Fasilitas Lounge Premium",
      description: "Nikmati ruang tunggu ber-AC yang nyaman dengan pilihan menu kopi berkualitas tinggi serta area bermain PS5 eksklusif.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  function formatOperationalHours(unitName: string, operationalSettings: any) {
    const defaults: Record<string, { label: string; hours: string; badge: string; isClosed: boolean }> = {
      'Doorsmeer': { badge: 'Buka Setiap Hari', hours: '08.00 - 18.00', label: 'Waktu Setempat', isClosed: false },
      'Coffee Shop': { badge: 'Buka Setiap Hari', hours: '09.00 - 23.00', label: 'Waktu Setempat', isClosed: false },
      'Vape Store': { badge: 'Buka Setiap Hari', hours: '10.00 - 22.00', label: 'Waktu Setempat', isClosed: false },
      'Bengkel': { badge: 'Minggu Libur', hours: '08.00 - 17.00', label: 'Senin - Sabtu', isClosed: false },
      'Rental PS': { badge: 'Buka Setiap Hari', hours: '10.00 - 24.00', label: 'Waktu Setempat', isClosed: false },
    };

    const fallback = defaults[unitName] || { badge: 'Hubungi Kami', hours: 'Tutup', label: '—', isClosed: true };
    
    if (!operationalSettings || !operationalSettings[unitName]) {
      return fallback;
    }

    const unitSettings = operationalSettings[unitName];
    if (!unitSettings.is_active) {
      return { badge: 'Tutup Sementara', hours: 'TUTUP', label: '—', isClosed: true };
    }

    const schedule = unitSettings.schedule;
    if (!schedule) {
      return fallback;
    }

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const openDays = days.filter(d => schedule[d]?.is_open);
    if (openDays.length === 0) {
      return { badge: 'Tutup', hours: 'TUTUP', label: '—', isClosed: true };
    }

    const firstOpenDay = openDays[0];
    const openTime = schedule[firstOpenDay].open ? schedule[firstOpenDay].open.substring(0, 5).replace(':', '.') : '08.00';
    const closeTime = schedule[firstOpenDay].close ? schedule[firstOpenDay].close.substring(0, 5).replace(':', '.') : '17.00';
    const sameHours = openDays.every(d => schedule[d].open === schedule[firstOpenDay].open && schedule[d].close === schedule[firstOpenDay].close);

    if (openDays.length === 7 && sameHours) {
      return {
        badge: 'Buka Setiap Hari',
        hours: `${openTime} - ${closeTime}`,
        label: 'Waktu Setempat',
        isClosed: false
      };
    }

    const isMonToSatOpen = days.slice(0, 6).every(d => schedule[d]?.is_open) && !schedule['Minggu']?.is_open;
    if (isMonToSatOpen && sameHours) {
      return {
        badge: 'Minggu Libur',
        hours: `${openTime} - ${closeTime}`,
        label: 'Senin - Sabtu',
        isClosed: false
      };
    }

    return {
      badge: openDays.length === 7 ? 'Buka Setiap Hari' : `Buka ${openDays.length} Hari/Minggu`,
      hours: `${openTime} - ${closeTime}`,
      label: openDays.length === 7 ? 'Waktu Setempat' : 'Hari Kerja',
      isClosed: false
    };
  }

  const unitsToDisplay = ['Doorsmeer', 'Coffee Shop', 'Vape Store', 'Bengkel', 'Rental PS'];

  return (
    <div className="w-full bg-background flex flex-col gap-24 py-20">
      
      {/* ─── SECTION 1: LAYANAN KAMI ─── */}
      <section className="w-full px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          
          {/* Heading Section */}
          <div className="flex flex-col items-center text-center gap-4">
            <h2 className="text-h2">Layanan Kami</h2>
            <p className="text-body-l">Lima layanan terintegrasi dalam satu lokasi premium.</p>
          </div>

          {/* 5 Layanan Hub Cards with Scroll Animation & Premium Hover UI */}
          <div 
            ref={sectionRef}
            className="flex flex-wrap justify-center gap-6"
          >
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] transition-all duration-1000 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                }`}
                style={{ transitionDelay: isVisible ? `${index * 150}ms` : '0ms' }}
              >
                <Link 
                  href={service.href || "#"} 
                  className="group relative w-full h-full rounded-venus overflow-hidden p-6 flex flex-col justify-between border border-border bg-surface shadow-md transition-all duration-500 ease-out hover:shadow-xl hover:-translate-y-2 min-h-[220px] block"
                >
                   {/* Background Image (Hidden normally, reveals intensely on hover) */}
                   <img 
                     src={service.image} 
                     className="absolute inset-0 w-full h-full object-cover opacity-0 scale-105 grayscale transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:grayscale-0" 
                     alt={service.title} 
                   />
                   
                   {/* Primary Color Dark Overlay on hover */}
                   <div className="absolute inset-0 bg-primary/0 transition-all duration-500 group-hover:bg-primary/90" />
                   
                   {/* Content Container */}
                   <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                     
                     {/* Top Row: Icon & Arrow */}
                     <div className="flex items-start justify-between w-full">
                       {/* Main Service Icon */}
                       <div className="p-3.5 rounded-full bg-background border border-border text-super-black transition-colors duration-500 group-hover:bg-primary-foreground group-hover:border-primary-foreground group-hover:text-primary">
                          {service.icon}
                       </div>
                       
                       {/* Interactive Arrow Indicator */}
                       <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-surface transition-all duration-500 group-hover:bg-primary-foreground group-hover:border-primary-foreground group-hover:-rotate-45">
                         <svg className="w-5 h-5 text-super-black transition-colors duration-500 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7m0 0l-7-7" />
                         </svg>
                       </div>
                     </div>
                     
                     {/* Bottom Row: Text Content */}
                     <div className="flex flex-col gap-2">
                       <h3 className="text-card-title text-super-black transition-colors duration-500 group-hover:text-primary-foreground">{service.title}</h3>
                       <p className="text-body-reg text-foreground transition-colors duration-500 group-hover:text-primary-foreground">{service.description}</p>
                     </div>
                     
                   </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: KEUNGGULAN KAMI ─── */}
      <section className="w-full px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          <div className="flex flex-col items-center text-center gap-4">
            <h2 className="text-h2">Keunggulan Kami</h2>
            <p className="text-body-l max-w-2xl">Layanan modern dengan standar terbaik yang dirancang khusus untuk kenyamanan Anda.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {strengths.map((item) => (
              <div
                key={item.id}
                className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] min-h-[220px]"
              >
                <div 
                  className="group relative w-full h-full rounded-venus overflow-hidden p-6 flex flex-col justify-between border border-border bg-surface shadow-md transition-all duration-500 ease-out hover:shadow-xl hover:-translate-y-2 min-h-[220px] cursor-default block"
                >
                   {/* Solid Primary Background overlay on hover (No background image) */}
                   <div className="absolute inset-0 bg-primary/0 transition-all duration-500 group-hover:bg-primary" />
                   
                   {/* Content Container */}
                   <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                     
                     {/* Top Row: Icon */}
                     <div className="flex items-start justify-between w-full">
                       {/* Main Icon */}
                       <div className="p-3.5 rounded-full bg-background border border-border text-super-black transition-colors duration-500 group-hover:bg-primary-foreground group-hover:border-primary-foreground group-hover:text-primary">
                          {item.icon}
                       </div>
                     </div>
                     
                     {/* Bottom Row: Text Content */}
                     <div className="flex flex-col gap-2">
                       <h3 className="text-card-title text-super-black transition-colors duration-500 group-hover:text-primary-foreground">{item.title}</h3>
                       <p className="text-body-reg text-foreground transition-colors duration-500 group-hover:text-primary-foreground">{item.description}</p>
                     </div>
                     
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: JAM OPERASIONAL ─── */}
      <section className="w-full px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          <div className="flex flex-col items-center text-center gap-4">
            <h2 className="text-h2">Jam Operasional</h2>
            <p className="text-body-l">Jadwal operasional harian untuk setiap unit usaha di Venus Hub.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {unitsToDisplay.map((unitName) => {
              const info = formatOperationalHours(unitName, settings);
              const isClosedBadge = info.badge === 'Minggu Libur' || info.badge === 'Tutup' || info.badge === 'Tutup Sementara';
              return (
                <div 
                  key={unitName} 
                  className="group relative w-full h-full rounded-venus overflow-hidden p-6 flex flex-col justify-between min-h-[200px] border border-border bg-surface shadow-md transition-all duration-500 ease-out hover:shadow-xl hover:-translate-y-2 cursor-default block"
                >
                  {/* Solid Primary Background overlay on hover (No background image) */}
                  <div className="absolute inset-0 bg-primary/0 transition-all duration-500 group-hover:bg-primary" />

                  {/* Content Container */}
                  <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center self-start px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all duration-500 ${
                        isClosedBadge 
                          ? 'bg-foreground/5 text-foreground/45 border border-border group-hover:bg-primary-foreground/10 group-hover:text-primary-foreground/85 group-hover:border-primary-foreground/20'
                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground group-hover:border-primary-foreground/30'
                      }`}>
                        {info.badge}
                      </span>
                      <h4 className="text-h3 text-super-black font-bold mt-2 transition-colors duration-500 group-hover:text-primary-foreground">{unitName}</h4>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-body-reg font-semibold text-primary transition-colors duration-500 group-hover:text-primary-foreground">{info.hours}</p>
                      <p className="text-label-sm text-foreground/40 transition-colors duration-500 group-hover:text-primary-foreground/60">{info.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
