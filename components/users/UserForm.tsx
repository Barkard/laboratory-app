'use client';

import React from 'react';
import { Box, Stack, Button, Typography } from '@mui/material';
import Icon from '../ui/Icon';
import Input from '../ui/Input';
import { User } from '@/types';

interface UserFormProps {
    onSubmit: (user: Partial<User>) => void;
    onCancel: () => void;
    initialData?: Partial<User>;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, onCancel, initialData }) => {
    const [formData, setFormData] = React.useState<Partial<User>>({
        uid: initialData?.uid || '',
        first_name: initialData?.first_name || '',
        last_name: initialData?.last_name || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={4}>
                <Stack spacing={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Icon name="user-detail" size="xs" color="#10b981" />
                        <Typography variant="subtitle1" fontWeight={700} color="#d1d5dc">Datos Personales</Typography>
                    </Stack>
                    <Input
                        label="Número de Cédula"
                        name="uid"
                        value={formData.uid}
                        onChange={handleChange}
                        placeholder="Ej. 12345678"
                        required
                    />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Input
                            label="Nombres"
                            name="first_name"
                            value={formData.first_name || ''}
                            onChange={handleChange}
                            placeholder="Ej. Juan"
                            required
                        />
                        <Input
                            label="Apellidos"
                            name="last_name"
                            value={formData.last_name || ''}
                            onChange={handleChange}
                            placeholder="Ej. Pérez"
                            required
                        />
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
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
                        {initialData ? 'Guardar Cambios' : 'Registrar Paciente'}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default UserForm;
