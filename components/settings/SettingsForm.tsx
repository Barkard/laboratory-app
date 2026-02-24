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
        identity_card: user.identity_card,
        first_name: user.first_name,
        last_name: user.last_name,
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
                        name="identity_card"
                        value={formData.identity_card}
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
