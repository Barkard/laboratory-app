'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Icon from '@/components/ui/Icon';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { User } from '@/types';
import SettingsForm from '@/components/settings/SettingsForm';
import {
    Box,
    Typography,
    Stack,
    Paper,
    Divider
} from '@mui/material';

// Simulate current logged user
const currentUser: User = {
    user_id: 1,
    identity_card: '12345678',
    first_name: 'Leon',
    last_name: 'Pineda'
};

export default function SettingsPage() {
    const [user, setUser] = React.useState<User>(currentUser);

    const handleUpdateProfile = (updatedData: Partial<User>) => {
        // In a real app, this would be an API call
        setUser(prev => ({ ...prev, ...updatedData }));
        console.log('Profile updated:', updatedData);
        // Here you could also add a toast notification
    };

    return (
        <DashboardLayout>
            <Box maxWidth="md" sx={{ mx: 'auto' }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                    mb={4}
                >
                    <Box>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{
                                width: 40,
                                height: 40,
                                bgcolor: '#34d399', // emerald-400
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 15px rgba(52, 211, 153, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                zIndex: 10,
                                position: 'relative'
                            }}>
                                <Icon name="cog" size="xs" color="white" />
                            </Box>
                            <Typography variant="h5" fontWeight={700} color="white">
                                Configuración
                            </Typography>
                        </Stack>
                        <Typography variant="body2" color="#d1d5dc" sx={{ mt: 1.5, ml: 0.5 }}>
                            Administre su información personal y preferencias de cuenta.
                        </Typography>
                    </Box>
                </Stack>

                <ScrollReveal delay={200}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 5 },
                            borderRadius: '1.5rem',
                            bgcolor: 'rgba(15, 23, 42, 0.9)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        {/* Background subtle glow */}
                        <Box sx={{
                            position: 'absolute',
                            top: -100,
                            right: -100,
                            width: 300,
                            height: 300,
                            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
                            zIndex: 0
                        }} />

                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <SettingsForm
                                user={user}
                                onSubmit={handleUpdateProfile}
                            />
                        </Box>
                    </Paper>
                </ScrollReveal>
            </Box>
        </DashboardLayout>
    );
}
