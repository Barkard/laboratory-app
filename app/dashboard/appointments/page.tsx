'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Icon from '@/components/ui/Icon';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { Appointment, User } from '@/types';
import { formatDateTime } from '@/utils/formatters';
import {
    DataGrid,
    GridColDef,
    GridRowSelectionModel,
    GridRenderCellParams,
    GridRowId
} from '@mui/x-data-grid';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import { apiFetch } from '@/utils/api';

const appointmentsData: Appointment[] = [];

const mockExams: any[] = [];

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
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider leading-none ${variants[status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
            {labels[status] || status}
        </span>
    );
};

export default function AppointmentsPage() {
    const [rows, setRows] = React.useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [users, setUsers] = React.useState<User[]>([]);
    const [exams, setExams] = React.useState<any[]>([]);

    const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>({ type: 'include', ids: new Set<GridRowId>() });
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [confirmModal, setConfirmModal] = React.useState<{
        open: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    }>({
        open: false,
        title: '',
        description: '',
        onConfirm: () => { }
    });

    const router = React.useMemo(() => typeof window !== 'undefined' ? require('next/navigation').useRouter() : null, []);

    React.useEffect(() => {
        const storedUser = localStorage.getItem('lab_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user.id_role !== 1 && router) {
                    router.push('/dashboard/patient');
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        fetchData();
    }, [router]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [appData, userData, examData] = await Promise.all([
                apiFetch<Appointment[]>('/appointments'),
                apiFetch<User[]>('/users'),
                apiFetch<any[]>('/exams')
            ]);

            setRows(Array.isArray(appData) ? appData : ((appData as any).appointments || []));
            setUsers(Array.isArray(userData) ? userData : ((userData as any).users || []));
            setExams(Array.isArray(examData) ? examData : ((examData as any).exams || []));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedIds = Array.isArray(selectionModel)
        ? selectionModel
        : Array.from((selectionModel as any).ids || []);

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;

        setConfirmModal({
            open: true,
            title: '¿Eliminar citas?',
            description: `¿Está seguro que desea eliminar ${selectedIds.length} citas médicas? Esta acción no se puede deshacer.`,
            onConfirm: async () => {
                try {
                    await Promise.all(
                        selectedIds.map(id => apiFetch(`/appointments/${id}`, { method: 'DELETE' }))
                    );
                    setSelectionModel({ type: 'include', ids: new Set<GridRowId>() });
                    fetchData();
                } catch (error) {
                    console.error('Error deleting appointments:', error);
                    alert('Error al eliminar algunas citas.');
                }
            }
        });
    };

    const handleCreateAppointment = async (data: any) => {
        try {
            await apiFetch('/appointments', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error creating appointment:', error);
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
            fetchData();
        } catch (error) {
            console.error('Error updating appointment status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'patient',
            headerName: 'Paciente',
            width: 250,
            valueGetter: (value, row) => `${row.user?.first_name || ''} ${row.user?.last_name || ''}`.trim()
        },
        {
            field: 'uid',
            headerName: 'Cédula',
            width: 150,
            valueGetter: (value, row) => row.user?.uid || ''
        },
        {
            field: 'requested_date',
            headerName: 'Fecha Solicitada',
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex items-center gap-2 h-full">
                    <Icon name="calendar" size="xs" color="#94a3b8" />
                    <span className="text-sm text-slate-200">{formatDateTime(params.value)}</span>
                </div>
            )
        },
        {
            field: 'status',
            headerName: 'Estado',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex items-center h-full">
                    <StatusBadge status={params.value as string} />
                </div>
            )
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 120,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex items-center gap-2 h-full">
                    <button
                        onClick={() => {
                            setSelectedAppointment(params.row);
                            setIsViewModalOpen(true);
                        }}
                        className="p-1.5 text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                        title="Ver detalles"
                    >
                        <Icon name="show" size="xs" />
                    </button>
                    {params.row.status === 'PENDIENTE' && (
                        <button
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Icon name="edit-alt" size="xs" />
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setConfirmModal({
                                open: true,
                                title: '¿Eliminar cita?',
                                description: '¿Está seguro que desea eliminar esta cita médica? Esta acción no se puede deshacer.',
                                onConfirm: async () => {
                                    try {
                                        await apiFetch(`/appointments/${params.row.id_appointment}`, { method: 'DELETE' });
                                        fetchData();
                                    } catch (error) {
                                        console.error('Error deleting appointment:', error);
                                        alert('Error al eliminar la cita.');
                                    }
                                }
                            });
                        }}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Eliminar"
                    >
                        <Icon name="trash" size="xs" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.4)] border border-white/10 relative z-10">
                                <Icon name="calendar-event" size="xs" color="white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Gestión de Citas
                            </h1>
                        </div>
                        <p className="text-sm text-slate-400 mt-2 ml-1">
                            Vea y administre las citas solicitadas en el laboratorio.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-rose-500/20"
                            >
                                <Icon name="trash" size="xs" />
                                Eliminar Selección ({selectedIds.length})
                            </button>
                        )}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-sky-500/20"
                        >
                            <Icon name="calendar-event" size="xs" />
                            Agendar Cita
                        </button>
                    </div>
                </div>

                <Modal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Agendar Nueva Cita"
                >
                    <AppointmentForm
                        users={users}
                        exams={exams}
                        onSubmit={handleCreateAppointment}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>

                {/* Modal: View Appointment Details */}
                <Modal
                    open={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title="Detalles de la Cita"
                >
                    {selectedAppointment && (
                        <div className="p-1">
                            <div className="flex flex-col gap-6">
                                {/* Patient Info */}
                                <div className="p-4 bg-white/3 rounded-2xl border border-white/5 space-y-4">
                                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Paciente</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                                            <Icon name="user" size="xs" />
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-white leading-tight">
                                                {selectedAppointment.user?.first_name} {selectedAppointment.user?.last_name}
                                            </p>
                                            <p className="text-sm text-white/60 mt-0.5">
                                                Cédula: {selectedAppointment.user?.uid}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Appointment Info */}
                                <div className="p-4 bg-white/3 rounded-2xl border border-white/5 space-y-4">
                                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Información de la Cita</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-white/60">Fecha y Hora:</span>
                                            <span className="text-sm font-bold text-white">{formatDateTime(selectedAppointment.requested_date)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-white/60">Estado actual:</span>
                                            <StatusBadge status={selectedAppointment.status} />
                                        </div>
                                    </div>
                                </div>

                                {/* Exams */}
                                <div className="p-4 bg-white/3 rounded-2xl border border-white/5 space-y-4">
                                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Exámenes Solicitados</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAppointment.exam_appointment_detail?.map((detail) => (
                                            <span
                                                key={detail.id_detail}
                                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white"
                                            >
                                                {detail.exam?.exam_type?.category_name || 'Examen'}
                                            </span>
                                        ))}
                                        {(!selectedAppointment.exam_appointment_detail || selectedAppointment.exam_appointment_detail.length === 0) && (
                                            <span className="text-xs text-white/40 italic text-center w-full block py-2">No hay exámenes detallados.</span>
                                        )}
                                    </div>
                                </div>

                                {/* Observations */}
                                {selectedAppointment.exam_appointment_detail?.[0]?.patient_observations && (
                                    <div className="p-4 bg-white/3 rounded-2xl border border-white/5 space-y-2">
                                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Observaciones</h3>
                                        <p className="text-sm text-white/80 italic leading-relaxed">
                                            "{selectedAppointment.exam_appointment_detail[0].patient_observations}"
                                        </p>
                                    </div>
                                )}

                                {/* Action Button */}
                                {selectedAppointment.status === 'PENDIENTE' && (
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateStatus(selectedAppointment.id_appointment, 'AGENDADA')}
                                        className="w-full flex items-center justify-center gap-2 mt-2 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-500/20"
                                    >
                                        <Icon name="send" size="xs" />
                                        {isUpdating ? 'Procesando...' : 'Enviar Permiso / Aprobar Cita'}
                                    </button>
                                )}
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
                            placeholder="Buscar por ID o Usuario..."
                            className="w-full bg-slate-900/30 border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/20 transition-all duration-300"
                        />
                    </div>

                    <div className="w-full bg-slate-900/45 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            getRowId={(row) => row.id_appointment}
                            loading={isLoading}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 5 },
                                },
                            }}
                            pageSizeOptions={[5, 10]}
                            checkboxSelection
                            onRowSelectionModelChange={(newSelection) => {
                                setSelectionModel(newSelection);
                            }}
                            rowSelectionModel={selectionModel}
                            disableRowSelectionOnClick
                            autoHeight
                            sx={{
                                border: 0,
                                '& .MuiDataGrid-main': { color: '#f8fafc' },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                                },
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                },
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                },
                                '& .MuiCheckbox-root': {
                                    color: 'rgba(255, 255, 255, 0.2)',
                                },
                                '& .Mui-checked': {
                                    color: '#38bdf8 !important',
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                                },
                                '& .MuiTablePagination-root': {
                                    color: '#94a3b8',
                                },
                                '& .MuiIconButton-root': {
                                    color: '#94a3b8',
                                },
                            }}
                        />
                    </div>
                </ScrollReveal>

                <ConfirmModal
                    open={confirmModal.open}
                    onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    description={confirmModal.description}
                />
            </div>
        </DashboardLayout>
    );
}
