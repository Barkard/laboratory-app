'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from "@/components/layout/DashboardLayout";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { apiFetch } from "@/utils/api";
import Modal from "@/components/ui/Modal";
import ResultForm from "@/components/results/ResultForm";
import { Result, Appointment } from "@/types";
import { formatDateTime, formatFullName } from '@/utils/formatters';

const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, string> = {
        'PENDIENTE': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'AGENDADA': 'bg-sky-500/10 text-sky-500 border-sky-500/20',
        'COMPLETADA': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'CANCELADA': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    };

    const labels: Record<string, string> = {
        'PENDIENTE': 'Pendiente',
        'AGENDADA': 'Agendada',
        'COMPLETADA': 'Completada',
        'CANCELADA': 'Cancelada',
    };

    return (
        <span className={`px-2 py-0 rounded-full text-[10px] font-bold border uppercase tracking-wider leading-none ${variants[status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
            {labels[status] || status}
        </span>
    );
};

const StatCard = ({ title, value, icon, color, trend, delay = 0 }: { title: string, value: string, icon: string, color: string, trend?: string, delay?: number }) => {
    const colorClasses: Record<string, string> = {
        primary: 'from-blue-600/20 to-blue-600/10 text-blue-400 border-blue-500/20 hover:from-blue-600/30 hover:to-blue-600/20',
        warning: 'from-amber-500/20 to-amber-500/10 text-amber-400 border-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/20',
        success: 'from-emerald-500/20 to-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:from-emerald-500/30 hover:to-emerald-500/20',
        secondary: 'from-purple-600/20 to-purple-600/10 text-purple-400 border-purple-500/20 hover:from-purple-600/30 hover:to-purple-600/20',
    };

    const iconColors: Record<string, string> = {
        primary: 'bg-blue-500 shadow-blue-500/20',
        warning: 'bg-amber-500 shadow-amber-500/20',
        success: 'bg-emerald-500 shadow-emerald-500/20',
        secondary: 'bg-purple-500 shadow-purple-500/20',
    };

    const colorStyle = colorClasses[color] || colorClasses.primary;
    const iconStyle = iconColors[color] || iconColors.primary;

    return (
        <ScrollReveal delay={delay} className="w-full h-full">
            <div className={`group relative p-6 h-full bg-linear-to-br ${colorStyle} backdrop-blur-xl border rounded-2xl transition-all duration-500 ease-out cursor-pointer overflow-hidden z-10 hover:z-20 hover:-translate-y-2`}>
                {/* Illumination Effect Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="absolute -inset-24 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_60%)] opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-1000 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                        <div className={`p-3.5 rounded-2xl ${iconStyle} text-white flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                            <Icon name={icon} size="sm" />
                        </div>
                        {trend && (
                            <span className="px-2.5 py-0.5 text-[11px] font-bold text-sky-400 bg-sky-400/10 border border-sky-400/20 rounded-full leading-none">
                                {trend}
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {title}
                        </h3>
                        <p className="text-3xl font-black text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-white group-hover:to-white/60 transition-all duration-300">
                            {value}
                        </p>
                    </div>
                </div>
            </div>
        </ScrollReveal>
    );
};


export default function AdminDashboard() {
    const [stats, setStats] = React.useState({
        totalUsers: '0',
        totalAppointments: '0',
        pendingResults: '0',
        examsPerformed: '0',
        pendingAppointments: [] as any[],
        scheduledAppointments: [] as any[]
    });
    const [isLoading, setIsLoading] = React.useState(true);
    const [user, setUser] = React.useState<any>(null);
    const [pendingSearchTerm, setPendingSearchTerm] = React.useState('');
    const [scheduledSearchTerm, setScheduledSearchTerm] = React.useState('');

    const [isUploadPopupOpen, setIsUploadPopupOpen] = React.useState(false);
    const [appointmentsForUpload, setAppointmentsForUpload] = React.useState<Appointment[]>([]);
    const [isLoadAppointments, setIsLoadAppointments] = React.useState(false);

    const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);

    const handleOpenModal = async (presetAppointmentId?: number) => {
        setIsUploadPopupOpen(true);
        setIsLoadAppointments(true);
        try {
            const [resultsData, appsData] = await Promise.all([
                apiFetch<Result[]>('/results'),
                apiFetch<Appointment[]>('/appointments')
            ]);
            const existingResultDetailIds = new Set((resultsData || []).map(r => r.id_appointment_detail));

            const availableApps = (appsData || [])
                .filter(a => a.status === 'AGENDADA' || a.status === 'COMPLETADA')
                .map(a => {
                    if (!a.exam_appointment_detail) return a;
                    return {
                        ...a,
                        exam_appointment_detail: a.exam_appointment_detail.filter(
                            d => !existingResultDetailIds.has(d.id_detail)
                        )
                    };
                })
                .filter(a => a.exam_appointment_detail && a.exam_appointment_detail.length > 0);

            // If we arrived from a specific button, we could find that appointment
            // For now, the select will show all available ones.
            setAppointmentsForUpload(availableApps);
        } catch (error) {
            console.error('Error fetching appointments for upload:', error);
        } finally {
            setIsLoadAppointments(false);
        }
    };

    const handleCreateResult = async (data: { id_appointment_detail: number, delivery_date: string, result_data: string }) => {
        try {
            await apiFetch('/results', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            // Si tenemos la cita seleccionada y su estado es AGENDADA, la pasamos a COMPLETADA
            if (selectedAppointment && selectedAppointment.status === 'AGENDADA') {
                await apiFetch(`/appointments/${selectedAppointment.id_appointment}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: 'COMPLETADA' })
                });
            }

            setIsUploadPopupOpen(false);
            // Re-fetch everything to ensure consistency
            await fetchStats();
        } catch (error: any) {
            console.error('Error creating result:', error);
            alert(`Error al registrar el resultado: ${error.message || 'Error interno'}`);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        setIsUpdating(true);
        try {
            await apiFetch(`/appointments/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            setIsViewModalOpen(false);
            // Re-fetch everything to ensure consistency
            await fetchStats();
        } catch (error) {
            console.error('Error updating appointment status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const router = useRouter();

    React.useEffect(() => {
        const storedUser = localStorage.getItem('lab_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // Redirigir si es paciente
                if (parsedUser.id_role !== 1 && router) {
                    router.push('/dashboard/patient');
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, [router]);

    const fetchStats = async () => {
        try {
            const [statsData, appData] = await Promise.all([
                apiFetch<any>('/stats/dashboard'),
                apiFetch<any>('/appointments').catch(() => [])
            ]);

            const allAppointments = Array.isArray(appData) ? appData : (appData?.appointments || []);

            // Cruzamos data.pendingAppointments con allAppointments para rellenar los detalles del examen 
            const enrichedPendingAppointments = (statsData.pendingAppointments || []).map((pending: any) => {
                const fullApp = allAppointments.find((a: any) => a.id_appointment === pending.id_appointment);
                return fullApp && fullApp.exam_appointment_detail ? { ...pending, exam_appointment_detail: fullApp.exam_appointment_detail } : pending;
            });

            // Obtenemos citas agendadas directamente del listado completo (ya tienen detalles)
            const scheduledAppointments = allAppointments.filter((a: any) => a.status === 'AGENDADA').slice(0, 5);

            setStats({
                totalUsers: statsData.totalUsers?.toString() || '0',
                totalAppointments: statsData.totalAppointments?.toString() || '0',
                pendingResults: statsData.pendingResults?.toString() || '0',
                examsPerformed: statsData.examsPerformed?.toString() || '0',
                pendingAppointments: enrichedPendingAppointments,
                scheduledAppointments: scheduledAppointments
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchStats();
    }, []);

    const filteredPending = stats.pendingAppointments.filter(app => {
        const fullName = `${app.user?.first_name} ${app.user?.last_name}`.toLowerCase();
        const uid = (app.user?.uid || '').toLowerCase();
        const exams = (app.exam_appointment_detail || []).map((d: any) => d.exam?.exam_type?.category_name || '').join(' ').toLowerCase();
        const search = pendingSearchTerm.toLowerCase();
        return fullName.includes(search) || uid.includes(search) || exams.includes(search);
    });

    const filteredScheduled = stats.scheduledAppointments.filter(app => {
        const fullName = `${app.user?.first_name} ${app.user?.last_name}`.toLowerCase();
        const uid = (app.user?.uid || '').toLowerCase();
        const exams = (app.exam_appointment_detail || []).map((d: any) => d.exam?.exam_type?.category_name || '').join(' ').toLowerCase();
        const search = scheduledSearchTerm.toLowerCase();
        return fullName.includes(search) || uid.includes(search) || exams.includes(search);
    });

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                        Gestión Integral de <span className="text-sky-400">Laboratorio</span>
                    </h1>
                    <p className="text-base text-slate-400 font-medium">
                        Bienvenido de nuevo{user ? `, ${formatFullName(user.first_name, user.last_name)}` : ''}. Aquí está el resumen de hoy.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        title="Citas para hoy"
                        value={isLoading ? '...' : stats.totalAppointments}
                        icon="calendar-event"
                        color="primary"
                        delay={100}
                    />
                    <StatCard
                        title="Resultados Pendientes"
                        value={isLoading ? '...' : stats.pendingResults}
                        icon="file-find"
                        color="warning"
                        delay={200}
                    />
                    <StatCard
                        title="Exámenes Realizados"
                        value={isLoading ? '...' : stats.examsPerformed}
                        icon="vial"
                        color="success"
                        delay={300}
                    />
                    <StatCard
                        title="Total Usuarios"
                        value={isLoading ? '...' : stats.totalUsers}
                        icon="group"
                        color="secondary"
                        delay={400}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Pending Appointments Card */}
                    <ScrollReveal delay={500}>
                        <div className="h-full bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                            <div className="p-6 flex items-center justify-between border-b border-white/5">
                                <h2 className="text-lg font-black text-white tracking-tight">
                                    Citas pendientes
                                </h2>
                                <button
                                    onClick={() => window.location.href = '/dashboard/appointments'}
                                    className="group flex items-center gap-1.5 text-[10px] font-black text-sky-400 hover:text-sky-300 transition-all uppercase tracking-wider"
                                >
                                    <span>Ver todas</span>
                                    <Icon name="arrow-right" size="xs" className="transition-transform group-hover:translate-x-0.5" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="mb-6 relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Icon name="search" size="xs" color="#64748b" className="transition-colors group-focus-within:text-sky-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar citas pendientes..."
                                        value={pendingSearchTerm}
                                        onChange={(e) => setPendingSearchTerm(e.target.value)}
                                        className="w-full bg-slate-900/30 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/20 transition-all duration-300"
                                    />
                                </div>

                                <div className="space-y-3">
                                    {isLoading ? (
                                        <p className="text-sm text-slate-500 animate-pulse">Cargando citas...</p>
                                    ) : filteredPending.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No se encontraron citas pendientes.</p>
                                    ) : filteredPending.map((appointment: any) => (
                                        <div
                                            key={appointment.id_appointment}
                                            onClick={() => {
                                                setSelectedAppointment(appointment);
                                                setIsViewModalOpen(true);
                                            }}
                                            className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-sky-500/30 transition-all duration-300 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 group-hover:scale-110 transition-transform duration-300">
                                                    <Icon name="user" size="xs" className="text-sky-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                                                        {formatFullName(appointment.user?.first_name || '', appointment.user?.last_name || '')}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 font-medium">Cédula: {appointment.user?.uid}</p>
                                                    {appointment.exam_appointment_detail && appointment.exam_appointment_detail.length > 0 && (
                                                        <p className="text-[11px] text-sky-400 font-bold mt-1 max-w-[200px] truncate">
                                                            {appointment.exam_appointment_detail.map((d: any) => d.exam?.exam_type?.category_name).filter(Boolean).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-6 pl-16 md:pl-0">
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-white">
                                                        {formatDateTime(appointment.requested_date)}
                                                    </p>
                                                    <div className="mt-1">
                                                        <StatusBadge status={appointment.status} />
                                                    </div>
                                                </div>
                                                <button
                                                    disabled={isUpdating}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUpdateStatus(appointment.id_appointment, 'AGENDADA');
                                                    }}
                                                    className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 disabled:opacity-50"
                                                    title="Agendar cita"
                                                >
                                                    <Icon name="calendar-event" size="xs" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Scheduled Appointments Card */}
                    <ScrollReveal delay={600}>
                        <div className="h-full bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                            <div className="p-6 flex items-center justify-between border-b border-white/5">
                                <h2 className="text-lg font-black text-white tracking-tight">
                                    Citas agendadas
                                </h2>
                                <button
                                    onClick={() => window.location.href = '/dashboard/appointments'}
                                    className="group flex items-center gap-1.5 text-[10px] font-black text-sky-400 hover:text-sky-300 transition-all uppercase tracking-wider"
                                >
                                    <span>Gestionar</span>
                                    <Icon name="upload" size="xs" className="transition-transform group-hover:scale-110" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="mb-6 relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Icon name="search" size="xs" color="#64748b" className="transition-colors group-focus-within:text-sky-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar citas agendadas..."
                                        value={scheduledSearchTerm}
                                        onChange={(e) => setScheduledSearchTerm(e.target.value)}
                                        className="w-full bg-slate-900/30 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/20 transition-all duration-300"
                                    />
                                </div>

                                <div className="space-y-3">
                                    {isLoading ? (
                                        <p className="text-sm text-slate-500 animate-pulse">Cargando citas...</p>
                                    ) : filteredScheduled.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No se encontraron citas agendadas.</p>
                                    ) : filteredScheduled.map((appointment: any) => (
                                        <div
                                            key={appointment.id_appointment}
                                            onClick={() => {
                                                setSelectedAppointment(appointment);
                                                setIsViewModalOpen(true);
                                            }}
                                            className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-sky-500/30 transition-all duration-300 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 group-hover:scale-110 transition-transform duration-300">
                                                    <Icon name="user" size="xs" className="text-sky-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                                                        {formatFullName(appointment.user?.first_name || '', appointment.user?.last_name || '')}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 font-medium">Cédula: {appointment.user?.uid}</p>
                                                    {appointment.exam_appointment_detail && appointment.exam_appointment_detail.length > 0 && (
                                                        <p className="text-[11px] text-sky-400 font-bold mt-1 max-w-[200px] truncate">
                                                            {appointment.exam_appointment_detail.map((d: any) => d.exam?.exam_type?.category_name).filter(Boolean).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-6 pl-16 md:pl-0">
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-white">
                                                        {formatDateTime(appointment.requested_date)}
                                                    </p>
                                                    <div className="mt-1">
                                                        <StatusBadge status={appointment.status} />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedAppointment(appointment);
                                                        handleOpenModal(appointment.id_appointment);
                                                    }}
                                                    className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500 hover:text-white transition-all duration-300"
                                                    title="Subir resultado"
                                                >
                                                    <Icon name="upload" size="xs" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                <Modal
                    open={isUploadPopupOpen}
                    onClose={() => setIsUploadPopupOpen(false)}
                    title="Subir Nuevo Resultado"
                >
                    {isLoadAppointments ? (
                        <div className="p-10 text-center">
                            <p className="text-white animate-pulse">Cargando...</p>
                        </div>
                    ) : (
                        <ResultForm
                            appointments={appointmentsForUpload}
                            onSubmit={handleCreateResult}
                            onCancel={() => setIsUploadPopupOpen(false)}
                        />
                    )}
                </Modal>

                {/* Modal: View Appointment Details */}
                <Modal
                    open={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title="Detalles de la Cita"
                >
                    {selectedAppointment && (
                        <div className="p-2 space-y-6">
                            {/* Patient Info */}
                            <div className="p-4 bg-white/3 rounded-2xl border border-white/5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                                    <Icon name="user" size="xs" className="text-sky-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-0.5">Paciente</p>
                                    <p className="text-base font-bold text-white">
                                        {formatFullName(selectedAppointment.user?.first_name || '', selectedAppointment.user?.last_name || '')}
                                    </p>
                                    <p className="text-xs text-white/60 font-medium">
                                        Cédula: {selectedAppointment.user?.uid}
                                    </p>
                                </div>
                            </div>

                            {/* Appointment Info */}
                            <div className="p-4 bg-white/3 rounded-2xl border border-white/5 space-y-4">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Detalles de la Cita</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/60 font-medium">Fecha y Hora:</span>
                                        <span className="text-white font-bold">{formatDateTime(selectedAppointment.requested_date)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/60 font-medium">Estado actual:</span>
                                        <StatusBadge status={selectedAppointment.status} />
                                    </div>
                                </div>
                            </div>

                            {/* Exams */}
                            <div className="p-4 bg-white/3 rounded-2xl border border-white/5 space-y-3">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Exámenes Solicitados</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedAppointment.exam_appointment_detail?.map((detail: any) => (
                                        <span
                                            key={detail.id_detail}
                                            className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-white transition-colors hover:border-sky-500/30"
                                        >
                                            {detail.exam?.exam_type?.category_name || 'Examen'}
                                        </span>
                                    ))}
                                    {(!selectedAppointment.exam_appointment_detail || selectedAppointment.exam_appointment_detail.length === 0) && (
                                        <p className="text-xs text-white/40 italic">No hay exámenes detallados.</p>
                                    )}
                                </div>
                            </div>

                            {/* Observations */}
                            {selectedAppointment.exam_appointment_detail?.[0]?.patient_observations && (
                                <div className="p-4 bg-white/3 rounded-2xl border border-white/5 space-y-2">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Observaciones</p>
                                    <p className="text-sm text-white/80 italic leading-relaxed">
                                        "{selectedAppointment.exam_appointment_detail[0].patient_observations}"
                                    </p>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="pt-2">
                                {selectedAppointment.status === 'PENDIENTE' && (
                                    <Button
                                        fullWidth
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateStatus(selectedAppointment.id_appointment, 'AGENDADA')}
                                        className="py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Icon name="send" size="xs" />
                                            <span>{isUpdating ? 'Procesando...' : 'Aprobar Cita'}</span>
                                        </div>
                                    </Button>
                                )}
                                {selectedAppointment.status === 'AGENDADA' && (
                                    <Button
                                        fullWidth
                                        onClick={() => {
                                            setIsViewModalOpen(false);
                                            handleOpenModal(selectedAppointment.id_appointment);
                                        }}
                                        className="py-4 rounded-xl bg-sky-500 hover:bg-sky-600 font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-95 text-white"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Icon name="upload" size="xs" />
                                            <span>Subir Resultado</span>
                                        </div>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </DashboardLayout>
    );
}
