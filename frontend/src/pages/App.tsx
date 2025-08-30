import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './App.module.css';

function App() {
  const redirect = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = () => redirect('/login');
  const handleRegister = () => redirect('/register');

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`/api/articles`, {
          credentials: 'include', // Important for sending cookies
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  });
  return (
    <div className={styles.root}>
      <div>App home screen</div>
      <div>
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleRegister}>Register</button>
      </div>

      <br />
      <br />

      {isLoading ? (
        <p>Checking login status...</p>
      ) : isLoggedIn ? (
        <p>You are logged in, CONGRATS!</p>
      ) : (
        <p>You are not logged in, LOL!</p>
      )}
    </div>
  );
}

export default App;
