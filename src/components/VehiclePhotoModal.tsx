import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import { X, Camera, Image as ImageIcon, Upload, Check, Link } from 'lucide-react';

interface VehiclePhotoModalProps {
  isOpen: boolean;
  vehicle: Vehicle;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
}

const PRESET_VEHICLE_PHOTOS = [
  { label: 'Truck / Pickup', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
  { label: 'Sports Car', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80' },
  { label: 'Compact / Hatchback', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Luxury Sedan', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80' },
  { label: 'SUV / Crossover', url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Classic Car', url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80' },
];

export const VehiclePhotoModal: React.FC<VehiclePhotoModalProps> = ({
  isOpen,
  vehicle,
  onClose,
  onSave,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');

  useEffect(() => {
    if (vehicle) {
      setPhotoUrl(vehicle.imageUrl || '');
    }
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedVehicle: Vehicle = {
      ...vehicle,
      imageUrl: photoUrl.trim(),
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedVehicle);
    onClose();
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="modal-title">Vehicle Photo for {vehicle.name}</h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Live Photo Preview */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: 'var(--radius-lg)',
                  margin: '0 auto 0.75rem',
                  overflow: 'hidden',
                  background: 'var(--bg-input)',
                  border: '2px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Vehicle Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '0.5rem' }}>
                    <ImageIcon size={36} style={{ opacity: 0.5, marginBottom: '0.25rem' }} />
                    <div style={{ fontSize: '0.75rem' }}>No Photo</div>
                  </div>
                )}
              </div>

              {photoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Remove Photo
                </button>
              )}
            </div>

            {/* Tab Navigation */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.5rem',
              }}
            >
              <button
                type="button"
                className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                onClick={() => setActiveTab('upload')}
              >
                <Upload size={14} /> Upload File
              </button>

              <button
                type="button"
                className={`btn ${activeTab === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                onClick={() => setActiveTab('url')}
              >
                <Link size={14} /> Image URL
              </button>

              <button
                type="button"
                className={`btn ${activeTab === 'presets' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                onClick={() => setActiveTab('presets')}
              >
                <ImageIcon size={14} /> Presets
              </button>
            </div>

            {/* Tab 1: Upload File */}
            {activeTab === 'upload' && (
              <div className="form-group">
                <label className="form-label">Upload Image File from Device</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.375rem', display: 'block' }}>
                  Supports JPG, PNG, WEBP photos from your computer or phone.
                </span>
              </div>
            )}

            {/* Tab 2: Image Web URL */}
            {activeTab === 'url' && (
              <div className="form-group">
                <label className="form-label">Image Web Address (URL)</label>
                <input
                  type="url"
                  className="form-input"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.375rem', display: 'block' }}>
                  Paste a direct image link from Unsplash, Imgur, or photo hosting.
                </span>
              </div>
            )}

            {/* Tab 3: Presets */}
            {activeTab === 'presets' && (
              <div className="form-group">
                <label className="form-label">Choose Stock Vehicle Photo</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {PRESET_VEHICLE_PHOTOS.map((preset) => (
                    <div
                      key={preset.label}
                      onClick={() => setPhotoUrl(preset.url)}
                      style={{
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: photoUrl === preset.url ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        background: 'var(--bg-input)',
                        transition: 'var(--transition)',
                      }}
                    >
                      <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '60px', objectFit: 'cover' }} />
                      <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem', fontWeight: 600, textAlign: 'center', color: 'var(--text-main)' }}>
                        {preset.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>Save Photo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
