'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
    Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, IconButton, Chip, Typography, Tooltip, CircularProgress,
    Snackbar, Alert, Checkbox,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Call, Email, Event, Task } from '@mui/icons-material';
import { GET_ACTIVITIES, GET_CONTACTS, GET_DEALS, CREATE_ACTIVITY, UPDATE_ACTIVITY, DELETE_ACTIVITY } from '@/graphql/operations';
import { MainLayout } from '@/components/MainLayout';

const TYPE_OPTIONS = [
    { value: 'TASK', label: 'Task', icon: <Task fontSize="small" />, color: '#6366f1' },
    { value: 'CALL', label: 'Call', icon: <Call fontSize="small" />, color: '#10b981' },
    { value: 'EMAIL', label: 'Email', icon: <Email fontSize="small" />, color: '#ec4899' },
    { value: 'MEETING', label: 'Meeting', icon: <Event fontSize="small" />, color: '#f59e0b' },
];

interface FormData { type: string; subject: string; description: string; dueDate: string; contactId: string; dealId: string; }
const initialForm: FormData = { type: 'TASK', subject: '', description: '', dueDate: '', contactId: '', dealId: '' };

export default function ActivitiesPage() {
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>(initialForm);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const { loading, data, refetch } = useQuery(GET_ACTIVITIES);
    const { data: contactsData } = useQuery(GET_CONTACTS);
    const { data: dealsData } = useQuery(GET_DEALS);
    const [createActivity, { loading: creating }] = useMutation(CREATE_ACTIVITY);
    const [updateActivity, { loading: updating }] = useMutation(UPDATE_ACTIVITY);
    const [deleteActivity] = useMutation(DELETE_ACTIVITY);

    const handleOpen = (row?: any) => {
        if (row) {
            setEditId(row.id);
            setForm({ type: row.type, subject: row.subject, description: row.description || '', dueDate: row.dueDate?.split('T')[0] || '', contactId: row.contact?.id || '', dealId: row.deal?.id || '' });
        } else {
            setEditId(null);
            setForm(initialForm);
        }
        setOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const input = { type: form.type, subject: form.subject, description: form.description || null, dueDate: form.dueDate || null, contactId: form.contactId || null, dealId: form.dealId || null };
            if (editId) {
                await updateActivity({ variables: { id: editId, input } });
                setSnackbar({ open: true, message: 'Activity updated!', severity: 'success' });
            } else {
                await createActivity({ variables: { input } });
                setSnackbar({ open: true, message: 'Activity created!', severity: 'success' });
            }
            setOpen(false);
            refetch();
        } catch (e: any) {
            setSnackbar({ open: true, message: e.message, severity: 'error' });
        }
    };

    const handleToggle = async (row: any) => {
        await updateActivity({ variables: { id: row.id, input: { completed: !row.completed } } });
        refetch();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this activity?')) {
            await deleteActivity({ variables: { id } });
            setSnackbar({ open: true, message: 'Activity deleted!', severity: 'success' });
            refetch();
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'completed', headerName: '', width: 50,
            renderCell: (p: GridRenderCellParams) => <Checkbox checked={p.value} onChange={() => handleToggle(p.row)} />,
        },
        {
            field: 'type', headerName: 'Type', width: 120,
            renderCell: (p: GridRenderCellParams) => {
                const t = TYPE_OPTIONS.find((o) => o.value === p.value);
                return <Chip icon={t?.icon} label={t?.label || p.value} size="small" sx={{ bgcolor: t?.color, color: 'white' }} />;
            },
        },
        {
            field: 'subject', headerName: 'Subject', flex: 1, minWidth: 200,
            renderCell: (p: GridRenderCellParams) => (
                <Typography variant="body2" sx={{ textDecoration: p.row.completed ? 'line-through' : 'none', opacity: p.row.completed ? 0.6 : 1 }}>
                    {p.value}
                </Typography>
            ),
        },
        {
            field: 'dueDate', headerName: 'Due Date', width: 130,
            renderCell: (p: GridRenderCellParams) => {
                if (!p.value) return '—';
                const date = new Date(p.value);
                const isOverdue = !p.row.completed && date < new Date();
                return <Typography variant="body2" color={isOverdue ? 'error' : 'text.primary'}>{date.toLocaleDateString()}</Typography>;
            },
        },
        { field: 'contact', headerName: 'Contact', flex: 0.7, valueGetter: (p: any) => p.row.contact ? `${p.row.contact.firstName} ${p.row.contact.lastName}` : '—' },
        { field: 'deal', headerName: 'Deal', flex: 0.7, valueGetter: (p: any) => p.row.deal?.title || '—' },
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
                        <Typography variant="h4" fontWeight={700}>Activities</Typography>
                        <Typography color="text.secondary">Manage tasks, calls, emails, and meetings</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Add Activity</Button>
                </Box>

                <Card>
                    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        <DataGrid rows={data?.activities || []} columns={columns} loading={loading} autoHeight pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} disableRowSelectionOnClick sx={{ border: 'none', minHeight: 400 }} />
                    </CardContent>
                </Card>

                <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>{editId ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} fullWidth>
                                {TYPE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                            </TextField>
                            <TextField label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} fullWidth required />
                            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} />
                            <TextField label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
                            <TextField select label="Contact" value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })} fullWidth>
                                <MenuItem value="">None</MenuItem>
                                {contactsData?.contacts?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</MenuItem>)}
                            </TextField>
                            <TextField select label="Deal" value={form.dealId} onChange={(e) => setForm({ ...form, dealId: e.target.value })} fullWidth>
                                <MenuItem value="">None</MenuItem>
                                {dealsData?.deals?.map((d: any) => <MenuItem key={d.id} value={d.id}>{d.title}</MenuItem>)}
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleSubmit} disabled={creating || updating || !form.subject}>
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
