'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
    Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, IconButton, Chip, Typography, Tooltip, CircularProgress,
    Snackbar, Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Language as WebIcon } from '@mui/icons-material';
import { GET_COMPANIES, CREATE_COMPANY, UPDATE_COMPANY, DELETE_COMPANY } from '@/graphql/operations';
import { MainLayout } from '@/components/MainLayout';

const SIZE_OPTIONS = [
    { value: 'STARTUP', label: 'Startup', color: '#10b981' },
    { value: 'SMALL', label: 'Small', color: '#6366f1' },
    { value: 'MEDIUM', label: 'Medium', color: '#8b5cf6' },
    { value: 'LARGE', label: 'Large', color: '#ec4899' },
    { value: 'ENTERPRISE', label: 'Enterprise', color: '#f59e0b' },
];

interface FormData { name: string; industry: string; website: string; size: string; address: string; }
const initialForm: FormData = { name: '', industry: '', website: '', size: '', address: '' };

export default function CompaniesPage() {
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>(initialForm);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const { loading, data, refetch } = useQuery(GET_COMPANIES);
    const [createCompany, { loading: creating }] = useMutation(CREATE_COMPANY);
    const [updateCompany, { loading: updating }] = useMutation(UPDATE_COMPANY);
    const [deleteCompany] = useMutation(DELETE_COMPANY);

    const handleOpen = (row?: any) => {
        if (row) {
            setEditId(row.id);
            setForm({ name: row.name, industry: row.industry || '', website: row.website || '', size: row.size || '', address: row.address || '' });
        } else {
            setEditId(null);
            setForm(initialForm);
        }
        setOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const input = { name: form.name, industry: form.industry || null, website: form.website || null, size: form.size || null, address: form.address || null };
            if (editId) {
                await updateCompany({ variables: { id: editId, input } });
                setSnackbar({ open: true, message: 'Company updated!', severity: 'success' });
            } else {
                await createCompany({ variables: { input } });
                setSnackbar({ open: true, message: 'Company created!', severity: 'success' });
            }
            setOpen(false);
            refetch();
        } catch (e: any) {
            setSnackbar({ open: true, message: e.message, severity: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this company?')) {
            await deleteCompany({ variables: { id } });
            setSnackbar({ open: true, message: 'Company deleted!', severity: 'success' });
            refetch();
        }
    };

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Company Name', flex: 1, minWidth: 200 },
        { field: 'industry', headerName: 'Industry', flex: 0.8, minWidth: 150, renderCell: (p: GridRenderCellParams) => p.value || '—' },
        {
            field: 'website', headerName: 'Website', flex: 1, minWidth: 200,
            renderCell: (p: GridRenderCellParams) => p.value ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WebIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'primary.main' }}>{p.value}</Typography>
                </Box>
            ) : '—',
        },
        {
            field: 'size', headerName: 'Size', width: 130,
            renderCell: (p: GridRenderCellParams) => {
                const s = SIZE_OPTIONS.find((o) => o.value === p.value);
                return s ? <Chip label={s.label} size="small" sx={{ bgcolor: s.color, color: 'white' }} /> : '—';
            },
        },
        {
            field: 'actions', headerName: '', width: 100, sortable: false,
            renderCell: (p: GridRenderCellParams) => (
                <>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(p.row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(p.row.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </>
            ),
        },
    ];

    return (
        <MainLayout>
            <Box className="animate-fade-in">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>Companies</Typography>
                        <Typography color="text.secondary">Manage your company accounts</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Add Company</Button>
                </Box>

                <Card>
                    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        <DataGrid rows={data?.companies || []} columns={columns} loading={loading} autoHeight pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} disableRowSelectionOnClick sx={{ border: 'none', minHeight: 400 }} />
                    </CardContent>
                </Card>

                <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>{editId ? 'Edit Company' : 'Add Company'}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField label="Company Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth required />
                            <TextField label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} fullWidth />
                            <TextField label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} fullWidth />
                            <TextField select label="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} fullWidth>
                                <MenuItem value="">Not specified</MenuItem>
                                {SIZE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                            </TextField>
                            <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} fullWidth multiline rows={2} />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleSubmit} disabled={creating || updating || !form.name}>
                            {creating || updating ? <CircularProgress size={20} /> : editId ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
                </Snackbar>
            </Box>
        </MainLayout>
    );
}
