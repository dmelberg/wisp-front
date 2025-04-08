'use client'; 

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography,
  Divider,
  Box,
} from '@mui/material';
import { Assessment, AttachMoney, Settings, SwapHoriz, Logout } from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/movements', label: 'Movements', icon: <SwapHoriz /> },
    { href: '/analytics', label: 'Analytics', icon: <Assessment /> },
    { href: '/salaries', label: 'Salaries', icon: <AttachMoney /> },
    { href: '/settings', label: 'Settings', icon: <Settings /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/auth');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6">Wisp</Typography>
      </Toolbar>
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={pathname === item.href}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default Sidebar;