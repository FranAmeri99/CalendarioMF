'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  CalendarToday,
  People,
  Business,
  Person,
  ExitToApp,
  Settings,
} from '@mui/icons-material'

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Reservas', icon: <CalendarToday />, path: '/dashboard/reservations' },
  { text: 'Personas', icon: <People />, path: '/dashboard/users' },
  { text: 'Equipos', icon: <Business />, path: '/dashboard/teams' },
  { text: 'Perfil', icon: <Person />, path: '/dashboard/profile' },
]

// Menú de administración solo para admins
const adminMenuItems = [
  { text: 'Admin Usuarios', icon: <Settings />, path: '/dashboard/admin/users' },
]

export default function Navigation() {
  const { data: session } = useSession()
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setDrawerOpen(false)
  }

  if (!session) return null

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema de Asistencia
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              {session.user?.name}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {session.user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => handleNavigation('/dashboard/profile')}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Perfil
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToApp fontSize="small" />
                </ListItemIcon>
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
                     <List>
             {menuItems.map((item) => (
               <ListItem
                 button
                 key={item.text}
                 onClick={() => handleNavigation(item.path)}
               >
                 <ListItemIcon>{item.icon}</ListItemIcon>
                 <ListItemText primary={item.text} />
               </ListItem>
             ))}
             
             {/* Menú de administración solo para admins */}
             {session?.user?.role === 'ADMIN' && (
               <>
                 <Divider sx={{ my: 1 }} />
                 <Typography variant="caption" sx={{ px: 2, color: 'text.secondary' }}>
                   Administración
                 </Typography>
                 {adminMenuItems.map((item) => (
                   <ListItem
                     button
                     key={item.text}
                     onClick={() => handleNavigation(item.path)}
                   >
                     <ListItemIcon>{item.icon}</ListItemIcon>
                     <ListItemText primary={item.text} />
                   </ListItem>
                 ))}
               </>
             )}
           </List>
        </Box>
      </Drawer>
    </>
  )
} 