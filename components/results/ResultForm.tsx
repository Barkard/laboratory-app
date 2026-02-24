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
                        <Icon name="info-circle" size="xs" color="#10b981" />
                        <Typography variant="subtitle1" fontWeight={700} color="#d1d5dc">Información General</Typography>
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
                            input: {
                                sx: {
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                                    bgcolor: 'rgba(255, 255, 255, 0.05)'
                                }
                            },
                            inputLabel: {
                                sx: { color: 'rgba(209, 213, 220, 0.6)', '&.Mui-focused': { color: '#10b981' } }
                            }
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

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />

                {/* Dynamic Fields Section */}
                <Stack spacing={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Icon name="test-tube" size="xs" color="#10b981" />
                        <Typography variant="subtitle1" fontWeight={700} color="#d1d5dc">Resultados del Examen</Typography>
                    </Stack>

                    {selectedExam && selectedExam.customFields && selectedExam.customFields.length > 0 ? (
                        <Stack spacing={2.5}>
                            {selectedExam.customFields.map((field) => (
                                <Box key={field.id}>
                                    {field.type === 'checkbox' ? (
                                        <Box
                                            sx={{
                                                p: 2,
                                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                                borderRadius: '0.8rem',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
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
                                                label={<Typography variant="body2" fontWeight={500} color="#d1d5dc">{field.label}</Typography>}
                                                sx={{ m: 0, '& .MuiCheckbox-root': { color: 'rgba(255, 255, 255, 0.3)', '&.Mui-checked': { color: '#10b981' } } }}
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
                                                input: {
                                                    sx: {
                                                        borderRadius: '0.75rem',
                                                        color: 'white',
                                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                                                        bgcolor: 'rgba(255, 255, 255, 0.05)'
                                                    }
                                                },
                                                inputLabel: {
                                                    sx: { color: 'rgba(209, 213, 220, 0.6)', '&.Mui-focused': { color: '#10b981' } }
                                                }
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
                        <Box sx={{ py: 4, px: 2, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '1rem' }}>
                            <Icon name="info-circle" size="md" color="rgba(255, 255, 255, 0.2)" />
                            <Typography variant="body2" color="rgba(209, 213, 220, 0.4)" mt={2}>
                                Seleccione un examen con campos configurados para ingresar resultados.
                            </Typography>
                        </Box>
                    )}
                </Stack>

                {/* Footer Actions */}
                <Stack direction="row" spacing={2} justifyContent="flex-end" pt={4}>
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        sx={{
                            borderRadius: '0.8rem',
                            textTransform: 'none',
                            px: 4,
                            color: 'rgba(255, 255, 255, 0.6)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                bgcolor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            borderRadius: '0.8rem',
                            textTransform: 'none',
                            px: 4,
                            bgcolor: '#10b981',
                            boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                            '&:hover': {
                                bgcolor: '#059669',
                                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.23)',
                            }
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
