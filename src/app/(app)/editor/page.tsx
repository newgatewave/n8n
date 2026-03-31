"use client";

import { useCallback, useState, useEffect, Suspense } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import FacebookNode from '@/components/nodes/FacebookNode';
import GoogleSheetNode from '@/components/nodes/GoogleSheetNode';
import ScheduleNode from '@/components/nodes/ScheduleNode';
import WebhookNode from '@/components/nodes/WebhookNode';
import MapperNode from '@/components/nodes/MapperNode';

import { useRouter, useSearchParams } from 'next/navigation';
import { saveFlowAction, executeWorkflowAction, getWorkflowAction } from './actions';
import Modal from '@/components/ui/Modal';

const nodeTypes = {
  facebook: FacebookNode,
  googleSheet: GoogleSheetNode,
  schedule: ScheduleNode,
  webhook: WebhookNode,
  mapper: MapperNode,
};

const initialNodes: any[] = [];
const initialEdges: any[] = [];

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentId = searchParams.get('id');

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [initialViewport, setInitialViewport] = useState({ x: 0, y: 0, zoom: 1 });
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(currentId);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));
  
  const showModal = (
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info', 
    onConfirm?: () => void
  ) => {
    setModalConfig({ isOpen: true, title, message, type, onConfirm });
  };

  // Load from DB (by ID) or local storage (Draft)
  useEffect(() => {
    async function loadWorkflow() {
      if (currentId) {
        try {
          const res = await getWorkflowAction(currentId);
          if (res.success && res.workflow) {
            setNodes(res.workflow.nodes as any[] || []);
            setEdges(res.workflow.edges as any[] || []);
            setWorkflowId(res.workflow.id);
            setIsLoaded(true);
            return;
          }
        } catch (err) {
          console.error("Failed to load workflow from DB:", err);
        }
      }

      // Fallback to localStorage draft
      const savedNodes = localStorage.getItem('n8n_draft_nodes');
      const savedEdges = localStorage.getItem('n8n_draft_edges');
      const savedViewport = localStorage.getItem('n8n_draft_viewport');
      
      if (savedNodes && savedEdges) {
        try {
          setNodes(JSON.parse(savedNodes));
          setEdges(JSON.parse(savedEdges));
        } catch(e) {
          setNodes(initialNodes as any);
          setEdges(initialEdges);
        }
      } else {
        setNodes(initialNodes as any);
        setEdges(initialEdges);
      }
      
      if (savedViewport) {
        try { setInitialViewport(JSON.parse(savedViewport)); } catch(e) {}
      }

      setIsLoaded(true);
    }

    loadWorkflow();
  }, [currentId, setNodes, setEdges]);

  // Auto-save to local storage when nodes/edges change
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('n8n_draft_nodes', JSON.stringify(nodes));
    localStorage.setItem('n8n_draft_edges', JSON.stringify(edges));
  }, [nodes, edges, isLoaded]);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const addNode = (type: string) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { label: type }
    };
    setNodes((nds) => [...nds, newNode]);
    setMenuOpen(false);
  };

  const handleDeploy = async () => {
    setIsSaving(true);
    try {
      const res = await saveFlowAction({ nodes, edges, name: workflowId ? undefined : `Workflow ${Date.now()}` }, workflowId || undefined);
      if (res.success) {
        setWorkflowId(res.workflowId);
        localStorage.removeItem('n8n_draft_nodes');
        localStorage.removeItem('n8n_draft_edges');
        showModal('💾 Saved Successfully', 'Your workflow has been saved to the database and is now live.', 'success');
      }
    } catch (err) {
      console.error(err);
      showModal('❌ Save Failed', 'There was an error saving your workflow. Please check the console.', 'error');
    }
    setIsSaving(false);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const result = await executeWorkflowAction({ nodes, edges });
      if (result.success) {
        showModal('✅ Execution Successful', `Workflow finished processing.\n\n- Rows added: ${result.rowsAdded || 0}`, 'success');
      } else {
        showModal('❌ Execution Failed', result.error || 'Unknown error during execution.', 'error');
      }
    } catch (err: any) {
      console.error("Execution Error:", err);
      showModal('⚠️ Technical Error', err.message || 'Check browser console for details', 'warning');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Modal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm ? () => { modalConfig.onConfirm?.(); closeModal(); } : undefined}
      />
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           Visual Flow Editor <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{!isLoaded ? '' : workflowId ? `(ID: ${workflowId.slice(0,6)})` : '(Auto-Saving Draft...)'}</span>
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
             <button className="btn btn-secondary" onClick={() => setMenuOpen(!menuOpen)}>
               + Add Node
             </button>
             {menuOpen && (
               <div style={{ position: 'absolute', top: '110%', right: 0, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', zIndex: 10, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button onClick={() => addNode('schedule')} style={{ background: 'transparent', border: 'none', color: 'white', textAlign: 'left', padding: '8px', cursor: 'pointer', borderRadius: '4px' }}>🕒 Schedule Trigger</button>
                  <button onClick={() => addNode('webhook')} style={{ background: 'transparent', border: 'none', color: 'white', textAlign: 'left', padding: '8px', cursor: 'pointer', borderRadius: '4px' }}>🌐 Webhook Trigger</button>
                  <button onClick={() => addNode('facebook')} style={{ background: 'transparent', border: 'none', color: 'white', textAlign: 'left', padding: '8px', cursor: 'pointer', borderRadius: '4px' }}>fb Facebook Ads</button>
                  <button onClick={() => addNode('mapper')} style={{ background: 'transparent', border: 'none', color: 'white', textAlign: 'left', padding: '8px', cursor: 'pointer', borderRadius: '4px' }}>🔁 Data Mapper</button>
                  <button onClick={() => addNode('googleSheet')} style={{ background: 'transparent', border: 'none', color: 'white', textAlign: 'left', padding: '8px', cursor: 'pointer', borderRadius: '4px' }}>📊 Google Sheets</button>
               </div>
             )}
          </div>
          <button className="btn btn-secondary" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-glow)' }} onClick={handleExecute} disabled={isExecuting}>
            <span>{isExecuting ? '⌛' : '▶️'}</span> {isExecuting ? 'Executing...' : 'Execute Workflow'}
          </button>
          <button className="btn btn-primary" onClick={handleDeploy} disabled={isSaving}>
             {isSaving ? 'Deploying...' : 'Deploy'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)' }}>
        {isLoaded && (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onMoveEnd={(event, viewport) => {
               localStorage.setItem('n8n_draft_viewport', JSON.stringify(viewport));
            }}
            defaultViewport={initialViewport}
            nodeTypes={nodeTypes as any}
            colorMode="dark"
          >
            <Controls />
            <MiniMap nodeColor={(node) => {
              switch (node.type) {
                case 'facebook': return '#1877F2';
                case 'googleSheet': return '#0F9D58';
                case 'schedule': return '#FFB800';
                case 'webhook': return '#9D4EDD';
                case 'mapper': return '#FFFFFF';
                default: return '#eee';
              }
            }} />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1.5} color="rgba(255,255,255,0.15)" />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}

export default function Editor() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
