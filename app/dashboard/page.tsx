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
import ScrollReveal from "@/components/ui/ScrollReveal";

const StatCard = ({ title, value, icon, color, trend, delay = 0 }: { title: string, value: string, icon: string, color: string, trend?: string, delay?: number }) => {
    return (
        <ScrollReveal delay={delay}>
            <Card
                sx={{
                    p: 3,
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    cursor: 'pointer',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        borderColor: 'rgba(56, 189, 248, 0.2)',
                    }
                }}
            >
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
        </ScrollReveal>
    );
};


export default function AdminDashboard() {
    return (
        <DashboardLayout>
            <Box maxWidth="xl" sx={{ mx: 'auto' }}>
                <Box mb={4}>
                    <Typography variant="h4" fontWeight={800} color="white" gutterBottom>
                        Gestión Integral de <span className="text-celeste">Laboratorio</span>
                    </Typography>
                    <Typography variant="body1" color="white" fontWeight={500}>
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
                            delay={100}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="Resultados Pendientes"
                            value="08"
                            icon="file-find"
                            color="warning"
                            delay={200}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="Exámenes Realizados"
                            value="145"
                            icon="vial"
                            color="success"
                            trend="+15%"
                            delay={300}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="Total Usuarios"
                            value="89"
                            icon="group"
                            color="secondary"
                            delay={400}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={4} component="div">
                    <Grid size={{ xs: 12, lg: 7 }} component="div">
                        <ScrollReveal delay={500}>
                            <Card sx={{ p: 4, height: '100%', bgcolor: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                                    <Typography variant="h6" fontWeight={800} color="white">
                                        Citas pendientes
                                    </Typography>
                                    <Button size="sm" variant="ghost" className="transition-all duration-300">Ver todas</Button>
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
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(30, 58, 138, 0.3)',
                                                        borderColor: 'rgba(56, 189, 248, 0.4)',
                                                        transform: 'translateX(4px)',
                                                        '& .MuiListItemText-primary': { color: '#38bdf8' }
                                                    }
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
                        </ScrollReveal>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 5 }} component="div">
                        <ScrollReveal delay={600}>
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
                                                variant="secondary"
                                                onClick={() => window.location.href = action.href}
                                                leftIcon={<Icon name={action.icon} size="sm" />}
                                                className={`
                                                w-full py-4 px-6 justify-start rounded-2xl
                                                bg-white/5 border-white/10 text-white
                                                hover:bg-blue-600/20 hover:border-cyan-400/50 hover:text-cyan-400
                                                transition-all duration-500 ease-out hover:scale-[1.02]
                                            `}
                                            >
                                                <Typography variant="caption" fontWeight={700} className="ml-1 transition-colors duration-500">{action.label}</Typography>
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>

                            </Card>
                        </ScrollReveal>
                    </Grid>
                </Grid>
            </Box>
        </DashboardLayout>
    );
}
