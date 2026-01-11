'use client';

import { Box } from '@mui/material';
import { Sidebar } from '@/components/Sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    overflow: 'auto',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
