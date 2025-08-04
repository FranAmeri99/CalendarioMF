'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Business,
  Person,
} from '@mui/icons-material'
import toast from 'react-hot-toast'

interface Team {
  id: string
  name: string
  description?: string
  leader?: {
    id: string
    name: string
    email: string
  }
  members: {
    id: string
    name: string
    email: string
  }[]
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leaderId: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Aquí se harían las llamadas a la API
      // Por ahora usamos datos de ejemplo
      setTeams([
        {
          id: '1',
          name: 'Desarrollo',
          description: 'Equipo de desarrollo de software',
          leader: {
            id: '1',
            name: 'Juan Pérez',
            email: 'juan@example.com',
          },
          members: [
            { id: '1', name: 'Juan Pérez', email: 'juan@example.com' },
            { id: '3', name: 'Carlos López', email: 'carlos@example.com' },
          ],
          createdAt: '2024-01-01',
        },
        {
          id: '2',
          name: 'Diseño',
          description: 'Equipo de diseño UX/UI',
          leader: {
            id: '2',
            name: 'María García',
            email: 'maria@example.com',
          },
          members: [
            { id: '2', name: 'María García', email: 'maria@example.com' },
          ],
          createdAt: '2024-01-02',
        },
        {
          id: '3',
          name: 'Marketing',
          description: 'Equipo de marketing digital',
          leader: undefined,
          members: [],
          createdAt: '2024-01-03',
        },
      ])

      setUsers([
        { id: '1', name: 'Juan Pérez', email: 'juan@example.com' },
        { id: '2', name: 'María García', email: 'maria@example.com' },
        { id: '3', name: 'Carlos López', email: 'carlos@example.com' },
        { id: '4', name: 'Ana Martínez', email: 'ana@example.com' },
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar los datos')
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
        leaderId: team.leader?.id || '',
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
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        toast.error('Debe ingresar un nombre para el equipo')
        return
      }

      // Aquí se haría la llamada a la API
      if (editingTeam) {
        // Actualizar equipo
        toast.success('Equipo actualizado exitosamente')
      } else {
        // Crear nuevo equipo
        toast.success('Equipo creado exitosamente')
      }

      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving team:', error)
      toast.error('Error al guardar el equipo')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este equipo?')) {
      return
    }

    try {
      // Aquí se haría la llamada a la API
      toast.success('Equipo eliminado exitosamente')
      fetchData()
    } catch (error) {
      console.error('Error deleting team:', error)
      toast.error('Error al eliminar el equipo')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Cargando equipos...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Gestión de Equipos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Equipo
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Equipo</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Líder</TableCell>
                <TableCell>Miembros</TableCell>
                <TableCell>Fecha de Creación</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar>
                        <Business />
                      </Avatar>
                      <Typography variant="body2">{team.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {team.description || 'Sin descripción'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {team.leader ? (
                      <Chip
                        label={team.leader.name}
                        size="small"
                        color="primary"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin líder
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${team.members.length} miembros`}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(team.createdAt).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(team)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(team.id)}
                    >
                      <Delete />
                    </IconButton>
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
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Nombre del Equipo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <TextField
              select
              fullWidth
              label="Líder del Equipo"
              value={formData.leaderId}
              onChange={(e) => setFormData({ ...formData, leaderId: e.target.value })}
            >
              <option value="">
                <em>Sin líder</em>
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTeam ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 