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
        user_id: initialData?.user_id || 0,
        requested_date: initialData?.requested_date ?
            (typeof initialData.requested_date === 'string' ?
                initialData.requested_date.substring(0, 16) :
                initialData.requested_date.toISOString().substring(0, 16)) :
            '',
        status: initialData?.status || 'Pending',
        exam_ids: initialData?.exam_ids || [] as number[],
        observations: initialData?.observations || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const selectedUser = users.find(u => u.user_id === formData.user_id) || null;

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={4}>
                {/* Section: Patient Info */}
                <Stack spacing={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Icon name="user-circle" size="xs" color="#3b82f6" />
                        <Typography variant="subtitle1" fontWeight={700} color="primary">Información del Paciente</Typography>
                    </Stack>

                    <Autocomplete
                        options={users}
                        getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.identity_card})`}
                        value={selectedUser}
                        onChange={(_, newValue) => {
                            setFormData(prev => ({ ...prev, user_id: newValue?.user_id || 0 }));
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Buscar Paciente"
                                placeholder="Nombre o Cédula..."
                                required
                                fullWidth
                                slotProps={{
                                    input: {
                                        ...params.InputProps,
                                        sx: { borderRadius: '0.75rem' }
                                    }
                                }}
                            />
                        )}
                    />
                </Stack>

                <Divider />

                {/* Section: Service Details */}
                <Stack spacing={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Icon name="vial" size="xs" color="#3b82f6" />
                        <Typography variant="subtitle1" fontWeight={700} color="primary">Detalles del Servicio</Typography>
                    </Stack>

                    <Autocomplete
                        multiple
                        options={exams}
                        getOptionLabel={(option) => option.name}
                        value={exams.filter(e => formData.exam_ids.includes(e.exam_id))}
                        onChange={(_, newValue) => {
                            setFormData(prev => ({ ...prev, exam_ids: newValue.map(e => e.exam_id) }));
                        }}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option.name}
                                    {...getTagProps({ index })}
                                    key={option.exam_id}
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
                                        sx: { borderRadius: '0.75rem' }
                                    }
                                }}
                            />
                        )}
                    />

                    <Input
                        label="Fecha y Hora Sugerida"
                        name="requested_date"
                        type="datetime-local"
                        value={formData.requested_date}
                        onChange={handleChange}
                        required
                    />

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
                        <Divider />
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Icon name="cog" size="xs" color="#64748b" />
                            <Typography variant="subtitle1" fontWeight={700} color="text.secondary">Estado de la Cita</Typography>
                        </Stack>
                        <TextField
                            select
                            label="Cambiar Estado"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            fullWidth
                            slotProps={{
                                input: { sx: { borderRadius: '0.75rem' } }
                            }}
                        >
                            <MenuItem value="Pending">Pendiente</MenuItem>
                            <MenuItem value="Confirmed">Confirmada</MenuItem>
                            <MenuItem value="Cancelled">Cancelada</MenuItem>
                        </TextField>
                    </Stack>
                )}

                <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        sx={{ borderRadius: '0.75rem', textTransform: 'none', px: 4, color: '#64748b', borderColor: '#e2e8f0' }}
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
                        {initialData ? 'Guardar Cambios' : 'Agendar Cita'}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default AppointmentForm;
