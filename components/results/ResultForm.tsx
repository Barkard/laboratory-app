'use client';

import React from 'react';
import {
    Box,
    Stack,
    Button,
    MenuItem,
    TextField,
    Typography,
    FormControlLabel,
    Checkbox,
    Divider
} from '@mui/material';
import Icon from '../ui/Icon';
import Input from '../ui/Input';
import { Result, Exam } from '@/types';

interface ResultFormProps {
    onSubmit: (result: Partial<Result & { patient_name: string, exam_id: number }>) => void;
    onCancel: () => void;
    exams: Exam[];
    initialData?: Partial<Result & { patient_name: string, exam_id: number }>;
}

const ResultForm: React.FC<ResultFormProps> = ({ onSubmit, onCancel, exams, initialData }) => {
    const [patientName, setPatientName] = React.useState(initialData?.patient_name || '');
    const [examId, setExamId] = React.useState<number>(initialData?.exam_id || (exams.length > 0 ? exams[0].exam_id : 0));
    const [deliveryDate, setDeliveryDate] = React.useState(
        initialData?.delivery_date ?
            (typeof initialData.delivery_date === 'string' ? initialData.delivery_date.substring(0, 16) : initialData.delivery_date.toISOString().substring(0, 16)) :
            new Date().toISOString().substring(0, 16)
    );
    const [dynamicData, setDynamicData] = React.useState<Record<string, any>>(initialData?.data || {});

    const selectedExam = exams.find(e => e.exam_id === examId);

    const handleDynamicChange = (fieldId: string, value: any) => {
        setDynamicData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            patient_name: patientName,
            appointment_detail_id: 0, // Mock id
            delivery_date: deliveryDate,
            data: dynamicData,
            exam_id: examId
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={4}>
                {/* General Information Section */}
                <Stack spacing={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Icon name="info-circle" size="xs" color="#3b82f6" />
                        <Typography variant="subtitle1" fontWeight={700} color="primary">Información General</Typography>
                    </Stack>

                    <Input
                        label="Nombre del Paciente"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        required
                    />

                    <TextField
                        select
                        label="Seleccionar Examen"
                        value={examId}
                        onChange={(e) => {
                            setExamId(Number(e.target.value));
                            setDynamicData({}); // Reset dynamic data when exam changes
                        }}
                        fullWidth
                        required
                        slotProps={{
                            input: { sx: { borderRadius: '0.75rem' } }
                        }}
                    >
                        {exams.map((exam) => (
                            <MenuItem key={exam.exam_id} value={exam.exam_id}>
                                {exam.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Input
                        label="Fecha de Entrega"
                        type="datetime-local"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        required
                    />
                </Stack>

                <Divider />

                {/* Dynamic Fields Section */}
                <Stack spacing={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Icon name="test-tube" size="xs" color="#3b82f6" />
                        <Typography variant="subtitle1" fontWeight={700} color="primary">Resultados del Examen</Typography>
                    </Stack>

                    {selectedExam && selectedExam.customFields && selectedExam.customFields.length > 0 ? (
                        <Stack spacing={2.5}>
                            {selectedExam.customFields.map((field) => (
                                <Box key={field.id}>
                                    {field.type === 'checkbox' ? (
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                bgcolor: '#f8fafc',
                                                borderRadius: '0.75rem',
                                                border: '1px solid #e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={!!dynamicData[field.id]}
                                                        onChange={(e) => handleDynamicChange(field.id, e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label={<Typography variant="body2" fontWeight={500}>{field.label}</Typography>}
                                                sx={{ m: 0 }}
                                            />
                                        </Box>
                                    ) : field.type === 'select' ? (
                                        <TextField
                                            select
                                            fullWidth
                                            label={field.label}
                                            value={dynamicData[field.id] || ''}
                                            onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                                            required
                                            slotProps={{
                                                input: { sx: { borderRadius: '0.75rem' } }
                                            }}
                                        >
                                            {field.options?.map(opt => (
                                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                            ))}
                                        </TextField>
                                    ) : (
                                        <Input
                                            label={field.label}
                                            type={field.type === 'number' ? 'number' : 'text'}
                                            value={dynamicData[field.id] || ''}
                                            onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                                            required
                                            placeholder={`Ingresar ${field.label.toLowerCase()}...`}
                                        />
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    ) : (
                        <Box sx={{ py: 4, px: 2, textAlign: 'center', bgcolor: '#f1f5f9', borderRadius: '1rem' }}>
                            <Icon name="info-circle" size="md" color="#94a3b8" />
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                Seleccione un examen con campos configurados para ingresar resultados.
                            </Typography>
                        </Box>
                    )}
                </Stack>

                {/* Footer Actions */}
                <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        sx={{
                            borderRadius: '0.75rem',
                            textTransform: 'none',
                            px: 4,
                            color: '#64748b',
                            borderColor: '#e2e8f0',
                            '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            borderRadius: '0.75rem',
                            textTransform: 'none',
                            px: 4,
                            boxShadow: 'none',
                            '&:hover': { boxShadow: 'none' }
                        }}
                    >
                        {initialData ? 'Actualizar Resultado' : 'Subir Resultado'}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default ResultForm;
