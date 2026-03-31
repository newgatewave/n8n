import { Handle, Position, useReactFlow } from '@xyflow/react';
import { useState, useEffect, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { getGoogleToken } from '@/app/(app)/editor/actions';

export default function GoogleSheetNode({ id, data }: any) {
  const { updateNodeData, setNodes } = useReactFlow();
  
  const [isConnected, setIsConnected] = useState(data.isConnected || false);
  const [hasManuallyDisconnected, setHasManuallyDisconnected] = useState(data.hasManuallyDisconnected || false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [files, setFiles] = useState<any[]>([]);
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState(data.selectedFile || '');
  const [selectedSheet, setSelectedSheet] = useState(data.selectedSheet || '');

  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync to graph
  useEffect(() => {
    updateNodeData(id, { selectedFile, selectedSheet, isConnected, hasManuallyDisconnected });
  }, [selectedFile, selectedSheet, isConnected, hasManuallyDisconnected, id, updateNodeData]);

  const loadFiles = useCallback(async () => {
    setLoadingFiles(true);
    setError(null);
    try {
      const res = await fetch('/api/google/drive');
      const resData = await res.json();
      if (resData.error) {
        setError(resData.error);
        if (resData.error.includes("connection")) setIsConnected(false);
      } else if (resData.files) {
        setFiles(resData.files);
        setIsConnected(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load files");
    }
    setLoadingFiles(false);
  }, []);

  // Check connection and load data
  useEffect(() => {
    if (hasManuallyDisconnected) return;

    if (!isConnected) {
      const checkConnection = async () => {
        try {
          const token = await getGoogleToken();
          if (token) {
            await loadFiles();
          }
        } catch (e) {
          console.error("Error checking Google connection:", e);
        }
      };
      checkConnection();
    } else if (files.length === 0 && !loadingFiles) {
      // If connected but no files loaded yet, load them once
      loadFiles();
    }
  }, [isConnected, hasManuallyDisconnected, loadFiles]); // Removed files.length and loadingFiles to prevent loop

  useEffect(() => {
    if (!selectedFile || !isConnected) return;
    setLoadingSheets(true);
    fetch(`/api/google/sheets?spreadsheetId=${selectedFile}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.tabs) setSheets(resData.tabs);
        setLoadingSheets(false);
      })
      .catch(() => setLoadingSheets(false));
  }, [selectedFile, isConnected]);

  const handleConnect = async () => {
    setHasManuallyDisconnected(false);
    await signIn('google', { redirect: true });
  };

  const disconnect = () => {
    setHasManuallyDisconnected(true);
    setIsConnected(false);
    setFiles([]);
    setSheets([]);
    setSelectedFile('');
    setSelectedSheet('');
    setMenuOpen(false);
  };

  return (
    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid #0F9D58', borderRadius: 'var(--radius-md)', padding: '15px', color: 'white', minWidth: '250px', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
      <Handle type="target" position={Position.Left} />
      <div style={{ fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#0F9D58', width: '24px', height: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📊</div>
          Google Sheets
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              •••
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)', zIndex: 100, minWidth: '120px', padding: '4px' }}>
                {isConnected && (
                  <button onClick={disconnect} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#ff4d4d', padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', borderRadius: '4px' }}>
                    Disconnect
                  </button>
                )}
                <button onClick={() => setNodes((nds) => nds.filter((n) => n.id !== id))} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', borderRadius: '4px' }}>
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
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Connect with Google Drive to select your sheets.</p>
          <button 
            onClick={handleConnect}
            style={{ width: '100%', padding: '10px', background: '#0F9D58', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>🔗</span> Connect Google
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Spreadsheet</label>
              <button 
                onClick={loadFiles} 
                disabled={loadingFiles}
                style={{ background: 'transparent', border: 'none', color: '#0F9D58', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {loadingFiles ? '...' : '🔄 Refresh'}
              </button>
            </div>
            <select 
              value={selectedFile}
              onChange={(e) => {
                setSelectedFile(e.target.value);
                setSelectedSheet('');
              }}
              style={{ width: '100%', padding: '10px', marginTop: '5px', background: 'rgba(255,255,255,0.05)', border: '1px solid #0F9D58', color: 'white', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
              <option value="" style={{ background: '#1e1e22' }}>{loadingFiles ? 'Loading...' : 'Select a file'}</option>
              {files.map(f => (
                <option key={f.id} value={f.id} style={{ background: '#1e1e22' }}>{f.name}</option>
              ))}
            </select>
          </div>

          {selectedFile && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Worksheet</label>
              <select 
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                style={{ width: '100%', padding: '10px', marginTop: '5px', background: 'rgba(255,255,255,0.05)', border: '1px solid #0F9D58', color: 'white', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
                <option value="" style={{ background: '#1e1e22' }}>{loadingSheets ? 'Loading...' : 'Select a tab'}</option>
                {sheets.map(s => (
                  <option key={s} value={s} style={{ background: '#1e1e22' }}>{s}</option>
                ))}
              </select>
            </div>
          )}
          <div style={{ fontSize: '0.7rem', color: '#0F9D58', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
             <span>✅</span> Identity Connected
          </div>
        </>
      )}

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
