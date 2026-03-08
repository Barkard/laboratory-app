'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Icon from '@/components/ui/Icon';
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Result, Exam, DynamicField, Appointment } from '@/types';
import { formatDateTime } from '@/utils/formatters';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ResultForm from '@/components/results/ResultForm';
import { DataGrid, GridColDef, GridRowSelectionModel, GridRenderCellParams } from '@mui/x-data-grid';
import { apiFetch } from '@/utils/api';

// Mock exams with custom fields for testing
const mockExams: Exam[] = [];
const resultsData: any[] = [];

export default function ResultsPage() {
    const [rows, setRows] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [appointments, setAppointments] = React.useState<Appointment[]>([]);
    const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>({
        type: 'include',
        ids: new Set()
    });
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [viewingResult, setViewingResult] = React.useState<any>(null);
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
            const [resultsData, appsData] = await Promise.all([
                apiFetch<Result[]>('/results'),
                apiFetch<Appointment[]>('/appointments')
            ]);
            setRows(resultsData || []);

            // Get all id_appointment_detail that already have a result
            const existingResultDetailIds = new Set((resultsData || []).map(r => r.id_appointment_detail));

            // Filter appointments to only those that are AGENDADA
            // And filter their details to only those without results
            const availableApps = (appsData || [])
                .filter(a => a.status === 'AGENDADA')
                .map(a => {
                    if (!a.exam_appointment_detail) return a;
                    return {
                        ...a,
                        exam_appointment_detail: a.exam_appointment_detail.filter(
                            d => !existingResultDetailIds.has(d.id_detail)
                        )
                    };
                })
                // Only keep appointments that still have at least one detail pending result
                .filter(a => a.exam_appointment_detail && a.exam_appointment_detail.length > 0);

            setAppointments(availableApps);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedIds = Array.from(selectionModel.ids);

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;

        setConfirmModal({
            open: true,
            title: '¿Eliminar resultados?',
            description: `¿Está seguro que desea eliminar ${selectedIds.length} resultados? Esta acción no se puede deshacer.`,
            onConfirm: () => {
                setRows(rows.filter((row) => !selectionModel.ids.has(row.id_result)));
                setSelectionModel({ type: 'include', ids: new Set() });
            }
        });
    };

    const handleCreateResult = async (data: { id_appointment_detail: number, delivery_date: string, result_data: string }) => {
        setIsLoading(true);
        try {
            await apiFetch('/results', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            await fetchData();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error creating result:', error);
            alert(`Error al registrar el resultado: ${error.message || 'Error interno'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredRows = rows.filter(row => {
        const appointmentUser = row.exam_appointment_detail?.appointment?.user;
        const patientName = `${appointmentUser?.first_name || ''} ${appointmentUser?.last_name || ''} ${appointmentUser?.uid || ''}`.toLowerCase();
        const examName = (row.exam_appointment_detail?.exam?.exam_type?.category_name || '').toLowerCase();
        return patientName.includes(searchTerm.toLowerCase()) || examName.includes(searchTerm.toLowerCase());
    });

    const columns: GridColDef[] = [
        {
            field: 'patient_name',
            headerName: 'Paciente',
            width: 350,
            renderCell: (params: GridRenderCellParams) => {
                const user = params.row.exam_appointment_detail?.appointment?.user;
                if (!user) return <span className="text-slate-500 italic">Desconocido</span>;
                return (
                    <div className="flex flex-col justify-center h-full py-2">
                        <p className="text-sm font-semibold text-white leading-tight">
                            {user.first_name} {user.last_name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                            C.I: {user.uid}
                        </p>
                    </div>
                );
            }
        },
        {
            field: 'exam_type',
            headerName: 'Examen',
            width: 180,
            valueGetter: (value, row) => row.exam_appointment_detail?.exam?.exam_type?.category_name || 'Desconocido',
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex items-center gap-2 h-full">
                    <div className="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                        <Icon name="microscope" size="xs" color="#38bdf8" />
                    </div>
                    <span className="text-sm text-white truncate">{params.value}</span>
                </div>
            )
        },
        {
            field: 'delivery_date',
            headerName: 'Fecha de Entrega',
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex items-center gap-2 h-full">
                    <Icon name="calendar" size="xs" color="#64748b" />
                    <span className="text-sm text-slate-300">{formatDateTime(params.value)}</span>
                </div>
            )
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 180,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex items-center gap-2 h-full">
                    <button
                        onClick={() => setViewingResult(params.row)}
                        className="p-1.5 text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                        title="Ver Detalles"
                    >
                        <Icon name="show" size="xs" />
                    </button>
                    <button
                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Imprimir"
                    >
                        <Icon name="printer" size="xs" />
                    </button>
                    <button
                        onClick={() => {
                            setConfirmModal({
                                open: true,
                                title: '¿Eliminar resultado?',
                                description: '¿Está seguro que desea eliminar este resultado de laboratorio? Esta acción no se puede deshacer.',
                                onConfirm: () => {
                                    setRows(rows.filter(r => r.id_result !== params.row.id_result));
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
                                <Icon name="vial" size="xs" color="white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Resultados de Exámenes
                            </h1>
                        </div>
                        <p className="text-sm text-slate-400 mt-2 ml-1">
                            Consulte y gestione los resultados de los análisis realizados.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-sky-500/20"
                    >
                        <Icon name="plus" size="xs" />
                        Subir Resultado
                    </button>
                </div>

                <Modal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Subir Nuevo Resultado"
                >
                    <ResultForm
                        appointments={appointments}
                        onSubmit={handleCreateResult}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>

                <ConfirmModal
                    open={confirmModal.open}
                    onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    description={confirmModal.description}
                />

                {/* Viewing Modal */}
                <Modal
                    open={!!viewingResult}
                    onClose={() => setViewingResult(null)}
                    title="Detalles del Resultado"
                >
                    {viewingResult && (
                        <div className="flex flex-col gap-6">
                            <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-sky-100 shadow-sm shrink-0">
                                        <Icon name="user" size="sm" color="#0ea5e9" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest leading-none mb-1">Paciente</p>
                                        <h3 className="text-base font-bold text-white">
                                            {`${viewingResult.exam_appointment_detail?.appointment?.user?.first_name || ''} ${viewingResult.exam_appointment_detail?.appointment?.user?.last_name || ''}`}
                                        </h3>
                                    </div>
                                </div>
                            </div>

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
                                    {Object.entries((viewingResult.result_data ? JSON.parse(viewingResult.result_data) : {}) as Record<string, any>).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="flex justify-between items-center p-3 bg-white/2 border border-white/5 rounded-xl transition-colors hover:bg-white/4"
                                        >
                                            <span className="text-sm text-slate-400 font-medium">{key}:</span>
                                            <span className="text-sm font-bold text-white">
                                                {typeof value === 'boolean' ? (
                                                    <span className={`px-2 py-0 rounded-full text-[10px] uppercase tracking-wider border font-bold leading-none ${value ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                        {value ? 'Sí' : 'No'}
                                                    </span>
                                                ) : value}
                                            </span>
                                        </div>
                                    ))}
                                    {(!viewingResult.result_data || Object.keys(JSON.parse(viewingResult.result_data)).length === 0) && (
                                        <p className="text-sm text-slate-500 italic text-center py-4">
                                            No hay valores adicionales registrados.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/10 transition-all duration-300">
                                    <Icon name="printer" size="xs" />
                                    Imprimir
                                </button>
                                <button
                                    onClick={() => setViewingResult(null)}
                                    className="flex-1 py-2.5 px-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-lg shadow-sky-500/20"
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
                            placeholder="Buscar por paciente, examen o código..."
                            className="w-full bg-slate-900/30 border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/20 transition-all duration-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="w-full bg-slate-900/45 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
                        <DataGrid
                            rows={filteredRows}
                            columns={columns}
                            getRowId={(row) => row.id_result}
                            loading={isLoading}
                            autoHeight
                            getRowHeight={() => 'auto'}
                            checkboxSelection
                            disableRowSelectionOnClick
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
            </div>
        </DashboardLayout>
    );
};
