import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import LoginPage from '../LoginPage';

describe('App Component', () => {
  it('renders correctly', () => {
    const { getAllByText } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    expect(getAllByText('Login')[0]).toBeInTheDocument();
  });
});
