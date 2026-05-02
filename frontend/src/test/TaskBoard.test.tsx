/**
 * SyncSpace — TaskBoard Component Tests
 * Tests for the Kanban task board page
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskBoard from '../pages/TaskBoard';

describe('TaskBoard', () => {
  it('renders task board with title', () => {
    render(<TaskBoard />);
    expect(screen.getByText('Task Board')).toBeInTheDocument();
  });

  it('renders all four Kanban columns', () => {
    render(<TaskBoard />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders task cards with titles', () => {
    render(<TaskBoard />);
    expect(screen.getByText('Set up CI/CD pipeline with Cloud Build')).toBeInTheDocument();
    expect(screen.getByText('Implement Google Calendar API sync')).toBeInTheDocument();
    expect(screen.getByText('Set up Firebase Authentication')).toBeInTheDocument();
  });

  it('shows task labels', () => {
    render(<TaskBoard />);
    expect(screen.getByText('DevOps')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('has create task button', () => {
    render(<TaskBoard />);
    const btn = document.getElementById('create-task-btn');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-label', 'Create new task');
  });

  it('opens create task modal when clicking New Task', () => {
    render(<TaskBoard />);
    fireEvent.click(document.getElementById('create-task-btn')!);
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Task Title *')).toBeInTheDocument();
  });

  it('closes modal when clicking close button', () => {
    render(<TaskBoard />);
    fireEvent.click(document.getElementById('create-task-btn')!);
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
  });

  it('creates a new task via modal', () => {
    render(<TaskBoard />);
    fireEvent.click(document.getElementById('create-task-btn')!);
    const titleInput = screen.getByLabelText('Task Title *');
    fireEvent.change(titleInput, { target: { value: 'New test task' } });
    fireEvent.click(screen.getByText('Create Task'));
    expect(screen.getByText('New test task')).toBeInTheDocument();
  });

  it('has proper ARIA roles for Kanban board', () => {
    render(<TaskBoard />);
    expect(screen.getByRole('region', { name: 'Task board' })).toBeInTheDocument();
  });

  it('shows task count per column', () => {
    render(<TaskBoard />);
    // Check for column count badges
    const badges = document.querySelectorAll('.kanban-column-count');
    expect(badges.length).toBe(4);
  });
});
