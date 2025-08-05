'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
  Home,
} from '@mui/icons-material'

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Reservas', icon: <CalendarToday />, path: '/dashboard/reservations' },
  { text: 'Equipos', icon: <Business />, path: '/dashboard/teams' },
  { text: 'Perfil', icon: <Person />, path: '/dashboard/profile' },
]

// Menú de administración solo para admins
const adminMenuItems = [
  { text: 'Admin Usuarios', icon: <Settings />, path: '/dashboard/admin/users' },
  { text: 'Configuración', icon: <Settings />, path: '/dashboard/admin/config' },
  { text: 'Equipos', icon: <Business />, path: '/dashboard/teams' },


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
        <Toolbar sx={{ minHeight: { xs: '56px', sm: '64px' } }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: { xs: 1, sm: 2 } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                height: { xs: 32, sm: 36, md: 40 },
                width: 'auto',
                maxWidth: { sm: 160, md: 180 },
                cursor: 'pointer'
              }}
              onClick={() => handleNavigation('/dashboard')}
            >
              <Image
                src="/logo.svg"
                alt="Logo Sistema de Asistencia"
                width={180}
                height={40}
                style={{ 
                  height: 'auto',
                  width: '100%',
                  maxWidth: '180px'
                }}
                priority
              />
            </Box>
            
            {/* Logo móvil más pequeño */}
            <Box 
              sx={{ 
                display: { xs: 'block', sm: 'none' },
                height: 28,
                width: 'auto',
                maxWidth: 120,
                cursor: 'pointer'
              }}
              onClick={() => handleNavigation('/dashboard')}
            >
              <Image
                src="/logo.svg"
                alt="Logo Sistema de Asistencia"
                width={120}
                height={28}
                style={{ 
                  height: 'auto',
                  width: '100%',
                  maxWidth: '120px'
                }}
                priority
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            <Typography 
              variant="body2" 
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {session.user?.name}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{ p: { xs: 0.5, sm: 1 } }}
            >
              <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
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
        PaperProps={{
          sx: {
            width: { xs: '280px', sm: '300px' },
            backgroundColor: '#fafafa'
          }
        }}
      >
        <Box role="presentation">
                     <List sx={{ py: 1 }}>
             {menuItems.map((item) => (
               <ListItem
                 button
                 key={item.text}
                 onClick={() => handleNavigation(item.path)}
                 sx={{
                   py: { xs: 2, sm: 1.5 },
                   px: { xs: 3, sm: 2 },
                   '&:hover': {
                     backgroundColor: 'rgba(25, 118, 210, 0.08)'
                   }
                 }}
               >
                 <ListItemIcon sx={{ minWidth: { xs: 48, sm: 40 } }}>
                   {item.icon}
                 </ListItemIcon>
                 <ListItemText 
                   primary={item.text} 
                   sx={{ 
                     '& .MuiListItemText-primary': {
                       fontSize: { xs: '1rem', sm: '0.875rem' },
                       fontWeight: 500
                     }
                   }}
                 />
               </ListItem>
             ))}
             
             {/* Menú de administración solo para admins */}
             {session?.user?.role === 'ADMIN' && (
               <>
                 <Divider sx={{ my: { xs: 2, sm: 1 } }} />
                 <Typography 
                   variant="caption" 
                   sx={{ 
                     px: { xs: 3, sm: 2 }, 
                     color: 'text.secondary',
                     fontSize: { xs: '0.75rem', sm: '0.75rem' },
                     fontWeight: 600
                   }}
                 >
                   Administración
                 </Typography>
                 {adminMenuItems.map((item) => (
                   <ListItem
                     button
                     key={item.text}
                     onClick={() => handleNavigation(item.path)}
                     sx={{
                       py: { xs: 2, sm: 1.5 },
                       px: { xs: 3, sm: 2 },
                       '&:hover': {
                         backgroundColor: 'rgba(25, 118, 210, 0.08)'
                       }
                     }}
                   >
                     <ListItemIcon sx={{ minWidth: { xs: 48, sm: 40 } }}>
                       {item.icon}
                     </ListItemIcon>
                     <ListItemText 
                       primary={item.text} 
                       sx={{ 
                         '& .MuiListItemText-primary': {
                           fontSize: { xs: '1rem', sm: '0.875rem' },
                           fontWeight: 500
                         }
                       }}
                     />
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