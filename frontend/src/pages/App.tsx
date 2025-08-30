import ReactWaButton from '@awesome.me/webawesome/dist/react/button/index.js';
import { useNavigate } from 'react-router-dom';

import styles from './App.module.css';

function App() {
  const redirect = useNavigate();

  const token = sessionStorage.getItem('authToken');
  const handleLogin = () => redirect('/login');
  const handleRegister = () => redirect('/register');
  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    console.log('Logged out');
    redirect('/login');
  };

  return (
    <div className={styles.root}>
      <div>App home screen</div>
      {!token ? (
        <div>
          <ReactWaButton
            appearance="filled"
            variant="brand"
            onClick={handleLogin}
            pill
          >
            Login
          </ReactWaButton>
          <ReactWaButton
            appearance="accent"
            variant="brand"
            onClick={handleRegister}
          >
            Register
          </ReactWaButton>
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
  );
}

export default App;
