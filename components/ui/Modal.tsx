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
                    borderRadius: '1.5rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', // slate-900 with high opacity
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden',
                    color: 'white'
                }
            }}
        >
            <DialogTitle sx={{
                m: 0,
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                bgcolor: 'rgba(15, 23, 42, 0.3)'
            }}>
                <Typography variant="h6" component="span" fontWeight={700} color="#d1d5dc">
                    {title}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444' // red-500
                        }
                    }}
                >
                    <Icon name="x" size="sm" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{
                p: 4,
                mt: 1,
                maxHeight: '70vh',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.05)',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                },
            }}>
                <Box>
                    {children}
                </Box>
            </DialogContent>

            {footer && (
                <DialogActions sx={{
                    p: 3,
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    bgcolor: 'rgba(15, 23, 42, 0.3)'
                }}>
                    {footer}
                </DialogActions>
            )}
        </Dialog>
    );
};

export default Modal;
