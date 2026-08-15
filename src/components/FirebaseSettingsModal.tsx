import React, { useState, useEffect } from 'react';
import { FirebaseConfig } from '../types';
import {
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  scanFirestoreCollections,
  seedSampleDataToFirebase,
} from '../firebase';
import { X, Database, Save, Trash2, CheckCircle2, AlertCircle, Upload, Search } from 'lucide-react';

interface FirebaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const FirebaseSettingsModal: React.FC<FirebaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [scanResults, setScanResults] = useState<Array<{ collectionName: string; count: number; sampleDocKeys: string[] }> | null>(null);
  const [scanning, setScanning] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMessage(null);
      setScanResults(null);
      setScanning(false);
      setSeeding(false);

      const existing = getSavedFirebaseConfig();
      if (existing) {
        setApiKey(existing.apiKey || '');
        setAuthDomain(existing.authDomain || '');
        setProjectId(existing.projectId || '');
        setStorageBucket(existing.storageBucket || '');
        setMessagingSenderId(existing.messagingSenderId || '');
        setAppId(existing.appId || '');
      } else {
        setApiKey('');
        setAuthDomain('');
        setProjectId('');
        setStorageBucket('');
        setMessagingSenderId('');
        setAppId('');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!apiKey.trim() || !projectId.trim()) {
        setMessage({ type: 'error', text: 'API Key and Project ID are required.' });
        return;
      }

      const config: FirebaseConfig = {
        apiKey: apiKey.trim(),
        authDomain: authDomain.trim(),
        projectId: projectId.trim(),
        storageBucket: storageBucket.trim(),
        messagingSenderId: messagingSenderId.trim(),
        appId: appId.trim(),
      };

      saveFirebaseConfig(config);
      setMessage({ type: 'success', text: 'Firebase configuration saved successfully!' });
      setTimeout(() => {
        onConfigSaved();
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Error saving Firebase config', err);
      setMessage({ type: 'error', text: `Failed to save configuration: ${err?.message || err}` });
    }
  };

  const handleClear = () => {
    try {
      saveFirebaseConfig(null);
      setApiKey('');
      setAuthDomain('');
      setProjectId('');
      setStorageBucket('');
      setMessagingSenderId('');
      setAppId('');
      setMessage({ type: 'success', text: 'Cleared Firebase config. Reverted to Local Storage Mode.' });
      setTimeout(() => {
        onConfigSaved();
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Error clearing Firebase config', err);
      setMessage({ type: 'error', text: `Failed to clear configuration: ${err?.message || err}` });
    }
  };

  const handleScanDatabase = async () => {
    setScanning(true);
    setMessage(null);
    try {
      const res = await scanFirestoreCollections();
      setScanResults(res);
    } catch (err: any) {
      console.error('Error scanning Firestore database', err);
      setMessage({ type: 'error', text: `Failed to scan database: ${err?.message || err}` });
    } finally {
      setScanning(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    setMessage(null);
    try {
      const success = await seedSampleDataToFirebase();
      if (success) {
        setMessage({ type: 'success', text: 'Sample fleet & oil logs uploaded to your Firebase database!' });
        setTimeout(() => {
          onConfigSaved();
          onClose();
        }, 800);
      } else {
        setMessage({ type: 'error', text: 'Failed to upload to Firebase. Please check security rules or API key.' });
      }
    } catch (err: any) {
      console.error('Error seeding Firebase data', err);
      setMessage({ type: 'error', text: `Error uploading sample fleet: ${err?.message || err}` });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} style={{ color: '#f59e0b' }} />
            <h3 className="modal-title">Firebase Database Configuration</h3>
          </div>
          <button type="button" className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Connect your Firebase Firestore project to synchronize your vehicle fleet and oil change history in real-time across devices.
            </p>

            {message && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: message.type === 'success' ? '#10b981' : '#ef4444',
                  border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                }}
              >
                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{message.text}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Project ID</label>
              <input
                type="text"
                className="form-input mono"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="my-oil-tracker-project"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">API Key</label>
              <input
                type="password"
                className="form-input mono"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Auth Domain</label>
                <input
                  type="text"
                  className="form-input mono"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="project.firebaseapp.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Storage Bucket</label>
                <input
                  type="text"
                  className="form-input mono"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  placeholder="project.appspot.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Messaging Sender ID</label>
                <input
                  type="text"
                  className="form-input mono"
                  value={messagingSenderId}
                  onChange={(e) => setMessagingSenderId(e.target.value)}
                  placeholder="1234567890"
                />
              </div>

              <div className="form-group">
                <label className="form-label">App ID</label>
                <input
                  type="text"
                  className="form-input mono"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:1234567890:web:abc123"
                />
              </div>
            </div>

            {/* Database Scanner Diagnostic Block */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleScanDatabase}
                disabled={scanning}
                style={{ width: '100%', fontSize: '0.8125rem' }}
              >
                <Search size={14} />
                <span>{scanning ? 'Scanning Firebase Collections...' : 'Scan & Auto-Detect Firebase Collections'}</span>
              </button>

              {scanResults && (
                <div style={{ marginTop: '0.875rem', background: 'var(--bg-input)', padding: '0.875rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
                    Scan Results ({scanResults.length} collections detected):
                  </div>
                  {scanResults.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)' }}>No top-level collections found in Firestore database.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {scanResults.map((res) => (
                        <div key={res.collectionName} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted var(--border-color)', paddingBottom: '0.25rem' }}>
                          <span className="mono" style={{ fontWeight: 700 }}>📁 {res.collectionName}</span>
                          <span><strong>{res.count}</strong> {res.count === 1 ? 'doc' : 'docs'} ({res.sampleDocKeys.slice(0, 4).join(', ')})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-danger" onClick={handleClear} title="Revert to browser local storage mode">
                <Trash2 size={14} />
                <span>Use Local Storage</span>
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleSeedData} disabled={seeding} title="Upload initial sample fleet to your Firebase Firestore database">
                <Upload size={14} />
                <span>{seeding ? 'Uploading...' : 'Upload Sample Fleet'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
