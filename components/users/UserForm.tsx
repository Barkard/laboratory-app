'use client';

import React from 'react';
import { Box, Stack, Button } from '@mui/material';
import Input from '../ui/Input';
import { User } from '@/types';

interface UserFormProps {
    onSubmit: (user: Partial<User>) => void;
    onCancel: () => void;
    initialData?: Partial<User>;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, onCancel, initialData }) => {
    const [formData, setFormData] = React.useState<Partial<User>>({
        identity_card: initialData?.identity_card || '',
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
            <Stack spacing={3}>
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
                <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        sx={{ borderRadius: '0.75rem', textTransform: 'none', px: 4 }}
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
                        {initialData ? 'Guardar Cambios' : 'Registrar Usuario'}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default UserForm;
