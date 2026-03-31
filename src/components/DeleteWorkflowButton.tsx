"use client";

import { useState } from "react";
import { deleteWorkflowAction } from "@/app/(app)/editor/actions";
import { useRouter } from "next/navigation";

export default function DeleteWorkflowButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this automation? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteWorkflowAction(id);
      if (!result.success) {
        alert("Failed to delete workflow");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("An error occurred during deletion");
    } finally {
      setIsDeleting(false);
      router.refresh();
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      style={{ 
        background: 'transparent', 
        border: '1px solid rgba(255, 77, 77, 0.3)', 
        color: '#ff4d4d', 
        padding: '8px 16px', 
        borderRadius: 'var(--radius-sm)', 
        cursor: 'pointer', 
        fontSize: '0.85rem',
        fontWeight: 500,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 77, 77, 0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {isDeleting ? 'Deleting...' : (
        <>
          <span>🗑️</span> Delete
        </>
      )}
    </button>
  );
}
