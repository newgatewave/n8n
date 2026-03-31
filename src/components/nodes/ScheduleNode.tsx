import { Handle, Position, useReactFlow } from '@xyflow/react';
import { useState, useEffect } from 'react';

export default function ScheduleNode({ id, data }: any) {
  const { updateNodeData, setNodes } = useReactFlow();
  const [scheduleType, setScheduleType] = useState(data.scheduleType || 'hourly');
  const [cronExp, setCronExp] = useState(data.cronExp || '0 * * * *');

  useEffect(() => {
    updateNodeData(id, { scheduleType, cronExp });
  }, [scheduleType, cronExp, id, updateNodeData]);

  return (
    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid #FFB800', borderRadius: 'var(--radius-md)', padding: '15px', color: 'white', minWidth: '250px' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{color: '#FFB800', fontSize: '1.2rem'}}>🕒</span> Schedule Trigger
        </div>
        <button onClick={() => setNodes((nds) => nds.filter((n) => n.id !== id))} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', padding: 0, lineHeight: 1 }}>×</button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Interval</label>
        <select 
          value={scheduleType}
          onChange={(e) => setScheduleType(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }}>
          <option value="every_minute">Every Minute</option>
          <option value="every_15_minutes">Every 15 Minutes</option>
          <option value="hourly">Every Hour</option>
          <option value="daily">Every Day</option>
          <option value="cron">Custom CRON (Expert)</option>
        </select>
      </div>

      {(scheduleType === 'daily' || scheduleType === 'hourly') && (
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Execution Time (HH:mm)
          </label>
          <input 
            type="time" 
            value={data.time || '08:00'}
            onChange={(e) => updateNodeData(id, { time: e.target.value })}
            style={{ width: '100%', padding: '8px', marginTop: '5px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }}
          />
        </div>
      )}

      {scheduleType === 'cron' && (
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cron Expression</label>
          <input 
            type="text" 
            value={cronExp}
            onChange={(e) => setCronExp(e.target.value)}
            placeholder="0 8 * * *"
            style={{ width: '100%', padding: '8px', marginTop: '5px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }} 
          />
        </div>
      )}

      {/* Trigger nodes only have outputs (right side), no inputs */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
