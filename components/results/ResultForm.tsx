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
    Chip,
    createFilterOptions
} from '@mui/material';
import Icon from '../ui/Icon';
import Input from '../ui/Input';
import { Result, Appointment, AppointmentExamDetail, DynamicField } from '@/types';
import { formatDateTime } from '@/utils/formatters';

interface ResultFormProps {
    onSubmit: (data: { id_appointment_detail: number, delivery_date: string, result_data: string }) => void;
    onCancel: () => void;
    appointments: Appointment[];
    initialData?: Partial<Result>;
}

const filter = createFilterOptions<Appointment>();

const ResultForm: React.FC<ResultFormProps> = ({ onSubmit, onCancel, appointments, initialData }) => {
    const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
    const [selectedDetail, setSelectedDetail] = React.useState<AppointmentExamDetail | null>(null);
    const [deliveryDate, setDeliveryDate] = React.useState(new Date().toISOString().substring(0, 16));
    const [dynamicData, setDynamicData] = React.useState<Record<string, any>>({});

    // When appointment changes, reset detail and dynamic data
    const handleAppointmentChange = (appointment: Appointment | null) => {
        setSelectedAppointment(appointment);
        if (appointment && appointment.exam_appointment_detail && appointment.exam_appointment_detail.length > 0) {
            // If only one exam, auto-select it
            if (appointment.exam_appointment_detail.length === 1) {
                setSelectedDetail(appointment.exam_appointment_detail[0]);
            } else {
                setSelectedDetail(null);
            }
        } else {
            setSelectedDetail(null);
        }
        setDynamicData({});
    };

    const handleDynamicChange = (fieldId: string, value: any) => {
        setDynamicData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDetail) return;

        onSubmit({
            id_appointment_detail: selectedDetail.id_detail,
            delivery_date: deliveryDate,
            result_data: JSON.stringify(dynamicData)
        });
    };

    // Get current exam and its fields
    const currentExam = selectedDetail?.exam;
    let customFields: DynamicField[] = [];
    if (currentExam?.custom_files?.json_schema) {
        try {
            customFields = JSON.parse(currentExam.custom_files.json_schema);
        } catch (e) {
            console.error('Error parsing schema:', e);
        }
    }

    return (
        <Box component="form" onSubmit={handleSubmit}>
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
                        renderOption={(props, option) => {
                            const { key, ...otherProps } = props as any;
                            return (
                                <li key={key} {...otherProps}>
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
                                        <Chip
                                            label={option.exam_appointment_detail?.[0]?.exam?.exam_type?.category_name || 'Examen'}
                                            size="small"
                                            variant="outlined"
                                            sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.6)' }}
                                        />
                                    </Stack>
                                </li>
                            );
                        }}
                        renderInput={(params) => (
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
                            <Stack spacing={1}>
                                <Typography variant="caption" color="#10b981" fontWeight={700}>PACIENTE SELECCIONADO</Typography>
                                <Typography variant="body1" fontWeight={600} color="white">
                                    {selectedAppointment.user?.first_name} {selectedAppointment.user?.last_name}
                                </Typography>
                                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                                    Cédula: {selectedAppointment.user?.uid}
                                </Typography>
                                <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
                                    Cita para el: {formatDateTime(selectedAppointment.requested_date)}
                                </Typography>
                            </Stack>
                        </Paper>
                    )}

                    {selectedAppointment && selectedAppointment.exam_appointment_detail && selectedAppointment.exam_appointment_detail.length > 1 && (
                        <TextField
                            select
                            label="Seleccionar Examen de la Cita"
                            value={selectedDetail?.id_detail || ''}
                            onChange={(e) => {
                                const detail = selectedAppointment.exam_appointment_detail?.find(d => d.id_detail === Number(e.target.value));
                                setSelectedDetail(detail || null);
                                setDynamicData({});
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
                            {selectedAppointment.exam_appointment_detail.map((detail) => (
                                <MenuItem key={detail.id_detail} value={detail.id_detail}>
                                    {detail.exam?.exam_type?.category_name || 'Examen'}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    {selectedDetail && (
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.2)', borderRadius: '1rem' }}>
                            <Stack spacing={1}>
                                <Typography variant="caption" color="#38bdf8" fontWeight={700}>EXAMEN A REALIZAR</Typography>
                                <Typography variant="body1" fontWeight={600} color="white">
                                    {selectedDetail.exam?.exam_type?.category_name}
                                </Typography>
                                {selectedDetail.exam?.exam_type?.requirements && (
                                    <Box sx={{ mt: 1, p: 1.5, bgcolor: 'rgba(56, 189, 248, 0.1)', borderRadius: '0.6rem', borderLeft: '3px solid #38bdf8' }}>
                                        <Typography variant="caption" color="rgba(255, 255, 255, 0.5)" display="block" mb={0.5}>Requisitos:</Typography>
                                        <Typography variant="body2" color="white" sx={{ fontStyle: 'italic' }}>
                                            {selectedDetail.exam.exam_type.requirements}
                                        </Typography>
                                    </Box>
                                )}
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

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />

                {/* Dynamic Fields Section */}
                <Stack spacing={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Icon name="test-tube" size="xs" color="#10b981" />
                        <Typography variant="subtitle1" fontWeight={700} color="#d1d5dc">Resultados del Examen</Typography>
                    </Stack>

                    {customFields.length > 0 ? (
                        <Stack spacing={2.5}>
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
                                {selectedDetail
                                    ? "Este examen no tiene campos configurados para resultados."
                                    : "Seleccione un paciente y examen para ingresar resultados."}
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
                        disabled={!selectedDetail}
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
                        Registrar Resultado
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default ResultForm;
