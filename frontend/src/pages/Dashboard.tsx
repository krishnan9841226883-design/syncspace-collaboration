/**
 * SyncSpace — Dashboard Page
 * Main overview with stats, activity feed, team pulse, and quick actions
 */

// React JSX transform handles this automatically
import { useAuth } from '../contexts/AuthContext';

// Demo data for hackathon
const demoStats = [
  { label: 'Total Tasks', value: '24', trend: '+3 this week', trendDir: 'up' as const, type: 'primary' as const, icon: '📋' },
  { label: 'Completed', value: '18', trend: '75% rate', trendDir: 'up' as const, type: 'success' as const, icon: '✅' },
  { label: 'In Progress', value: '4', trend: '2 due today', trendDir: 'down' as const, type: 'warning' as const, icon: '⚡' },
  { label: 'Team Members', value: '8', trend: 'All active', trendDir: 'up' as const, type: 'accent' as const, icon: '👥' },
];

const demoActivities = [
  { id: '1', user: 'Sarah Chen', action: 'completed task', target: 'Design landing page', time: '2 min ago', initials: 'SC' },
  { id: '2', user: 'Alex Kim', action: 'created task', target: 'API integration tests', time: '15 min ago', initials: 'AK' },
  { id: '3', user: 'Jordan Lee', action: 'commented on', target: 'Sprint planning notes', time: '32 min ago', initials: 'JL' },
  { id: '4', user: 'Maya Patel', action: 'moved task to Review', target: 'User authentication', time: '1 hour ago', initials: 'MP' },
  { id: '5', user: 'Chris Wu', action: 'uploaded file to', target: '#design channel', time: '2 hours ago', initials: 'CW' },
];

const demoTasks = [
  { id: '1', title: 'Implement Google Calendar sync', priority: 'urgent' as const, status: 'in_progress' as const, due: 'Today' },
  { id: '2', title: 'Write unit tests for auth module', priority: 'high' as const, status: 'todo' as const, due: 'Tomorrow' },
  { id: '3', title: 'Design analytics dashboard charts', priority: 'medium' as const, status: 'review' as const, due: 'May 4' },
  { id: '4', title: 'Set up CI/CD pipeline', priority: 'high' as const, status: 'todo' as const, due: 'May 5' },
  { id: '5', title: 'Accessibility audit & fixes', priority: 'medium' as const, status: 'in_progress' as const, due: 'May 3' },
];

const demoTeam = [
  { name: 'Sarah', status: 'online' as const },
  { name: 'Alex', status: 'online' as const },
  { name: 'Jordan', status: 'away' as const },
  { name: 'Maya', status: 'dnd' as const },
  { name: 'Chris', status: 'online' as const },
  { name: 'Taylor', status: 'offline' as const },
  { name: 'Riley', status: 'online' as const },
  { name: 'Dev', status: 'away' as const },
];

const statusLabels: Record<string, string> = {
  todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done',
};

export default function Dashboard() {
  const { user } = useAuth();
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard">
      {/* Greeting */}
      <div className="dashboard-greeting">
        <h1>{greeting}, {user?.displayName?.split(' ')[0] || 'there'}! 👋</h1>
        <p>Here's what's happening with your team today.</p>
      </div>

      {/* Stats */}
      <section className="stats-grid" aria-label="Project statistics">
        {demoStats.map((stat) => (
          <article key={stat.label} className={`stat-card ${stat.type}`}>
            <div className="stat-card-header">
              <div className="stat-card-icon" aria-hidden="true">{stat.icon}</div>
              <span className={`stat-card-trend ${stat.trendDir}`}>{stat.trend}</span>
            </div>
            <div className="stat-card-value">{stat.value}</div>
            <div className="stat-card-label">{stat.label}</div>
          </article>
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
                <button className="quick-action-btn" id="qa-create-task" aria-label="Create new task">
                  <span className="quick-action-icon" aria-hidden="true">➕</span>
                  New Task
                </button>
                <button className="quick-action-btn" id="qa-start-meeting" aria-label="Start a meeting">
                  <span className="quick-action-icon" aria-hidden="true">📹</span>
                  Start Meeting
                </button>
                <button className="quick-action-btn" id="qa-ai-summary" aria-label="Get AI summary">
                  <span className="quick-action-icon" aria-hidden="true">🧠</span>
                  AI Summary
                </button>
                <button className="quick-action-btn" id="qa-team-pulse" aria-label="Check team pulse">
                  <span className="quick-action-icon" aria-hidden="true">💓</span>
                  Team Pulse
                </button>
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
                {demoTasks.map((task) => (
                  <div key={task.id} className="task-preview-item" role="listitem">
                    <span className={`task-priority-dot ${task.priority}`} role="img" aria-label={`${task.priority} priority`}></span>
                    <div className="task-preview-info">
                      <div className="task-preview-title">{task.title}</div>
                      <div className="task-preview-meta">Due: {task.due}</div>
                    </div>
                    <span className={`task-status-badge ${task.status}`}>{statusLabels[task.status]}</span>
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
                {demoTeam.filter(t => t.status === 'online').length} online
              </span>
            </div>
            <div className="card-body">
              <div className="team-members">
                {demoTeam.map((member) => (
                  <div key={member.name} className="team-member" title={`${member.name} — ${member.status}`}>
                    <div className="team-member-avatar">
                      <div className="sidebar-avatar-placeholder" style={{ width: 40, height: 40, fontSize: 'var(--text-sm)' }}>
                        {member.name[0]}
                      </div>
                      <span className={`team-member-status ${member.status}`} role="img" aria-label={member.status}></span>
                    </div>
                    <span className="team-member-name">{member.name}</span>
                  </div>
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
                {demoActivities.map((activity) => (
                  <li key={activity.id} className="activity-item">
                    <div className="activity-avatar" aria-hidden="true">{activity.initials}</div>
                    <div className="activity-content">
                      <div className="activity-text">
                        <strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong>
                      </div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
