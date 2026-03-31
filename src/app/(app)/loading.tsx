export default function GlobalLoading() {
  return (
    <div style={{ 
      width: '100%', 
      height: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '1.5rem'
    }}>
      <div className="loader-glow"></div>
      <div style={{ 
        fontSize: '1.1rem', 
        fontWeight: 500, 
        color: 'var(--text-secondary)',
        letterSpacing: '0.05em'
      }}>
        Syncing your workspace...
      </div>
    </div>
  );
}
