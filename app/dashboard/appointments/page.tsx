'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Icon from '@/components/ui/Icon';
import { Appointment } from '@/types';
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
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

const appointmentsData: Appointment[] = [
    { appointment_id: 101, user_id: 1, requested_date: '2026-02-21T08:30:00', status: 'Confirmed' },
    { appointment_id: 102, user_id: 2, requested_date: '2026-02-21T09:15:00', status: 'Pending' },
    { appointment_id: 103, user_id: 3, requested_date: '2026-02-21T10:00:00', status: 'Confirmed' },
    { appointment_id: 104, user_id: 4, requested_date: '2026-02-22T11:30:00', status: 'Cancelled' },
    { appointment_id: 105, user_id: 1, requested_date: '2026-02-23T08:00:00', status: 'Pending' },
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

    const selectedIds = Array.from(selectionModel.ids);

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;

        if (confirm(`¿Está seguro que desea eliminar ${selectedIds.length} citas?`)) {
            setRows(rows.filter((row) => !selectionModel.ids.has(row.appointment_id)));
            setSelectionModel({ type: 'include', ids: new Set() });
        }
    };

    const columns: GridColDef[] = [
        { field: 'appointment_id', headerName: 'ID de Cita', width: 100 },
        { field: 'user_id', headerName: 'Usuario (ID)', width: 120 },
        {
            field: 'requested_date',
            headerName: 'Fecha Solicitada',
            width: 250,
            renderCell: (params) => (
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
            renderCell: (params) => (
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
            renderCell: (params) => (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                    <IconButton size="small" color="primary">
                        <Icon name="edit-alt" size="xs" />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                            if (confirm('¿Eliminar esta cita?')) {
                                setRows(rows.filter(r => r.appointment_id !== params.row.appointment_id));
                            }
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
                        <Typography variant="h5" fontWeight={700}>
                            Gestión de Citas
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
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
                            sx={{ boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                        >
                            Agendar Cita
                        </Button>
                    </Stack>
                </Stack>

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
                            sx: { borderRadius: '0.75rem', bgcolor: 'white' }
                        }}
                        sx={{ maxWidth: 400 }}
                    />
                </Box>

                <Paper sx={{ width: '100%', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: 'none' }}>
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
                        sx={{
                            border: 0,
                            '& .MuiDataGrid-columnHeaders': {
                                bgcolor: '#f8fafc',
                                borderBottom: '1px solid #f1f5f9',
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f1f5f9',
                            },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: '1px solid #f1f5f9',
                            },
                        }}
                    />
                </Paper>
            </Box>
        </DashboardLayout>
    );
}
