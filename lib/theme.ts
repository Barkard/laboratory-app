'use client';

import { createTheme } from '@mui/material/styles';
import type { } from '@mui/x-data-grid/themeAugmentation';

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
            paper: 'rgba(15, 23, 42, 0.4)', // slate-900 transparent
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
                    backgroundColor: 'rgba(15, 23, 42, 0.4)', // slate-900 transparent
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '1.25rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.4)', // slate-900 transparent
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(51, 65, 85, 0.6)', // slate-700 transparent
                        borderRadius: '0.75rem',
                        color: '#ffffff',
                        '& fieldset': {
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(56, 189, 248, 0.3)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#38bdf8',
                        },
                    },
                },
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    border: 'none',
                    backgroundColor: 'transparent',
                    '--DataGrid-containerBackground': 'transparent',
                },
                columnHeaders: {
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(8px)',
                    color: 'white',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                },
                columnHeaderTitle: {
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                },
                cell: {
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#e2e8f0',
                    backgroundColor: 'transparent',
                },
                row: {
                    backgroundColor: 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(56, 189, 248, 0.06) !important',
                        transform: 'translateX(2px)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(56, 189, 248, 0.1) !important',
                        '&:hover': {
                            backgroundColor: 'rgba(56, 189, 248, 0.15) !important',
                        },
                    },
                },
                footerContainer: {
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8',
                },
                toolbarContainer: {
                    backgroundColor: 'transparent',
                },
                virtualScroller: {
                    backgroundColor: 'transparent',
                },
            },
        },
    },
});

export default theme;
