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
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

function MenuBar() {
  const redirect = useNavigate();

  const [currentLink, setCurrentLink] = React.useState(location.pathname);

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

  return (
    <AppBar
      position="relative"
      elevation={1}
      sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton sx={{ display: { md: 'none' } }}>
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
              onClick={() => {
                setCurrentLink(item.link);
                redirect(item.link);
              }}
              sx={{
                color:
                  item.link === currentLink
                    ? 'primary.contrastText'
                    : 'text.secondary',
                '&:hover': {
                  bgcolor:
                    item.link === currentLink ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
export default MenuBar;
