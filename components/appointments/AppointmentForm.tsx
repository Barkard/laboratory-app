'use client';

import React from 'react';
import {
    Box,
    Stack,
    Button,
    MenuItem,
    TextField,
    Typography,
    Autocomplete,
    Divider,
    Chip,
    InputAdornment
} from '@mui/material';
import Icon from '../ui/Icon';
import Input from '../ui/Input';
import { Appointment, User, Exam } from '@/types';

interface AppointmentFormProps {
    onSubmit: (appointment: any) => void;
    onCancel: () => void;
    users: User[];
    exams: Exam[];
    initialData?: Partial<Appointment & { exam_ids: number[], observations: string }>;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit, onCancel, users, exams, initialData }) => {
    const [formData, setFormData] = React.useState({
        id_user: initialData?.id_user || 0,
        dia: initialData?.requested_date ? (typeof initialData.requested_date === 'string' ? initialData.requested_date.substring(8, 10) : (initialData.requested_date as any).getDate().toString().padStart(2, '0')) : '',
        mes: initialData?.requested_date ? (typeof initialData.requested_date === 'string' ? initialData.requested_date.substring(5, 7) : ((initialData.requested_date as any).getMonth() + 1).toString().padStart(2, '0')) : '',
        sug_time: initialData?.requested_date ?
            (typeof initialData.requested_date === 'string' ?
                initialData.requested_date.substring(11, 16) :
                (initialData.requested_date as any).toISOString().substring(11, 16)) :
            '',
        status: initialData?.status || 'PENDIENTE',
        exam_ids: initialData?.exam_ids || [] as number[],
        observations: initialData?.observations || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { dia, mes, sug_time, ...rest } = formData;
        const currentYear = new Date().getFullYear();
        // Construct yyyy-mm-dd format for Date parsing
        const formattedDate = `${currentYear}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        onSubmit({
            ...rest,
            requested_date: `${formattedDate}T${sug_time}:00.000Z`
        });
    };

    const selectedUser = users.find(u => u.id_user === formData.id_user) || null;

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={4}>
                {/* Section: Patient Info */}
                <Stack spacing={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Icon name="user-circle" size="xs" color="#10b981" />
                        <Typography variant="subtitle1" fontWeight={700} color="#d1d5dc">Información del Paciente</Typography>
                    </Stack>

                    <Autocomplete
                        options={users}
                        getOptionLabel={(option) => `${option.uid} - ${option.first_name} ${option.last_name}`}
                        value={selectedUser}
                        onChange={(_, newValue) => {
                            setFormData(prev => ({ ...prev, id_user: newValue?.id_user || 0 }));
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Buscar Paciente por Cédula"
                                placeholder="Escriba la cédula..."
                                required
                                fullWidth
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

                    {selectedUser && (
                        <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ p: 1, bgcolor: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%' }}>
                                    <Icon name="user" size="xs" color="#10b981" />
                                </Box>
                                <Box>
                                    <Typography variant="body2" fontWeight={700} color="white">
                                        {selectedUser.first_name} {selectedUser.last_name}
                                    </Typography>
                                    <Typography variant="caption" color="#94a3b8">
                                        Cédula: {selectedUser.uid} | Tel: {selectedUser.phone}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    )}
                </Stack>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />

                {/* Section: Service Details */}
                <Stack spacing={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Icon name="vial" size="xs" color="#10b981" />
                        <Typography variant="subtitle1" fontWeight={700} color="#d1d5dc">Detalles del Servicio</Typography>
                    </Stack>

                    <Autocomplete
                        multiple
                        options={exams}
                        getOptionLabel={(option) => option.exam_type?.category_name || 'Sin nombre'}
                        value={exams.filter(e => formData.exam_ids.includes(e.id_exam))}
                        onChange={(_, newValue) => {
                            setFormData(prev => ({ ...prev, exam_ids: newValue.map(e => e.id_exam) }));
                        }}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option.exam_type?.category_name || 'Sin nombre'}
                                    {...getTagProps({ index })}
                                    key={option.id_exam}
                                    size="small"
                                    sx={{ borderRadius: '6px', fontWeight: 600 }}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Seleccionar Exámenes"
                                placeholder="Añadir examen..."
                                required={formData.exam_ids.length === 0}
                                fullWidth
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

                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="flex-end">
                            <Box flex={1}>
                                <Input
                                    label="Día"
                                    name="dia"
                                    type="text"
                                    placeholder="DD"
                                    maxLength={2}
                                    value={formData.dia}
                                    onChange={handleChange}
                                    required
                                />
                            </Box>
                            <Box flex={1}>
                                <Input
                                    label="Mes"
                                    name="mes"
                                    type="text"
                                    placeholder="MM"
                                    maxLength={2}
                                    value={formData.mes}
                                    onChange={handleChange}
                                    required
                                />
                            </Box>
                            <Box flex={2}>
                                <Input
                                    label="Hora Sugerida"
                                    name="sug_time"
                                    type="time"
                                    value={formData.sug_time}
                                    onChange={handleChange}
                                    required
                                />
                            </Box>
                        </Stack>
                    </Stack>

                    <Input
                        label="Observaciones o Síntomas"
                        name="observations"
                        value={formData.observations}
                        onChange={handleChange}
                        placeholder="Ej. Ayuno de 8 horas, dolor abdominal..."
                        multiline
                        rows={3}
                    />
                </Stack>

                {/* Section: Admin Info (Only if editing or status needs change) */}
                {initialData && (
                    <Stack spacing={3}>
                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Icon name="cog" size="xs" color="#94a3b8" />
                            <Typography variant="subtitle1" fontWeight={700} color="#d1d5dc">Estado de la Cita</Typography>
                        </Stack>
                        <TextField
                            select
                            label="Cambiar Estado"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            fullWidth
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
                            <MenuItem value="Pending">Pendiente</MenuItem>
                            <MenuItem value="Confirmed">Confirmada</MenuItem>
                            <MenuItem value="Cancelled">Cancelada</MenuItem>
                        </TextField>
                    </Stack>
                )}

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
                        {initialData ? 'Guardar Cambios' : 'Agendar Cita'}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default AppointmentForm;
