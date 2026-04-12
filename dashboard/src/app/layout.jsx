'use client';
import './globals.css';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth, getInitials, getDisplayName } from '@/lib/auth';
import RightSidebar from '@/components/RightSidebar';

const NAV = [
  { href:'/',          label:'Overview',      icon:'grid_view'       },
  { href:'/bookings',  label:'Bookings',      icon:'event_available' },
  { href:'/leads',     label:'Leads',         icon:'contact_phone'   },
  { href:'/calls',     label:'All calls',     icon:'call_log'        },
  { href:'/activity',  label:'Activity log',  icon:'history'         },
  { href:'/users',     label:'Users',         icon:'group', adminOnly:true },
];

const PUBLIC_PATHS = ['/login', '/cancel'];

function Icon({ name, size=20 }) {
  return <span className="material-symbols-outlined" style={{ fontSize:size }}>{name}</span>;
}

function LogoutDialog({ onConfirm, onCancel }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 16px' }}>
      <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'28px 24px', width:'100%', maxWidth:340 }}>
        <p style={{ fontSize:15, fontWeight:500, marginBottom:8 }}>Confirm sign out</p>
        <p style={{ fontSize:13, color:'var(--muted)', marginBottom:24, lineHeight:1.6 }}>
          Are you sure you want to sign out?
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onCancel}>Cancel</button>
          <button className="danger" onClick={onConfirm}>Yes, sign out</button>
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar nav item — shared by both desktop and mobile ── */
function NavItem({ href, label, icon, active, collapsed, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : ''}
      style={{
        display:'flex', alignItems:'center',
        gap: collapsed ? 0 : 10,
        padding: collapsed ? '10px 0' : '9px 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius:'var(--radius)',
        fontWeight: active ? 500 : 400,
        fontSize: 13,
        color:      active ? 'var(--accent)' : 'var(--text)',
        background: active ? 'var(--accent-bg)' : 'transparent',
        textDecoration:'none',
        transition:'background 0.15s',
        minHeight: 40,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background='var(--bg)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? 'var(--accent-bg)' : 'transparent'; }}
    >
      <Icon name={icon} size={20} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

/* ── Sidebar action button (theme, sign out) ── */
function SideBtn({ icon, label, collapsed, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : ''}
      style={{
        display:'flex', alignItems:'center',
        gap: collapsed ? 0 : 8,
        padding: collapsed ? '9px 0' : '9px 10px',
        justifyContent: 'center',
        borderRadius:'var(--radius)',
        fontSize:13, width:'100%', minHeight:40,
        background:'transparent', border:'none',
        cursor:'pointer', transition:'background 0.15s',
        textAlign:'center',
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.opacity='0.8'}
      onMouseLeave={e => e.currentTarget.style.opacity='1'}
    >
      <Icon name={icon} size={20} />
      {!collapsed && <span style={{ marginLeft:2 }}>{label}</span>}
    </button>
  );
}

/* ── The actual sidebar content ── */
function SidebarContent({ collapsed, theme, toggleTheme, user, onSignOut, onNavClick }) {
  const pathname  = usePathname();
  const initials  = getInitials(user);
  const display   = getDisplayName(user);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>

      {/* Logo row */}
      <div style={{ padding: collapsed ? '16px 0' : '16px 16px', borderBottom:'0.5px solid var(--border)', flexShrink:0, minHeight:60, display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        {!collapsed && (
          <div>
            <p style={{ fontSize:14, fontWeight:500 }}>AI Booking</p>
            <p style={{ fontSize:11, color:'var(--muted)', marginTop:1 }}>Admin dashboard</p>
          </div>
        )}
        {collapsed && <Icon name="directions_car" size={22} />}
      </div>

      {/* Nav links */}
      <nav style={{ flex:1, padding: collapsed ? '8px 6px' : '8px 8px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' }}>
        {NAV.filter(n => !n.adminOnly || user?.role === 'admin').map(({ href, label, icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <NavItem key={href} href={href} label={label} icon={icon} active={active} collapsed={collapsed} onClick={onNavClick} />
          );
        })}
      </nav>

      {/* Bottom section */}
      <div style={{ borderTop:'0.5px solid var(--border)', padding: collapsed ? '10px 6px' : '10px 10px', flexShrink:0, display:'flex', flexDirection:'column', gap:4 }}>

        {/* Avatar + name */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding: collapsed ? '6px 0' : '6px 4px', justifyContent: collapsed ? 'center' : 'flex-start', marginBottom:2 }}>
          <div style={{
            width:32, height:32, borderRadius:'50%', flexShrink:0,
            background:'var(--accent-bg)', color:'var(--accent)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:13, fontWeight:600,
          }}>
            {initials}
          </div>
          {!collapsed && (
            <div style={{ overflow:'hidden', flex:1 }}>
              <p style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{display}</p>
              <p style={{ fontSize:11, color:'var(--muted)', textTransform:'capitalize' }}>{user?.role}</p>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <SideBtn
          icon={theme === 'light' ? 'dark_mode' : 'light_mode'}
          label={theme === 'light' ? 'Dark mode' : 'Light mode'}
          collapsed={collapsed}
          onClick={toggleTheme}
          style={{ color:'var(--muted)', border:'0.5px solid var(--border)', borderRadius:'var(--radius)' }}
        />

        {/* Sign out */}
        <SideBtn
          icon="logout"
          label="Sign out"
          collapsed={collapsed}
          onClick={onSignOut}
          style={{ color:'var(--red)', background:'var(--red-bg)', borderRadius:'var(--radius)' }}
        />
      </div>
    </div>
  );
}

function Shell({ children }) {
  const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));

  const [theme,       setTheme]       = useState('light');
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [showLogout,  setShowLogout]  = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);
  const [hideRightBar, setHideRightBar] = useState(false);

  useEffect(() => {
    const savedTheme     = localStorage.getItem('theme') ?? 'light';
    const savedCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    setTheme(savedTheme);
    setCollapsed(savedCollapsed);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const mqMobile = window.matchMedia('(max-width: 768px)');
    const mqNarrow = window.matchMedia('(max-width: 1050px)');
    setIsMobile(mqMobile.matches);
    setHideRightBar(mqNarrow.matches);

    const handlerMobile = e => setIsMobile(e.matches);
    const handlerNarrow = e => setHideRightBar(e.matches);
    mqMobile.addEventListener('change', handlerMobile);
    mqNarrow.addEventListener('change', handlerNarrow);
    return () => {
      mqMobile.removeEventListener('change', handlerMobile);
      mqNarrow.removeEventListener('change', handlerNarrow);
    };
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar_collapsed', String(next));
  }

  useEffect(() => {
    if (!loading && !user && !isPublic) router.replace('/login');
    if (!loading &&  user && pathname === '/login') router.replace('/');
  }, [user, loading, isPublic]);

  // Close mobile drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
        <p style={{ color:'var(--muted)', fontSize:14 }}>Loading...</p>
      </div>
    );
  }

  if (isPublic || !user) return <>{children}</>;

  const SIDE_W = isMobile ? 0 : (collapsed ? 64 : 220);

  function handleSignOut() {
    logout();
    router.replace('/login');
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg)' }}>

      {/* ── Mobile overlay backdrop ── */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position:'fixed', inset:0, zIndex:40, background:'rgba(0,0,0,0.4)' }}
        />
      )}

      {/* ── Desktop sidebar ── */}
      {!isMobile && (
        <aside style={{
          width: SIDE_W, flexShrink:0,
          background:'var(--surface)',
          borderRight:'0.5px solid var(--border)',
          height:'100vh', overflow:'hidden',
          transition:'width 0.2s ease',
          position:'relative', zIndex:10,
        }}>
          {/* Collapse toggle button */}
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand' : 'Collapse'}
            style={{
              position:'absolute', top:14, right: collapsed ? '50%' : 12,
              transform: collapsed ? 'translateX(50%)' : 'none',
              zIndex:1, padding:'4px', border:'0.5px solid var(--border)',
              borderRadius:'var(--radius)', background:'var(--surface)',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', transition:'right 0.2s',
            }}
          >
            <Icon name={collapsed ? 'menu' : 'chevron_left'} size={16} />
          </button>
          <SidebarContent
            collapsed={collapsed} theme={theme}
            toggleTheme={toggleTheme} user={user}
            onSignOut={() => setShowLogout(true)}
          />
        </aside>
      )}

      {/* ── Mobile drawer ── */}
      {isMobile && (
        <aside style={{
          position:'fixed', top:0, left:0, bottom:0,
          width:240, zIndex:50,
          background:'var(--surface)',
          borderRight:'0.5px solid var(--border)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition:'transform 0.25s ease',
          overflowY:'auto',
        }}>
          <SidebarContent
            collapsed={false} theme={theme}
            toggleTheme={toggleTheme} user={user}
            onSignOut={() => setShowLogout(true)}
            onNavClick={() => setMobileOpen(false)}
          />
        </aside>
      )}

      {/* ── Main area ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        {/* Mobile topbar */}
        {isMobile && (
          <div style={{
            height:52, flexShrink:0, padding:'0 16px',
            background:'var(--surface)', borderBottom:'0.5px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{ border:'none', background:'none', padding:'6px', display:'flex', alignItems:'center' }}
            >
              <Icon name="menu" size={22} />
            </button>
            <p style={{ fontSize:14, fontWeight:500 }}>AI Booking</p>
            <button
              onClick={toggleTheme}
              style={{ border:'none', background:'none', padding:'6px', display:'flex', alignItems:'center', color:'var(--muted)' }}
            >
              <Icon name={theme==='light' ? 'dark_mode' : 'light_mode'} size={20} />
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
          <main style={{ flex:1, overflowY:'auto', padding: isMobile ? '20px 16px' : '0' }}>
            <div style={{ maxWidth: (hideRightBar && !isMobile) ? 1100 : 920, margin:'0 auto', padding: isMobile ? '0' : '32px 36px' }}>
              {children}
            </div>
          </main>

          {/* Right sidebar — hidden on mobile and below 1050px */}
          {!isMobile && !hideRightBar && <RightSidebar />}
        </div>
      </div>

      {showLogout && (
        <LogoutDialog
          onConfirm={handleSignOut}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
