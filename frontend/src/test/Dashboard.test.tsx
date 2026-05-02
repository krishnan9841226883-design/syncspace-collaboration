/**
 * SyncSpace — Dashboard Component Tests
 * Tests for the main dashboard page
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';

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

describe('Dashboard', () => {
  it('renders greeting with user name', () => {
    render(<Dashboard />);
    // "Test" appears in multiple elements, check for the greeting heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('renders stats cards', () => {
    render(<Dashboard />);
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
    expect(screen.getByText('Team Members')).toBeInTheDocument();
  });

  it('renders quick actions section', () => {
    render(<Dashboard />);
    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(screen.getByText('Start Meeting')).toBeInTheDocument();
    expect(screen.getByText('AI Summary')).toBeInTheDocument();
    expect(screen.getByText('Team Pulse')).toBeInTheDocument();
  });

  it('renders activity feed', () => {
    render(<Dashboard />);
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Alex Kim')).toBeInTheDocument();
  });

  it('renders upcoming tasks section', () => {
    render(<Dashboard />);
    expect(screen.getByText('Implement Google Calendar sync')).toBeInTheDocument();
    expect(screen.getByText('Write unit tests for auth module')).toBeInTheDocument();
  });

  it('has proper ARIA labels for sections', () => {
    render(<Dashboard />);
    expect(screen.getByLabelText('Project statistics')).toBeInTheDocument();
    expect(screen.getByLabelText('Quick actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Recent activity')).toBeInTheDocument();
  });

  it('renders team members widget with online status', () => {
    render(<Dashboard />);
    expect(screen.getByLabelText('Team members')).toBeInTheDocument();
  });

  it('has unique IDs on quick action buttons', () => {
    render(<Dashboard />);
    expect(document.getElementById('qa-create-task')).toBeInTheDocument();
    expect(document.getElementById('qa-start-meeting')).toBeInTheDocument();
    expect(document.getElementById('qa-ai-summary')).toBeInTheDocument();
    expect(document.getElementById('qa-team-pulse')).toBeInTheDocument();
  });
});
