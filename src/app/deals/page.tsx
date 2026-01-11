'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
    Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, IconButton, Chip, Typography, Tooltip, CircularProgress,
    Snackbar, Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { GET_DEALS, GET_CONTACTS, GET_COMPANIES, CREATE_DEAL, UPDATE_DEAL, DELETE_DEAL } from '@/graphql/operations';
import { MainLayout } from '@/components/MainLayout';

const STAGE_OPTIONS = [
    { value: 'QUALIFICATION', label: 'Qualification', color: '#6366f1' },
    { value: 'DISCOVERY', label: 'Discovery', color: '#8b5cf6' },
    { value: 'PROPOSAL', label: 'Proposal', color: '#ec4899' },
    { value: 'NEGOTIATION', label: 'Negotiation', color: '#f59e0b' },
    { value: 'CLOSED_WON', label: 'Closed Won', color: '#10b981' },
    { value: 'CLOSED_LOST', label: 'Closed Lost', color: '#ef4444' },
];

interface FormData { title: string; value: string; currency: string; stage: string; probability: string; closeDate: string; contactId: string; companyId: string; }
const initialForm: FormData = { title: '', value: '', currency: 'USD', stage: 'QUALIFICATION', probability: '10', closeDate: '', contactId: '', companyId: '' };

const formatCurrency = (v: number, c: string = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(v);

export default function DealsPage() {
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>(initialForm);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const { loading, data, refetch } = useQuery(GET_DEALS);
    const { data: contactsData } = useQuery(GET_CONTACTS);
    const { data: companiesData } = useQuery(GET_COMPANIES);
    const [createDeal, { loading: creating }] = useMutation(CREATE_DEAL);
    const [updateDeal, { loading: updating }] = useMutation(UPDATE_DEAL);
    const [deleteDeal] = useMutation(DELETE_DEAL);

    const handleOpen = (row?: any) => {
        if (row) {
            setEditId(row.id);
            setForm({ title: row.title, value: String(row.value), currency: row.currency, stage: row.stage, probability: String(row.probability), closeDate: row.closeDate?.split('T')[0] || '', contactId: row.contact?.id || '', companyId: row.company?.id || '' });
        } else {
            setEditId(null);
            setForm(initialForm);
        }
        setOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const input = { title: form.title, value: parseFloat(form.value), currency: form.currency, stage: form.stage, probability: parseInt(form.probability), closeDate: form.closeDate || null, contactId: form.contactId || null, companyId: form.companyId || null };
            if (editId) {
                await updateDeal({ variables: { id: editId, input } });
                setSnackbar({ open: true, message: 'Deal updated!', severity: 'success' });
            } else {
                await createDeal({ variables: { input } });
                setSnackbar({ open: true, message: 'Deal created!', severity: 'success' });
            }
            setOpen(false);
            refetch();
        } catch (e: any) {
            setSnackbar({ open: true, message: e.message, severity: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this deal?')) {
            await deleteDeal({ variables: { id } });
            setSnackbar({ open: true, message: 'Deal deleted!', severity: 'success' });
            refetch();
        }
    };

    const columns: GridColDef[] = [
        { field: 'title', headerName: 'Deal Title', flex: 1, minWidth: 200 },
        { field: 'value', headerName: 'Value', width: 130, renderCell: (p: GridRenderCellParams) => formatCurrency(p.value, p.row.currency) },
        {
            field: 'stage', headerName: 'Stage', width: 140,
            renderCell: (p: GridRenderCellParams) => {
                const s = STAGE_OPTIONS.find((o) => o.value === p.value);
                return <Chip label={s?.label || p.value} size="small" sx={{ bgcolor: s?.color, color: 'white' }} />;
            },
        },
        { field: 'probability', headerName: 'Prob.', width: 80, renderCell: (p: GridRenderCellParams) => `${p.value}%` },
        { field: 'contact', headerName: 'Contact', flex: 0.8, valueGetter: (p: any) => p.row.contact ? `${p.row.contact.firstName} ${p.row.contact.lastName}` : '—' },
        { field: 'company', headerName: 'Company', flex: 0.8, valueGetter: (p: any) => p.row.company?.name || '—' },
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
                        <Typography variant="h4" fontWeight={700}>Deals</Typography>
                        <Typography color="text.secondary">Track your sales pipeline</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Add Deal</Button>
                </Box>

                <Card>
                    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        <DataGrid rows={data?.deals || []} columns={columns} loading={loading} autoHeight pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} disableRowSelectionOnClick sx={{ border: 'none', minHeight: 400 }} />
                    </CardContent>
                </Card>

                <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>{editId ? 'Edit Deal' : 'Add Deal'}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField label="Deal Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth required />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField label="Value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} fullWidth required />
                                <TextField select label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} sx={{ minWidth: 100 }}>
                                    <MenuItem value="USD">USD</MenuItem>
                                    <MenuItem value="EUR">EUR</MenuItem>
                                    <MenuItem value="GBP">GBP</MenuItem>
                                </TextField>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField select label="Stage" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} fullWidth>
                                    {STAGE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                                <TextField label="Probability %" type="number" value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} sx={{ minWidth: 120 }} />
                            </Box>
                            <TextField label="Close Date" type="date" value={form.closeDate} onChange={(e) => setForm({ ...form, closeDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
                            <TextField select label="Contact" value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })} fullWidth>
                                <MenuItem value="">None</MenuItem>
                                {contactsData?.contacts?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</MenuItem>)}
                            </TextField>
                            <TextField select label="Company" value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })} fullWidth>
                                <MenuItem value="">None</MenuItem>
                                {companiesData?.companies?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleSubmit} disabled={creating || updating || !form.title || !form.value}>
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
