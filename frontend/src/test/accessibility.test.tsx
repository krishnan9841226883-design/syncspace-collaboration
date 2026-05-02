/**
 * SyncSpace — Accessibility Tests
 * Automated WCAG 2.1 AA compliance checks
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Dashboard from '../pages/Dashboard';
import TaskBoard from '../pages/TaskBoard';
import Analytics from '../pages/Analytics';

expect.extend(toHaveNoViolations);

// Mock auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
    },
    loading: false,
    error: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe('Accessibility (WCAG 2.1 AA)', () => {
  it('Dashboard has no accessibility violations', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('TaskBoard has no accessibility violations', async () => {
    const { container } = render(<TaskBoard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Analytics has no accessibility violations', async () => {
    const { container } = render(<Analytics />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
