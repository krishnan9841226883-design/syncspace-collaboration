/**
 * SyncSpace — Dashboard Page
 * Main overview displaying project statistics, activity feed, team status,
 * and quick action shortcuts. Uses memoization for optimal rendering.
 * 
 * @module Dashboard
 */

import { useMemo, memo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

// =================== Type Definitions ===================

/** Statistical metric card configuration */
interface StatItem {
  readonly label: string;
  readonly value: string;
  readonly trend: string;
  readonly trendDir: 'up' | 'down';
  readonly type: 'primary' | 'success' | 'warning' | 'accent';
  readonly icon: string;
}

/** Activity feed entry */
interface ActivityItem {
  readonly id: string;
  readonly user: string;
  readonly action: string;
  readonly target: string;
  readonly time: string;
  readonly initials: string;
}

/** Upcoming task preview */
interface TaskPreview {
  readonly id: string;
  readonly title: string;
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly status: 'todo' | 'in_progress' | 'review' | 'done';
  readonly due: string;
}

/** Team member status */
interface TeamMember {
  readonly name: string;
  readonly status: 'online' | 'away' | 'dnd' | 'offline';
}

// =================== Constants (Frozen for immutability) ===================

const DEMO_STATS: readonly StatItem[] = Object.freeze([
  { label: 'Total Tasks', value: '24', trend: '+3 this week', trendDir: 'up', type: 'primary', icon: '📋' },
  { label: 'Completed', value: '18', trend: '75% rate', trendDir: 'up', type: 'success', icon: '✅' },
  { label: 'In Progress', value: '4', trend: '2 due today', trendDir: 'down', type: 'warning', icon: '⚡' },
  { label: 'Team Members', value: '8', trend: 'All active', trendDir: 'up', type: 'accent', icon: '👥' },
]);

const DEMO_ACTIVITIES: readonly ActivityItem[] = Object.freeze([
  { id: '1', user: 'Sarah Chen', action: 'completed task', target: 'Design landing page', time: '2 min ago', initials: 'SC' },
  { id: '2', user: 'Alex Kim', action: 'created task', target: 'API integration tests', time: '15 min ago', initials: 'AK' },
  { id: '3', user: 'Jordan Lee', action: 'commented on', target: 'Sprint planning notes', time: '32 min ago', initials: 'JL' },
  { id: '4', user: 'Maya Patel', action: 'moved task to Review', target: 'User authentication', time: '1 hour ago', initials: 'MP' },
  { id: '5', user: 'Chris Wu', action: 'uploaded file to', target: '#design channel', time: '2 hours ago', initials: 'CW' },
]);

const DEMO_TASKS: readonly TaskPreview[] = Object.freeze([
  { id: '1', title: 'Implement Google Calendar sync', priority: 'urgent', status: 'in_progress', due: 'Today' },
  { id: '2', title: 'Write unit tests for auth module', priority: 'high', status: 'todo', due: 'Tomorrow' },
  { id: '3', title: 'Design analytics dashboard charts', priority: 'medium', status: 'review', due: 'May 4' },
  { id: '4', title: 'Set up CI/CD pipeline', priority: 'high', status: 'todo', due: 'May 5' },
  { id: '5', title: 'Accessibility audit & fixes', priority: 'medium', status: 'in_progress', due: 'May 3' },
]);

const DEMO_TEAM: readonly TeamMember[] = Object.freeze([
  { name: 'Sarah', status: 'online' },
  { name: 'Alex', status: 'online' },
  { name: 'Jordan', status: 'away' },
  { name: 'Maya', status: 'dnd' },
  { name: 'Chris', status: 'online' },
  { name: 'Taylor', status: 'offline' },
  { name: 'Riley', status: 'online' },
  { name: 'Dev', status: 'away' },
]);

const STATUS_LABELS: Readonly<Record<string, string>> = Object.freeze({
  todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done',
});

// =================== Memoized Sub-Components ===================

/** Stat card rendered with memo to prevent unnecessary re-renders */
const StatCard = memo(function StatCard({ stat }: { stat: StatItem }) {
  return (
    <article className={`stat-card ${stat.type}`}>
      <div className="stat-card-header">
        <div className="stat-card-icon" aria-hidden="true">{stat.icon}</div>
        <span className={`stat-card-trend ${stat.trendDir}`}>{stat.trend}</span>
      </div>
      <div className="stat-card-value">{stat.value}</div>
      <div className="stat-card-label">{stat.label}</div>
    </article>
  );
});

/** Activity list item */
const ActivityListItem = memo(function ActivityListItem({ activity }: { activity: ActivityItem }) {
  return (
    <li className="activity-item">
      <div className="activity-avatar" aria-hidden="true">{activity.initials}</div>
      <div className="activity-content">
        <div className="activity-text">
          <strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong>
        </div>
        <div className="activity-time">{activity.time}</div>
      </div>
    </li>
  );
});

/** Team member avatar with status indicator */
const TeamMemberItem = memo(function TeamMemberItem({ member }: { member: TeamMember }) {
  return (
    <div className="team-member" title={`${member.name} — ${member.status}`}>
      <div className="team-member-avatar">
        <div className="sidebar-avatar-placeholder" style={{ width: 40, height: 40, fontSize: 'var(--text-sm)' }}>
          {member.name[0]}
        </div>
        <span className={`team-member-status ${member.status}`} role="img" aria-label={member.status}></span>
      </div>
      <span className="team-member-name">{member.name}</span>
    </div>
  );
});

// =================== Quick Actions ===================

/** Quick action button configuration */
const QUICK_ACTIONS = [
  { id: 'qa-create-task', icon: '➕', label: 'New Task', ariaLabel: 'Create new task' },
  { id: 'qa-start-meeting', icon: '📹', label: 'Start Meeting', ariaLabel: 'Start a meeting' },
  { id: 'qa-ai-summary', icon: '🧠', label: 'AI Summary', ariaLabel: 'Get AI summary' },
  { id: 'qa-team-pulse', icon: '💓', label: 'Team Pulse', ariaLabel: 'Check team pulse' },
] as const;

// =================== Dashboard Component ===================

/**
 * Dashboard page component.
 * Renders a high-level overview of project health, team status, and recent activity.
 * All subcomponents are memoized for rendering efficiency.
 */
export default function Dashboard() {
  const { user } = useAuth();

  /** Compute time-based greeting */
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  /** First name extraction */
  const firstName = useMemo(
    () => user?.displayName?.split(' ')[0] || 'there',
    [user?.displayName]
  );

  /** Compute online team count */
  const onlineCount = useMemo(
    () => DEMO_TEAM.filter(t => t.status === 'online').length,
    []
  );

  /** Quick action handler */
  const handleQuickAction = useCallback((actionId: string) => {
    // Placeholder for action dispatch (navigate, open modal, etc.)
    console.warn(`Quick action triggered: ${actionId}`);
  }, []);

  return (
    <div className="dashboard">
      {/* Greeting */}
      <div className="dashboard-greeting">
        <h1>{greeting}, {firstName}! 👋</h1>
        <p>Here's what's happening with your team today.</p>
      </div>

      {/* Stats Grid */}
      <section className="stats-grid" aria-label="Project statistics">
        {DEMO_STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Quick Actions */}
          <section className="card" aria-label="Quick actions">
            <div className="card-header">
              <h2 className="card-title">⚡ Quick Actions</h2>
            </div>
            <div className="card-body">
              <div className="quick-actions">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    className="quick-action-btn"
                    id={action.id}
                    aria-label={action.ariaLabel}
                    onClick={() => handleQuickAction(action.id)}
                  >
                    <span className="quick-action-icon" aria-hidden="true">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Upcoming Tasks */}
          <section className="card" aria-label="Upcoming tasks">
            <div className="card-header">
              <h2 className="card-title">📋 Upcoming Tasks</h2>
              <button className="card-action" aria-label="View all tasks">View All →</button>
            </div>
            <div className="card-body">
              <div className="task-preview-list" role="list">
                {DEMO_TASKS.map((task) => (
                  <div key={task.id} className="task-preview-item" role="listitem">
                    <span className={`task-priority-dot ${task.priority}`} role="img" aria-label={`${task.priority} priority`}></span>
                    <div className="task-preview-info">
                      <div className="task-preview-title">{task.title}</div>
                      <div className="task-preview-meta">Due: {task.due}</div>
                    </div>
                    <span className={`task-status-badge ${task.status}`}>{STATUS_LABELS[task.status]}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Team Members */}
          <section className="card" aria-label="Team members">
            <div className="card-header">
              <h2 className="card-title">👥 Team</h2>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                {onlineCount} online
              </span>
            </div>
            <div className="card-body">
              <div className="team-members">
                {DEMO_TEAM.map((member) => (
                  <TeamMemberItem key={member.name} member={member} />
                ))}
              </div>
            </div>
          </section>

          {/* Activity Feed */}
          <section className="card" aria-label="Recent activity">
            <div className="card-header">
              <h2 className="card-title">🔔 Activity</h2>
              <button className="card-action" aria-label="View all activity">View All →</button>
            </div>
            <div className="card-body">
              <ul className="activity-list" role="list" aria-label="Recent activities">
                {DEMO_ACTIVITIES.map((activity) => (
                  <ActivityListItem key={activity.id} activity={activity} />
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
