import { Handle, Position, useReactFlow } from '@xyflow/react';
import { useState, useEffect, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { getFacebookToken } from '@/app/(app)/editor/actions';

export default function FacebookNode({ id, data }: any) {
  const { updateNodeData, setNodes } = useReactFlow();
  
  const [token, setToken] = useState(data.token || '');
  const [isConnected, setIsConnected] = useState(data.isConnected || false);
  const [accounts, setAccounts] = useState<any[]>(data.accounts || []);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(
    data.selectedAccounts || (data.selectedAccount ? [data.selectedAccount] : [])
  );
  const [datePreset, setDatePreset] = useState(data.datePreset || 'last_7d');
  const [level, setLevel] = useState(data.level || 'campaign');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAccMenuOpen, setIsAccMenuOpen] = useState(false);
  const [hasManuallyDisconnected, setHasManuallyDisconnected] = useState(data.hasManuallyDisconnected || false);

  // Function to fetch accounts using the current token
  const fetchAccounts = useCallback(async (tokenToUse: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/facebook/accounts?token=${tokenToUse}`);
      const resData = await res.json();
      
      if (resData.error) {
         setError(resData.error);
         setIsConnected(false);
      } else if (resData.accounts) {
         setAccounts(resData.accounts);
         setIsConnected(true);
         setToken(tokenToUse);
         setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
    }
    setLoading(false);
  }, []);

  // Sync state to React Flow
  useEffect(() => {
    updateNodeData(id, { token, isConnected, accounts, selectedAccounts, datePreset, level, hasManuallyDisconnected });
  }, [token, isConnected, accounts, selectedAccounts, datePreset, level, id, updateNodeData, hasManuallyDisconnected]);

  // Check for existing token in DB on mount
  useEffect(() => {
    if (isConnected || hasManuallyDisconnected) return; 

    const checkConnection = async () => {
      try {
        const dbToken = await getFacebookToken();
        if (dbToken) {
          await fetchAccounts(dbToken);
        }
      } catch (err) {
        console.error("Error checking FB connection:", err);
      }
    };
    checkConnection();
  }, [isConnected, fetchAccounts, hasManuallyDisconnected]);

  const handleConnect = async () => {
    setHasManuallyDisconnected(false);
    await signIn('facebook', { redirect: true });
  };

  const toggleAccount = (accId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accId) ? prev.filter(id => id !== accId) : [...prev, accId]
    );
  };

  const toggleAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedAccounts.length === accounts.length && accounts.length > 0) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(accounts.map(a => a.id));
    }
  };

  const disconnect = () => {
    setHasManuallyDisconnected(true);
    setIsConnected(false);
    setAccounts([]);
    setSelectedAccounts([]);
    setToken('');
    setMenuOpen(false);
  };

  return (
    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid #1877F2', borderRadius: 'var(--radius-md)', padding: '15px', color: 'white', minWidth: '280px', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
      <Handle type="target" position={Position.Left} />
      <div style={{ fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#1877F2', width: '24px', height: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>f</div>
            Facebook Ads
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
           <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                title="Menu" 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                •••
              </button>
              
              {menuOpen && (
                <div style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  right: 0, 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)', 
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 200,
                  minWidth: '120px',
                  padding: '4px'
                }}>
                  {isConnected && (
                    <button 
                      onClick={disconnect} 
                      style={{ 
                        width: '100%', 
                        textAlign: 'left', 
                        background: 'transparent', 
                        border: 'none', 
                        color: '#ff4d4d', 
                        padding: '8px 12px', 
                        cursor: 'pointer', 
                        fontSize: '0.85rem',
                        borderRadius: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 77, 77, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      Disconnect
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setNodes((nds) => nds.filter((n) => n.id !== id));
                      setMenuOpen(false);
                    }} 
                    style={{ 
                      width: '100%', 
                      textAlign: 'left', 
                      background: 'transparent', 
                      border: 'none', 
                      color: 'var(--text-primary)', 
                      padding: '8px 12px', 
                      cursor: 'pointer', 
                      fontSize: '0.85rem',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Remove Node
                  </button>
                </div>
              )}
           </div>
         </div>
      </div>
      
      {error && <div style={{ color: '#ff4d4d', fontSize: '0.75rem', marginBottom: '10px', background: 'rgba(255, 77, 77, 0.1)', padding: '8px', borderRadius: '4px' }}>{error}</div>}

      {!isConnected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Connect your Facebook Ad account to pull metrics.
          </p>
          <button 
            onClick={handleConnect}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              background: '#1877F2', 
              color: 'white', 
              border: 'none', 
              borderRadius: 'var(--radius-sm)', 
              cursor: 'pointer', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
            {loading ? 'Connecting...' : (
              <>
                <span>🔗</span> Connect Facebook
              </>
            )}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Select Ad Accounts</label>
            <button 
              onClick={() => fetchAccounts(token)} 
              disabled={loading}
              style={{ background: 'transparent', border: 'none', color: '#1877F2', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {loading ? '...' : '🔄 Refresh'}
            </button>
          </div>
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsAccMenuOpen(!isAccMenuOpen)}
              className="nodrag"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #1877F2',
                borderRadius: '6px',
                color: 'white',
                fontSize: '0.85rem',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedAccounts.length === 0 ? '--- Select ---' : `${selectedAccounts.length} selected`}
              </span>
              <span>{isAccMenuOpen ? '▲' : '▼'}</span>
            </button>

            {isAccMenuOpen && (
              <div 
                className="nodrag"
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  right: 0,
                  background: '#1a1a1d',
                  border: '1px solid #1877F2',
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  zIndex: 300,
                  padding: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                   <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Available Accounts</span>
                   <button 
                     onClick={toggleAll}
                     style={{ background: 'transparent', border: 'none', color: '#1877F2', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
                   >
                     {selectedAccounts.length === accounts.length ? 'Deselect All' : 'Select All'}
                   </button>
                </div>
                
          <div 
            className="nowheel"
            style={{ 
              maxHeight: '200px', 
              overflowY: 'auto' 
            }}
          >
            {accounts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No accounts found</div>
            ) : accounts.map(acc => (
              <div 
                key={acc.id}
                onClick={() => toggleAccount(acc.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px', 
                  cursor: 'pointer',
                  borderRadius: '4px',
                  background: selectedAccounts.includes(acc.id) ? 'rgba(24, 119, 242, 0.1)' : 'transparent',
                  marginBottom: '2px'
                }}
                onMouseEnter={(e) => !selectedAccounts.includes(acc.id) && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={(e) => !selectedAccounts.includes(acc.id) && (e.currentTarget.style.background = 'transparent')}
              >
                <input 
                  type="checkbox" 
                  checked={selectedAccounts.includes(acc.id)} 
                  readOnly
                  style={{ accentColor: '#1877F2' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.name}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{acc.id}</span>
                </div>
              </div>
            ))}
          </div>
              </div>
            )}
          </div>

          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '4px' }}>Date Range</label>
          <select 
             value={datePreset}
             onChange={(e) => setDatePreset(e.target.value)}
             style={{ 
               width: '100%', 
               padding: '10px', 
               background: 'rgba(255,255,255,0.05)', 
               border: '1px solid #1877F2', 
               color: 'white', 
               borderRadius: '6px', 
               fontSize: '0.85rem',
               outline: 'none'
             }}>
             <option value="today" style={{ background: '#1e1e22' }}>Today</option>
             <option value="yesterday" style={{ background: '#1e1e22' }}>Yesterday</option>
             <option value="last_3d" style={{ background: '#1e1e22' }}>Last 3 Days</option>
             <option value="last_7d" style={{ background: '#1e1e22' }}>Last 7 Days</option>
             <option value="last_30d" style={{ background: '#1e1e22' }}>Last 30 Days</option>
             <option value="this_month" style={{ background: '#1e1e22' }}>This Month</option>
             <option value="last_month" style={{ background: '#1e1e22' }}>Last Month</option>
             <option value="maximum" style={{ background: '#1e1e22' }}>Lifetime (Maximum)</option>
          </select>

          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '8px' }}>Aggregation Level</label>
          <select 
             value={level}
             onChange={(e) => setLevel(e.target.value)}
             style={{ 
               width: '100%', 
               padding: '10px', 
               background: 'rgba(255,255,255,0.05)', 
               border: '1px solid #1877F2', 
               color: 'white', 
               borderRadius: '6px', 
               fontSize: '0.85rem',
               outline: 'none'
             }}>
             <option value="account" style={{ background: '#1e1e22' }}>Account</option>
             <option value="campaign" style={{ background: '#1e1e22' }}>Campaign</option>
             <option value="adset" style={{ background: '#1e1e22' }}>Ad Set</option>
             <option value="ad" style={{ background: '#1e1e22' }}>Ad</option>
          </select>

          <div style={{ fontSize: '0.7rem', color: '#0F9D58', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
             <span>✅</span> Identity Connected ({selectedAccounts.length} selected)
          </div>
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
