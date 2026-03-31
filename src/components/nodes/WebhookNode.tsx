import { Handle, Position, useReactFlow } from '@xyflow/react';
import { useState } from 'react';

export default function WebhookNode({ id, data }: any) {
  const { setNodes } = useReactFlow();
  const mockUrl = "https://flowsync.app/webhook/e9b8-abcd-1234";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(mockUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid #9D4EDD', borderRadius: 'var(--radius-md)', padding: '15px', color: 'white', minWidth: '250px' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{color: '#9D4EDD', fontSize: '1.2rem'}}>🌐</span> Webhook Trigger
        </div>
        <button onClick={() => setNodes((nds) => nds.filter((n) => n.id !== id))} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', padding: 0, lineHeight: 1 }}>×</button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Webhook URL (Listening)</label>
        <div style={{ display: 'flex', marginTop: '5px', gap: '5px' }}>
          <input 
            type="text" 
            value={mockUrl}
            readOnly
            style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', borderRadius: '4px', fontSize: '0.8rem' }} 
          />
          <button 
            onClick={handleCopy}
            style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
