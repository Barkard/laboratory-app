'use client';

import React from 'react';
import { Box, Stack, Button, Typography, Paper } from '@mui/material';
import Icon from '../ui/Icon';
import Input from '../ui/Input';
import { User } from '@/types';

interface SettingsFormProps {
    user: User;
    onSubmit: (updatedUser: Partial<User>) => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ user, onSubmit }) => {
    const [formData, setFormData] = React.useState<Partial<User>>({
        uid: user?.uid || '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
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
                        <Typography variant="subtitle1" fontWeight={700} color="#d1d5dc">Información del Perfil</Typography>
                    </Stack>

                    <Input
                        label="Número de Cédula"
                        name="uid"
                        value={formData.uid}
                        onChange={handleChange}
                        placeholder="Ej. 12345678"
                        required
                        disabled
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

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Input
                            label="Correo Electrónico"
                            name="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            placeholder="ejemplo@correo.com"
                            required
                        />
                        <Input
                            label="Teléfono"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleChange}
                            placeholder="Ej. 04121234567"
                            required
                        />
                    </Stack>

                    <Input
                        label="Dirección"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        placeholder="Ej. Calle Principal #123"
                    />
                </Stack>

                <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            borderRadius: '0.8rem',
                            textTransform: 'none',
                            px: 6,
                            py: 1.2,
                            bgcolor: '#10b981',
                            boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                            fontWeight: 600,
                            '&:hover': {
                                bgcolor: '#059669',
                                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.23)',
                            }
                        }}
                    >
                        Actualizar Perfil
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default SettingsForm;
