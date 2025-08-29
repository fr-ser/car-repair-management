import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_URL } from './global/config';

type Errors = {
  email?: string;
  password?: string;
  other?: string;
};

export default function LoginPage() {
  const redirect = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const validate = () => {
    const newErrors: Errors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Enter a valid email';
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
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Optional: Include auth token if needed
          // "Authorization": `Bearer ${sessionStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      const responseJson = await response.json();
      const responseStatus = response.status;
      if (responseStatus !== 200) {
        setErrors({
          other: 'Invalid credentials',
        });
      } else {
        const token = responseJson.access_token; // ← replace with actual API response
        sessionStorage.setItem('authToken', token);
        // Proceed with login logic
        redirect('/');
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
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 border rounded-xl"
          required
          data-testid="user-email-input"
        />
        {errors.email && <p className="error">{errors.email}</p>}
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
    </div>
  );
}
