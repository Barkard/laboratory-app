'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Zoom,
    Stack
} from '@mui/material';
import Icon from './Icon';

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Eliminar',
    cancelText = 'Cancelar',
    type = 'danger'
}) => {
    const color = type === 'danger' ? 'error' : type === 'warning' ? 'warning' : 'primary';
    const iconName = type === 'danger' ? 'trash' : type === 'warning' ? 'error-circle' : 'info-circle';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionComponent={Zoom}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '1.25rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                    p: 1
                }
            }}
        >
            <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: type === 'danger' ? '#fef2f2' : type === 'warning' ? '#fffbeb' : '#eff6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3
                    }}
                >
                    <Icon
                        name={iconName}
                        size="md"
                        color={type === 'danger' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'}
                    />
                </Box>

                <Typography variant="h6" fontWeight={700} gutterBottom>
                    {title}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                <Stack direction="row" spacing={2} width="100%">
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={onClose}
                        sx={{
                            borderRadius: '0.75rem',
                            textTransform: 'none',
                            color: '#64748b',
                            borderColor: '#e2e8f0'
                        }}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        fullWidth
                        autoFocus
                        variant="contained"
                        color={color}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        sx={{
                            borderRadius: '0.75rem',
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': { boxShadow: 'none' }
                        }}
                    >
                        {confirmText}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmModal;
