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
    IconButton,
    Tooltip,
    Skeleton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Business as BusinessIcon,
    TrendingUp as DealsIcon,
    Task as TaskIcon,
    Logout as LogoutIcon,
    LightMode as LightModeIcon,
    DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { useAuth } from '@/components/AuthContext';
import { useThemeMode } from '@/components/ThemeContext';

const drawerWidth = 260;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Contacts', icon: <PeopleIcon />, path: '/contacts' },
    { text: 'Companies', icon: <BusinessIcon />, path: '/companies' },
    { text: 'Deals', icon: <DealsIcon />, path: '/deals' },
    { text: 'Activities', icon: <TaskIcon />, path: '/activities' },
];

export function Sidebar() {
    const classes = useStyles();
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const { mode, toggleTheme } = useThemeMode();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const getInitials = () => {
        if (!user) return 'U';
        return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    };

    const getRoleDisplay = () => {
        if (!user) return 'User';
        const roles: Record<string, string> = {
            admin: 'Administrator',
            user: 'User',
            viewer: 'Viewer',
        };
        return roles[user.role] || user.role;
    };

    return (
        <Drawer variant="permanent" className={classes.drawer}>
            <Box className={classes.container}>
                {/* Logo */}
                <Box className={classes.header}>
                    <Box className={classes.logoWrapper}>
                        <Box className={classes.logoIcon}>K</Box>
                        <Box>
                            <Typography variant="h6" fontWeight={700} className={classes.logoTitle}>
                                Khao
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Sales Simplified
                            </Typography>
                        </Box>
                    </Box>
                    <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                        <IconButton
                            onClick={toggleTheme}
                            size="small"
                            className={classes.themeToggle}
                        >
                            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Navigation */}
                <List className={classes.navList}>
                    {menuItems.map((item) => (
                        <ListItemButton
                            key={item.text}
                            selected={pathname === item.path}
                            onClick={() => router.push(item.path)}
                            className={classes.navItem}
                        >
                            <ListItemIcon
                                className={pathname === item.path ? classes.navIconActive : classes.navIconInactive}
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
                <Box className={classes.userSection}>
                    {loading ? (
                        <>
                            <Skeleton variant="circular" width={36} height={36} />
                            <Box className={classes.skeletonWrapper}>
                                <Skeleton width={80} height={20} />
                                <Skeleton width={60} height={16} />
                            </Box>
                        </>
                    ) : user ? (
                        <>
                            <Avatar
                                src={user.avatarUrl || undefined}
                                className={classes.avatar}
                            >
                                {getInitials()}
                            </Avatar>
                            <Box className={classes.userInfoWrapper}>
                                <Typography variant="body2" fontWeight={500} noWrap>
                                    {user.firstName} {user.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    {getRoleDisplay()}
                                </Typography>
                            </Box>
                            <Tooltip title="Logout">
                                <IconButton
                                    size="small"
                                    onClick={handleLogout}
                                    className={classes.logoutButton}
                                >
                                    <LogoutIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Not logged in
                        </Typography>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}

const useStyles = makeStyles((theme: Theme) => ({
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
        },
    },
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: theme.spacing(3),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: theme.palette.mode === 'dark'
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid rgba(0,0,0,0.08)',
    },
    logoWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(2),
    },
    logoIcon: {
        width: 42,
        height: 42,
        borderRadius: theme.spacing(1),
        background: 'linear-gradient(135deg, #00D09C 0%, #00A87D 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '1.3rem',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0, 208, 156, 0.3)',
    },
    logoTitle: {
        lineHeight: 1.2,
    },
    themeToggle: {
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.04)',
        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.08)',
            color: theme.palette.primary.main,
        },
    },
    navList: {
        flex: 1,
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    navItem: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(0.5),
        marginBottom: theme.spacing(0.5),
    },
    navIconActive: {
        color: theme.palette.primary.main,
        minWidth: 40,
    },
    navIconInactive: {
        color: theme.palette.text.secondary,
        minWidth: 40,
    },
    userSection: {
        padding: theme.spacing(2),
        borderTop: theme.palette.mode === 'dark'
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(2),
    },
    userInfoWrapper: {
        flex: 1,
        minWidth: 0,
    },
    skeletonWrapper: {
        flex: 1,
    },
    avatar: {
        width: 36,
        height: 36,
        background: 'linear-gradient(135deg, #00D09C 0%, #00A87D 100%)',
        fontSize: '0.875rem',
        fontWeight: 600,
    },
    logoutButton: {
        color: theme.palette.text.secondary,
        '&:hover': {
            color: theme.palette.error.main,
            backgroundColor: 'rgba(235, 87, 87, 0.1)',
        },
    },
}));
