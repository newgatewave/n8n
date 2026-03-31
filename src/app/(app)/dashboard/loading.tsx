export default function DashboardLoading() {
  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skeleton" style={{ width: '250px', height: '32px' }}></div>
          <div className="skeleton" style={{ width: '350px', height: '16px' }}></div>
        </div>
        <div className="skeleton" style={{ width: '150px', height: '42px', borderRadius: '8px' }}></div>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem', minHeight: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div className="skeleton" style={{ width: '120px', height: '24px' }}></div>
              <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '12px' }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="skeleton" style={{ width: '80%', height: '14px' }}></div>
              <div className="skeleton" style={{ width: '60%', height: '14px' }}></div>
              <div className="skeleton" style={{ width: '70%', height: '14px' }}></div>
            </div>
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
              <div className="skeleton" style={{ flexGrow: 1, height: '36px' }}></div>
              <div className="skeleton" style={{ width: '100px', height: '36px' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
