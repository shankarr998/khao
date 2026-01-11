'use client';

import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Sidebar } from '@/components/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const classes = useStyles();

    return (
        <ProtectedRoute>
            <Box className={classes.root}>
                <Sidebar />
                <Box component="main" className={classes.main}>
                    {children}
                </Box>
            </Box>
        </ProtectedRoute>
    );
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: 'flex',
        minHeight: '100vh',
    },
    main: {
        flexGrow: 1,
        padding: theme.spacing(3),
        overflow: 'auto',
    },
}));
