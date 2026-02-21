'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2563eb', // blue-600
        },
        secondary: {
            main: '#64748b', // slate-500
        },
        background: {
            default: '#f8fafc', // slate-50
        },
    },
    typography: {
        fontFamily: 'var(--font-geist-sans), sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '0.75rem', // 12px
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '1rem', // 16px
                },
            },
        },
    },
});

export default theme;
