'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Avatar,
  Tooltip,
  CircularProgress,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Search,
  Visibility,
  VisibilityOff,
  Person,
  Business,
} from '@mui/icons-material'
import Navigation from '@/components/Layout/Navigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { UserService } from '@/lib/services/userService'
import { TeamService } from '@/lib/services/teamService'
import type { UserWithTeam } from '@/lib/services/userService'
import type { Team } from '@/lib/services/teamService'

interface UserFormData {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
  teamId?: string
}

export default function AdminUsersPage() {
  const { session, isAdmin, isLoading } = useAdminAuth()
  const [users, setUsers] = useState<UserWithTeam[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithTeam | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    teamId: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  // Cargar datos iniciales
  useEffect(() => {
    if (isAdmin) {
      loadData()
    }
  }, [isAdmin])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, teamsData] = await Promise.all([
        UserService.getAllUsers(),
        TeamService.getSimpleTeams(),
      ])
      setUsers(usersData)
      setTeams(teamsData)
    } catch (error) {
      console.error('Error loading data:', error)
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenDialog = (user?: UserWithTeam) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role as 'ADMIN' | 'MANAGER' | 'USER',
        teamId: user.teamId || '',
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        teamId: '',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'USER',
      teamId: '',
    })
    setShowPassword(false)
  }

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // Actualizar usuario existente
        const updatedUser = await UserService.updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          teamId: formData.teamId || undefined,
          ...(formData.password && { password: formData.password }),
        })
        
        setUsers(users.map(user => 
          user.id === editingUser.id ? updatedUser : user
        ))
        
        setSnackbar({
          open: true,
          message: 'Usuario actualizado correctamente',
          severity: 'success'
        })
      } else {
        // Crear nuevo usuario
        const newUser = await UserService.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          teamId: formData.teamId || undefined,
        })
        
        setUsers([newUser, ...users])
        setSnackbar({
          open: true,
          message: 'Usuario creado correctamente',
          severity: 'success'
        })
      }
      handleCloseDialog()
    } catch (error) {
      console.error('Error submitting user:', error)
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al procesar la operación',
        severity: 'error'
      })
    }
  }

  const handleDelete = async (userId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await UserService.deleteUser(userId)
        setUsers(users.filter(user => user.id !== userId))
        setSnackbar({
          open: true,
          message: 'Usuario eliminado correctamente',
          severity: 'success'
        })
      } catch (error) {
        console.error('Error deleting user:', error)
        setSnackbar({
          open: true,
          message: 'Error al eliminar el usuario',
          severity: 'error'
        })
      }
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error'
      case 'MANAGER':
        return 'warning'
      case 'USER':
        return 'primary'
      default:
        return 'default'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Person />
      case 'MANAGER':
        return <Business />
      case 'USER':
        return <Person />
      default:
        return <Person />
    }
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (!isAdmin) {
    return null
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Administración de Usuarios
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Usuario
          </Button>
        </Box>

        {/* Barra de búsqueda */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Buscar usuarios por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Paper>

        {/* Tabla de usuarios */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Equipo</TableCell>
                <TableCell>Fecha de Creación</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar>
                        {user.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">
                        {user.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.team ? (
                      <Chip
                        label={user.team.name}
                        color="primary"
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin equipo
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(user)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(user.id)}
                          color="error"
                          disabled={user.id === session?.user.id}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog para crear/editar usuario */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
              
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
                required
              />
              
              <TextField
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                fullWidth
                required={!editingUser}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  label="Rol"
                >
                  <MenuItem value="USER">Usuario</MenuItem>
                  <MenuItem value="MANAGER">Manager</MenuItem>
                  <MenuItem value="ADMIN">Administrador</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Equipo</InputLabel>
                <Select
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  label="Equipo"
                >
                  <MenuItem value="">
                    <em>Sin equipo</em>
                  </MenuItem>
                  {teams.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.name || !formData.email || (!editingUser && !formData.password)}
            >
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
} 