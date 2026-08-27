import React, { useState, useEffect, createContext, useContext } from 'react';
import Sidebar from './components/sidebar/Sidebar.jsx';
import Header from './components/header/Header.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Leads from './pages/Leads.jsx';
import LeadDetail from './pages/LeadDetail.jsx';
import Callbacks from './pages/Callbacks.jsx';
import Import from './pages/Import.jsx';
import BulkEmail from './pages/BulkEmail.jsx';
import Reports from './pages/Reports.jsx';
import Audit from './pages/Audit.jsx';
import Users from './pages/Users.jsx';
import Settings from './pages/Settings.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import { getCurrentUser } from './services/api.js';

export const AppContext = createContext(null);

export function useApp() { return useContext(AppContext); }

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [program, setProgram] = useState('All Programs');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  useEffect(() => {
    let mounted = true;

    getCurrentUser()
      .then(user => {
        if (!mounted) return;
        setCurrentUser(user);
        setAuthError(null);
      })
      .catch(error => {
        if (!mounted) return;
        setAuthError(error?.message || 'Unable to authenticate with the CRM.');
      })
      .finally(() => {
        if (mounted) setAuthLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const navigate = (p, leadId = null) => {
    setPage(p);
    if (leadId) setSelectedLeadId(leadId);
    setSidebarOpen(false);
  };

  const ctx = { program, setProgram, navigate, addToast, selectedLeadId, currentUser, authLoading };

  if (authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background, #f8fafc)', color: 'var(--text, #0f172a)', fontFamily: 'inherit' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Loading CRM</div>
          <div style={{ fontSize: 13, color: 'var(--text-3, #64748b)' }}>Authenticating your Google account…</div>
        </div>
      </div>
    );
  }

  if (authError || !currentUser) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background, #f8fafc)', color: 'var(--text, #0f172a)', fontFamily: 'inherit', padding: 24 }}>
        <div style={{ maxWidth: 460, background: 'var(--surface, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: 10, padding: 24, boxShadow: 'var(--shadow-md, 0 8px 24px rgba(15,23,42,.08))' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>CRM access denied</div>
          <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-2, #475569)' }}>{authError || 'Your account is not authorized to use this CRM.'}</div>
        </div>
      </div>
    );
  }

  const pageTitle = {
    dashboard: 'Dashboard', leads: 'Leads', 'lead-detail': 'Lead Detail',
    callbacks: 'Callbacks', import: 'Import', 'bulk-email': 'Bulk Email',
    reports: 'Reports', audit: 'Audit Log', users: 'Users', settings: 'Settings',
  };

  return (
    <AppContext.Provider value={ctx}>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 40,
          }} />
        )}

        {/* Sidebar */}
        <div style={{
          position: window.innerWidth < 1024 ? 'fixed' : 'relative',
          left: 0, top: 0, bottom: 0, zIndex: 50,
          transform: window.innerWidth < 1024 && !sidebarOpen ? 'translateX(-100%)' : 'none',
          transition: 'transform .22s ease',
          flexShrink: 0,
        }}>
          <Sidebar activePage={page} onNavigate={navigate} />
        </div>

        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <Header
            title={pageTitle[page] || 'CRM'}
            program={program}
            onProgramChange={setProgram}
            currentUser={currentUser}
            onMenuClick={() => setSidebarOpen(o => !o)}
          />
          <main style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
            {page === 'dashboard' && <Dashboard />}
            {page === 'leads' && <Leads />}
            {page === 'lead-detail' && <LeadDetail leadId={selectedLeadId} />}
            {page === 'callbacks' && <Callbacks />}
            {page === 'import' && <Import />}
            {page === 'bulk-email' && <BulkEmail />}
            {page === 'reports' && <Reports />}
            {page === 'audit' && <Audit />}
            {page === 'users' && <Users />}
            {page === 'settings' && <Settings />}
          </main>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={id => setToasts(t => t.filter(x => x.id !== id))} />
    </AppContext.Provider>
  );
}
