'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Icon from '@/components/ui/Icon';
import ScrollReveal from "@/components/ui/ScrollReveal";
import { apiFetch } from '@/utils/api';
import { Exam } from '@/types';
import {
    Box,
    Stack,
    Button,
    Autocomplete,
    TextField,
    Chip,
    Typography,
    Paper,
    Snackbar,
    Alert
} from '@mui/material';
import Input from '@/components/ui/Input';

export default function PatientNewAppointmentPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [exams, setExams] = useState<Exam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Notification state
    const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({ show: false, message: '', type: 'success' });

    const [formData, setFormData] = useState({
        dia: '',
        mes: '',
        sug_time: '',
        exam_ids: [] as number[],
        observations: '',
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('lab_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        } else {
            router.push('/login');
        }

        fetchExams();
    }, [router]);

    const fetchExams = async () => {
        try {
            const data = await apiFetch<Exam[]>('/exams');
            setExams(data || []);
        } catch (error) {
            console.error('Error fetching exams:', error);
            showNotification('Error al cargar la lista de exámenes disponibles.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        if (formData.exam_ids.length === 0) {
            showNotification('Debes seleccionar al menos un examen.', 'error');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const { dia, mes, sug_time, exam_ids, observations } = formData;
            const currentYear = new Date().getFullYear();
            const formattedDate = `${currentYear}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
            const requested_date = `${formattedDate}T${sug_time}:00.000Z`;

            await apiFetch('/appointments', {
                method: 'POST',
                body: JSON.stringify({
                    id_user: user.id_user,
                    requested_date,
                    status: 'PENDIENTE',
                    exam_ids,
                    observations
                }),
            });

            showNotification('¡Cita solicitada con éxito!', 'success');
            
            // Redirect after a short delay so user sees the success message
            setTimeout(() => {
                router.push('/dashboard/patient');
            }, 2000);
            
        } catch (error: any) {
            console.error('Error creating appointment:', error);
            showNotification(error.message || 'Error al procesar la solicitud.', 'error');
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ScrollReveal>
                    <div className="flex items-center gap-4 mb-8">
                        <button 
                            onClick={() => router.back()}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/50 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                        >
                            <Icon name="chevron-left" size="sm" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                <Icon name="calendar" size="sm" className="text-emerald-400" />
                                Solicitar Cita
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Programa tu próxima visita al laboratorio seleccionando los exámenes que necesitas.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Icon name="loader" size="lg" className="text-emerald-400 animate-spin mb-4" />
                                <p className="text-slate-400">Cargando formulario...</p>
                            </div>
                        ) : (
                            <Box component="form" onSubmit={handleSubmit}>
                                <Stack spacing={5}>
                                    
                                    {/* Patient Info Display (Read-only) */}
                                    <Box sx={{ p: 3, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        <Stack direction="row" spacing={3} alignItems="center">
                                            <Box sx={{ p: 1.5, bgcolor: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%' }}>
                                                <Icon name="user" size="sm" color="#10b981" />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="#10b981" fontWeight={700} sx={{ letterSpacing: '0.5px' }}>
                                                    PACIENTE
                                                </Typography>
                                                <Typography variant="h6" fontWeight={700} color="white" sx={{ mt: 0.5 }}>
                                                    {user?.first_name} {user?.last_name}
                                                </Typography>
                                                <Typography variant="body2" color="#94a3b8" sx={{ mt: 0.5 }}>
                                                    Cédula: {user?.uid} | Tel: {user?.phone}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>

                                    {/* Service Details */}
                                    <Stack spacing={3}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Icon name="vial" size="sm" color="#10b981" />
                                            <Typography variant="h6" fontWeight={700} color="white">Exámenes Requeridos</Typography>
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
                                                        sx={{ 
                                                            borderRadius: '8px', 
                                                            fontWeight: 600,
                                                            bgcolor: 'rgba(16, 185, 129, 0.15)',
                                                            color: '#34d399',
                                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                                            '& .MuiChip-deleteIcon': {
                                                                color: '#10b981',
                                                                '&:hover': { color: '#059669' }
                                                            }
                                                        }}
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
                                                                borderRadius: '1rem',
                                                                color: 'white',
                                                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                                                            }
                                                        },
                                                        inputLabel: {
                                                            sx: { color: 'rgba(209, 213, 220, 0.6)', '&.Mui-focused': { color: '#10b981' } }
                                                        }
                                                    }}
                                                />
                                            )}
                                        />

                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                            <Box flex={1}>
                                                <Input
                                                    label="Día sugerido"
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
                                                    label="Mes sugerido"
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
                                                    label="Hora sugerida"
                                                    name="sug_time"
                                                    type="time"
                                                    value={formData.sug_time}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Box>
                                        </Stack>

                                        <Input
                                            label="Observaciones o Síntomas (Opcional)"
                                            name="observations"
                                            value={formData.observations}
                                            onChange={handleChange}
                                            placeholder="Ej. Ayuno de 8 horas, dolor leve, etc..."
                                            multiline
                                            rows={3}
                                        />
                                    </Stack>

                                    <Stack direction="row" spacing={3} justifyContent="flex-end" pt={4}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => router.back()}
                                            disabled={isSubmitting}
                                            sx={{
                                                borderRadius: '1rem',
                                                textTransform: 'none',
                                                px: 4,
                                                py: 1.5,
                                                fontWeight: 700,
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                borderColor: 'rgba(255, 255, 255, 0.15)',
                                                '&:hover': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                    bgcolor: 'rgba(255, 255, 255, 0.05)'
                                                }
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={isSubmitting}
                                            sx={{
                                                borderRadius: '1rem',
                                                textTransform: 'none',
                                                px: 4,
                                                py: 1.5,
                                                fontSize: '1rem',
                                                fontWeight: 700,
                                                bgcolor: '#10b981',
                                                boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                                                '&:hover': {
                                                    bgcolor: '#059669',
                                                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.23)',
                                                },
                                                '&.Mui-disabled': {
                                                    bgcolor: 'rgba(16, 185, 129, 0.5)',
                                                    color: 'rgba(255, 255, 255, 0.5)'
                                                }
                                            }}
                                        >
                                            {isSubmitting ? 'Procesando...' : 'Confirmar Solicitud'}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Box>
                        )}
                    </div>
                </ScrollReveal>

                <Snackbar 
                    open={notification.show} 
                    autoHideDuration={4000} 
                    onClose={() => setNotification(prev => ({...prev, show: false}))}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert 
                        onClose={() => setNotification(prev => ({...prev, show: false}))} 
                        severity={notification.type} 
                        variant="filled"
                        sx={{ width: '100%', borderRadius: '1rem', fontWeight: 600 }}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </div>
        </DashboardLayout>
    );
}
