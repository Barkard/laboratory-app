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
    Divider,
    Autocomplete,
    Avatar,
    Paper,
    createFilterOptions,
    AutocompleteRenderInputParams
} from '@mui/material';
import Icon from '../ui/Icon';
import Input from '../ui/Input';
import { Result, Appointment, DynamicField } from '@/types';
import { formatDateTime } from '@/utils/formatters';

interface ResultFormProps {
    onSubmit: (results: { id_appointment_detail: number, delivery_date: string, result_data: string }[]) => void;
    onCancel: () => void;
    appointments: Appointment[];
    initialAppointment?: Appointment | null;
    initialData?: Partial<Result>;
}

const filter = createFilterOptions<Appointment>();

const ResultForm: React.FC<ResultFormProps> = ({ onSubmit, onCancel, appointments, initialAppointment }) => {
    const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(initialAppointment || null);
    const [currentExamIndex, setCurrentExamIndex] = React.useState(0);
    const [deliveryDate, setDeliveryDate] = React.useState(new Date().toISOString().substring(0, 16));
    const [resultsByDetail, setResultsByDetail] = React.useState<Record<number, Record<string, string | number | boolean>>>({});

    // When appointment changes, reset state
    const handleAppointmentChange = React.useCallback((appointment: Appointment | null) => {
        setSelectedAppointment(appointment);
        setCurrentExamIndex(0);
        setResultsByDetail({});
    }, []);

    // Effect to handle initialAppointment from prop
    React.useEffect(() => {
        if (initialAppointment) {
            handleAppointmentChange(initialAppointment);
        }
    }, [initialAppointment, handleAppointmentChange]);

    const handleDynamicChange = (detailId: number, label: string, value: string | number | boolean) => {
        setResultsByDetail(prev => ({
            ...prev,
            [detailId]: {
                ...(prev[detailId] || {}),
                [label]: value
            }
        }));
    };

    const handleSubmitAll = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppointment?.exam_appointment_detail) return;

        const resultsToSubmit = selectedAppointment.exam_appointment_detail
            .map(detail => {
                const data = resultsByDetail[detail.id_detail];
                if (data && Object.keys(data).length > 0) {
                    return {
                        id_appointment_detail: detail.id_detail,
                        delivery_date: new Date(deliveryDate).toISOString(),
                        result_data: JSON.stringify(data)
                    };
                }
                return null;
            })
            .filter((r): r is { id_appointment_detail: number, delivery_date: string, result_data: string } => r !== null);

        if (resultsToSubmit.length > 0) {
            onSubmit(resultsToSubmit);
        }
    };

    const details = selectedAppointment?.exam_appointment_detail || [];
    const currentDetail = details[currentExamIndex];
    const currentExam = currentDetail?.exam;
    
    let customFields: DynamicField[] = [];
    if (currentExam?.custom_files?.json_schema) {
        try {
            customFields = JSON.parse(currentExam.custom_files.json_schema);
        } catch (e) {
            console.error('Error parsing schema:', e);
        }
    }

    return (
        <Box component="form" onSubmit={handleSubmitAll}>
            <Stack spacing={4}>
                {/* Appointment Selection Section */}
                <Stack spacing={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Icon name="search" size="xs" color="#10b981" />
                        <Typography variant="subtitle1" fontWeight={700} color="#d1d5dc">Buscar Cita / Paciente</Typography>
                    </Stack>

                    <Autocomplete
                        options={appointments}
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);
                            if (params.inputValue !== '') {
                                return options.filter(option => {
                                    const searchStr = `${option.user?.first_name || ''} ${option.user?.last_name || ''} ${option.user?.uid || ''} ${option.id_appointment}`.toLowerCase();
                                    return searchStr.includes(params.inputValue.toLowerCase());
                                });
                            }
                            return filtered;
                        }}
                        getOptionLabel={(option) => option.user ? `${option.user.first_name || ''} ${option.user.last_name || ''} ${option.user.uid || ''}`.trim() : `Cita #${option.id_appointment}`}
                        onChange={(_, value) => handleAppointmentChange(value)}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id_appointment}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1, width: '100%' }}>
                                        <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: 32, height: 32, fontSize: '0.8rem' }}>
                                            {option.user?.first_name[0]}{option.user?.last_name[0]}
                                        </Avatar>
                                        <Stack sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography variant="body2" fontWeight={600} noWrap>
                                                {option.user?.first_name} {option.user?.last_name}
                                            </Typography>
                                            <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
                                                Cédula: {option.user?.uid} • {formatDateTime(option.requested_date)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </li>
                        )}
                        renderInput={(params: AutocompleteRenderInputParams) => (
                            <TextField
                                {...params}
                                label="Buscar por Nombre o Cédula"
                                placeholder="Ej. 12345678 o Juan Pérez"
                                slotProps={{
                                    input: {
                                        ...params.InputProps,
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
                            />
                        )}
                    />

                    {selectedAppointment && (
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '1rem' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack spacing={0.5}>
                                    <Typography variant="caption" color="#10b981" fontWeight={700}>PACIENTE</Typography>
                                    <Typography variant="body2" fontWeight={600} color="white">
                                        {selectedAppointment.user?.first_name} {selectedAppointment.user?.last_name}
                                    </Typography>
                                    <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
                                        C.I: {selectedAppointment.user?.uid} • Cita: {formatDateTime(selectedAppointment.requested_date)}
                                    </Typography>
                                </Stack>
                                <Stack alignItems="flex-end">
                                    <Typography variant="caption" color="rgba(255, 255, 255, 0.4)">EXÁMENES</Typography>
                                    <Typography variant="body2" fontWeight={700} color="#10b981">{details.length}</Typography>
                                </Stack>
                            </Stack>
                        </Paper>
                    )}

                    <Input
                        label="Fecha de Entrega de Resultados"
                        type="datetime-local"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        required
                    />
                </Stack>

                {selectedAppointment && details.length > 0 && (
                    <Box sx={{ position: 'relative' }}>
                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', mb: 4 }} />
                        
                        {/* Carousel Header / Navigation */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    {currentExamIndex + 1}
                                </Box>
                                <Typography variant="subtitle1" fontWeight={700} color="white">
                                    {currentExam?.exam_type?.category_name}
                                </Typography>
                            </Stack>
                            
                            <Stack direction="row" spacing={1}>
                                <Button
                                    size="small"
                                    disabled={currentExamIndex === 0}
                                    onClick={() => setCurrentExamIndex(prev => prev - 1)}
                                    sx={{ minWidth: 40, p: 1, borderRadius: '0.8rem', color: '#94a3b8', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
                                >
                                    <Icon name="chevron-left" size="xs" />
                                </Button>
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: '#94a3b8', fontWeight: 600 }}>
                                    {currentExamIndex + 1} / {details.length}
                                </Typography>
                                <Button
                                    size="small"
                                    disabled={currentExamIndex === details.length - 1}
                                    onClick={() => setCurrentExamIndex(prev => prev + 1)}
                                    sx={{ minWidth: 40, p: 1, borderRadius: '0.8rem', color: '#94a3b8', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
                                >
                                    <Icon name="chevron-right" size="xs" />
                                </Button>
                            </Stack>
                        </Stack>

                        {/* Slide Content */}
                        <Paper 
                            variant="outlined" 
                            sx={{ 
                                p: 4, 
                                borderRadius: '1.5rem', 
                                bgcolor: 'rgba(255, 255, 255, 0.02)', 
                                borderColor: 'rgba(255, 255, 255, 0.08)',
                                minHeight: '200px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {customFields.length > 0 ? (
                                <Stack spacing={3}>
                                    {customFields.map((field) => (
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
                                                                checked={!!resultsByDetail[currentDetail.id_detail]?.[field.label]}
                                                                onChange={(e) => handleDynamicChange(currentDetail.id_detail, field.label, e.target.checked)}
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
                                                    value={resultsByDetail[currentDetail.id_detail]?.[field.label] || ''}
                                                    onChange={(e) => handleDynamicChange(currentDetail.id_detail, field.label, e.target.value)}
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
                                                    value={String(resultsByDetail[currentDetail.id_detail]?.[field.label] ?? '')}
                                                    onChange={(e) => handleDynamicChange(currentDetail.id_detail, field.label, e.target.value)}
                                                    required
                                                    placeholder={`Ingresar ${field.label.toLowerCase()}...`}
                                                />
                                            )}
                                        </Box>
                                    ))}
                                </Stack>
                            ) : (
                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                    <Icon name="info-circle" size="md" color="rgba(255, 255, 255, 0.2)" />
                                    <Typography variant="body2" color="rgba(209, 213, 220, 0.4)" mt={2}>
                                        Este examen no tiene campos configurados para resultados.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                )}

                {!selectedAppointment && (
                    <Box sx={{ py: 8, px: 2, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '1.5rem' }}>
                        <Icon name="user-plus" size="md" color="rgba(255, 255, 255, 0.1)" />
                        <Typography variant="body2" color="rgba(209, 213, 220, 0.3)" mt={2}>
                            Seleccione un paciente para comenzar a cargar resultados.
                        </Typography>
                    </Box>
                )}

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
                        disabled={!selectedAppointment || Object.keys(resultsByDetail).length === 0}
                        sx={{
                            borderRadius: '0.8rem',
                            textTransform: 'none',
                            px: 4,
                            bgcolor: '#10b981',
                            boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                            '&:hover': {
                                bgcolor: '#059669',
                                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.23)',
                            },
                            '&.Mui-disabled': {
                                bgcolor: 'rgba(16, 185, 129, 0.3)',
                                color: 'rgba(255, 255, 255, 0.3)'
                            }
                        }}
                    >
                        Registrar Todos los Resultados ({Object.keys(resultsByDetail).length})
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default ResultForm;
