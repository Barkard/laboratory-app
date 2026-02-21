'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import Icon from "@/components/ui/Icon";
import {
    Box,
    Grid,
    Card,
    Typography,
    Stack,
    Avatar,
    Chip,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    IconButton,
    Button as MUIButton
} from "@mui/material";
import Button from "@/components/ui/Button";

const StatCard = ({ title, value, icon, color, trend }: { title: string, value: string, icon: string, color: string, trend?: string }) => (
    <Card sx={{
        p: 3,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            borderColor: 'rgba(56, 189, 248, 0.2)',
        }
    }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Box
                sx={{
                    p: 1.5,
                    borderRadius: '0.75rem',
                    bgcolor: color === 'primary' ? 'primary.main' : `${color}.main`,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
            >
                <Icon name={icon} size="sm" />
            </Box>
            {trend && (
                <Chip
                    label={trend}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '0.7rem', borderColor: 'primary.main', color: 'primary.main' }}
                />
            )}
        </Stack>
        <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} mt={0.5} color="white">
            {value}
        </Typography>
    </Card>
);

export default function AdminDashboard() {
    return (
        <DashboardLayout>
            <Box maxWidth="xl" sx={{ mx: 'auto' }}>
                <Box mb={4}>
                    <Typography variant="h4" fontWeight={800} color="white" gutterBottom>
                        Gestión Integral <span className="text-celeste">de Laboratorio</span>
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                        Bienvenido de nuevo, Dr. Pineda. Aquí está el resumen de hoy.
                    </Typography>
                </Box>

                <Grid container spacing={3} mb={4}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="Citas para hoy"
                            value="12"
                            icon="calendar-event"
                            color="primary"
                            trend="+2 nuevas"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="Resultados Pendientes"
                            value="08"
                            icon="file-find"
                            color="warning"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="Exámenes Realizados"
                            value="145"
                            icon="vial"
                            color="success"
                            trend="+15%"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="Total Usuarios"
                            value="89"
                            icon="group"
                            color="secondary"
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={4} component="div">
                    <Grid size={{ xs: 12, lg: 7 }} component="div">
                        <Card sx={{ p: 4, height: '100%', bgcolor: 'rgba(15, 23, 42, 0.5)' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                                <Typography variant="h6" fontWeight={800} color="white">
                                    Próximas Citas Médicas
                                </Typography>
                                <Button size="sm" variant="ghost">Ver todas</Button>
                            </Stack>
                            <List disablePadding>
                                {[1, 2, 3, 4].map((i, index) => (
                                    <React.Fragment key={i}>
                                        <ListItem
                                            sx={{
                                                px: 2,
                                                py: 2.5,
                                                borderRadius: '1rem',
                                                mb: 2,
                                                bgcolor: 'rgba(255, 255, 255, 0.02)',
                                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(56, 189, 248, 0.2)' }
                                            }}
                                            secondaryAction={
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="body2" fontWeight={800} color="white" display="block">
                                                        10:30 AM
                                                    </Typography>
                                                    <Typography variant="caption" color="primary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        CONFIRMADA
                                                    </Typography>
                                                </Box>
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'rgba(56, 189, 248, 0.1)', color: 'primary.main', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                                                    <Icon name="user" size="xs" />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={`Paciente #${i}04 - Leon Pineda`}
                                                secondary="Hematología Completa"
                                                primaryTypographyProps={{ variant: 'body2', fontWeight: 700, color: 'white' }}
                                                secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 500 }}
                                            />
                                        </ListItem>
                                    </React.Fragment>
                                ))}
                            </List>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 5 }} component="div">
                        <Card sx={{ p: 4, height: '100%', bgcolor: 'rgba(15, 23, 42, 0.5)' }}>
                            <Typography variant="h6" fontWeight={800} color="white" mb={4}>
                                Accesos Directos
                            </Typography>
                            <Grid container spacing={2}>
                                {[
                                    { label: 'Gestionar Citas', icon: 'calendar-plus', color: 'primary', href: '/dashboard/appointments' },
                                    { label: 'Gestión de Pacientes', icon: 'user-plus', color: 'secondary', href: '/dashboard/users' },
                                    { label: 'Registrar Examen', icon: 'vial', color: 'primary', href: '/dashboard/exams' },
                                    { label: 'Configuración', icon: 'cog', color: 'secondary', href: '/dashboard/settings' },
                                ].map((action) => (
                                    <Grid key={action.label} size={{ xs: 12, sm: 6 }}>
                                        <Button
                                            fullWidth
                                            variant="secondary"
                                            onClick={() => window.location.href = action.href}
                                            leftIcon={<Icon name={action.icon} size="sm" />}
                                            sx={{
                                                py: 2,
                                                px: 3,
                                                justifyContent: 'flex-start',
                                                borderRadius: '1rem',
                                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                                color: 'white',
                                                '&:hover': {
                                                    bgcolor: 'rgba(56, 189, 248, 0.05)',
                                                    borderColor: 'rgba(56, 189, 248, 0.2)',
                                                    color: 'primary.main',
                                                    transform: 'translateX(4px)'
                                                }
                                            }}
                                        >
                                            <Typography variant="caption" fontWeight={700} sx={{ ml: 1 }}>{action.label}</Typography>
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>

                            <Box mt={6} p={3} sx={{ bgcolor: 'rgba(56, 189, 248, 0.03)', borderRadius: '1.25rem', border: '1px dashed rgba(56, 189, 248, 0.2)' }}>
                                <Typography variant="body2" color="primary" textAlign="center" fontWeight={600} sx={{ lineHeight: 1.6 }}>
                                    "La eficiencia en el laboratorio comienza con una gestión inteligente de los datos."
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </DashboardLayout>
    );
}
