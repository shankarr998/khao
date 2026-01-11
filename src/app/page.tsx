'use client';

import { useQuery } from '@apollo/client';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Skeleton,
    Chip,
    Avatar,
    alpha,
} from '@mui/material';
import {
    People as PeopleIcon,
    Business as BusinessIcon,
    TrendingUp as DealsIcon,
    AttachMoney as MoneyIcon,
    CheckCircle as WonIcon,
    Cancel as LostIcon,
    Schedule as ScheduleIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { GET_DASHBOARD_STATS } from '@/graphql/operations';
import { MainLayout } from '@/components/MainLayout';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

const StatsCard = ({ title, value, icon, color }: StatsCardProps) => (
    <Card>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar
                    sx={{
                        width: 56,
                        height: 56,
                        background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                        boxShadow: `0 8px 20px ${alpha(color, 0.4)}`,
                    }}
                >
                    {icon}
                </Avatar>
                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                        {value}
                    </Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const STAGE_COLORS: Record<string, string> = {
    QUALIFICATION: '#6366f1',
    DISCOVERY: '#8b5cf6',
    PROPOSAL: '#ec4899',
    NEGOTIATION: '#f59e0b',
    CLOSED_WON: '#10b981',
    CLOSED_LOST: '#ef4444',
};

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
};

const formatStageName = (stage: string) =>
    stage.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');

export default function Dashboard() {
    const { loading, error, data } = useQuery(GET_DASHBOARD_STATS);

    if (loading) {
        return (
            <MainLayout>
                <Box sx={{ p: 2 }}>
                    <Grid container spacing={3}>
                        {[...Array(4)].map((_, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Skeleton variant="rounded" height={140} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="error" variant="h6">Failed to load dashboard</Typography>
                    <Typography color="text.secondary">Please ensure the database is connected</Typography>
                </Box>
            </MainLayout>
        );
    }

    const stats = data?.dashboardStats;
    const dealsByStage = data?.dealsByStage || [];

    const pieData = dealsByStage
        .filter((d: any) => d.count > 0)
        .map((d: any) => ({
            name: formatStageName(d.stage),
            value: d.count,
            color: STAGE_COLORS[d.stage],
        }));

    const barData = dealsByStage.map((d: any) => ({
        name: formatStageName(d.stage).split(' ')[0],
        value: d.value,
        color: STAGE_COLORS[d.stage],
    }));

    return (
        <MainLayout>
            <Box className="animate-fade-in">
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Welcome back! 👋
                    </Typography>
                    <Typography color="text.secondary">
                        Here's what's happening with your sales pipeline today.
                    </Typography>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard title="Total Contacts" value={stats?.totalContacts || 0} icon={<PeopleIcon />} color="#6366f1" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard title="Total Companies" value={stats?.totalCompanies || 0} icon={<BusinessIcon />} color="#8b5cf6" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard title="Open Deals" value={stats?.openDeals || 0} icon={<DealsIcon />} color="#ec4899" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard title="Pipeline Value" value={formatCurrency(stats?.totalDealValue || 0)} icon={<MoneyIcon />} color="#10b981" />
                    </Grid>
                </Grid>

                {/* Secondary Stats */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'success.dark', color: 'white' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <WonIcon />
                                <Box>
                                    <Typography variant="h5" fontWeight={700}>{stats?.wonDeals || 0}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Won Deals</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'error.dark', color: 'white' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <LostIcon />
                                <Box>
                                    <Typography variant="h5" fontWeight={700}>{stats?.lostDeals || 0}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Lost Deals</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'primary.dark', color: 'white' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <ScheduleIcon />
                                <Box>
                                    <Typography variant="h5" fontWeight={700}>{stats?.upcomingActivities || 0}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Upcoming Tasks</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: 'warning.dark', color: 'white' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <WarningIcon />
                                <Box>
                                    <Typography variant="h5" fontWeight={700}>{stats?.overdueActivities || 0}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Overdue Tasks</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Charts */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} gutterBottom>Deal Value by Stage</Typography>
                                <Box sx={{ height: 300, mt: 2 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="name" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" tickFormatter={(v) => formatCurrency(v)} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                                formatter={(value: number) => [formatCurrency(value), 'Value']}
                                            />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="url(#colorGradient)" />
                                            <defs>
                                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#6366f1" />
                                                    <stop offset="100%" stopColor="#8b5cf6" />
                                                </linearGradient>
                                            </defs>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} gutterBottom>Deals by Stage</Typography>
                                <Box sx={{ height: 220, mt: 2 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                                                {pieData.map((entry: any, index: number) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    {pieData.map((entry: any) => (
                                        <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: entry.color }} />
                                                <Typography variant="body2">{entry.name}</Typography>
                                            </Box>
                                            <Chip size="small" label={entry.value} />
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </MainLayout>
    );
}
