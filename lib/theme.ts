'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#38bdf8', // sky-400 (celeste for better contrast on dark)
            light: '#7dd3fc',
            dark: '#0ea5e9',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#94a3b8', // slate-400
        },
        background: {
            default: '#0f172a', // slate-900
            paper: '#111827', // gray-900
        },
        text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
        }
    },
    typography: {
        fontFamily: 'var(--font-geist-sans), sans-serif',
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '0.875rem',
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '8px 20px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px -4px rgba(14, 165, 233, 0.3)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '1.25rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '1.25rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                },
            },
        },
    },
});

export default theme;
