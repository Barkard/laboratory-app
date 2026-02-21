'use client';

import React from 'react';
import {
    Box,
    Stack,
    Button,
    MenuItem,
    TextField,
    Typography,
    IconButton,
    Divider,
    Paper,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import Icon from '../ui/Icon';
import Input from '../ui/Input';
import { Exam, ExamType } from '@/types';

interface DynamicField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'checkbox' | 'select';
    options?: string[]; // For select type
}

interface ExamFormProps {
    onSubmit: (exam: Partial<Exam & { customFields: DynamicField[] }>) => void;
    onCancel: () => void;
    examTypes: ExamType[];
    onAddType: (name: string) => void;
    initialData?: Partial<Exam & { customFields: DynamicField[] }>;
}

const ExamForm: React.FC<ExamFormProps> = ({ onSubmit, onCancel, examTypes, onAddType, initialData }) => {
    const [typeId, setTypeId] = React.useState(initialData?.type_id || (examTypes.length > 0 ? examTypes[0].type_id : 0));
    const [fields, setFields] = React.useState<DynamicField[]>(initialData?.customFields || []);

    // New type creation state
    const [isAddingType, setIsAddingType] = React.useState(false);
    const [newTypeName, setNewTypeName] = React.useState('');

    const handleSaveNewType = () => {
        if (!newTypeName.trim()) return;
        const nextId = Math.max(...examTypes.map(t => t.type_id), 0) + 1;
        onAddType(newTypeName);
        setTypeId(nextId);
        setNewTypeName('');
        setIsAddingType(false);
    };

    const addField = () => {
        const newField: DynamicField = {
            id: Math.random().toString(36).substr(2, 9),
            label: '',
            type: 'text'
        };
        setFields([...fields, newField]);
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const updateField = (id: string, updates: Partial<DynamicField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedType = examTypes.find(t => t.type_id === typeId);
        onSubmit({
            name: selectedType?.category_name || '',
            type_id: typeId,
            customFields: fields
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={4}>
                {/* Basic Information */}
                <Stack spacing={3}>
                    <Typography variant="subtitle1" fontWeight={700} color="primary">Categoría del Examen</Typography>

                    {!isAddingType ? (
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                            <TextField
                                select
                                label="Tipo de Examen"
                                value={typeId}
                                onChange={(e) => setTypeId(Number(e.target.value))}
                                fullWidth
                                required
                                helperText="El nombre del examen será el mismo que el tipo seleccionado."
                                slotProps={{
                                    input: { sx: { borderRadius: '0.75rem' } }
                                }}
                                sx={{ flex: 1 }}
                            >
                                {examTypes.map((type) => (
                                    <MenuItem key={type.type_id} value={type.type_id}>
                                        {type.category_name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <IconButton
                                onClick={() => setIsAddingType(true)}
                                sx={{
                                    mt: 1,
                                    bgcolor: '#eff6ff',
                                    color: '#3b82f6',
                                    '&:hover': { bgcolor: '#dbeafe' }
                                }}
                            >
                                <Icon name="plus" size="xs" />
                            </IconButton>
                        </Stack>
                    ) : (
                        <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                <Box flex={1}>
                                    <Input
                                        label="Nuevo Nombre de Examen"
                                        placeholder="Ej. Glucosa Post-Prandial"
                                        value={newTypeName}
                                        onChange={(e) => setNewTypeName(e.target.value)}
                                        autoFocus
                                    />
                                </Box>
                                <IconButton
                                    onClick={() => setIsAddingType(false)}
                                    sx={{ mt: 4 }}
                                    color="error"
                                >
                                    <Icon name="x" size="xs" />
                                </IconButton>
                            </Stack>
                            <Button
                                variant="contained"
                                onClick={handleSaveNewType}
                                disabled={!newTypeName.trim()}
                                sx={{
                                    borderRadius: '0.5rem',
                                    textTransform: 'none',
                                    alignSelf: 'flex-start',
                                    boxShadow: 'none',
                                    '&:hover': { boxShadow: 'none' }
                                }}
                            >
                                Guardar nombre de examen
                            </Button>
                        </Stack>
                    )}
                </Stack>

                <Divider />

                {/* Custom Fields Builder */}
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} color="primary">Campos del Formulario</Typography>
                            <Typography variant="caption" color="text.secondary">Defina los campos que se llenarán al registrar resultados.</Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<Icon name="plus" size="xs" />}
                            onClick={addField}
                            size="small"
                            sx={{ borderRadius: '0.5rem', textTransform: 'none' }}
                        >
                            Añadir Campo
                        </Button>
                    </Stack>

                    {fields.length === 0 ? (
                        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderStyle: 'dashed' }}>
                            <Typography variant="body2" color="text.secondary">No hay campos personalizados definidos.</Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={2}>
                            {fields.map((field) => (
                                <Paper
                                    key={field.id}
                                    variant="outlined"
                                    sx={{ p: 2, borderRadius: '0.75rem', position: 'relative', bgcolor: '#fdfdfd' }}
                                >
                                    <Stack spacing={2}>
                                        <Stack direction="row" spacing={2} alignItems="flex-start">
                                            <Box flex={1}>
                                                <Input
                                                    label="Etiqueta del Campo"
                                                    placeholder="Ej. Nivel de Glucosa"
                                                    value={field.label}
                                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                    required
                                                />
                                            </Box>
                                            <Box sx={{ width: 140 }}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel sx={{ mt: 1.2 }}>Tipo</InputLabel>
                                                    <Select
                                                        value={field.type}
                                                        label="Tipo"
                                                        onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                                                        sx={{ borderRadius: '0.5rem', mt: 1.2 }}
                                                    >
                                                        <MenuItem value="text">Texto</MenuItem>
                                                        <MenuItem value="number">Número</MenuItem>
                                                        <MenuItem value="checkbox">Checkbox</MenuItem>
                                                        <MenuItem value="select">Selector</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => removeField(field.id)}
                                                sx={{ mt: 4 }}
                                            >
                                                <Icon name="trash" size="xs" />
                                            </IconButton>
                                        </Stack>

                                        {field.type === 'select' && (
                                            <Input
                                                label="Opciones (separadas por coma)"
                                                placeholder="Ej. Positivo, Negativo, Pendiente"
                                                value={field.options?.join(', ') || ''}
                                                onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                                                required
                                            />
                                        )}
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Stack>

                {/* Footer Actions */}
                <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        sx={{ borderRadius: '0.75rem', textTransform: 'none', px: 4, color: '#64748b', borderColor: '#e2e8f0' }}
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
                        {initialData ? 'Guardar Cambios' : 'Registrar Examen'}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default ExamForm;
