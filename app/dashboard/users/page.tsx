'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Icon from '@/components/ui/Icon';
import { User } from '@/types';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import UserForm from '@/components/users/UserForm';
import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    IconButton,
    Stack,
    Paper
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel, GridRenderCellParams } from '@mui/x-data-grid';

const usersData: User[] = [
    { user_id: 1, identity_card: '12345678', first_name: 'Leon', last_name: 'Pineda' },
    { user_id: 2, identity_card: '87654321', first_name: 'Maria', last_name: 'Garcia' },
    { user_id: 3, identity_card: '11223344', first_name: 'Jose', last_name: 'Rodriguez' },
    { user_id: 4, identity_card: '44332211', first_name: 'Ana', last_name: 'Martinez' },
    { user_id: 5, identity_card: '55667788', first_name: 'Carlos', last_name: 'Sanches' },
];

export default function UsersPage() {
    const [rows, setRows] = React.useState(usersData);
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
            title: '¿Eliminar usuarios?',
            description: `¿Está seguro que desea eliminar ${selectedIds.length} pacientes del sistema? Esta acción no se puede deshacer.`,
            onConfirm: () => {
                setRows(rows.filter((row) => !selectionModel.ids.has(row.user_id)));
                setSelectionModel({ type: 'include', ids: new Set() });
            }
        });
    };

    const handleCreateUser = (userData: Partial<User>) => {
        const newUser: User = {
            user_id: rows.length + 1,
            identity_card: userData.identity_card || '',
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
        };
        setRows([...rows, newUser]);
        setIsModalOpen(false);
    };

    const columns: GridColDef[] = [
        { field: 'user_id', headerName: 'ID', width: 80 },
        { field: 'identity_card', headerName: 'Cédula', width: 150 },
        { field: 'first_name', headerName: 'Nombres', width: 200 },
        { field: 'last_name', headerName: 'Apellidos', width: 200 },
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
                                title: '¿Eliminar usuario?',
                                description: '¿Está seguro que desea eliminar este paciente del sistema? Esta acción no se puede deshacer.',
                                onConfirm: () => {
                                    setRows(rows.filter(r => r.user_id !== params.row.user_id));
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
                        <Typography variant="h5" fontWeight={700}>
                            Gestión de Usuarios
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Administre los pacientes registrados en el sistema.
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
                            startIcon={<Icon name="user-plus" size="xs" />}
                            onClick={() => setIsModalOpen(true)}
                            sx={{ boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                        >
                            Nuevo Usuario
                        </Button>
                    </Stack>
                </Stack>

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

                <Box mb={3}>
                    <TextField
                        fullWidth
                        placeholder="Buscar por nombre o cédula..."
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
                        getRowId={(row) => row.user_id}
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
