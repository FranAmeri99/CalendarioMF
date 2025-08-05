'use client'

import { Card, CardContent, Typography, Box, Avatar } from '@mui/material'
import { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: ReactNode
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  trend?: {
    value: number
    isPositive: boolean
  }
}

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'primary',
  trend 
}: MetricCardProps) {
  const getColorValue = () => {
    switch (color) {
      case 'primary': return '#1976d2'
      case 'secondary': return '#9c27b0'
      case 'success': return '#2e7d32'
      case 'warning': return '#ed6c02'
      case 'error': return '#d32f2f'
      default: return '#1976d2'
    }
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: '#ffffff',
        border: '1px solid #e8e8e8',
        borderRadius: { xs: '12px', sm: '16px' },
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <CardContent sx={{ p: { xs: '16px', sm: '20px', md: '24px' } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={{ xs: '12px', sm: '16px' }}>
          <Box>
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: getColorValue(),
                mb: { xs: '2px', sm: '4px' },
                fontSize: { xs: '24px', sm: '28px', md: '32px' },
                lineHeight: { xs: '32px', sm: '36px', md: '40px' }
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontWeight: 500,
                fontSize: { xs: '12px', sm: '14px' },
                lineHeight: { xs: '16px', sm: '20px' }
              }}
            >
              {subtitle}
            </Typography>
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: `${getColorValue()}15`,
              color: getColorValue(),
              width: { xs: 40, sm: 48, md: 56 },
              height: { xs: 40, sm: 48, md: 56 },
              borderRadius: { xs: '8px', sm: '12px' }
            }}
          >
            {icon}
          </Avatar>
        </Box>
        
        <Typography 
          variant="h6" 
          component="div"
          sx={{ 
            fontWeight: 600,
            color: '#1a1a1a',
            fontSize: { xs: '14px', sm: '16px' },
            lineHeight: { xs: '20px', sm: '24px' }
          }}
        >
          {title}
        </Typography>

        {trend && (
          <Box display="flex" alignItems="center" mt="12px">
            <Typography 
              variant="caption" 
              sx={{ 
                color: trend.isPositive ? '#2e7d32' : '#d32f2f',
                fontWeight: 600,
                fontSize: '12px'
              }}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Typography>
            <Typography variant="caption" color="text.secondary" ml="4px" fontSize="12px">
              vs mes anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
} 