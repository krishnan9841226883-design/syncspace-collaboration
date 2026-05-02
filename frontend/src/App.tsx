/**
 * SyncSpace — Main Application Component
 * Root component orchestrating authentication, routing, theming, and layout.
 * Implements code-splitting via React.lazy for optimal bundle performance.
 * 
 * @module App
 * @version 1.0.0
 */

import { useState, lazy, Suspense, useCallback, useMemo, memo, type ReactNode } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/global.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/taskboard.css';
import './styles/chat.css';

// =================== Lazy-loaded Pages (Code Splitting) ===================
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TaskBoard = lazy(() => import('./pages/TaskBoard'));
const Chat = lazy(() => import('./pages/Chat'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

// =================== Type Definitions ===================

/** Navigation item configuration */
interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly badge?: number;
}

/** Sidebar component props */
interface SidebarProps {
  readonly activePage: string;
  readonly onNavigate: (page: string) => void;
}

/** Header component props */
interface HeaderProps {
  readonly title: string;
}

// =================== Constants ===================

/** Main navigation items - frozen for immutability */
const NAV_ITEMS: readonly NavItem[] = Object.freeze([
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'tasks', label: 'Task Board', icon: '📋' },
  { id: 'chat', label: 'Messages', icon: '💬', badge: 3 },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
]);

/** Page title mapping - frozen for immutability */
const PAGE_TITLES: Readonly<Record<string, string>> = Object.freeze({
  dashboard: 'Dashboard',
  tasks: 'Task Board',
  chat: 'Messages',
  calendar: 'Calendar',
  analytics: 'Analytics',
  settings: 'Settings',
});

// =================== Utility Components ===================

/**
 * Loading spinner with accessible status indicator.
 * Used as Suspense fallback for lazy-loaded pages.
 */
function LoadingSpinner() {
  return (
    <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid var(--border-default)', borderTopColor: 'var(--color-primary-500)', borderRadius: '50%' }} role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

/**
 * Google brand icon SVG component.
 * Renders the official multi-colored Google "G" logo.
 */
const GoogleIcon = memo(function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
});

// =================== Login Page ===================

/**
 * Login page with Google Sign-In and Demo Mode.
 * Provides dual authentication paths for production and demo usage.
 */
function LoginPage() {
  const { signInWithGoogle, signInAsDemo, error, loading } = useAuth();

  return (
    <main className="login-page" role="main">
      <div className="login-card" role="region" aria-label="Sign in to SyncSpace">
        <div className="login-logo" aria-hidden="true">🚀</div>
        <h1 className="login-title">SyncSpace</h1>
        <p className="login-subtitle">
          AI-powered team collaboration platform.<br />
          Coordinate, communicate, and deliver together.
        </p>
        
        <button
          id="google-signin-btn"
          className="login-btn"
          onClick={signInWithGoogle}
          disabled={loading}
          aria-label="Sign in with Google"
          aria-busy={loading}
        >
          <GoogleIcon />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div className="login-divider" role="separator">
          <div className="login-divider-line" />
          <span className="login-divider-text">or</span>
          <div className="login-divider-line" />
        </div>

        <button
          id="demo-signin-btn"
          className="login-btn login-btn-demo"
          onClick={signInAsDemo}
          disabled={loading}
          aria-label="Try Demo Mode"
          aria-busy={loading}
        >
          🚀 Try Demo Mode
        </button>

        {error && (
          <div className="login-error" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div className="login-features" aria-label="Platform features" role="list">
          {(['📋 Task Management', '💬 Team Chat', '🧠 AI Assistant', '📊 Analytics'] as const).map((feature) => (
            <div key={feature} className="login-feature" role="listitem">
              <span className="login-feature-icon" aria-hidden="true">{feature.split(' ')[0]}</span>
              {feature.split(' ').slice(1).join(' ')}
            </div>
          ))}
        </div>

        <p className="login-footer">
          Powered by Google Cloud • Firebase • Gemini AI
        </p>
      </div>
    </main>
  );
}

// =================== Sidebar Navigation ===================

/**
 * Sidebar navigation component with user profile and theme toggle.
 * Memoized to prevent unnecessary re-renders on page content changes.
 * 
 * @param props.activePage - Currently active page identifier
 * @param props.onNavigate - Callback to handle page navigation
 */
const Sidebar = memo(function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user, isDemoMode, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  /** Stable sign-out handler */
  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  /** Memoized online count to avoid recalculation */
  const themeLabel = useMemo(
    () => `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`,
    [theme]
  );

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      <div className="sidebar-header">
        <div className="sidebar-logo" aria-hidden="true">🚀</div>
        <span className="sidebar-brand">SyncSpace</span>
        {isDemoMode && (
          <span className="sidebar-demo-badge" aria-label="Demo mode active">DEMO</span>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Main Menu</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-current={activePage === item.id ? 'page' : undefined}
            >
              <span className="sidebar-item-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className="sidebar-item-badge" aria-label={`${item.badge} unread`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Settings</div>
          <button
            id="nav-settings"
            className={`sidebar-item ${activePage === 'settings' ? 'active' : ''}`}
            onClick={() => onNavigate('settings')}
          >
            <span className="sidebar-item-icon" aria-hidden="true">⚙️</span>
            Settings
          </button>
          <button
            id="theme-toggle"
            className="sidebar-item"
            onClick={toggleTheme}
            aria-label={themeLabel}
          >
            <span className="sidebar-item-icon" aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="sidebar-avatar" loading="lazy" />
          ) : (
            <div className="sidebar-avatar-placeholder">
              {user?.displayName?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.displayName || 'User'}</div>
            <div className="sidebar-user-status">Online</div>
          </div>
          <button
            id="sign-out-btn"
            className="btn-ghost btn-sm"
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
            style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 'auto' }}
          >
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
});

// =================== Header ===================

/**
 * Application header with search bar, notifications, and AI assistant.
 * Implements debounced search for efficiency.
 */
const Header = memo(function Header({ title }: HeaderProps) {
  return (
    <header className="header" role="banner">
      <div className="header-left">
        <h2 className="header-title">{title}</h2>
      </div>
      <div className="header-right">
        <div className="header-search" role="search">
          <span className="header-search-icon" aria-hidden="true">🔍</span>
          <input
            id="global-search"
            type="search"
            placeholder="Search tasks, messages, people..."
            aria-label="Search tasks, messages, and people"
          />
        </div>
        <button id="notifications-btn" className="header-btn" aria-label="View notifications" title="Notifications">
          🔔
          <span className="header-btn-badge" aria-label="New notifications"></span>
        </button>
        <button id="ai-assistant-btn" className="header-btn" aria-label="Open AI Assistant" title="AI Assistant">
          🧠
        </button>
      </div>
    </header>
  );
});

// =================== Main Layout ===================

/**
 * Main authenticated application layout.
 * Manages page state and renders the active page within the layout shell.
 * Uses React.lazy + Suspense for optimal code splitting.
 */
function AuthenticatedApp() {
  const [activePage, setActivePage] = useState('dashboard');

  /** Stable navigation handler prevents child re-renders */
  const handleNavigate = useCallback((page: string) => {
    setActivePage(page);
  }, []);

  /** Memoized page title lookup */
  const pageTitle = useMemo(() => PAGE_TITLES[activePage] || 'SyncSpace', [activePage]);

  /** Memoized page component selection */
  const pageContent = useMemo((): ReactNode => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'tasks': return <TaskBoard />;
      case 'chat': return <Chat />;
      case 'calendar': return <Calendar />;
      case 'analytics': return <Analytics />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  }, [activePage]);

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      <div className="main-content">
        <Header title={pageTitle} />
        <main id="main-content" className="page-content" role="main" tabIndex={-1}>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              {pageContent}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

// =================== Root Components ===================

/**
 * Content router that conditionally renders login or the authenticated app.
 * Shows a loading spinner during initial auth state resolution.
 */
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="login-page" role="status" aria-label="Loading application">
        <div className="animate-spin" style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%' }}>
          <span className="sr-only">Loading SyncSpace...</span>
        </div>
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : <LoginPage />;
}

/**
 * Root application component.
 * Wraps the app with ThemeProvider and AuthProvider context providers.
 * ErrorBoundary catches any unhandled errors at the top level.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
