import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from './page.module.css';
import DeleteWorkflowButton from '@/components/DeleteWorkflowButton';

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  const workflows = await prisma.workflow.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Your Automations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage and monitor your data sync workflows.
          </p>
        </div>
        <Link href="/editor" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}>
          + New Workflow
        </Link>
      </header>

      {workflows.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
          <h2>No workflows yet</h2>
          <p>Create your first automation in the Visual Editor to start syncing data.</p>
          <Link href="/editor" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            Open Visual Editor
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {workflows.map((wf) => {
            // Helper to find specific node data from the visual nodes
            const nodes = (wf.nodesData as any[]) || [];
            const fbNodes = nodes.filter(n => n.type === 'facebook');
            const sheetNodes = nodes.filter(n => n.type === 'googleSheet');
            const scheduleNode = nodes.find(n => n.type === 'schedule');

            return (
              <div key={wf.id} className={`${styles.card} glass-card`} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className={styles.cardHeader}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{wf.name}</h3>
                  <span className={`${styles.status} ${wf.active ? styles.statusActive : styles.statusInactive}`}>
                    {wf.active ? 'Active' : 'Draft'}
                  </span>
                </div>
                <div className={styles.cardBody} style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span title="Facebook Source">📡</span>
                      <span>{fbNodes.length} Account(s)</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span title="Google Sheet Destination">📄</span>
                      <span>Target: {sheetNodes[0]?.data?.selectedSheet || 'Not set'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span title="Schedule">⏰</span>
                      <span>{scheduleNode ? `Freq: ${scheduleNode.data?.frequency || 'Daily'}` : 'Manual'}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.cardFooter} style={{ display: 'flex', gap: '12px', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <Link 
                    href={`/editor?id=${wf.id}`} 
                    className="btn btn-secondary" 
                    style={{ 
                      flexGrow: 1, 
                      textAlign: 'center', 
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>⚙️</span> Edit
                  </Link>
                  <DeleteWorkflowButton id={wf.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
