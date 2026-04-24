'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { capitalize } from '@/utils/formatters';

export default function PatientPage() {
    const [user, setUser] = useState<any>(null);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        // Get user from localStorage
        const storedUser = localStorage.getItem('lab_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        // Set greeting based on time
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting('¡Buenos días');
        else if (hour >= 12 && hour < 19) setGreeting('¡Buenas tardes');
        else setGreeting('¡Buenas noches');
    }, []);

    const firstName = user?.first_name ? capitalize(user.first_name.split(' ')[0]) : 'Paciente';

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <ScrollReveal>
                    {/* Welcome Header Section */}
                    <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-16 mb-12 shadow-2xl">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-sky-500/10 blur-[100px] rounded-full" />
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="shrink-0 relative">
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-linear-to-br from-sky-400 to-sky-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-sky-500/30 rotate-3 transition-transform hover:rotate-0 duration-500">
                                    <Icon name="user-circle" size="lg" className="text-6xl md:text-7xl" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-slate-900 shrink-0">
                                    <Icon name="check-shield" size="xs" />
                                </div>
                            </div>

                            <div className="text-center md:text-left">
                                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                                    {greeting}, <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-emerald-400">{firstName}</span>!
                                </h1>
                                <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl">
                                    Es un gusto saludarte. Tu bienestar es nuestra prioridad. Aquí encontrarás todo lo que necesitas para gestionar tu salud.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Results Card */}
                        <div className="bg-slate-900/30 backdrop-blur-xl border border-white/5 rounded-4xl p-8 shadow-lg flex flex-col h-full">
                            <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 mb-6 transition-all duration-300">
                                <Icon name="file-find" size="md" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Mis Resultados</h3>
                            <p className="text-slate-400 font-medium grow">
                                Consulta y descarga los resultados de tus exámenes de laboratorio de forma segura.
                            </p>
                            <Link href="/dashboard/patient/results" className="mt-8">
                                <button className="w-full flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-sky-500/20">
                                    Ver resultados <Icon name="chevron-right" size="xs" />
                                </button>
                            </Link>
                        </div>

                        <div className="bg-slate-900/30 backdrop-blur-xl border border-white/5 rounded-4xl p-8 shadow-lg flex flex-col h-full">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 transition-all duration-300">
                                <Icon name="calendar" size="md" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Solicitar Cita</h3>
                            <p className="text-slate-400 font-medium grow">
                                Programa tu próxima visita al laboratorio de manera rápida y sencilla.
                            </p>
                            <Link href="/dashboard/patient/appointments/new" className="mt-8">
                                <button className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20">
                                    Solicitar cita <Icon name="chevron-right" size="xs" />
                                </button>
                            </Link>
                        </div>

                    </div>

                    {/* Health Tip Section */}
                    <div className="mt-12 bg-linear-to-r from-sky-600/20 to-emerald-600/20 backdrop-blur-sm border border-white/5 rounded-4xl p-8 flex flex-col md:flex-row items-center gap-6">
                        <div className="p-4 bg-white/10 rounded-2xl text-emerald-400">
                            <Icon name="heart" size="md" className="animate-pulse" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-lg">💡 Tip de Salud</h4>
                            <p className="text-slate-400">Recuerda que para la mayoría de los exámenes de sangre es ideal mantener un ayuno de 8 a 12 horas.</p>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </DashboardLayout>
    );
}
