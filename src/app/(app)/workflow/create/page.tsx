"use client";

import { useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { createWorkflowAction } from '../actions';

export default function CreateWorkflow() {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // MOCK: In a real app we'd fetch these from our API
  const mockFbColumns = ['campaign_name', 'spend', 'impressions', 'clicks'];
  const mockSheetHeaders = ['Date', 'Campaign', 'Cost', 'Views', 'Link Clicks'];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await createWorkflowAction({
        fbAccounts: ['act_1'],
        datePreset: 'last_7d',
        sheetId: 'mock_sheet_123',
        worksheet: 'FB_Data',
        schedule: 'auto',
      });
      if (res.success) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save workflow");
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create Automation</h1>
      
      <div className={styles.stepper}>
        <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>
          1 <span className={styles.stepLabel}>Source</span>
        </div>
        <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>
          2 <span className={styles.stepLabel}>Destination</span>
        </div>
        <div className={`${styles.step} ${step >= 3 ? styles.stepActive : ''}`}>
          3 <span className={styles.stepLabel}>Mapping</span>
        </div>
        <div className={`${styles.step} ${step >= 4 ? styles.stepActive : ''}`}>
          4 <span className={styles.stepLabel}>Schedule</span>
        </div>
      </div>

      <div className={styles.formCard}>
        {step === 1 && (
          <div>
            <h2>Facebook Ads Configuration</h2>
            <br />
            <div className={styles.formGroup}>
              <label>Select Ad Accounts (Multiple Allowed)</label>
              <select multiple className={styles.input} style={{ height: '120px' }}>
                <option value="act_1">My Business Account (act_1)</option>
                <option value="act_2">Client A Account (act_2)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Date Range to Pull</label>
              <select className={styles.input}>
                <option value="yesterday">Yesterday</option>
                <option value="last_7d">Last 7 Days</option>
                <option value="last_30d">Last 30 Days</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>Google Sheets Target</h2>
            <br />
            <div className={styles.formGroup}>
              <label>Select Spreadsheet</label>
              <select className={styles.input}>
                <option>Performance Marketing Q3 (id: 1abc...)</option>
                <option>Client Reporting (id: 2xyz...)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Sheet / Tab</label>
              <select className={styles.input}>
                <option>FB_Data</option>
                <option>Raw</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2>Map Columns</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Map Facebook metrics to your Google Sheet headers.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: '1rem', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Facebook Field</div>
              <div></div>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Google Sheet Column</div>
              
              <div className={styles.formGroup} style={{ margin: 0}}>
                <select className={styles.input}>
                  <option>date_start</option>
                </select>
              </div>
              <div style={{ textAlign: 'center' }}>→</div>
              <div className={styles.formGroup} style={{ margin: 0}}>
                <select className={styles.input}>
                  <option>Date</option>
                </select>
              </div>

              <div className={styles.formGroup} style={{ margin: 0}}>
                <select className={styles.input}>
                  <option>campaign_name</option>
                </select>
              </div>
              <div style={{ textAlign: 'center' }}>→</div>
              <div className={styles.formGroup} style={{ margin: 0}}>
                <select className={styles.input}>
                  <option>Campaign</option>
                </select>
              </div>
              
              <div className={styles.formGroup} style={{ margin: 0}}>
                <select className={styles.input}>
                  <option>spend</option>
                </select>
              </div>
              <div style={{ textAlign: 'center' }}>→</div>
              <div className={styles.formGroup} style={{ margin: 0}}>
                <select className={styles.input}>
                  <option>Cost</option>
                </select>
              </div>
            </div>
            <br/>
            <button className="btn btn-secondary">+ Add Mapping</button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2>Execution Schedule</h2>
            <br />
            <div className={styles.formGroup}>
              <label>How should this run?</label>
              <select className={styles.input}>
                <option value="auto">Automatically on Schedule</option>
                <option value="manual">Manual Trigger Only</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Schedule Time (Daily)</label>
              <input type="time" defaultValue="08:00" className={styles.input} />
            </div>
          </div>
        )}

        <div className={styles.actions}>
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
              Back
            </button>
          )}
          {step < 4 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
              Continue
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Workflow'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
