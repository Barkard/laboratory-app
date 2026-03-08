'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Icon from '@/components/ui/Icon';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { Exam, ExamType, CustomFile } from '@/types';
import { GridRowId } from '@mui/x-data-grid';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ExamForm from '@/components/exams/ExamForm';
import { DataGrid, GridColDef, GridRowSelectionModel, GridRenderCellParams } from '@mui/x-data-grid';
import { apiFetch } from '@/utils/api';

const examsData: (Exam & { type: string })[] = [];

export default function ExamsPage() {
    const [allExamTypes, setAllExamTypes] = React.useState<ExamType[]>([]);
    const [rows, setRows] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>({
        type: 'include',
        ids: new Set()
    });
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingExam, setEditingExam] = React.useState<any>(null);
    const [previewExam, setPreviewExam] = React.useState<any>(null);
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
        fetchExams();
    }, [router]);

    const fetchExams = async () => {
        setIsLoading(true);
        try {
            const [examsData, typesData] = await Promise.all([
                apiFetch<Exam[]>('/exams'),
                apiFetch<ExamType[]>('/exams/types')
            ]);

            // Adapt NestJS response (it returns the array directly)
            setRows(Array.isArray(examsData) ? examsData : ((examsData as any).exams || []));
            setAllExamTypes(Array.isArray(typesData) ? typesData : ((typesData as any).types || []));
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedIds = Array.from(selectionModel.ids);

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;

        setConfirmModal({
            open: true,
            title: '¿Eliminar exámenes?',
            description: `¿Está seguro que desea eliminar ${selectedIds.length} exámenes del catálogo? Esta acción no se puede deshacer.`,
            onConfirm: () => {
                setRows(rows.filter((row) => !selectionModel.ids.has(row.id_exam)));
                setSelectionModel({ type: 'include', ids: new Set() });
            }
        });
    };

    const handleCreateExam = async (data: any) => {
        setIsLoading(true);
        try {
            const method = editingExam ? 'PATCH' : 'POST';
            const url = editingExam ? `/exams/${editingExam.id_exam}` : `/exams`;

            // NestJS backend expects custom_file_data and id_type
            const payload: any = {
                id_type: data.id_type,
            };

            // For new exams, we always need either id_file or custom_file_data
            // If data.id_file is not present, we create a new custom_file_data
            if (!data.id_file) {
                payload.custom_file_data = {
                    config_name: data.config_name || `Config for ${data.name || 'Exam'}`,
                    json_schema: JSON.stringify(data.customFields || [])
                };
            } else {
                payload.id_file = data.id_file;
            }

            await apiFetch(url, {
                method,
                body: JSON.stringify(payload)
            });

            await fetchExams();
            setIsModalOpen(false);
            setEditingExam(null);
        } catch (error) {
            console.error('Error saving exam:', error);
            alert('Error al guardar el examen. Verifique los datos.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNewType = async (name: string, requirements: string) => {
        try {
            const data = await apiFetch<ExamType>('/exams/types', {
                method: 'POST',
                body: JSON.stringify({
                    category_name: name,
                    detail: `Categoría para ${name}`,
                    requirements: requirements
                })
            });

            setAllExamTypes(prev => [...prev, data]);
            return data.id_type;
        } catch (error) {
            console.error('Error adding exam type:', error);
            alert('Error al crear la categoría de examen.');
            return undefined;
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Examen',
            width: 250,
            valueGetter: (value, row) => row.exam_type?.category_name || 'Sin nombre'
        },
        {
            field: 'type',
            headerName: 'Categoría',
            width: 200,
            valueGetter: (value, row) => row.exam_type?.category_name || 'Sin categoría',
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex items-center h-full">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider leading-none bg-sky-500/10 text-sky-500 border-sky-500/20">
                        {params.value}
                    </span>
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
                        onClick={() => setPreviewExam(params.row)}
                        className="p-1.5 text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                        title="Ver/Llenar Formulario"
                    >
                        <Icon name="task" size="xs" />
                    </button>
                    <button
                        onClick={() => {
                            setEditingExam(params.row);
                            setIsModalOpen(true);
                        }}
                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Icon name="edit-alt" size="xs" />
                    </button>
                    <button
                        onClick={() => {
                            setConfirmModal({
                                open: true,
                                title: '¿Eliminar examen?',
                                description: '¿Está seguro que desea eliminar este examen del catálogo? Esta acción no se puede deshacer.',
                                onConfirm: () => {
                                    setRows(rows.filter(r => r.id_exam !== params.row.id_exam));
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
                                <Icon name="book" size="xs" color="white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Catálogo de Exámenes
                            </h1>
                        </div>
                        <p className="text-sm text-slate-400 mt-2 ml-1">
                            Gestione los diferentes tipos de análisis disponibles.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-rose-500/20"
                            >
                                <Icon name="trash" size="xs" />
                                Eliminar ({selectedIds.length})
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setEditingExam(null);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-sky-500/20"
                        >
                            <Icon name="plus" size="xs" />
                            Nuevo Examen
                        </button>
                    </div>
                </div>

                <Modal
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingExam(null);
                    }}
                    title={editingExam ? "Editar Examen" : "Registrar Nuevo Examen"}
                >
                    <ExamForm
                        key={editingExam?.id_exam || 'new'}
                        examTypes={allExamTypes}
                        onAddType={handleAddNewType}
                        onSubmit={handleCreateExam}
                        onCancel={() => {
                            setIsModalOpen(false);
                            setEditingExam(null);
                        }}
                        initialData={editingExam}
                    />
                </Modal>

                <ScrollReveal delay={200}>
                    <div className="mb-6 relative group w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name="search" size="xs" color="#64748b" className="transition-colors group-focus-within:text-sky-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por tipo o configuración..."
                            className="w-full bg-slate-900/30 border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/20 transition-all duration-300"
                        />
                    </div>

                    <div className="w-full bg-slate-900/45 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            getRowId={(row) => row.id_exam}
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

                <Modal
                    open={!!previewExam}
                    onClose={() => setPreviewExam(null)}
                    title={`Vista Previa: ${previewExam?.exam_type?.category_name || 'Examen'}`}
                >
                    {previewExam && (() => {
                        const fields = previewExam.custom_files?.json_schema
                            ? JSON.parse(previewExam.custom_files.json_schema)
                            : [];

                        return (
                            <div className="flex flex-col gap-6">
                                <p className="text-sm text-slate-400">
                                    Esta es una vista previa de cómo se verá el formulario de resultados.
                                </p>

                                <hr className="border-white/5" />

                                {fields.length > 0 ? (
                                    <div className="flex flex-col gap-6">
                                        {fields.map((field: any) => (
                                            <div key={field.id}>
                                                {field.type === 'checkbox' ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 border-2 border-white/20 rounded-sm" />
                                                        <p className="text-sm text-white">{field.label}</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                                                            {field.label}
                                                        </label>
                                                        <div
                                                            className="p-3 bg-white/3 border border-white/10 rounded-xl text-white/40 text-sm"
                                                        >
                                                            {field.type === 'select' ? `Seleccionar ${field.label}...` : `Ingresar ${field.label.toLowerCase()}...`}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 px-4 text-center bg-white/2 border border-dashed border-white/10 rounded-2xl">
                                        <div className="flex justify-center mb-3">
                                            <Icon name="info-circle" size="md" color="#64748b" />
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            Este examen no tiene campos configurados aún.
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => setPreviewExam(null)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 mt-2"
                                >
                                    Cerrar Vista Previa
                                </button>
                            </div>
                        );
                    })()}
                </Modal>
            </div>
        </DashboardLayout>
    );
}
