/**
 * SyncSpace — Calendar Page
 * Google Calendar integration with team events
 */

import { useState } from 'react';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface CalEvent {
  id: string;
  title: string;
  date: number;
  time: string;
  color: string;
  meetLink?: string;
}

const demoEvents: CalEvent[] = [
  { id: 'e1', title: 'Sprint Planning', date: 2, time: '10:00 AM', color: '#6366f1', meetLink: 'https://meet.google.com/abc-def-ghi' },
  { id: 'e2', title: 'Design Review', date: 3, time: '2:00 PM', color: '#8b5cf6' },
  { id: 'e3', title: 'Team Standup', date: 5, time: '9:30 AM', color: '#14b8a6', meetLink: 'https://meet.google.com/xyz-uvw-rst' },
  { id: 'e4', title: 'Demo Day', date: 7, time: '3:00 PM', color: '#f59e0b' },
  { id: 'e5', title: 'Retrospective', date: 9, time: '4:00 PM', color: '#10b981', meetLink: 'https://meet.google.com/jkl-mno-pqr' },
];

export default function Calendar() {
  const [currentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = currentDate.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calDays.push(i);

  return (
    <div className="dashboard" role="region" aria-label="Calendar">
      <div className="task-board-header">
        <div>
          <h1>📅 Calendar</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            {monthNames[month]} {year} — Synced with Google Calendar
          </p>
        </div>
        <div className="task-board-actions">
          <button className="btn btn-secondary" aria-label="Sync with Google Calendar">🔄 Sync Calendar</button>
          <button className="btn btn-primary" aria-label="Create new event">➕ New Event</button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Calendar Grid */}
        <section className="card" aria-label="Monthly calendar view">
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-default)' }}>
              {days.map((d) => (
                <div key={d} style={{ padding: 'var(--space-3)', textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  {d}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {calDays.map((day, idx) => {
                const eventsForDay = day ? demoEvents.filter((e) => e.date === day) : [];
                const isToday = day === today;
                return (
                  <div
                    key={idx}
                    style={{
                      minHeight: 100,
                      padding: 'var(--space-2)',
                      borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-default)' : 'none',
                      borderBottom: '1px solid var(--border-default)',
                      background: isToday ? 'rgba(99, 102, 241, 0.04)' : undefined,
                    }}
                    role="gridcell"
                    aria-label={day ? `${monthNames[month]} ${day}` : undefined}
                  >
                    {day && (
                      <>
                        <div style={{
                          width: 28, height: 28, borderRadius: 'var(--radius-full)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 'var(--text-sm)', fontWeight: isToday ? 'var(--font-bold)' : 'var(--font-normal)',
                          background: isToday ? 'var(--color-primary-600)' : 'transparent',
                          color: isToday ? 'white' : 'var(--text-primary)',
                          marginBottom: 'var(--space-1)',
                        }}>
                          {day}
                        </div>
                        {eventsForDay.map((ev) => (
                          <div
                            key={ev.id}
                            style={{
                              fontSize: '11px', padding: '2px 6px', borderRadius: 'var(--radius-sm)',
                              background: ev.color + '20', color: ev.color, fontWeight: 'var(--font-medium)',
                              marginBottom: 2, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}
                            title={`${ev.title} at ${ev.time}`}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <div>
          <section className="card" aria-label="Upcoming events">
            <div className="card-header">
              <h3 className="card-title">📅 Upcoming Events</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {demoEvents.map((ev) => (
                  <div key={ev.id} style={{
                    padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-default)', display: 'flex', gap: 'var(--space-3)',
                    alignItems: 'center', transition: 'all var(--transition-fast)', cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 4, height: 40, borderRadius: 'var(--radius-full)', background: ev.color, flexShrink: 0,
                    }} aria-hidden="true" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>{ev.title}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>May {ev.date} · {ev.time}</div>
                    </div>
                    {ev.meetLink && (
                      <a href={ev.meetLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary" aria-label={`Join ${ev.title} meeting`}>
                        📹 Join
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="card" style={{ marginTop: 'var(--space-4)' }} aria-label="Google Meet">
            <div className="card-header">
              <h3 className="card-title">📹 Quick Meeting</h3>
            </div>
            <div className="card-body">
              <button className="btn btn-primary" style={{ width: '100%' }} id="start-meet-btn" aria-label="Start instant Google Meet">
                🚀 Start Instant Google Meet
              </button>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)', textAlign: 'center' }}>
                Powered by Google Meet
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
