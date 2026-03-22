import {
  Article as ArticleIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  DirectionsCar as CarIcon,
  Description as DescriptionIcon,
  Menu as MenuIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MenuBar() {
  const redirect = useNavigate();

  const [currentLink, setCurrentLink] = React.useState(location.pathname);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const navigationItems = [
    { label: 'Kunden', icon: <PeopleIcon />, link: '/clients' },
    { label: 'Autos', icon: <CarIcon />, link: '/cars' },
    {
      label: 'Aufträge',
      icon: <DescriptionIcon />,
      link: '/orders',
    },
    {
      label: 'Übersicht',
      icon: <BarChartIcon />,
      link: '/overview',
    },
    {
      label: 'Dokumente',
      icon: <AssignmentIcon />,
      link: '/documents',
    },
    {
      label: 'Artikel',
      icon: <ArticleIcon />,
      link: '/articles',
    },
  ];

  const navigate = (link: string) => {
    setCurrentLink(link);
    redirect(link);
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar
        position="relative"
        elevation={1}
        sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              sx={{ display: { md: 'none' } }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Web-Verwaltung v2</Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                startIcon={item.icon}
                variant={item.link === currentLink ? 'contained' : 'text'}
                size="small"
                onClick={() => navigate(item.link)}
                sx={{
                  color:
                    item.link === currentLink
                      ? 'primary.contrastText'
                      : 'text.secondary',
                  '&:hover': {
                    bgcolor:
                      item.link === currentLink
                        ? 'primary.dark'
                        : 'action.hover',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { md: 'none' } }}
      >
        <List sx={{ width: 220, pt: 1 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                selected={item.link === currentLink}
                onClick={() => navigate(item.link)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}
