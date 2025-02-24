'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { Assessment, AttachMoney, Settings, SwapHoriz } from '@mui/icons-material'; // Import Material UI icons

const drawerWidth = 240;

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/movements', label: 'Movements', icon: <SwapHoriz /> },
    { href: '/analytics', label: 'Analytics', icon: <Assessment /> },
    { href: '/salaries', label: 'Salaries', icon: <AttachMoney /> },
    { href: '/settings', label: 'Settings', icon: <Settings /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Typography variant="h6">Wisp</Typography>
      </Toolbar>
      <List>
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
    </Drawer>
  );
};

export default Sidebar;