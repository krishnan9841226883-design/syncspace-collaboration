/**
 * SyncSpace — Task Board Page (Kanban)
 * Real-time Kanban with Firestore sync and drag-and-drop
 */

import { useState, useCallback, useMemo, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../services/firestoreService';

interface TaskData {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  labels: { name: string; color: string }[];
  assignee: string;
  dueDate?: string;
  creatorId?: string;
}

/** Kanban column configuration — frozen for immutability */
const COLUMNS = Object.freeze([
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
] as const);

// Fallback demo data for when Firestore is empty or in demo mode
const demoTasks: TaskData[] = [
  { id: 't1', title: 'Set up CI/CD pipeline with Cloud Build', description: '', priority: 'high', status: 'todo', labels: [{ name: 'DevOps', color: '#6366f1' }], assignee: 'AK', dueDate: 'May 5' },
  { id: 't2', title: 'Write unit tests for auth module', description: '', priority: 'high', status: 'todo', labels: [{ name: 'Testing', color: '#14b8a6' }], assignee: 'JL' },
  { id: 't3', title: 'Create onboarding flow for new users', description: '', priority: 'medium', status: 'todo', labels: [{ name: 'UX', color: '#f59e0b' }], assignee: 'MP', dueDate: 'May 6' },
  { id: 't4', title: 'Implement Google Calendar API sync', description: '', priority: 'urgent', status: 'in_progress', labels: [{ name: 'Google', color: '#ea4335' }, { name: 'API', color: '#4285f4' }], assignee: 'SC', dueDate: 'Today' },
  { id: 't5', title: 'Accessibility audit & WCAG fixes', description: '', priority: 'medium', status: 'in_progress', labels: [{ name: 'A11y', color: '#10b981' }], assignee: 'CW', dueDate: 'May 3' },
  { id: 't6', title: 'Design analytics dashboard charts', description: '', priority: 'medium', status: 'review', labels: [{ name: 'Design', color: '#8b5cf6' }], assignee: 'MP' },
  { id: 't7', title: 'Implement Firestore security rules', description: '', priority: 'high', status: 'review', labels: [{ name: 'Security', color: '#ef4444' }], assignee: 'AK' },
  { id: 't8', title: 'Set up Firebase Authentication', description: '', priority: 'high', status: 'done', labels: [{ name: 'Auth', color: '#f59e0b' }], assignee: 'SC' },
  { id: 't9', title: 'Design system & CSS tokens', description: '', priority: 'medium', status: 'done', labels: [{ name: 'Design', color: '#8b5cf6' }], assignee: 'CW' },
  { id: 't10', title: 'Create shared TypeScript types', description: '', priority: 'low', status: 'done', labels: [{ name: 'Core', color: '#64748b' }], assignee: 'JL' },
];

/** Create Task Modal */
function CreateTaskModal({ onClose, onSave }: { onClose: () => void; onSave: (task: Partial<TaskData>) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskData['priority']>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, description, priority, status: 'todo', dueDate: dueDate || undefined, labels: [], assignee: '' });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal">
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">Create New Task</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="task-title" className="form-label">Task Title *</label>
              <input id="task-title" className="form-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task title..." required autoFocus aria-required="true" />
            </div>
            <div className="form-group">
              <label htmlFor="task-desc" className="form-label">Description</label>
              <textarea id="task-desc" className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the task..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-priority" className="form-label">Priority</label>
                <select id="task-priority" className="form-select" value={priority} onChange={(e) => setPriority(e.target.value as TaskData['priority'])}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-due" className="form-label">Due Date</label>
                <input id="task-due" className="form-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim()}>Create Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TaskBoard() {
  const { user, isDemoMode } = useAuth();
  const { tasks: firestoreTasks, addTask, updateTask } = useTasks();
  const [localTasks, setLocalTasks] = useState(demoTasks);
  const [showModal, setShowModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState<{ taskId: string; fromColumn: string } | null>(null);

  /** Memoized task list — recalculates only when source data changes */
  const allTasks: TaskData[] = useMemo(() => {
    if (!isDemoMode && firestoreTasks.length > 0) {
      return firestoreTasks.map(t => ({
        id: t.id,
        title: t.title || '',
        description: t.description || '',
        priority: (t.priority as TaskData['priority']) || 'medium',
        status: t.status || 'todo',
        labels: t.labels || [],
        assignee: t.assignee || '',
        dueDate: t.dueDate,
        creatorId: t.creatorId,
      }));
    }
    return localTasks;
  }, [isDemoMode, firestoreTasks, localTasks]);

  /** Memoized column grouping — recalculates only when tasks change */
  const columns = useMemo(
    () => COLUMNS.map(col => ({ ...col, tasks: allTasks.filter(t => t.status === col.id) })),
    [allTasks]
  );

  const handleDragStart = (taskId: string, fromColumn: string) => {
    setDraggedTask({ taskId, fromColumn });
  };

  const handleDrop = useCallback((toColumnId: string) => {
    if (!draggedTask || draggedTask.fromColumn === toColumnId) return;

    if (!isDemoMode && firestoreTasks.length > 0) {
      // Update in Firestore
      updateTask(draggedTask.taskId, { status: toColumnId });
    } else {
      // Update locally
      setLocalTasks(prev => prev.map(t =>
        t.id === draggedTask.taskId ? { ...t, status: toColumnId } : t
      ));
    }
    setDraggedTask(null);
  }, [draggedTask, isDemoMode, firestoreTasks.length, updateTask]);

  const handleSaveTask = async (task: Partial<TaskData>) => {
    if (!isDemoMode && user) {
      // Save to Firestore
      await addTask({
        title: task.title || '',
        description: task.description,
        priority: task.priority || 'medium',
        status: 'todo',
        assignee: task.assignee,
        dueDate: task.dueDate,
        labels: task.labels,
        creatorId: user.uid,
      });
    } else {
      // Save locally
      const newTask: TaskData = {
        id: `t${Date.now()}`,
        title: task.title || '',
        description: task.description || '',
        priority: (task.priority as TaskData['priority']) || 'medium',
        status: 'todo',
        labels: task.labels || [],
        assignee: task.assignee || '',
        dueDate: task.dueDate,
      };
      setLocalTasks(prev => [newTask, ...prev]);
    }
  };

  const totalTasks = allTasks.length;

  return (
    <div className="task-board" role="region" aria-label="Task board">
      <div className="task-board-header">
        <div>
          <h1>Task Board</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            {totalTasks} tasks across {columns.length} columns
            {!isDemoMode && firestoreTasks.length > 0 && <span style={{ color: 'var(--color-success-500)', marginLeft: 8 }}>● Synced with Firestore</span>}
          </p>
        </div>
        <div className="task-board-actions">
          <button className="btn btn-secondary" id="filter-tasks-btn" aria-label="Filter tasks">🔍 Filter</button>
          <button className="btn btn-primary" id="create-task-btn" onClick={() => setShowModal(true)} aria-label="Create new task">
            ➕ New Task
          </button>
        </div>
      </div>

      <div className="kanban-container" role="list" aria-label="Kanban columns">
        {columns.map((column) => (
          <div
            key={column.id}
            className="kanban-column"
            role="listitem"
            aria-label={`${column.title} column, ${column.tasks.length} tasks`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="kanban-column-header">
              <div className="kanban-column-title">
                <span className={`kanban-column-dot ${column.id}`} aria-hidden="true"></span>
                {column.title}
                <span className="kanban-column-count">{column.tasks.length}</span>
              </div>
            </div>
            <div className="kanban-column-body">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className="task-card"
                  draggable
                  onDragStart={() => handleDragStart(task.id, column.id)}
                  role="article"
                  aria-label={`Task: ${task.title}, Priority: ${task.priority}`}
                  tabIndex={0}
                >
                  <span className={`task-card-priority ${task.priority}`} aria-hidden="true"></span>
                  {task.labels && task.labels.length > 0 && (
                    <div className="task-card-labels">
                      {task.labels.map((l) => (
                        <span key={l.name} className="task-card-label" style={{ background: l.color }}>{l.name}</span>
                      ))}
                    </div>
                  )}
                  <div className="task-card-title">{task.title}</div>
                  <div className="task-card-footer">
                    <div className="task-card-meta">
                      {task.dueDate && (
                        <span className="task-card-meta-item" aria-label={`Due ${task.dueDate}`}>📅 {task.dueDate}</span>
                      )}
                    </div>
                    {task.assignee && (
                      <div className="sidebar-avatar-placeholder" style={{ width: 24, height: 24, fontSize: '10px' }} aria-label={`Assigned to ${task.assignee}`}>
                        {task.assignee.slice(0, 2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button className="kanban-add-btn" onClick={() => setShowModal(true)} aria-label={`Add task to ${column.title}`}>
                + Add task
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && <CreateTaskModal onClose={() => setShowModal(false)} onSave={handleSaveTask} />}
    </div>
  );
}
