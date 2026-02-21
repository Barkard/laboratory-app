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
    Button
} from "@mui/material";

const StatCard = ({ title, value, icon, color, trend }: { title: string, value: string, icon: string, color: string, trend?: string }) => (
    <Card sx={{ p: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Box
                sx={{
                    p: 1.5,
                    borderRadius: '0.75rem',
                    bgcolor: `${color}.main`,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Icon name={icon} size="sm" />
            </Box>
            {trend && (
                <Chip
                    label={trend}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                />
            )}
        </Stack>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
        </Typography>
        <Typography variant="h4" fontWeight={700} mt={0.5}>
            {value}
        </Typography>
    </Card>
);

export default function AdminDashboard() {
    return (
        <DashboardLayout>
            <Box maxWidth="xl" sx={{ mx: 'auto' }}>
                <Box mb={4}>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                        Resumen del Laboratorio
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Monitoree el estado de sus citas y resultados.
                    </Typography>
                </Box>

                <Grid container spacing={3} mb={4} component="div">
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} component="div">
                        <StatCard
                            title="Citas para hoy"
                            value="12"
                            icon="calendar-event"
                            color="primary"
                            trend="+2 nuevas"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} component="div">
                        <StatCard
                            title="Resultados Pendientes"
                            value="8"
                            icon="file-find"
                            color="warning"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} component="div">
                        <StatCard
                            title="Exámenes Realizados"
                            value="145"
                            icon="vial"
                            color="success"
                            trend="+15%"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} component="div">
                        <StatCard
                            title="Total Usuarios"
                            value="89"
                            icon="info"
                            color="secondary"
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={4} component="div">
                    <Grid size={{ xs: 12, lg: 6 }} component="div">
                        <Card sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" fontWeight={700} mb={3}>
                                Próximas Citas
                            </Typography>
                            <List disablePadding>
                                {[1, 2, 3].map((i, index) => (
                                    <React.Fragment key={i}>
                                        <ListItem
                                            sx={{
                                                px: 2,
                                                py: 2,
                                                borderRadius: '0.75rem',
                                                border: '1px solid #f8fafc',
                                                mb: index === 2 ? 0 : 2,
                                                '&:hover': { bgcolor: '#f8fafc' }
                                            }}
                                            secondaryAction={
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="caption" fontWeight={700} display="block">
                                                        10:30 AM
                                                    </Typography>
                                                    <Typography variant="caption" color="primary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                                        Confirmada
                                                    </Typography>
                                                </Box>
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: '#f1f5f9', color: '#94a3b8' }}>
                                                    <Icon name="user" size="xs" />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={`Paciente #${i}04`}
                                                secondary="Hematología Completa"
                                                primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </ListItem>
                                    </React.Fragment>
                                ))}
                            </List>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 6 }} component="div">
                        <Card sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" fontWeight={700} mb={3}>
                                Accesos Directos
                            </Typography>
                            <Grid container spacing={2} component="div">
                                {[
                                    { label: 'Gestionar Citas', icon: 'calendar-plus', color: 'primary', href: '/dashboard/appointments' },
                                    { label: 'Gestión de Usuarios', icon: 'user-plus', color: 'secondary', href: '/dashboard/users' },
                                    { label: 'Registrar Examen', icon: 'vial', color: 'success', href: '/dashboard/exams' },
                                    { label: 'Configuraciones', icon: 'cog', color: 'warning', href: '/dashboard/settings' },
                                ].map((action) => (
                                    <Grid key={action.label} size={{ xs: 12, sm: 6 }} component="div">
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color={action.color as any}
                                            startIcon={<Icon name={action.icon} size="sm" />}
                                            href={action.href}
                                            sx={{
                                                py: 2,
                                                justifyContent: 'flex-start',
                                                borderRadius: '1rem',
                                                borderWidth: '1.5px',
                                                '&:hover': { borderWidth: '1.5px' }
                                            }}
                                        >
                                            {action.label}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                            <Box mt={4} p={2} bgcolor="#f8fafc" borderRadius="1rem">
                                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" fontWeight={500}>
                                    Use los accesos directos para navegar rápidamente entre los módulos principales del sistema.
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </DashboardLayout>
    );
}
