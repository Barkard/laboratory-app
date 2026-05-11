'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Icon from '@/components/ui/Icon';
import ScrollReveal from "@/components/ui/ScrollReveal";
import { apiFetch } from '@/utils/api';
import { Exam, ExamType, ClassExam } from '@/types';
import {
    Box,
    Stack,
    Button,
    Typography,
    Paper,
    Snackbar,
    Alert,
    MenuItem,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip
} from '@mui/material';
import Input from '@/components/ui/Input';

export default function PatientNewAppointmentPage() {
    const router = useRouter();
    const [user, setUser] = useState<{id_user: number, first_name: string, last_name: string} | null>(null);
    const [classExams, setClassExams] = useState<ClassExam[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
    const [filteredExamTypes, setFilteredExamTypes] = useState<ExamType[]>([]);
    const [selectedExamTypes, setSelectedExamTypes] = useState<ExamType[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    
    // Notification state
    const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({ show: false, message: '', type: 'success' });

    const [formData, setFormData] = useState({
        date: '',
        time: '',
        observations: '',
    });
    const [formErrors, setFormErrors] = useState({
        date: '',
        time: '',
    });

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await apiFetch<ClassExam[]>('/class-exam');
                setClassExams(data || []);
            } catch (error) {
                console.error('Error fetching classes:', error);
                showNotification('Error al cargar las clases de exámenes.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

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

        fetchClasses();
    }, [router]);

    const handleClassChange = (classId: number) => {
        setSelectedClassId(classId);
        const selectedClass = classExams.find(c => c.id_class === classId);
        setFilteredExamTypes(selectedClass?.exam_types || []);
    };

    const toggleExamSelection = (examType: ExamType) => {
        setSelectedExamTypes(prev => {
            const isSelected = prev.find(e => e.id_type === examType.id_type);
            if (isSelected) {
                return prev.filter(e => e.id_type !== examType.id_type);
            } else {
                return [...prev, examType];
            }
        });
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Real-time validation
        if (name === 'date') {
            if (!value) {
                setFormErrors(prev => ({ ...prev, date: 'La fecha es requerida' }));
                return;
            }
            
            const selectedDate = new Date(value + 'T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                setFormErrors(prev => ({ ...prev, date: 'No se pueden solicitar citas en fechas pasadas' }));
                return;
            }

            const dayOfWeek = selectedDate.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                setFormErrors(prev => ({ ...prev, date: 'No se permiten fines de semana' }));
            } else {
                setFormErrors(prev => ({ ...prev, date: '' }));
            }
        }

        if (name === 'time') {
            if (!value) {
                setFormErrors(prev => ({ ...prev, time: 'La hora es requerida' }));
                return;
            }
            const [hours, minutes] = value.split(':').map(Number);
            if (hours >= 17 && (hours > 17 || minutes > 0)) {
                setFormErrors(prev => ({ ...prev, time: 'Máximo hasta las 5:00 PM' }));
            } else {
                setFormErrors(prev => ({ ...prev, time: '' }));
            }
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        
        if (selectedExamTypes.length === 0) {
            showNotification('Debes seleccionar al menos un examen.', 'error');
            return;
        }

        if (!formData.date || !formData.time) {
            showNotification('Por favor complete la fecha y hora sugerida.', 'error');
            return;
        }

        if (formErrors.date || formErrors.time) {
            showNotification('Por favor corrija los errores en el formulario.', 'error');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const { date, time, observations } = formData;
            const requested_date = `${date}T${time}:00.000Z`;

            // Note: the backend /appointments expects exam_ids
            // We need to map selectedExamTypes to actual Exam IDs if we had them, 
            // but usually a patient selects a Type, and the system finds an available Exam of that type.
            // Looking at the previous code, it used exam_ids from a list of Exams.
            // Let's assume for now we need to fetch the actual Exams for these Types.
            
            // Re-fetch exams to get their IDs based on selected Types
            const allExams = await apiFetch<Exam[]>('/exams');
            const examIds = selectedExamTypes.map(type => {
                const found = allExams.find(e => e.id_type === type.id_type);
                return found?.id_exam;
            }).filter(id => id !== undefined) as number[];

            if (examIds.length === 0) {
                throw new Error('No se encontraron exámenes disponibles para los tipos seleccionados.');
            }

            await apiFetch('/appointments', {
                method: 'POST',
                body: JSON.stringify({
                    id_user: user.id_user,
                    requested_date,
                    status: 'PENDIENTE',
                    exam_ids: examIds,
                    observations
                }),
            });

            showNotification('¡Cita solicitada con éxito!', 'success');
            setIsDetailsModalOpen(false);
            
            setTimeout(() => {
                router.push('/dashboard/patient');
            }, 2000);
            
        } catch (error: unknown) {
            console.error('Error creating appointment:', error);
            const message = error instanceof Error ? error.message : 'Error al procesar la solicitud.';
            showNotification(message, 'error');
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <Typography color="white">Cargando...</Typography>
                    </Box>
                ) : (
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
                                Solicitar Nueva Cita
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Sigue los pasos para programar tus exámenes de laboratorio.
                            </p>
                        </div>
                    </div>

                    <Stack spacing={4}>
                        {/* Step 1: Select Class */}
                        <Paper sx={{ p: 4, bgcolor: 'rgba(15, 23, 42, 0.4)', borderRadius: '2rem', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                            <Stack spacing={3}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 'bold' }}>1</Box>
                                    <Typography variant="h6" fontWeight={700} color="white">Seleccione la Clase de Examen</Typography>
                                </Stack>
                                
                                <TextField
                                    select
                                    label="Clase de Examen"
                                    value={selectedClassId}
                                    onChange={(e) => handleClassChange(Number(e.target.value))}
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            sx: {
                                                borderRadius: '1rem',
                                                color: 'white',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                                                bgcolor: 'rgba(255, 255, 255, 0.03)'
                                            }
                                        },
                                        inputLabel: {
                                            sx: { color: 'rgba(209, 213, 220, 0.6)', '&.Mui-focused': { color: '#10b981' } }
                                        }
                                    }}
                                >
                                    {classExams.map((cls) => (
                                        <MenuItem key={cls.id_class} value={cls.id_class}>
                                            {cls.class_name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Stack>
                        </Paper>

                        {/* Step 2: Table of Exam Types */}
                        {selectedClassId && (
                            <Paper sx={{ p: 4, bgcolor: 'rgba(15, 23, 42, 0.4)', borderRadius: '2rem', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                                <Stack spacing={3}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 'bold' }}>2</Box>
                                            <Typography variant="h6" fontWeight={700} color="white">Tipos de Exámenes Disponibles</Typography>
                                        </Stack>
                                        {selectedExamTypes.length > 0 && (
                                            <Chip 
                                                label={`${selectedExamTypes.length} seleccionados`} 
                                                onDelete={() => setSelectedExamTypes([])}
                                                sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 700 }}
                                            />
                                        )}
                                    </Stack>

                                    <TableContainer component={Box} sx={{ borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
                                        <Table>
                                            <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                                                <TableRow>
                                                    <TableCell sx={{ color: '#94a3b8', fontWeight: 700, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>NOMBRE</TableCell>
                                                    <TableCell sx={{ color: '#94a3b8', fontWeight: 700, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>DESCRIPCIÓN</TableCell>
                                                    <TableCell align="center" sx={{ color: '#94a3b8', fontWeight: 700, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>ACCIÓN</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredExamTypes.length > 0 ? (
                                                    filteredExamTypes.map((type) => {
                                                        const isSelected = selectedExamTypes.find(e => e.id_type === type.id_type);
                                                        return (
                                                            <TableRow key={type.id_type} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' }, transition: 'background-color 0.2s' }}>
                                                                <TableCell sx={{ color: 'white', fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>{type.category_name}</TableCell>
                                                                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>{type.detail || 'Sin descripción disponible'}</TableCell>
                                                                <TableCell align="center" sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                                    <Button
                                                                        variant={isSelected ? "contained" : "outlined"}
                                                                        size="small"
                                                                        onClick={() => toggleExamSelection(type)}
                                                                        sx={{ 
                                                                            borderRadius: '0.5rem',
                                                                            textTransform: 'none',
                                                                            minWidth: '100px',
                                                                            bgcolor: isSelected ? '#10b981' : 'transparent',
                                                                            color: isSelected ? 'white' : '#10b981',
                                                                            borderColor: '#10b981',
                                                                            '&:hover': {
                                                                                bgcolor: isSelected ? '#059669' : 'rgba(16, 185, 129, 0.05)',
                                                                                borderColor: '#10b981'
                                                                            }
                                                                        }}
                                                                    >
                                                                        {isSelected ? 'Seleccionado' : 'Seleccionar'}
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#64748b', fontStyle: 'italic' }}>
                                                            No hay exámenes disponibles para esta clase.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    {selectedExamTypes.length > 0 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                                            <Button
                                                variant="contained"
                                                onClick={() => setIsDetailsModalOpen(true)}
                                                sx={{
                                                    borderRadius: '1rem',
                                                    textTransform: 'none',
                                                    px: 6,
                                                    py: 1.5,
                                                    fontWeight: 700,
                                                    bgcolor: '#10b981',
                                                    boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                                                    '&:hover': { bgcolor: '#059669' }
                                                }}
                                            >
                                                Continuar con {selectedExamTypes.length} examen(es)
                                            </Button>
                                        </Box>
                                    )}
                                </Stack>
                            </Paper>
                        )}
                    </Stack>
                </ScrollReveal>
                )}

                {/* Details Modal */}
                <Dialog 
                    open={isDetailsModalOpen} 
                    onClose={() => setIsDetailsModalOpen(false)}
                    PaperProps={{
                        sx: {
                            bgcolor: '#0f172a',
                            backgroundImage: 'none',
                            borderRadius: '2rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            minWidth: { xs: '90%', sm: '500px' }
                        }
                    }}
                >
                    <DialogTitle sx={{ color: 'white', fontWeight: 700, pt: 4, px: 4 }}>
                        Detalles de la Cita
                    </DialogTitle>
                    <DialogContent sx={{ px: 4 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mt: 1 }}>
                            {/* Left Column: Form */}
                            <Stack spacing={3} flex={1}>
                                <Typography variant="subtitle2" color="#10b981" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Información de la Cita
                                </Typography>
                                
                                <Input
                                    label="Fecha de la Cita"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    error={formErrors.date}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="dark-input"
                                />
                                <Input
                                    label="Hora sugerida (Máximo 5:00 PM)"
                                    name="time"
                                    type="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    error={formErrors.time}
                                    required
                                    className="dark-input"
                                />
                                <Input
                                    label="Observaciones (Opcional)"
                                    name="observations"
                                    value={formData.observations}
                                    onChange={handleChange}
                                    placeholder="Indique síntomas o requisitos especiales..."
                                    multiline
                                    rows={3}
                                />
                            </Stack>

                            {/* Right Column: Exam Details */}
                            <Box flex={1} sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: '1.5rem', p: 3, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <Typography variant="subtitle2" color="#10b981" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '1px', mb: 2 }}>
                                    Exámenes Seleccionados
                                </Typography>
                                <Stack spacing={2}>
                                    {selectedExamTypes.map(type => (
                                        <Box key={type.id_type} sx={{ pb: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', '&:last-child': { borderBottom: 'none' } }}>
                                            <Typography variant="body2" fontWeight={700} color="white">{type.category_name}</Typography>
                                            <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                                                {type.detail || 'Sin descripción detallada.'}
                                            </Typography>
                                            {type.requirements && (
                                                <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: '0.5rem', borderLeft: '2px solid #10b981' }}>
                                                    <Typography variant="caption" color="#10b981" sx={{ fontWeight: 600 }}>Requisitos:</Typography>
                                                    <Typography variant="caption" color="white" sx={{ display: 'block', fontStyle: 'italic' }}>{type.requirements}</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 4, pt: 2 }}>
                        <Button 
                            onClick={() => setIsDetailsModalOpen(false)}
                            sx={{ color: '#94a3b8', textTransform: 'none', fontWeight: 600 }}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                                borderRadius: '0.75rem',
                                textTransform: 'none',
                                px: 4,
                                bgcolor: '#10b981',
                                fontWeight: 700,
                                '&:hover': { bgcolor: '#059669' }
                            }}
                        >
                            {isSubmitting ? 'Procesando...' : 'Solicitar Cita'}
                        </Button>
                    </DialogActions>
                </Dialog>

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
