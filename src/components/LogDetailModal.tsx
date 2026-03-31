"use client";

import { useState } from "react";

interface LogDetailModalProps {
  logs: string | null;
  output: string | null;
  status: string;
  workflowName: string;
}

export default function LogDetailModal({ logs, output, status, workflowName }: LogDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse JSON for pretty printing
  const formatData = (data: string | null) => {
    if (!data) return "No data available";
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return data;
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="log-details-btn"
        onClick={() => setIsOpen(true)}
      >
        View Details
      </button>
    );
  }

  return (
    <>
      <button className="log-details-btn" onClick={() => setIsOpen(true)}>
        View Details
      </button>
      
      {/* Modal Overlay */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.8)', 
          backdropFilter: 'blur(8px)',
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem'
        }}
        onClick={() => setIsOpen(false)}
      >
        {/* Modal Content */}
        <div 
          style={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-lg)', 
            width: '100%', 
            maxWidth: '800px', 
            maxHeight: '85vh', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>Execution Details</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Workflow: {workflowName}</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.5rem', overflowY: 'auto', flexGrow: 1 }}>
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Status & Results
              </h4>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ 
                  padding: '6px 12px', 
                  borderRadius: '99px', 
                  fontSize: '0.75rem', 
                  fontWeight: 700,
                  background: status === 'success' || status === 'COMPLETED' ? 'rgba(15, 157, 88, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                  color: status === 'success' || status === 'COMPLETED' ? '#0F9D58' : '#ff4d4d',
                  border: `1px solid ${status === 'success' || status === 'COMPLETED' ? 'rgba(15, 157, 88, 0.2)' : 'rgba(255, 77, 77, 0.2)'}`
                }}>
                  {status.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Diagnostic Data */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Technical Output (JSON)
              </h4>
              <pre style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '1.25rem', 
                borderRadius: '12px', 
                border: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                color: '#A9B7C6',
                overflowX: 'auto',
                fontFamily: 'monospace'
              }}>
                {formatData(output || logs)}
              </pre>
            </div>

            {/* Field Guide Hint */}
            {(output?.includes("availableFields")) && (
              <div style={{ background: 'rgba(24, 119, 242, 0.05)', border: '1px solid rgba(24, 119, 242, 0.2)', borderRadius: '12px', padding: '1.25rem' }}>
                <p style={{ color: '#1877F2', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>💡 Pro Tip: Customizing Mapping</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                  Use the field names listed in "availableFields" above in your Data Mapper node to capture exactly what Facebook sends back.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.1)' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setIsOpen(false)}
              style={{ padding: '8px 24px' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
