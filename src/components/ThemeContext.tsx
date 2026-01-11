'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeMode() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within a ThemeContextProvider');
    }
    return context;
}

// Groww-inspired color palette
const getDesignTokens = (mode: ThemeMode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Light mode - Groww inspired
                primary: {
                    main: '#00D09C',
                    light: '#33DAB0',
                    dark: '#00A87D',
                    contrastText: '#FFFFFF',
                },
                secondary: {
                    main: '#5367FF',
                    light: '#7585FF',
                    dark: '#3D4DB8',
                },
                success: {
                    main: '#00D09C',
                    light: '#33DAB0',
                    dark: '#00A87D',
                },
                warning: {
                    main: '#F2994A',
                    light: '#F5AD6E',
                    dark: '#D97F33',
                },
                error: {
                    main: '#EB5757',
                    light: '#EF7979',
                    dark: '#D63C3C',
                },
                background: {
                    default: '#F5F5F5',
                    paper: '#FFFFFF',
                },
                text: {
                    primary: '#44475B',
                    secondary: '#7C7E8C',
                },
                divider: alpha('#44475B', 0.12),
            }
            : {
                // Dark mode - Groww dark inspired
                primary: {
                    main: '#00D09C',
                    light: '#33DAB0',
                    dark: '#00A87D',
                    contrastText: '#FFFFFF',
                },
                secondary: {
                    main: '#5367FF',
                    light: '#7585FF',
                    dark: '#3D4DB8',
                },
                success: {
                    main: '#00D09C',
                    light: '#33DAB0',
                    dark: '#00A87D',
                },
                warning: {
                    main: '#F2994A',
                    light: '#F5AD6E',
                    dark: '#D97F33',
                },
                error: {
                    main: '#EB5757',
                    light: '#EF7979',
                    dark: '#D63C3C',
                },
                background: {
                    default: '#0D0D11',
                    paper: '#141519',
                },
                text: {
                    primary: '#FFFFFF',
                    secondary: '#9CA3AF',
                },
                divider: alpha('#FFFFFF', 0.08),
            }),
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.02em' },
        h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.01em' },
        h3: { fontWeight: 600, fontSize: '1.5rem' },
        h4: { fontWeight: 600, fontSize: '1.25rem' },
        h5: { fontWeight: 600, fontSize: '1.1rem' },
        h6: { fontWeight: 600, fontSize: '1rem' },
        button: { textTransform: 'none' as const, fontWeight: 500 },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 20px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { transform: 'translateY(-1px)' },
                },
                contained: {
                    background: 'linear-gradient(135deg, #00D09C 0%, #00A87D 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #00A87D 0%, #008C68 100%)' },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    backgroundImage: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
                        : 'none',
                    backdropFilter: theme.palette.mode === 'dark' ? 'blur(10px)' : 'none',
                    border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.06)'
                        : '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: theme.palette.mode === 'dark'
                        ? 'none'
                        : '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 8px 30px rgba(0, 0, 0, 0.4)'
                            : '0 8px 24px rgba(0, 0, 0, 0.08)',
                    },
                }),
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: ({ theme }: any) => ({
                    backgroundColor: theme.palette.mode === 'dark' ? '#141519' : '#FFFFFF',
                    borderRight: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.06)'
                        : '1px solid rgba(0, 0, 0, 0.08)',
                }),
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    borderRadius: 8,
                    margin: '4px 8px',
                    '&.Mui-selected': {
                        background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(0, 208, 156, 0.15) 0%, rgba(0, 168, 125, 0.08) 100%)'
                            : 'linear-gradient(135deg, rgba(0, 208, 156, 0.12) 0%, rgba(0, 168, 125, 0.06) 100%)',
                        borderLeft: '3px solid #00D09C',
                        '&:hover': {
                            background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, rgba(0, 208, 156, 0.2) 0%, rgba(0, 168, 125, 0.12) 100%)'
                                : 'linear-gradient(135deg, rgba(0, 208, 156, 0.18) 0%, rgba(0, 168, 125, 0.10) 100%)',
                        },
                    },
                }),
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                        borderColor: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.06)',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.03)'
                            : 'rgba(0, 0, 0, 0.02)',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(0, 208, 156, 0.08)'
                            : 'rgba(0, 208, 156, 0.04)',
                    },
                }),
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: ({ theme }: any) => ({
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.12)'
                                : 'rgba(0, 0, 0, 0.12)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(0, 208, 156, 0.5)',
                        },
                    },
                }),
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: ({ theme }: any) => ({
                    backgroundImage: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(20, 21, 25, 0.95) 0%, rgba(13, 13, 17, 0.98) 100%)'
                        : 'none',
                    backgroundColor: theme.palette.mode === 'dark' ? '#141519' : '#FFFFFF',
                    backdropFilter: 'blur(20px)',
                    border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.06)'
                        : '1px solid rgba(0, 0, 0, 0.06)',
                }),
            },
        },
    },
});

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedMode = localStorage.getItem('khao-theme-mode') as ThemeMode;
        if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
            setMode(savedMode);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setMode(prefersDark ? 'dark' : 'light');
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('khao-theme-mode', mode);
            document.documentElement.setAttribute('data-theme', mode);
        }
    }, [mode, mounted]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    const contextValue = useMemo(
        () => ({ mode, toggleTheme, setMode }),
        [mode]
    );

    // Prevent flash of wrong theme
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={contextValue}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}
