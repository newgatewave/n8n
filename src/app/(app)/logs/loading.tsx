export default function LogsLoading() {
  return (
    <div style={{ padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div className="skeleton" style={{ width: '300px', height: '38px', marginBottom: '8px' }}></div>
        <div className="skeleton" style={{ width: '450px', height: '18px' }}></div>
      </header>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <th key={i} style={{ padding: '1.25rem 1.5rem' }}>
                  <div className="skeleton" style={{ width: '80px', height: '16px' }}></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div className="skeleton" style={{ width: '150px', height: '20px', marginBottom: '6px' }}></div>
                  <div className="skeleton" style={{ width: '100px', height: '14px' }}></div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '12px' }}></div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div className="skeleton" style={{ width: '90px', height: '18px' }}></div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div className="skeleton" style={{ width: '120px', height: '18px' }}></div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <div className="skeleton" style={{ width: '80px', height: '32px', borderRadius: '6px', marginLeft: 'auto' }}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
