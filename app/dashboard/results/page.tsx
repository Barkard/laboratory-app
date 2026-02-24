'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Icon from '@/components/ui/Icon';
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Result, Exam, DynamicField } from '@/types';
import { formatDateTime } from '@/utils/formatters';
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
    Tooltip,
    Divider
} from '@mui/material';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ResultForm from '@/components/results/ResultForm';
import { DataGrid, GridColDef, GridRowSelectionModel, GridRenderCellParams } from '@mui/x-data-grid';

// Mock exams with custom fields for testing
const mockExams: Exam[] = [
    {
        exam_id: 1,
        name: 'Hematología',
        type_id: 1,
        file_id: 1,
        customFields: [
            { id: 'h1', label: 'Hemoglobina (g/dL)', type: 'number' },
            { id: 'h2', label: 'Hematocrito (%)', type: 'number' },
            { id: 'h3', label: 'Observaciones', type: 'text' }
        ]
    },
    {
        exam_id: 2,
        name: 'Bioquímica',
        type_id: 2,
        file_id: 1,
        customFields: [
            { id: 'b1', label: 'Glucosa (mg/dL)', type: 'number' },
            { id: 'b2', label: 'Colesterol Total', type: 'number' },
            { id: 'b3', label: 'Estado', type: 'select', options: ['Normal', 'Elevado', 'Crítico'] }
        ]
    },
    {
        exam_id: 3,
        name: 'Inmunología',
        type_id: 3,
        file_id: 2,
        customFields: [
            { id: 'i1', label: 'Resultado VIH', type: 'select', options: ['No Reactivo', 'Reactivo'] },
            { id: 'i2', label: 'Confirmado', type: 'checkbox' }
        ]
    },
];

const resultsData: (Result & { patient_name: string, exam_type: string })[] = [
    {
        result_id: 1,
        appointment_detail_id: 101,
        delivery_date: '2026-02-21T16:00:00',
        patient_name: 'Leon Pineda',
        exam_type: 'Hematología',
        data: { 'h1': '14.5', 'h2': '42', 'h3': 'Sin anomalías' }
    },
    {
        result_id: 2,
        appointment_detail_id: 102,
        delivery_date: '2026-02-22T09:00:00',
        patient_name: 'Maria Garcia',
        exam_type: 'Bioquímica',
        data: { 'b1': '95', 'b2': '180', 'b3': 'Normal' }
    },
];

export default function ResultsPage() {
    const [rows, setRows] = React.useState(resultsData);
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

    const selectedIds = Array.from(selectionModel.ids);

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;

        setConfirmModal({
            open: true,
            title: '¿Eliminar resultados?',
            description: `¿Está seguro que desea eliminar ${selectedIds.length} resultados? Esta acción no se puede deshacer.`,
            onConfirm: () => {
                setRows(rows.filter((row) => !selectionModel.ids.has(row.result_id)));
                setSelectionModel({ type: 'include', ids: new Set() });
            }
        });
    };

    const handleCreateResult = (data: any) => {
        const exam = mockExams.find(e => e.exam_id === data.exam_id) || mockExams[0];

        const newResult: any = {
            result_id: Math.max(...rows.map(r => r.result_id), 0) + 1,
            appointment_detail_id: 0,
            delivery_date: data.delivery_date,
            patient_name: data.patient_name,
            exam_type: exam.name,
            data: data.data
        };
        setRows([...rows, newResult]);
        setIsModalOpen(false);
    };

    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredRows = rows.filter(row =>
        row.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.exam_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: GridColDef[] = [
        { field: 'result_id', headerName: 'ID', width: 80 },
        { field: 'patient_name', headerName: 'Paciente', width: 200 },
        {
            field: 'exam_type',
            headerName: 'Examen',
            width: 180,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                    <Icon name="vial" size="xs" color="#3b82f6" />
                    <Chip label={params.value} variant="outlined" size="small" color="primary" sx={{ fontWeight: 600, borderRadius: '6px' }} />
                </Stack>
            )
        },
        {
            field: 'delivery_date',
            headerName: 'Fecha de Entrega',
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                    <Icon name="calendar" size="xs" color="#94a3b8" />
                    <Typography variant="body2">{formatDateTime(params.value)}</Typography>
                </Stack>
            )
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 180,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                    <Tooltip title="Ver Detalles">
                        <IconButton
                            size="small"
                            color="info"
                            sx={{ bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }}
                            onClick={() => setViewingResult(params.row)}
                        >
                            <Icon name="show" size="xs" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Imprimir">
                        <IconButton size="small" color="secondary" sx={{ bgcolor: '#f5f3ff', '&:hover': { bgcolor: '#ede9fe' } }}>
                            <Icon name="printer" size="xs" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton
                            size="small"
                            color="error"
                            sx={{ bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}
                            onClick={() => {
                                setConfirmModal({
                                    open: true,
                                    title: '¿Eliminar resultado?',
                                    description: '¿Está seguro que desea eliminar este resultado de laboratorio? Esta acción no se puede deshacer.',
                                    onConfirm: () => {
                                        setRows(rows.filter(r => r.result_id !== params.row.result_id));
                                    }
                                });
                            }}
                        >
                            <Icon name="trash" size="xs" />
                        </IconButton>
                    </Tooltip>
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
                                <Icon name="vial" size="xs" color="white" />
                            </Box>
                            <Typography variant="h5" fontWeight={700} color="white">
                                Resultados de Exámenes
                            </Typography>
                        </Stack>
                        <Typography variant="body2" color="#d1d5dc" sx={{ mt: 1.5, ml: 0.5 }}>
                            Consulte y gestione los resultados de los análisis realizados.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Icon name="plus" size="xs" />}
                        onClick={() => setIsModalOpen(true)}
                        sx={{
                            borderRadius: '0.75rem',
                            textTransform: 'none',
                            px: 3,
                            boxShadow: 'none',
                            '&:hover': { boxShadow: 'none' }
                        }}
                    >
                        Subir Resultado
                    </Button>
                </Stack>

                <Modal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Subir Nuevo Resultado"
                >
                    <ResultForm
                        exams={mockExams}
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
                        <Stack spacing={3}>
                            <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: '1rem', border: '1px solid #dbeafe' }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ width: 48, height: 48, bgcolor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', border: '1px solid #dbeafe' }}>
                                        <Icon name="user" size="sm" />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paciente</Typography>
                                        <Typography variant="body1" fontWeight={700}>{viewingResult.patient_name}</Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            <Stack direction="row" spacing={3}>
                                <Box flex={1}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>EXAMEN</Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>{viewingResult.exam_type}</Typography>
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>FECHA ENTREGA</Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>{formatDateTime(viewingResult.delivery_date)}</Typography>
                                </Box>
                            </Stack>

                            <Divider />

                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <Icon name="list-ul" size="xs" color="#3b82f6" />
                                    <Typography variant="subtitle2" fontWeight={700} color="primary">Valores Registrados</Typography>
                                </Stack>
                                <Stack spacing={1.5}>
                                    {Object.entries(viewingResult.data || {}).map(([key, value]) => {
                                        const examObj = mockExams.find(e => e.name === viewingResult.exam_type);
                                        const field = examObj?.customFields?.find(f => f.id === key);
                                        return (
                                            <Box
                                                key={key}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    p: 1.5,
                                                    bgcolor: '#f8fafc',
                                                    borderRadius: '0.75rem',
                                                    border: '1px solid #f1f5f9'
                                                }}
                                            >
                                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                    {field?.label || key}:
                                                </Typography>
                                                <Typography variant="body2" color="text.primary" fontWeight={700}>
                                                    {typeof value === 'boolean' ? (
                                                        <Chip
                                                            label={value ? 'Sí' : 'No'}
                                                            size="small"
                                                            color={value ? 'success' : 'default'}
                                                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                                                        />
                                                    ) : (
                                                        value as string
                                                    )}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                    {(!viewingResult.data || Object.keys(viewingResult.data).length === 0) && (
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic" textAlign="center">
                                            No hay valores adicionales registrados.
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>

                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<Icon name="printer" size="xs" />}
                                    sx={{ borderRadius: '0.75rem', textTransform: 'none' }}
                                >
                                    Imprimir
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => setViewingResult(null)}
                                    sx={{ borderRadius: '0.75rem', textTransform: 'none', boxShadow: 'none' }}
                                >
                                    Cerrar
                                </Button>
                            </Stack>
                        </Stack>
                    )}
                </Modal>

                <ScrollReveal delay={200}>
                    <Box mb={3}>
                        <TextField
                            fullWidth
                            placeholder="Buscar por paciente, examen o código..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                            rows={filteredRows}
                            columns={columns}
                            getRowId={(row) => row.result_id}
                            autoHeight
                            checkboxSelection
                            disableRowSelectionOnClick
                            sx={{ border: 0 }}
                        />
                    </Paper>
                </ScrollReveal>
            </Box>
        </DashboardLayout>
    );
};
