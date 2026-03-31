import { Handle, Position, useReactFlow } from '@xyflow/react';
import { useState, useEffect } from 'react';

const FACEBOOK_FIELDS = [
  'date', 'date_start', 'date_stop',
  'account_id', 'account_name', 
  'campaign_id', 'campaign_name', 
  'adset_id', 'adset_name', 
  'ad_id', 'ad_name', 
  'spend', 'impressions', 'clicks', 'reach', 
  'frequency', 'cpc', 'cpm', 'cpp', 'ctr',
  'inline_link_clicks', 'cost_per_inline_link_click',
  'video_avg_time_watched_actions',
  'video_avg_time',
  'avg_video',
  'video_play_time',
  'video_p25_watched_actions',
  'video_p50_watched_actions',
  'video_p75_watched_actions',
  'video_p95_watched_actions',
  'video_p100_watched_actions',
  'thruplays',
  'cost_per_thruplay',
  'messaging_conversations',
  'messages',
  'messaging_conversation_started_7d',
  'post_engagement',
  'page_engagement',
  'post_reactions',
  'post_reactions_like',
  'post_reactions_love',
  'comments',
  'shares',
  'post_saves',
  'page_likes',
  'link_clicks',
  'onsite_conversion.messaging_conversation_started_7d',
];

export default function MapperNode({ id, data }: any) {
  const { updateNodeData, setNodes } = useReactFlow();
  const [fields, setFields] = useState(data.fields || [{ source: '', target: '' }]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    updateNodeData(id, { fields });
  }, [fields, id, updateNodeData]);

  const addField = () => setFields([...fields, { source: '', target: '' }]);
  
  const updateField = (index: number, key: 'source' | 'target', value: string) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_: any, i: number) => i !== index));
  };

  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: any, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;
    
    const newFields = [...fields];
    const draggedItem = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(idx, 0, draggedItem);
    
    setFields(newFields);
    setDraggedIndex(idx);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--text-primary)', borderRadius: 'var(--radius-md)', padding: '15px', color: 'white', minWidth: '380px', boxShadow: 'var(--shadow-md)' }}>
      <Handle type="target" position={Position.Left} />
      
      <div style={{ fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{color: 'white', fontSize: '1.2rem'}}>🔁</span> Data Mapper (Set)
        </div>
        <button onClick={() => setNodes((nds) => nds.filter((n) => n.id !== id))} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', padding: 0, lineHeight: 1 }}>×</button>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '8px', padding: '0 5px 0 35px', fontWeight: 600 }}>
        <span style={{ flex: 1 }}>Source (from FB)</span>
        <span style={{ width: '15px' }}></span>
        <span style={{ flex: 1 }}>Target (to Sheet)</span>
        <span style={{ width: '25px' }}></span>
      </div>

      <datalist id={`fb-fields-${id}`}>
        {FACEBOOK_FIELDS.map(f => <option key={f} value={f} />)}
      </datalist>

      {fields.map((field: any, idx: number) => (
        <div 
          key={idx} 
          draggable 
          className="nodrag"
          onDragStart={() => handleDragStart(idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDragEnd={handleDragEnd}
          style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '10px', 
            alignItems: 'center',
            opacity: draggedIndex === idx ? 0.3 : 1,
            cursor: 'default'
          }}
        >
          <div style={{ cursor: 'grab', color: 'var(--text-secondary)', fontSize: '1.2rem', padding: '0 5px', userSelect: 'none' }}>⠿</div>
          <input 
            list={`fb-fields-${id}`}
            value={field.source}
            onChange={(e) => updateField(idx, 'source', e.target.value)}
            placeholder="Search FB Field..."
            style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }} 
          />
          <span style={{color: 'var(--text-secondary)', fontWeight: 'bold'}}>→</span>
          <input 
            value={field.target}
            onChange={(e) => updateField(idx, 'target', e.target.value)}
            placeholder="Sheet Column"
            style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }} 
          />
          <button 
             onClick={() => removeField(idx)}
             style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
          >
             ×
          </button>
        </div>
      ))}

      <button 
        onClick={addField}
        style={{ width: '100%', padding: '6px', marginTop: '10px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--text-secondary)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>
        + Add Field
      </button>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
