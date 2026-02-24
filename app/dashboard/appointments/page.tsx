'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Icon from '@/components/ui/Icon';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { Appointment, User } from '@/types';
import { formatDateTime } from '@/utils/formatters';
import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Chip,
    IconButton,
    Stack
} from '@mui/material';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import { DataGrid, GridColDef, GridRowSelectionModel, GridRenderCellParams } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

const appointmentsData: Appointment[] = [
    { appointment_id: 101, user_id: 1, requested_date: '2026-02-21T08:30:00', status: 'Confirmed' },
    { appointment_id: 102, user_id: 2, requested_date: '2026-02-21T09:15:00', status: 'Pending' },
    { appointment_id: 103, user_id: 3, requested_date: '2026-02-21T10:00:00', status: 'Confirmed' },
    { appointment_id: 104, user_id: 4, requested_date: '2026-02-22T11:30:00', status: 'Cancelled' },
    { appointment_id: 105, user_id: 1, requested_date: '2026-02-23T08:00:00', status: 'Pending' },
];

const mockUsers: User[] = [
    { user_id: 1, identity_card: '12345678', first_name: 'Leon', last_name: 'Pineda' },
    { user_id: 2, identity_card: '87654321', first_name: 'Maria', last_name: 'Garcia' },
    { user_id: 3, identity_card: '11223344', first_name: 'Jose', last_name: 'Rodriguez' },
    { user_id: 4, identity_card: '44332211', first_name: 'Ana', last_name: 'Martinez' },
];

const mockExams: any[] = [
    { exam_id: 1, name: 'Hematología Completa' },
    { exam_id: 2, name: 'Glucosa' },
    { exam_id: 3, name: 'Colesterol Total' },
    { exam_id: 4, name: 'Uanálisis' },
    { exam_id: 5, name: 'Creatinina' },
];

const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, "warning" | "success" | "error" | "default"> = {
        Pending: 'warning',
        Confirmed: 'success',
        Cancelled: 'error',
    };

    const labels: Record<string, string> = {
        Pending: 'Pendiente',
        Confirmed: 'Confirmada',
        Cancelled: 'Cancelada',
    };

    return (
        <Chip
            label={labels[status] || status}
            color={variants[status] || 'default'}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 700, borderRadius: '6px' }}
        />
    );
};

export default function AppointmentsPage() {
    const [rows, setRows] = React.useState(appointmentsData);
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

    const selectedIds = Array.from(selectionModel.ids);

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;

        setConfirmModal({
            open: true,
            title: '¿Eliminar citas?',
            description: `¿Está seguro que desea eliminar ${selectedIds.length} citas médicas? Esta acción no se puede deshacer.`,
            onConfirm: () => {
                setRows(rows.filter((row) => !selectionModel.ids.has(row.appointment_id)));
                setSelectionModel({ type: 'include', ids: new Set() });
            }
        });
    };

    const handleCreateAppointment = (data: Partial<Appointment>) => {
        const newAppointment: Appointment = {
            appointment_id: Math.max(...rows.map(r => r.appointment_id)) + 1,
            user_id: data.user_id || 0,
            requested_date: data.requested_date || new Date().toISOString(),
            status: data.status || 'Pending',
        };
        setRows([...rows, newAppointment]);
        setIsModalOpen(false);
    };

    const columns: GridColDef[] = [
        { field: 'appointment_id', headerName: 'ID de Cita', width: 100 },
        { field: 'user_id', headerName: 'Usuario (ID)', width: 120 },
        {
            field: 'requested_date',
            headerName: 'Fecha Solicitada',
            width: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                    <Icon name="calendar" size="xs" color="#94a3b8" />
                    <Typography variant="body2">{formatDateTime(params.value)}</Typography>
                </Stack>
            )
        },
        {
            field: 'status',
            headerName: 'Estado',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" alignItems="center" sx={{ height: '100%' }}>
                    <StatusBadge status={params.value} />
                </Stack>
            )
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 120,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                    <IconButton size="small" color="primary">
                        <Icon name="edit-alt" size="xs" />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                            setConfirmModal({
                                open: true,
                                title: '¿Eliminar cita?',
                                description: '¿Está seguro que desea eliminar esta cita médica? Esta acción no se puede deshacer.',
                                onConfirm: () => {
                                    setRows(rows.filter(r => r.appointment_id !== params.row.appointment_id));
                                }
                            });
                        }}
                    >
                        <Icon name="trash" size="xs" />
                    </IconButton>
                </Stack>
            )
        }
    ];

    return (
        <DashboardLayout>
            <Box maxWidth="lg" sx={{ mx: 'auto' }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                    mb={4}
                >
                    <Box>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{
                                width: 40,
                                height: 40,
                                bgcolor: '#34d399', // emerald-400
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 15px rgba(52, 211, 153, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                zIndex: 10,
                                position: 'relative'
                            }}>
                                <Icon name="calendar-event" size="xs" color="white" />
                            </Box>
                            <Typography variant="h5" fontWeight={700} color="white">
                                Gestión de Citas
                            </Typography>
                        </Stack>
                        <Typography variant="body2" color="#d1d5dc" sx={{ mt: 1.5, ml: 0.5 }}>
                            Vea y administre las citas solicitadas en el laboratorio.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        {selectedIds.length > 0 && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Icon name="trash" size="xs" />}
                                onClick={handleDeleteSelected}
                            >
                                Eliminar ({selectedIds.length})
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<Icon name="calendar-event" size="xs" />}
                            onClick={() => setIsModalOpen(true)}
                            sx={{ boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                        >
                            Agendar Cita
                        </Button>
                    </Stack>
                </Stack>

                <Modal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Agendar Nueva Cita"
                >
                    <AppointmentForm
                        users={mockUsers}
                        exams={mockExams}
                        onSubmit={handleCreateAppointment}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>

                <ScrollReveal delay={200}>
                    <Box mb={3}>
                        <TextField
                            fullWidth
                            placeholder="Buscar por ID o Usuario..."
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Icon name="search" size="xs" color="#94a3b8" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ maxWidth: 400 }}
                        />
                    </Box>

                    <Paper
                        elevation={0}
                        className="w-full shadow-none overflow-hidden"
                        sx={{
                            backdropFilter: 'blur(16px)',
                            backgroundColor: 'rgba(15, 23, 42, 0.45)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '1.25rem',
                            overflow: 'hidden',
                        }}
                    >
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            getRowId={(row) => row.appointment_id}
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
                            sx={{ border: 0 }}
                        />
                    </Paper>
                </ScrollReveal>

                <ConfirmModal
                    open={confirmModal.open}
                    onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    description={confirmModal.description}
                />
            </Box>
        </DashboardLayout>
    );
}
