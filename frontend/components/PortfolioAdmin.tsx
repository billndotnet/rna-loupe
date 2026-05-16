import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, IconButton, Chip, CircularProgress, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Tabs, Tab,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ViewListIcon from '@mui/icons-material/ViewList'

interface Gallery {
  id: string; name: string; items: { filename: string }[]
}

interface Section {
  id: string; title: string; description: string; gallery_id: string
  cover_image: string; order: number; published: boolean; created_at: string
}

interface Contact {
  id: string; name: string; email: string; phone: string
  event_type: string; event_date: string; message: string
  status: string; created_at: string
}

const emptySection = { title: '', description: '', gallery_id: '', cover_image: '', order: 0, published: false }

export default function PortfolioAdmin() {
  const [tab, setTab] = useState(0)
  const [sections, setSections] = useState<Section[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(emptySection)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/loupe/portfolio', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/loupe/contact', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/gallery/state', { credentials: 'include' }).then(r => r.ok ? r.json() : { galleries: [] }),
    ]).then(([p, c, g]) => {
      setSections(p.sections || [])
      setContacts(c.submissions || [])
      setGalleries(g.galleries || [])
    }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(emptySection); setEditing(null); setError(''); setDialogOpen(true) }
  const openEdit = (s: Section) => {
    setForm({ title: s.title, description: s.description, gallery_id: s.gallery_id,
      cover_image: s.cover_image, order: s.order, published: s.published })
    setEditing(s.id); setError(''); setDialogOpen(true)
  }

  const handleSave = async () => {
    const url = editing ? `/api/loupe/portfolio/${editing}` : '/api/loupe/portfolio'
    const res = await fetch(url, { method: editing ? 'PUT' : 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (!res.ok) { const d = await res.json(); setError(d.error?.message || 'Failed'); return }
    setDialogOpen(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this section?')) return
    await fetch(`/api/loupe/portfolio/${id}`, { method: 'DELETE', credentials: 'include' }); load()
  }

  const galleryName = (id: string) => {
    const g = galleries.find(g => g.id === id)
    return g ? `${g.name || g.id} (${g.items?.length || 0})` : id
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ViewListIcon sx={{ mr: 1 }} />
        <Typography variant="h5">Portfolio</Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label={`Sections (${sections.length})`} />
        <Tab label={`Inquiries (${contacts.length})`} />
      </Tabs>

      {tab === 0 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate}>Add Section</Button>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell><TableCell>Title</TableCell>
                  <TableCell>Gallery</TableCell><TableCell>Published</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sections.sort((a, b) => a.order - b.order).map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.order}</TableCell>
                    <TableCell><strong>{s.title}</strong></TableCell>
                    <TableCell>{s.gallery_id ? <Chip label={galleryName(s.gallery_id)} size="small" /> : <Chip label="None" size="small" variant="outlined" />}</TableCell>
                    <TableCell><Chip label={s.published ? 'Live' : 'Draft'} size="small" color={s.published ? 'success' : 'default'} /></TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openEdit(s)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(s.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {sections.length === 0 && <TableRow><TableCell colSpan={5} align="center">No portfolio sections</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tab === 1 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell><TableCell>Name</TableCell><TableCell>Email</TableCell>
                <TableCell>Event</TableCell><TableCell>Status</TableCell><TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map(c => (
                <TableRow key={c.id} hover>
                  <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  <TableCell><strong>{c.name}</strong></TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.event_type}</TableCell>
                  <TableCell><Chip label={c.status} size="small" color={c.status === 'new' ? 'warning' : 'default'} /></TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.message}</TableCell>
                </TableRow>
              ))}
              {contacts.length === 0 && <TableRow><TableCell colSpan={6} align="center">No inquiries yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Section' : 'Add Section'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Title" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth label="Description" value={form.description} multiline rows={3}
            onChange={e => setForm({ ...form, description: e.target.value })} sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Gallery</InputLabel>
            <Select
              value={form.gallery_id}
              label="Gallery"
              onChange={e => setForm({ ...form, gallery_id: e.target.value })}
            >
              <MenuItem value="">(No gallery)</MenuItem>
              {galleries.map(g => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name || g.id} ({g.items?.length || 0} photos)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth label="Order" type="number" value={form.order}
            onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
            <Typography>Published</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!form.title}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
