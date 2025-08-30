import { WaInput } from '@awesome.me/webawesome/dist/react';
import ReactWaButton from '@awesome.me/webawesome/dist/react/button/index.js';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as apiService from '../../services/backend-service';
import * as Errors from '../../types/errors';

type Errors = {
  email?: string;
  password?: string;
  username?: string;
  other?: string;
};

export default function RegisterPage() {
  const redirect = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
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
      try {
        await apiService.signup({ email, password });
        // Proceed with login logic
        redirect('/');
      } catch (err: unknown) {
        if (err instanceof Errors.AuthError) {
          setErrors({ other: err.message });
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
        <h2 className="text-2xl font-semibold mb-4 text-center">Register</h2>
        {errors.other && <p className="error">{errors.other}</p>}
        <WaInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          className="w-full p-2 mb-3 border rounded-xl"
          required
          data-testid="user-email-input"
        ></WaInput>
        {errors.email && <p className="error">{errors.email}</p>}
        <WaInput
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
          className="w-full p-2 mb-3 border rounded-xl"
          required
          data-testid="user-username-input"
        ></WaInput>
        <WaInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          className="w-full p-2 mb-4 border rounded-xl"
          required
          data-testid="user-password-input"
        ></WaInput>
        {errors.password && (
          <p className="text-red-500 text-sm mb-4">{errors.password}</p>
        )}
        <ReactWaButton
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition"
          data-testid="user-register-button"
        >
          Register
        </ReactWaButton>
      </form>
    </div>
  );
}
