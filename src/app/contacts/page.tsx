'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
    Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, IconButton, Chip, Typography, Tooltip, CircularProgress,
    Snackbar, Alert, Avatar,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import { GET_CONTACTS, GET_COMPANIES, CREATE_CONTACT, UPDATE_CONTACT, DELETE_CONTACT } from '@/graphql/operations';
import { MainLayout } from '@/components/MainLayout';

const STATUS_OPTIONS = [
    { value: 'LEAD', label: 'Lead', color: '#6366f1' },
    { value: 'PROSPECT', label: 'Prospect', color: '#8b5cf6' },
    { value: 'CUSTOMER', label: 'Customer', color: '#10b981' },
    { value: 'CHURNED', label: 'Churned', color: '#ef4444' },
];

interface FormData {
    firstName: string; lastName: string; email: string; phone: string; jobTitle: string; status: string; companyId: string;
}

const initialForm: FormData = { firstName: '', lastName: '', email: '', phone: '', jobTitle: '', status: 'LEAD', companyId: '' };

export default function ContactsPage() {
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>(initialForm);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const { loading, data, refetch } = useQuery(GET_CONTACTS);
    const { data: companiesData } = useQuery(GET_COMPANIES);
    const [createContact, { loading: creating }] = useMutation(CREATE_CONTACT);
    const [updateContact, { loading: updating }] = useMutation(UPDATE_CONTACT);
    const [deleteContact] = useMutation(DELETE_CONTACT);

    const handleOpen = (row?: any) => {
        if (row) {
            setEditId(row.id);
            setForm({ firstName: row.firstName, lastName: row.lastName, email: row.email, phone: row.phone || '', jobTitle: row.jobTitle || '', status: row.status, companyId: row.company?.id || '' });
        } else {
            setEditId(null);
            setForm(initialForm);
        }
        setOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const input = { ...form, phone: form.phone || null, jobTitle: form.jobTitle || null, companyId: form.companyId || null };
            if (editId) {
                await updateContact({ variables: { id: editId, input } });
                setSnackbar({ open: true, message: 'Contact updated!', severity: 'success' });
            } else {
                await createContact({ variables: { input } });
                setSnackbar({ open: true, message: 'Contact created!', severity: 'success' });
            }
            setOpen(false);
            refetch();
        } catch (e: any) {
            setSnackbar({ open: true, message: e.message, severity: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this contact?')) {
            await deleteContact({ variables: { id } });
            setSnackbar({ open: true, message: 'Contact deleted!', severity: 'success' });
            refetch();
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'name', headerName: 'Name', flex: 1, minWidth: 200,
            renderCell: (p: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', fontSize: '0.875rem' }}>
                        {p.row.firstName?.[0]}{p.row.lastName?.[0]}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={500}>{p.row.firstName} {p.row.lastName}</Typography>
                        <Typography variant="caption" color="text.secondary">{p.row.jobTitle || 'No title'}</Typography>
                    </Box>
                </Box>
            ),
        },
        {
            field: 'email', headerName: 'Email', flex: 1, minWidth: 200,
            renderCell: (p: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />{p.value}</Box>
            ),
        },
        { field: 'phone', headerName: 'Phone', flex: 0.8, minWidth: 140, renderCell: (p: GridRenderCellParams) => p.value || '—' },
        { field: 'company', headerName: 'Company', flex: 0.8, minWidth: 150, valueGetter: (p: any) => p.row.company?.name || '—' },
        {
            field: 'status', headerName: 'Status', width: 120,
            renderCell: (p: GridRenderCellParams) => {
                const s = STATUS_OPTIONS.find((o) => o.value === p.value);
                return <Chip label={s?.label || p.value} size="small" sx={{ bgcolor: s?.color, color: 'white' }} />;
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
                        <Typography variant="h4" fontWeight={700}>Contacts</Typography>
                        <Typography color="text.secondary">Manage your contacts and leads</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Add Contact</Button>
                </Box>

                <Card>
                    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        <DataGrid rows={data?.contacts || []} columns={columns} loading={loading} autoHeight pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} disableRowSelectionOnClick sx={{ border: 'none', minHeight: 400 }} />
                    </CardContent>
                </Card>

                <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>{editId ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} fullWidth required />
                                <TextField label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} fullWidth required />
                            </Box>
                            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth required />
                            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth />
                            <TextField label="Job Title" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} fullWidth />
                            <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} fullWidth>
                                {STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                            </TextField>
                            <TextField select label="Company" value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })} fullWidth>
                                <MenuItem value="">None</MenuItem>
                                {companiesData?.companies?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleSubmit} disabled={creating || updating || !form.firstName || !form.lastName || !form.email}>
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
