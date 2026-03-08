'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function PatientPage() {
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ScrollReveal>
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px] shadow-2xl">
                        <div className="w-20 h-20 bg-linear-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-sky-500/20 animate-pulse">
                            <i className='bx bx-user text-4xl'></i>
                        </div>
                        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">¡Hola Mundo!</h1>
                        <p className="text-slate-400 text-lg font-medium max-w-md text-center">
                            Bienvenido a la nueva vista del paciente. Estamos construyendo una experiencia premium para ti.
                        </p>

                        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-wait">
                                    <div className="h-2 w-12 bg-sky-500/50 rounded-full mb-4"></div>
                                    <div className="h-4 w-full bg-white/10 rounded-full mb-2"></div>
                                    <div className="h-4 w-2/3 bg-white/10 rounded-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </DashboardLayout>
    );
}
