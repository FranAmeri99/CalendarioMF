'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business,
} from '@mui/icons-material'

interface Team {
  id: string
  name: string
  description?: string
  leaderId?: string
  leader?: {
    id: string
    name: string
    email: string
  }
  members?: {
    id: string
    name: string
    email: string
  }[]
}

interface User {
  id: string
  name: string
  email: string
  role: string
  teamId?: string
}

interface FormData {
  name: string
  description: string
  leaderId: string
}

export default function TeamsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    leaderId: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teams')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setTeams(data.teams)
      setUsers(data.users)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team)
      setFormData({
        name: team.name,
        description: team.description || '',
        leaderId: team.leaderId || '',
      })
    } else {
      setEditingTeam(null)
      setFormData({
        name: '',
        description: '',
        leaderId: '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingTeam(null)
    setFormData({
      name: '',
      description: '',
      leaderId: '',
    })
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        alert('Debe ingresar un nombre para el equipo')
        return
      }

      const url = '/api/teams'
      const method = editingTeam ? 'PUT' : 'POST'
      
      const body = editingTeam 
        ? {
            id: editingTeam.id,
            name: formData.name,
            description: formData.description,
            leaderId: formData.leaderId || undefined,
          }
        : {
            name: formData.name,
            description: formData.description,
            leaderId: formData.leaderId || undefined,
          }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      alert(editingTeam ? 'Equipo actualizado exitosamente' : 'Equipo creado exitosamente')
      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving team:', error)
      alert('Error al guardar el equipo')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este equipo?')) {
      return
    }

    try {
      const response = await fetch(`/api/teams?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      alert('Equipo eliminado exitosamente')
      fetchData()
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('Error al eliminar el equipo')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!session) {
    return null
  }

  return (
    <Container maxWidth="xl" sx={{ p: 0 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="32px">
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            color: '#1a1a1a',
            fontSize: '32px',
            lineHeight: '40px'
          }}
        >
          Gestión de Equipos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: '24px',
            py: '12px',
            fontSize: '14px',
            lineHeight: '20px',
            bgcolor: '#1976d2',
            '&:hover': {
              bgcolor: '#1565c0'
            }
          }}
        >
          Nuevo Equipo
        </Button>
      </Box>

      <Paper
        sx={{
          background: '#ffffff',
          border: '1px solid #e8e8e8',
          borderRadius: '16px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Equipo</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Líder</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Miembros</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1a1a1a' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap="12px">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: '#9c27b0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '16px'
                        }}
                      >
                        <Business sx={{ fontSize: 20 }} />
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {team.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {team.description || 'Sin descripción'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {team.leader ? (
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {team.leader.name}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin líder asignado
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {team.members && team.members.length > 0 ? (
                      <Box display="flex" gap="4px" flexWrap="wrap">
                        {team.members.slice(0, 3).map((member) => (
                          <Chip
                            key={member.id}
                            label={member.name}
                            size="small"
                            sx={{
                              bgcolor: '#e3f2fd',
                              color: '#1976d2',
                              fontSize: '10px',
                              height: '20px'
                            }}
                          />
                        ))}
                        {team.members.length > 3 && (
                          <Chip
                            label={`+${team.members.length - 3}`}
                            size="small"
                            sx={{
                              bgcolor: '#f5f5f5',
                              color: '#666',
                              fontSize: '10px',
                              height: '20px'
                            }}
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin miembros
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap="8px">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(team)}
                        sx={{ color: '#1976d2' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(team.id)}
                        sx={{ color: '#d32f2f' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para crear/editar equipo */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTeam ? 'Editar Equipo' : 'Nuevo Equipo'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap="16px" mt="8px">
            <TextField
              label="Nombre del equipo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              size="small"
              required
            />

            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={3}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Líder del equipo (opcional)</InputLabel>
              <Select
                value={formData.leaderId}
                onChange={(e) => setFormData({ ...formData, leaderId: e.target.value })}
                label="Líder del equipo (opcional)"
              >
                <MenuItem value="">
                  <em>Sin líder asignado</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTeam ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
} 