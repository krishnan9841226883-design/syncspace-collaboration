/**
 * SyncSpace — Analytics Page
 * Team productivity metrics and visual charts
 */

// React JSX transform handles this automatically

const velocityData = [12, 15, 18, 14, 20, 22, 18];
const maxVelocity = Math.max(...velocityData);

export default function Analytics() {
  return (
    <div className="dashboard" role="region" aria-label="Team Analytics">
      <div className="task-board-header">
        <div>
          <h1>📈 Analytics</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            Team productivity insights and metrics
          </p>
        </div>
        <div className="task-board-actions">
          <button className="btn btn-secondary">📥 Export Report</button>
        </div>
      </div>

      {/* Stats row */}
      <section className="stats-grid" aria-label="Key metrics">
        <article className="stat-card primary">
          <div className="stat-card-header">
            <div className="stat-card-icon">📊</div>
            <span className="stat-card-trend up">+12%</span>
          </div>
          <div className="stat-card-value">87%</div>
          <div className="stat-card-label">Completion Rate</div>
        </article>
        <article className="stat-card success">
          <div className="stat-card-header">
            <div className="stat-card-icon">⚡</div>
            <span className="stat-card-trend up">+8%</span>
          </div>
          <div className="stat-card-value">2.4d</div>
          <div className="stat-card-label">Avg. Completion Time</div>
        </article>
        <article className="stat-card warning">
          <div className="stat-card-header">
            <div className="stat-card-icon">🎯</div>
            <span className="stat-card-trend up">+15%</span>
          </div>
          <div className="stat-card-value">22</div>
          <div className="stat-card-label">Sprint Velocity</div>
        </article>
        <article className="stat-card accent">
          <div className="stat-card-header">
            <div className="stat-card-icon">💬</div>
            <span className="stat-card-trend up">+20%</span>
          </div>
          <div className="stat-card-value">156</div>
          <div className="stat-card-label">Messages This Week</div>
        </article>
      </section>

      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Velocity Chart */}
          <section className="card" aria-label="Sprint velocity chart">
            <div className="card-header">
              <h2 className="card-title">📊 Sprint Velocity</h2>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Last 7 sprints</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)', height: 200, paddingTop: 'var(--space-4)' }} role="img" aria-label="Bar chart showing sprint velocity over 7 sprints">
                {velocityData.map((val, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>{val}</span>
                    <div style={{
                      width: '100%', height: `${(val / maxVelocity) * 150}px`,
                      background: `linear-gradient(180deg, var(--color-primary-400), var(--color-primary-600))`,
                      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                      transition: 'height 0.5s ease-out',
                      minHeight: 20,
                    }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>S{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Task Distribution */}
          <section className="card" aria-label="Task distribution">
            <div className="card-header">
              <h2 className="card-title">📋 Task Distribution</h2>
            </div>
            <div className="card-body">
              {[
                { label: 'To Do', count: 3, pct: 12, color: 'var(--color-gray-400)' },
                { label: 'In Progress', count: 4, pct: 17, color: 'var(--color-primary-500)' },
                { label: 'Review', count: 2, pct: 8, color: 'var(--color-accent-500)' },
                { label: 'Done', count: 15, pct: 63, color: 'var(--color-success-500)' },
              ].map((item) => (
                <div key={item.label} style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>{item.label}</span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{item.count} ({item.pct}%)</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', overflow: 'hidden' }} role="progressbar" aria-valuenow={item.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${item.label}: ${item.pct}%`}>
                    <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: 'var(--radius-full)', transition: 'width 0.8s ease-out' }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Team Workload */}
          <section className="card" aria-label="Team workload">
            <div className="card-header">
              <h2 className="card-title">👥 Team Workload</h2>
            </div>
            <div className="card-body">
              {[
                { name: 'Sarah Chen', tasks: 6, capacity: 8 },
                { name: 'Alex Kim', tasks: 5, capacity: 8 },
                { name: 'Jordan Lee', tasks: 4, capacity: 6 },
                { name: 'Maya Patel', tasks: 7, capacity: 8 },
                { name: 'Chris Wu', tasks: 3, capacity: 6 },
              ].map((member) => (
                <div key={member.name} style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div className="sidebar-avatar-placeholder" style={{ width: 24, height: 24, fontSize: '10px' }}>{member.name.split(' ').map(n => n[0]).join('')}</div>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>{member.name}</span>
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{member.tasks}/{member.capacity}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', overflow: 'hidden' }} role="progressbar" aria-valuenow={member.tasks} aria-valuemax={member.capacity} aria-label={`${member.name}: ${member.tasks} of ${member.capacity} tasks`}>
                    <div style={{
                      height: '100%', width: `${(member.tasks / member.capacity) * 100}%`,
                      background: member.tasks / member.capacity > 0.85 ? 'var(--color-error-500)' : member.tasks / member.capacity > 0.6 ? 'var(--color-accent-500)' : 'var(--color-success-500)',
                      borderRadius: 'var(--radius-full)', transition: 'width 0.6s ease-out',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Insights */}
          <section className="card" aria-label="AI insights" style={{ border: '1px solid rgba(99, 102, 241, 0.2)', background: 'linear-gradient(135deg, rgba(99,102,241,0.03), rgba(20,184,166,0.03))' }}>
            <div className="card-header" style={{ borderBottom: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <h2 className="card-title">🧠 AI Insights</h2>
              <span style={{ fontSize: 'var(--text-xs)', padding: '2px 8px', background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-500)', borderRadius: 'var(--radius-full)', fontWeight: 'var(--font-semibold)' }}>Gemini</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[
                  { icon: '💡', text: 'Maya has high workload. Consider redistributing 2 tasks to Chris.' },
                  { icon: '⚠️', text: '2 tasks are approaching deadline without progress. Review by EOD.' },
                  { icon: '🎉', text: 'Team velocity increased 15% this sprint. Great momentum!' },
                  { icon: '📊', text: 'Code review turnaround improved by 30% after standup format change.' },
                ].map((insight, i) => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}>
                    <span aria-hidden="true">{insight.icon}</span>
                    <span>{insight.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
