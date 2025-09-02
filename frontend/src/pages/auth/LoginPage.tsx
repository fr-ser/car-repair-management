import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { signIn } from '@/src/services/backend-service';

export default function LoginPage() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setLoginError('');

    try {
      await signIn(userName, password);
      navigate('/');
    } catch {
      setLoginError('Login fehlgeschlagen');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          {' '}
          <LockOutlinedIcon />{' '}
        </Avatar>
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            id="user-name"
            label="Benutzername"
            autoFocus
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Passwort"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Button
            onClick={handleSubmit}
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Einloggen...' : 'Einloggen'}
          </Button>

          {loginError && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {loginError}
            </Alert>
          )}
        </Box>
      </Box>
    </Container>
  );
}
