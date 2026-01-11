'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    Checkbox,
    FormControlLabel,
    CircularProgress,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    Login as LoginIcon,
} from '@mui/icons-material';
import { useAuth } from '@/components/AuthContext';

export default function LoginPage() {
    const classes = useStyles();
    const router = useRouter();
    const { user, loading: authLoading, login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login(email, password);
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <Box className={classes.loadingContainer}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box className={classes.root}>
            {/* Background decoration */}
            <Box className={classes.backgroundDecoTop} />
            <Box className={classes.backgroundDecoBottom} />

            <Card className={classes.card}>
                <CardContent className={classes.cardContent}>
                    {/* Logo/Brand */}
                    <Box className={classes.brandSection}>
                        <Box className={classes.logoIcon}>
                            <LoginIcon className={classes.loginIconWhite} />
                        </Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Welcome Back
                        </Typography>
                        <Typography color="text.secondary">
                            Sign in to your CRM account
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" className={classes.errorAlert} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={classes.emailField}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon className={classes.inputIcon} />
                                    </InputAdornment>
                                ),
                            }}
                            placeholder="admin@crm.com"
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={classes.passwordField}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon className={classes.inputIcon} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            size="small"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            placeholder="••••••••"
                        />

                        <Box className={classes.rememberRow}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label={<Typography variant="body2">Remember me</Typography>}
                            />
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isLoading}
                            className={classes.submitButton}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                    </form>

                    {/* Demo credentials hint */}
                    <Box className={classes.demoCredentials}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Demo Credentials:
                        </Typography>
                        <Typography variant="body2" className={classes.monoText}>
                            admin@crm.com / admin123
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: theme.spacing(2),
    },
    loadingContainer: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    },
    backgroundDecoTop: {
        position: 'fixed',
        top: '-50%',
        right: '-20%',
        width: '60vw',
        height: '60vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    backgroundDecoBottom: {
        position: 'fixed',
        bottom: '-30%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    card: {
        width: '100%',
        maxWidth: 420,
        position: 'relative',
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: theme.spacing(3),
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    },
    cardContent: {
        padding: theme.spacing(4),
    },
    brandSection: {
        textAlign: 'center',
        marginBottom: theme.spacing(4),
    },
    logoIcon: {
        width: 64,
        height: 64,
        borderRadius: theme.spacing(2),
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        marginBottom: theme.spacing(2),
        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
    },
    loginIconWhite: {
        fontSize: 32,
        color: 'white',
    },
    errorAlert: {
        marginBottom: theme.spacing(3),
    },
    emailField: {
        marginBottom: theme.spacing(2.5),
    },
    passwordField: {
        marginBottom: theme.spacing(2),
    },
    inputIcon: {
        color: theme.palette.text.secondary,
    },
    rememberRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing(3),
    },
    submitButton: {
        paddingTop: theme.spacing(1.5),
        paddingBottom: theme.spacing(1.5),
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
        '&:hover': {
            background: 'linear-gradient(135deg, #5558e3 0%, #7c4ddb 100%)',
            boxShadow: '0 15px 35px rgba(99, 102, 241, 0.4)',
        },
    },
    demoCredentials: {
        marginTop: theme.spacing(4),
        padding: theme.spacing(2),
        borderRadius: theme.spacing(2),
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
    },
    monoText: {
        fontFamily: 'monospace',
    },
}));
