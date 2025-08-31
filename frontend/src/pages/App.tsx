import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { tabsClasses } from '@mui/material/Tabs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import MenuBar from '../components/MenuBar';
import styles from './App.module.css';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ClientDetailsPage from './clients/ClientDetailsPage';

function App() {
  const redirect = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = () => redirect('/login');
  const handleRegister = () => redirect('/register');

  const theme = createTheme({
    colorSchemes: {
      dark: false,
    },
  });

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  // firebase style

  const [tabIndex, setTabIndex] = React.useState(0);
  const TabItem = styled(Tab)(({ theme }) => ({
    textTransform: 'initial',
    minWidth: 0,
    letterSpacing: 0.5,
    margin: theme.spacing(0, 2),
    padding: 0,
    overflow: 'unset',
    fontWeight: 500,
    '&:hover::before': {
      backgroundColor: 'rgba(0 0 0 / 0.04)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '-1rem',
      right: '-1rem',
      height: '100%',
    },
    [theme.breakpoints.up('md')]: {
      minWidth: 0,
    },
  }));

  return (
    <ThemeProvider theme={theme}>
      <MenuBar />
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabIndex}
          onChange={(_, index) => setTabIndex(index)}
          sx={{
            marginLeft: 1,
            [`& .${tabsClasses.indicator}`]: {
              height: 3,
              borderTopLeftRadius: '3px',
              borderTopRightRadius: '3px',
            },
          }}
        >
          <TabItem disableRipple label={'Kunden'} {...a11yProps(0)} />
          <TabItem disableRipple label={'Autos'} {...a11yProps(1)} />
          <TabItem disableRipple label={'Aufträge'} {...a11yProps(2)} />
          <TabItem disableRipple label={'Übersicht'} {...a11yProps(3)} />
          <TabItem disableRipple label={'Documente'} {...a11yProps(4)} />
          <TabItem disableRipple label={'Artikel'} {...a11yProps(5)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={tabIndex} index={0}>
        Item One
        <ClientDetailsPage></ClientDetailsPage>
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={1}>
        Item Two
        <RegisterPage />
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={2}>
        Item Three
        <LoginPage />
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={3}>
        Item Four
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={4}>
        Item Five
      </CustomTabPanel>
      <CustomTabPanel value={tabIndex} index={5}>
        Item Six
      </CustomTabPanel>

      {/* all below should be deleted */}
      <Container maxWidth="lg">
        <div className={styles.root}>
          <div>App home screen</div>
          {!token ? (
            <div>
              <AccessAlarmIcon />
              <Button variant="outlined" onClick={handleLogin}>
                Login
              </Button>
              <Button variant="contained" onClick={handleRegister}>
                Register
              </Button>
            </div>
          ) : (
            <button onClick={handleLogout}>Logout</button>
          )}

          <br />
          <br />

          {!token ? (
            <p>You are not logged in, LOL!</p>
          ) : (
            <p>You are logged in, CONGRATS!</p>
          )}
        </div>
      </Container>
    </ThemeProvider>
  );
}

export default App;
