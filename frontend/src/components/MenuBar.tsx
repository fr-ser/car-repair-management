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
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

export interface NavigationItem {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  link: string;
}

function MenuBar({ current }: { current: string }) {
  const redirect = useNavigate();
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null,
  );
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const navigationItems: NavigationItem[] = [
    { label: 'Kunden', icon: <PeopleIcon />, active: true, link: '/clients' },
    { label: 'Autos', icon: <CarIcon />, active: false, link: '/cars' },
    {
      label: 'Aufträge',
      icon: <DescriptionIcon />,
      active: false,
      link: '/orders',
    },
    {
      label: 'Übersicht',
      icon: <BarChartIcon />,
      active: false,
      link: '/overview',
    },
    {
      label: 'Dokumente',
      icon: <AssignmentIcon />,
      active: false,
      link: '/documents',
    },
    {
      label: 'Artikel',
      icon: <ArticleIcon />,
      active: false,
      link: '/articles',
    },
  ];

  for (const item of navigationItems) {
    if (item.link === current) {
      item.active = true;
    } else {
      item.active = false;
    }
  }

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
    >
      <Toolbar sx={{ px: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            flexGrow: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
              Web-Verwaltung
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                startIcon={item.icon}
                variant={item.active ? 'contained' : 'text'}
                size="small"
                onClick={() => {
                  // Handle navigation or other actions here
                  redirect(item.link);
                }}
                sx={{
                  color: item.active
                    ? 'primary.contrastText'
                    : 'text.secondary',
                  bgcolor: item.active ? 'primary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: item.active ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Box>

        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt="Remy Sharp" src="src/assets/react.svg" />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {settings.map((setting) => (
              <MenuItem key={setting} onClick={handleCloseUserMenu}>
                <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
export default MenuBar;
