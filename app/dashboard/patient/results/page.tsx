'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Icon from '@/components/ui/Icon';
import ScrollReveal from "@/components/ui/ScrollReveal";
import { formatDateTime } from '@/utils/formatters';
import Modal from '@/components/ui/Modal';
import { apiFetch } from '@/utils/api';
import { Result } from '@/types';
import { useRouter } from 'next/navigation';

export default function PatientResultsPage() {
    const router = useRouter();
    const [results, setResults] = useState<Result[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewingResult, setViewingResult] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('lab_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetchPatientResults(parsedUser.id_user);
            } catch (error) {
                console.error('Error parsing user data:', error);
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchPatientResults = async (userId: number) => {
        try {
            // First fetch all results
            const allResults = await apiFetch<Result[]>('/results');
            
            // Filter results to only show those belonging to the current patient
            const patientResults = (allResults || []).filter(result => 
                result.exam_appointment_detail?.appointment?.id_user === userId
            );
            
            setResults(patientResults);
        } catch (error) {
            console.error('Error fetching patient results:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredResults = results.filter(row => {
        const examName = (row.exam_appointment_detail?.exam?.exam_type?.category_name || '').toLowerCase();
        return examName.includes(searchTerm.toLowerCase());
    });

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pt-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.back()}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/50 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition-all shrink-0"
                            title="Regresar"
                        >
                            <Icon name="chevron-left" size="sm" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.4)] border border-white/10 relative z-10 shrink-0">
                                    <Icon name="file-find" size="xs" color="white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">
                                    Mis Resultados
                                </h1>
                            </div>
                            <p className="text-sm text-slate-400 mt-2 ml-1">
                                Consulta el historial detallado de tus exámenes médicos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Viewing Modal */}
                <Modal
                    open={!!viewingResult}
                    onClose={() => setViewingResult(null)}
                    title="Detalles del Resultado"
                >
                    {viewingResult && (
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Examen</p>
                                    <p className="text-sm font-bold text-white">
                                        {viewingResult.exam_appointment_detail?.exam?.exam_type?.category_name || 'Desconocido'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fecha Entrega</p>
                                    <p className="text-sm font-bold text-white">
                                        {formatDateTime(viewingResult.delivery_date)}
                                    </p>
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Icon name="list-ul" size="xs" color="#38bdf8" />
                                    <h4 className="text-sm font-bold text-sky-400">Valores Registrados</h4>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {(() => {
                                        const resultData = viewingResult.result_data ? JSON.parse(viewingResult.result_data) : {};
                                        let schema: any[] = [];
                                        try {
                                            const schemaStr = viewingResult.exam_appointment_detail?.exam?.custom_files?.json_schema;
                                            if (schemaStr) schema = JSON.parse(schemaStr);
                                        } catch (e) {}
                                        
                                        const entries = Object.entries(resultData);
                                        
                                        if (entries.length === 0) {
                                            return (
                                                <p className="text-sm text-slate-500 italic text-center py-4">
                                                    Los valores de este examen aún están en procesamiento o no fueron registrados.
                                                </p>
                                            );
                                        }

                                        return entries.map(([key, value]) => {
                                            const fieldDef = schema.find((f: any) => f.id === key);
                                            const label = fieldDef ? fieldDef.label : key;

                                            return (
                                                <div
                                                    key={key}
                                                    className="flex justify-between items-center p-3 bg-white/2 border border-white/5 rounded-xl transition-colors hover:bg-white/4"
                                                >
                                                    <span className="text-sm text-slate-400 font-medium">{label}:</span>
                                                    <span className="text-sm font-bold text-white">
                                                        {typeof value === 'boolean' ? (
                                                            <span className={`px-2 py-0 rounded-full text-[10px] uppercase tracking-wider border font-bold leading-none ${value ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                                {value ? 'Sí' : 'No'}
                                                            </span>
                                                        ) : (value as any)}
                                                    </span>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-lg shadow-sky-500/20">
                                    <Icon name="download" size="xs" />
                                    Descargar PDF
                                </button>
                                <button
                                    onClick={() => setViewingResult(null)}
                                    className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white text-sm font-bold rounded-xl border border-white/10 transition-all duration-300"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

                <ScrollReveal delay={200}>
                    <div className="mb-6 relative group w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name="search" size="xs" color="#64748b" className="transition-colors group-focus-within:text-sky-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por tipo de examen..."
                            className="w-full bg-slate-900/30 border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/20 transition-all duration-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="w-full bg-slate-900/45 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden shadow-2xl p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Icon name="loader" size="lg" className="text-sky-400 animate-spin mb-4" />
                                <p className="text-slate-400">Cargando tus resultados...</p>
                            </div>
                        ) : filteredResults.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredResults.map((result) => (
                                    <div 
                                        key={result.id_result}
                                        className="group flex flex-col justify-between bg-white/3 border border-white/5 hover:border-sky-500/30 hover:bg-slate-800/40 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-sky-500/5 hover:-translate-y-1"
                                        onClick={() => setViewingResult(result)}
                                    >
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0 border border-sky-500/20 group-hover:bg-sky-500 group-hover:text-white text-sky-400 transition-all duration-300">
                                                    <Icon name="microscope" size="sm" />
                                                </div>
                                                <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                                                    {result.exam_appointment_detail?.exam?.exam_type?.category_name || 'Examen de Laboratorio'}
                                                </h3>
                                            </div>
                                            
                                            <div className="space-y-2 mb-6">
                                                <div className="flex items-center gap-2">
                                                    <Icon name="calendar" size="xs" color="#64748b" />
                                                    <span className="text-xs text-slate-400">Entrega:</span>
                                                    <span className="text-xs font-semibold text-slate-300">
                                                        {formatDateTime(result.delivery_date)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Icon name="clipboard-check" size="xs" color="#10b981" />
                                                    <span className="text-xs font-semibold text-emerald-400">Completado</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-sm font-bold rounded-xl transition-colors border border-slate-700 group-hover:border-sky-500/30">
                                            <Icon name="show" size="xs" />
                                            Ver Detalles
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                    <Icon name="file-find" size="lg" color="#64748b" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Sin resultados</h3>
                                <p className="text-slate-400 max-w-sm">
                                    {searchTerm 
                                        ? "No se encontraron resultados que coincidan con tu búsqueda." 
                                        : "Actualmente no tienes resultados de exámenes disponibles. Una vez que te realices exámenes, aparecerán aquí."}
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollReveal>
            </div>
        </DashboardLayout>
    );
}
