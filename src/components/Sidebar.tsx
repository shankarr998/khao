'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Avatar,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Business as BusinessIcon,
    TrendingUp as DealsIcon,
    Task as TaskIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Contacts', icon: <PeopleIcon />, path: '/contacts' },
    { text: 'Companies', icon: <BusinessIcon />, path: '/companies' },
    { text: 'Deals', icon: <DealsIcon />, path: '/deals' },
    { text: 'Activities', icon: <TaskIcon />, path: '/activities' },
];

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Logo */}
                <Box
                    sx={{
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1.2rem',
                            color: 'white',
                        }}
                    >
                        C
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                            CRM Pro
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Manage & Grow
                        </Typography>
                    </Box>
                </Box>

                {/* Navigation */}
                <List sx={{ flex: 1, py: 2 }}>
                    {menuItems.map((item) => (
                        <ListItemButton
                            key={item.text}
                            selected={pathname === item.path}
                            onClick={() => router.push(item.path)}
                            sx={{ mx: 1, my: 0.5 }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: pathname === item.path ? 'primary.main' : 'text.secondary',
                                    minWidth: 40,
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: pathname === item.path ? 600 : 400,
                                }}
                            />
                        </ListItemButton>
                    ))}
                </List>

                {/* User */}
                <Box
                    sx={{
                        p: 2,
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        }}
                    >
                        U
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={500}>
                            Admin User
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Administrator
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Drawer>
    );
}
