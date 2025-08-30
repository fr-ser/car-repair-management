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
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
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
