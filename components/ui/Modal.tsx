'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Box,
    Zoom
} from '@mui/material';
import Icon from './Icon';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
    open,
    onClose,
    title,
    children,
    footer,
    maxWidth = 'sm'
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionComponent={Zoom}
            maxWidth={maxWidth}
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '1.25rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{
                m: 0,
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f1f5f9',
                bgcolor: '#f8fafc'
            }}>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                    {title}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                        '&:hover': {
                            bgcolor: '#f1f5f9',
                            color: 'error.main'
                        }
                    }}
                >
                    <Icon name="x" size="sm" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, mt: 1 }}>
                <Box>
                    {children}
                </Box>
            </DialogContent>

            {footer && (
                <DialogActions sx={{
                    p: 3,
                    borderTop: '1px solid #f1f5f9',
                    bgcolor: '#f8fafc'
                }}>
                    {footer}
                </DialogActions>
            )}
        </Dialog>
    );
};

export default Modal;
