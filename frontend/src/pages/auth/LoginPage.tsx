import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as apiService from '../../services/backend-service';
import * as Errors from '../../types/errors';

type Errors = {
  userName?: string;
  password?: string;
  other?: string;
};

export default function LoginPage() {
  const redirect = useNavigate();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = () => redirect('/login');
  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    console.log('Logged out');
    redirect('/login');
  };

  useEffect(() => {
    console.log('yo!!');
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

  const validate = () => {
    const newErrors: Errors = {};

    if (!userName.trim()) {
      newErrors.userName = 'User Name is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        await apiService.signin({ userName, password });
        // Proceed with login logic
        // redirect('/login');
        setIsLoggedIn(true);
      } catch (err: unknown) {
        if (err instanceof Errors.AuthError) {
          setErrors({ other: err.message });
        } else {
          console.error('Unexpected error', err);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-80"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
        {errors.other && <p className="error">{errors.other}</p>}
        <input
          type="text"
          placeholder="User Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full p-2 mb-3 border rounded-xl"
          required
          data-testid="user-name-input"
        />
        {errors.userName && <p className="error">{errors.userName}</p>}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded-xl"
          required
          data-testid="user-password-input"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-4">{errors.password}</p>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition"
          data-testid="user-login-button"
        >
          Login
        </button>
      </form>
      <div>App home screen</div>
      <div>
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <br></br>
      <br></br>
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
