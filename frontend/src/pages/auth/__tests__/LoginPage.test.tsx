import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { signIn } from '@/src/services/backend-service';

import LoginPage from '../LoginPage';

vi.mock('@/src/services/backend-service');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage Component', () => {
  it('allows user to type in username and password fields', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const usernameInput = screen.getByLabelText('Benutzername');
    const passwordInput = screen.getByLabelText('Passwort');

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
      fireEvent.click(screen.getByRole('button', { name: 'Einloggen' }));
    });

    expect(signIn).toHaveBeenCalledWith('testuser', 'testpassword');
  });
});
