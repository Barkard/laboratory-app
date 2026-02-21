'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Icon from '@/components/ui/Icon';
import { Exam, ExamType, CustomFile } from '@/types';
import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    IconButton,
    Stack,
    Paper,
    Chip,
    Divider
} from '@mui/material';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ExamForm from '@/components/exams/ExamForm';
import { DataGrid, GridColDef, GridRowSelectionModel, GridRenderCellParams } from '@mui/x-data-grid';

// ... (rest of imports)

const examTypes: ExamType[] = [
    { type_id: 1, category_name: 'Hematología' },
    { type_id: 2, category_name: 'Bioquímica' },
    { type_id: 3, category_name: 'Inmunología' },
];

const customFiles: CustomFile[] = [
    { file_id: 1, config_name: 'Standard Blood Test', json_schema: '{}' },
    { file_id: 2, config_name: 'Urine Analysis', json_schema: '{}' },
];

const examsData: (Exam & { type: string })[] = [
    { exam_id: 1, name: 'Hematología', type_id: 1, file_id: 1, type: 'Hematología' },
    { exam_id: 2, name: 'Bioquímica', type_id: 2, file_id: 1, type: 'Bioquímica' },
    { exam_id: 3, name: 'Inmunología', type_id: 3, file_id: 2, type: 'Inmunología' },
];

export default function ExamsPage() {
    const [allExamTypes, setAllExamTypes] = React.useState<ExamType[]>(examTypes);
    const [rows, setRows] = React.useState(examsData);
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

    const selectedIds = Array.from(selectionModel.ids);

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;

        setConfirmModal({
            open: true,
            title: '¿Eliminar exámenes?',
            description: `¿Está seguro que desea eliminar ${selectedIds.length} exámenes del catálogo? Esta acción no se puede deshacer.`,
            onConfirm: () => {
                setRows(rows.filter((row) => !selectionModel.ids.has(row.exam_id)));
                setSelectionModel({ type: 'include', ids: new Set() });
            }
        });
    };

    const handleCreateExam = (data: any) => {
        const type = allExamTypes.find(t => t.type_id === data.type_id);

        if (editingExam) {
            setRows(rows.map(r => r.exam_id === editingExam.exam_id ? {
                ...r,
                name: data.name,
                type_id: data.type_id,
                type: type?.category_name || 'Desconocido',
                customFields: data.customFields
            } : r));
        } else {
            const newExam: any = {
                exam_id: Math.max(...rows.map(r => r.exam_id), 0) + 1,
                name: data.name,
                type_id: data.type_id || 0,
                file_id: 0,
                type: type?.category_name || 'Desconocido',
                customFields: data.customFields
            };
            setRows([...rows, newExam]);
        }

        setIsModalOpen(false);
        setEditingExam(null);
    };

    const handleAddNewType = (name: string) => {
        const newType: ExamType = {
            type_id: Math.max(...allExamTypes.map(t => t.type_id), 0) + 1,
            category_name: name
        };
        setAllExamTypes([...allExamTypes, newType]);
    };

    const columns: GridColDef[] = [
        { field: 'exam_id', headerName: 'ID', width: 80 },
        {
            field: 'type',
            headerName: 'Nombre / Tipo de Examen',
            width: 300,
            renderCell: (params: GridRenderCellParams) => (
                <Chip label={params.value} variant="outlined" size="small" sx={{ fontWeight: 600 }} color="primary" />
            )
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 120,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                    <IconButton
                        size="small"
                        color="info"
                        title="Ver/Llenar Formulario"
                        onClick={() => setPreviewExam(params.row)}
                    >
                        <Icon name="task" size="xs" />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                            setEditingExam(params.row);
                            setIsModalOpen(true);
                        }}
                    >
                        <Icon name="edit-alt" size="xs" />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                            setConfirmModal({
                                open: true,
                                title: '¿Eliminar examen?',
                                description: '¿Está seguro que desea eliminar este examen del catálogo? Esta acción no se puede deshacer.',
                                onConfirm: () => {
                                    setRows(rows.filter(r => r.exam_id !== params.row.exam_id));
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
                            Catálogo de Exámenes
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Gestione los tipos de exámenes disponibles y sus configuraciones.
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
                            startIcon={<Icon name="plus" size="xs" />}
                            onClick={() => {
                                setEditingExam(null);
                                setIsModalOpen(true);
                            }}
                            sx={{ boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                        >
                            Nuevo Examen
                        </Button>
                    </Stack>
                </Stack>

                <Modal
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingExam(null);
                    }}
                    title={editingExam ? "Editar Examen" : "Registrar Nuevo Examen"}
                >
                    <ExamForm
                        key={editingExam?.exam_id || 'new'}
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

                <Box mb={3}>
                    <TextField
                        fullWidth
                        placeholder="Buscar por tipo o configuración..."
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
                        getRowId={(row) => row.exam_id}
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

                {/* Form Preview Modal */}
                <Modal
                    open={!!previewExam}
                    onClose={() => setPreviewExam(null)}
                    title={`Vista Previa: ${previewExam?.name}`}
                >
                    {previewExam && (
                        <Stack spacing={3}>
                            <Typography variant="body2" color="text.secondary">
                                Esta es una vista previa de cómo se verá el formulario de resultados para este examen.
                            </Typography>

                            <Divider />

                            {previewExam.customFields && previewExam.customFields.length > 0 ? (
                                <Stack spacing={3}>
                                    {previewExam.customFields.map((field: any) => (
                                        <Box key={field.id}>
                                            {field.type === 'checkbox' ? (
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Box sx={{ width: 20, height: 20, border: '2px solid #cbd5e1', borderRadius: '4px' }} />
                                                    <Typography variant="body2">{field.label}</Typography>
                                                </Stack>
                                            ) : (
                                                <Box>
                                                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                        {field.label}
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            p: 1.5,
                                                            bgcolor: '#f8fafc',
                                                            borderRadius: '0.75rem',
                                                            border: '1px solid #e2e8f0',
                                                            color: '#94a3b8',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {field.type === 'select' ? `Seleccionar ${field.label}...` : `Ingresar ${field.label.toLowerCase()}...`}
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </Stack>
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f1f5f9', borderRadius: '1rem' }}>
                                    <Icon name="info-circle" size="md" color="#94a3b8" />
                                    <Typography variant="body2" color="text.secondary" mt={1}>
                                        Este examen no tiene campos configurados aún.
                                    </Typography>
                                </Box>
                            )}

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => setPreviewExam(null)}
                                sx={{ borderRadius: '0.75rem', mt: 2 }}
                            >
                                Entendido
                            </Button>
                        </Stack>
                    )}
                </Modal>
            </Box>
        </DashboardLayout>
    );
}
