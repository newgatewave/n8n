"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        {!isCollapsed && (
          <div className={styles.logo}>
            <span className="text-gradient">FlowSync</span>
          </div>
        )}
        <button 
          className={styles.toggleBtn} 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /><path d="m14 9 3 3-3 3" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /><path d="m16 15-3-3 3-3" /></svg>
          )}
        </button>
      </div>
      
      <nav className={styles.nav}>
        <Tooltip text="Dashboard" show={isCollapsed}>
          <Link 
            href="/dashboard" 
            className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}
          >
            <span className={styles.icon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
            </span>
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
        </Tooltip>
        
        <Tooltip text="Visual Editor" show={isCollapsed}>
          <Link 
            href="/editor" 
            className={`${styles.navItem} ${pathname?.includes('/editor') ? styles.active : ''}`}
          >
            <span className={styles.icon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" /></svg>
            </span>
            {!isCollapsed && <span>Visual Editor</span>}
          </Link>
        </Tooltip>

        <Tooltip text="Execution Logs" show={isCollapsed}>
          <Link 
            href="/logs" 
            className={`${styles.navItem} ${pathname?.includes('/logs') ? styles.active : ''}`}
          >
            <span className={styles.icon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 12h8" /><path d="M13 8h8" /><path d="M13 16h8" /><path d="M3 8h1" /><path d="M3 12h1" /><path d="M3 16h1" /><path d="M8 8h1" /><path d="M8 12h1" /><path d="M8 16h1" /></svg>
            </span>
            {!isCollapsed && <span>Execution Logs</span>}
          </Link>
        </Tooltip>
      </nav>

      <div className={styles.footer}>
        <Tooltip text="Sign Out" show={isCollapsed}>
          <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.logoutBtn}>
            <span className={styles.icon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
            </span>
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

// Simple internal Tooltip component for collapsed state
function Tooltip({ text, children, show }: { text: string, children: React.ReactNode, show: boolean }) {
  if (!show) return <>{children}</>;
  return (
    <div className={styles.tooltipContainer}>
      {children}
      <div className={styles.tooltipText}>{text}</div>
    </div>
  );
}
