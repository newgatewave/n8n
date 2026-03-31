import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import LogDetailModal from "@/components/LogDetailModal";

export default async function LogsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  // Fetch executions for this user's workflows
  const executions = await prisma.workflowExecution.findMany({
    where: {
      workflow: {
        userId: session.user.id
      }
    },
    include: {
      workflow: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      startedAt: 'desc'
    },
    take: 50
  });

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Execution History</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Monitor your automation runs, track data syncs, and troubleshoot errors.
        </p>
      </header>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ minWidth: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>WORKFLOW</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>STATUS</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>RESULT</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>TIME</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {executions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📜</div>
                  <p>No executions found yet. Your workflows will appear here after they run.</p>
                  <Link href="/editor" className="text-gradient" style={{ display: 'inline-block', marginTop: '1rem', fontWeight: 600 }}>
                    Go to Editor →
                  </Link>
                </td>
              </tr>
            ) : (
              executions.map((exe) => (
                <tr key={exe.id} className="log-table-row">
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'white' }}>{exe.workflow.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {exe.workflowId.substring(0, 8)}...</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '99px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: exe.status === 'success' ? 'rgba(15, 157, 88, 0.15)' : 'rgba(255, 77, 77, 0.15)',
                      color: exe.status === 'success' ? '#0F9D58' : '#ff4d4d',
                      border: exe.status === 'success' ? '1px solid rgba(15, 157, 88, 0.3)' : '1px solid rgba(255, 77, 77, 0.3)'
                    }}>
                      <span style={{ fontSize: '10px' }}>{exe.status === 'success' ? '●' : '●'}</span>
                      {exe.status.toUpperCase()}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    {exe.status === 'success' ? (
                      <span style={{ color: '#0F9D58', fontSize: '0.85rem', fontWeight: 500 }}>
                        +{exe.rowsAdded} rows added
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }} title={exe.logs || ''}>
                        Error occurred
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(exe.startedAt).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <LogDetailModal 
                      logs={exe.logs} 
                      output={exe.output} 
                      status={exe.status} 
                      workflowName={exe.workflow.name} 
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
