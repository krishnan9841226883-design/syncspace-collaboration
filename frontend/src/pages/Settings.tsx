/**
 * SyncSpace — Settings Page
 * User profile, notification, and workspace settings
 */

// React JSX transform handles this automatically
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="dashboard" role="region" aria-label="Settings">
      <h1 style={{ marginBottom: 'var(--space-6)' }}>⚙️ Settings</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', maxWidth: 900 }}>
        {/* Profile */}
        <section className="card" aria-label="Profile settings">
          <div className="card-header"><h3 className="card-title">👤 Profile</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', border: '3px solid var(--color-primary-200)' }} />
              ) : (
                <div className="sidebar-avatar-placeholder" style={{ width: 64, height: 64, fontSize: 'var(--text-xl)' }}>
                  {user?.displayName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>{user?.displayName || 'User'}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{user?.email}</div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="settings-name" className="form-label">Display Name</label>
              <input id="settings-name" className="form-input" defaultValue={user?.displayName || ''} aria-label="Display name" />
            </div>
            <div className="form-group">
              <label htmlFor="settings-dept" className="form-label">Department</label>
              <select id="settings-dept" className="form-select" aria-label="Department">
                <option>Engineering</option>
                <option>Design</option>
                <option>Product</option>
                <option>Marketing</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 'var(--space-2)' }}>Save Changes</button>
          </div>
        </section>

        {/* Appearance */}
        <section className="card" aria-label="Appearance settings">
          <div className="card-header"><h3 className="card-title">🎨 Appearance</h3></div>
          <div className="card-body">
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)' }}>Theme</div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                {(['light', 'dark'] as const).map((t) => (
                  <button key={t} onClick={() => { if (theme !== t) toggleTheme(); }} className={`btn ${theme === t ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }} aria-pressed={theme === t} aria-label={`${t} mode`}>
                    {t === 'light' ? '☀️' : '🌙'} {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              ℹ️ Theme preference is saved locally and respects your system settings.
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="card" aria-label="Notification settings">
          <div className="card-header"><h3 className="card-title">🔔 Notifications</h3></div>
          <div className="card-body">
            {[
              { label: 'Task assignments', desc: 'When a task is assigned to you', id: 'notif-assign' },
              { label: 'Mentions', desc: 'When someone @mentions you', id: 'notif-mention' },
              { label: 'Deadlines', desc: 'Reminders for upcoming deadlines', id: 'notif-deadline' },
              { label: 'Meeting reminders', desc: '15 min before meetings', id: 'notif-meeting' },
            ].map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-default)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>{item.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{item.desc}</div>
                </div>
                <label className="sr-only" htmlFor={item.id}>{item.label}</label>
                <input type="checkbox" id={item.id} defaultChecked style={{ width: 18, height: 18, accentColor: 'var(--color-primary-600)' }} />
              </div>
            ))}
          </div>
        </section>

        {/* Google Services */}
        <section className="card" aria-label="Google services">
          <div className="card-header"><h3 className="card-title">🔷 Google Services</h3></div>
          <div className="card-body">
            {[
              { name: 'Firebase Auth', status: 'Connected', icon: '🔐' },
              { name: 'Cloud Firestore', status: 'Connected', icon: '🗄️' },
              { name: 'Cloud Storage', status: 'Connected', icon: '📁' },
              { name: 'Google Calendar', status: 'Connect', icon: '📅' },
              { name: 'Gemini AI', status: 'Configure', icon: '🧠' },
              { name: 'Google Meet', status: 'Connected', icon: '📹' },
              { name: 'Cloud Messaging', status: 'Connected', icon: '📨' },
            ].map((svc) => (
              <div key={svc.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-default)' }}>
                <span aria-hidden="true">{svc.icon}</span>
                <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>{svc.name}</span>
                <span style={{
                  fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', padding: '2px 10px', borderRadius: 'var(--radius-full)',
                  background: svc.status === 'Connected' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  color: svc.status === 'Connected' ? 'var(--color-success-500)' : 'var(--color-accent-600)',
                }}>{svc.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-default)' }}>
        <button className="btn btn-secondary" onClick={signOut} id="settings-signout" style={{ color: 'var(--color-error-500)' }} aria-label="Sign out of SyncSpace">
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}
