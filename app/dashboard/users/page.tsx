'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Icon from '@/components/ui/Icon';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { User } from '@/types';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import UserForm from '@/components/users/UserForm';
import { DataGrid, GridColDef, GridRowSelectionModel, GridRenderCellParams } from '@mui/x-data-grid';
import { apiFetch } from '@/utils/api';
import { capitalize } from '@/utils/formatters';

// Mock data removed in favor of real API integration

export default function UsersPage() {
    const [rows, setRows] = React.useState<User[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectionModel, setSelectionModel] = React.useState<GridRowSelectionModel>({
        type: 'include',
        ids: new Set()
    });
    const [isModalOpen, setIsModalOpen] = React.useState(false);
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
    const router = useRouter();

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
        fetchUsers();
    }, [router]);

    const fetchUsers = async () => {
        try {
            const data = await apiFetch<User[]>('/users');

            // data is directly the array of users in NestJS implementation
            setRows(Array.isArray(data) ? data : ((data as any).users || []));
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedIds = Array.from(selectionModel.ids);

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;

        setConfirmModal({
            open: true,
            title: '¿Eliminar usuarios?',
            description: `¿Está seguro que desea eliminar ${selectedIds.length} pacientes del sistema? Esta acción no se puede deshacer.`,
            onConfirm: () => {
                // TODO: Implement backend delete
                setRows(rows.filter((row) => !selectionModel.ids.has(row.id_user)));
                setSelectionModel({ type: 'include', ids: new Set() });
            }
        });
    };

    const handleCreateUser = (userData: Partial<User>) => {
        // This is now handled by the registration flow or can be added as a separate API call
        // For now, let's just refresh the list after registration
        setIsModalOpen(false);
        fetchUsers();
    };

    const columns: GridColDef[] = [
        { field: 'uid', headerName: 'Cédula', width: 130 },
        {
            field: 'first_name',
            headerName: 'Nombres',
            width: 150,
            renderCell: (params: GridRenderCellParams) => capitalize(params.value as string)
        },
        {
            field: 'last_name',
            headerName: 'Apellidos',
            width: 150,
            renderCell: (params: GridRenderCellParams) => capitalize(params.value as string)
        },
        { field: 'phone', headerName: 'Teléfono', width: 130 },
        {
            field: 'id_role',
            headerName: 'Rol',
            width: 140,
            renderCell: (params: GridRenderCellParams) => {
                const isUser = params.row.id_role === 1;
                const roleName = isUser ? 'Administrador' : 'Paciente';
                const colors = isUser
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                return (
                    <span className={`px-2 py-0.5 rounded-3xl text-[10px] font-bold border uppercase tracking-wider ${colors}`}>
                        {roleName}
                    </span>
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 120,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <div className="flex items-center gap-2 h-full">
                    <button
                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Icon name="edit-alt" size="xs" />
                    </button>
                    <button
                        onClick={() => {
                            setConfirmModal({
                                open: true,
                                title: '¿Eliminar usuario?',
                                description: '¿Está seguro que desea eliminar este paciente del sistema? Esta acción no se puede deshacer.',
                                onConfirm: () => {
                                    setRows(rows.filter(r => r.id_user !== params.row.id_user));
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
                                <Icon name="user" size="xs" color="white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Gestión de Pacientes
                            </h1>
                        </div>
                        <p className="text-sm text-slate-400 mt-2 ml-1">
                            Administre el registro de pacientes del laboratorio.
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
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-sky-500/20"
                        >
                            <Icon name="user-plus" size="xs" />
                            Nuevo Usuario
                        </button>
                    </div>
                </div>

                <Modal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Registrar Nuevo Paciente"
                >
                    <UserForm
                        onSubmit={handleCreateUser}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>

                <ScrollReveal delay={200}>
                    <div className="mb-6 relative group w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name="search" size="xs" color="#64748b" className="transition-colors group-focus-within:text-sky-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o identificación..."
                            className="w-full bg-slate-900/30 border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/20 transition-all duration-300"
                        />
                    </div>

                    <div className="w-full bg-slate-900/45 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            getRowId={(row) => row.id_user}
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
