import React, { useState } from 'react';
import { Vehicle, OilChangeRecord } from '../types';
import { calculateServiceStatus, formatMileage } from '../utils/calculations';
import { MileageGauge } from './MileageGauge';
import { HistoryTimeline } from './HistoryTimeline';
import { IntervalEditModal } from './IntervalEditModal';
import { VehiclePhotoModal } from './VehiclePhotoModal';
import { Edit3, Trash2, Wrench, History, ChevronDown, ChevronUp, SlidersHorizontal, Camera, Share2 } from 'lucide-react';

interface DashboardProps {
  selectedVehicle: Vehicle | null;
  records: OilChangeRecord[];
  onLogOilChange: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onSaveVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onEditRecord: (record: OilChangeRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  selectedVehicle,
  records,
  onLogOilChange,
  onEditVehicle,
  onSaveVehicle,
  onDeleteVehicle,
  onEditRecord,
  onDeleteRecord,
}) => {
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isIntervalModalOpen, setIsIntervalModalOpen] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);

  if (!selectedVehicle) {
    return (
      <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Vehicle Selected</h3>
        <p style={{ color: 'var(--text-muted)' }}>Select a vehicle by name to view oil change status and history.</p>
      </div>
    );
  }

  const statusInfo = calculateServiceStatus(selectedVehicle, records);
  const vehicleRecords = records.filter(r => r.vehicleId === selectedVehicle.id);

  return (
    <div className="dashboard-layout">
      <style>{`
        .dashboard-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .vehicle-hero-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          flex-wrap: wrap;
          gap: 1rem;
        }
        .vhero-info {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .vhero-img-container {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md);
          overflow: hidden;
          cursor: pointer;
          border: 1px solid var(--border-color);
          flex-shrink: 0;
          background: var(--bg-input);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vhero-img-container:hover .vhero-img-overlay {
          opacity: 1;
        }
        .vhero-img-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition);
          color: #ffffff;
        }
        .vhero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .vhero-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }
        .vhero-subtitle {
          font-size: 0.875rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.125rem;
        }
        
        .dash-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 992px) {
          .dash-main-grid {
            grid-template-columns: 1fr;
          }
        }

        .specs-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }
        .specs-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .specs-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          font-size: 0.875rem;
        }
        .spec-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .spec-key {
          color: var(--text-muted);
        }
        .spec-val {
          font-weight: 600;
          color: var(--text-main);
          text-align: right;
        }

        .toggle-history-btn {
          width: 100%;
          margin-top: 1.25rem;
          padding: 0.75rem 1rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #60a5fa;
          border-radius: var(--radius-md);
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: var(--transition);
        }
        .toggle-history-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.5);
          color: #ffffff;
        }

        .edit-interval-quick-btn {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #f59e0b;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.625rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          transition: var(--transition);
        }
        .edit-interval-quick-btn:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(245, 158, 11, 0.5);
          color: #ffffff;
        }
      `}</style>

      {/* Selected Vehicle Banner Header */}
      <div className="vehicle-hero-banner">
        <div className="vhero-info">
          {/* Clickable Photo Avatar */}
          <div
            className="vhero-img-container"
            onClick={() => setIsPhotoModalOpen(true)}
            title="Click to add or change vehicle photo"
          >
            {selectedVehicle.imageUrl ? (
              <img src={selectedVehicle.imageUrl} alt={selectedVehicle.name} className="vhero-img" />
            ) : (
              <Camera size={24} style={{ color: 'var(--text-dim)' }} />
            )}
            <div className="vhero-img-overlay">
              <Camera size={18} />
            </div>
          </div>

          <div>
            <h2 className="vhero-title">{selectedVehicle.name}</h2>
            <div className="vhero-subtitle">
              <span>{selectedVehicle.trim || `${selectedVehicle.make} ${selectedVehicle.model}`}</span>
              {selectedVehicle.licensePlate && (
                <>
                  <span>•</span>
                  <span className="mono" style={{ background: 'var(--bg-input)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                    {selectedVehicle.licensePlate}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setIsPhotoModalOpen(true)}>
            <Camera size={15} style={{ color: 'var(--accent-primary)' }} />
            <span>{selectedVehicle.imageUrl ? 'Change Photo' : 'Add Photo'}</span>
          </button>

          <button className="btn btn-secondary" onClick={() => setIsIntervalModalOpen(true)}>
            <SlidersHorizontal size={15} style={{ color: '#f59e0b' }} />
            <span>Custom Interval</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('car', selectedVehicle.id);
              url.searchParams.set('cardOnly', 'true');

              try {
                const raw = localStorage.getItem('apexfleet_firebase_config_v1');
                if (raw) {
                  const parsed = JSON.parse(raw);
                  if (parsed?.apiKey && parsed?.projectId) {
                    url.searchParams.set('apiKey', parsed.apiKey);
                    url.searchParams.set('projectId', parsed.projectId);
                  }
                }
              } catch (e) {}

              navigator.clipboard.writeText(url.toString());
              alert(`Copied link for "${selectedVehicle.name}" to clipboard!\n\nSend this link to your iPhone user:\n${url.toString()}`);
            }}
            title="Copy dedicated iPhone Card link to send to user"
          >
            <Share2 size={15} style={{ color: '#10b981' }} />
            <span>Share iPhone Link</span>
          </button>

          <button className="btn btn-secondary" onClick={() => onEditVehicle(selectedVehicle)}>
            <Edit3 size={15} />
            <span>Edit Vehicle</span>
          </button>

          <button
            className="btn btn-danger btn-icon"
            onClick={() => onDeleteVehicle(selectedVehicle.id)}
            title="Remove Vehicle"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Selected Vehicle Main Card: Next Scheduled Service Gauge + Specs */}
      <div className="dash-main-grid">
        <div>
          <MileageGauge
            vehicle={selectedVehicle}
            statusInfo={statusInfo}
            onLogOilChange={onLogOilChange}
            onEditInterval={() => setIsIntervalModalOpen(true)}
          />
        </div>

        {/* Vehicle Specs & History Toggle Card */}
        <div className="card specs-card">
          <div>
            <div className="specs-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={18} style={{ color: 'var(--accent-primary)' }} />
                <span>Vehicle Specifications</span>
              </div>
              <button
                className="edit-interval-quick-btn"
                onClick={() => setIsIntervalModalOpen(true)}
                title="Edit Custom Service Interval"
              >
                <SlidersHorizontal size={12} />
                <span>Edit Interval</span>
              </button>
            </div>

            <div className="specs-list">
              <div className="spec-row">
                <span className="spec-key">Preferred Oil</span>
                <span className="spec-val">{selectedVehicle.preferredOil}</span>
              </div>

              <div className="spec-row">
                <span className="spec-key">Sump Capacity</span>
                <span className="spec-val mono">{selectedVehicle.oilCapacity || 'N/A'}</span>
              </div>

              <div className="spec-row">
                <span className="spec-key">Filter Part #</span>
                <span className="spec-val mono">{selectedVehicle.filterPartNumber || 'N/A'}</span>
              </div>

              <div className="spec-row" style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '0.375rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <span className="spec-key" style={{ color: '#f59e0b', fontWeight: 600 }}>Interval Distance</span>
                <span className="spec-val mono" style={{ color: '#f59e0b', fontWeight: 700 }}>{formatMileage(selectedVehicle.oilIntervalMiles)}</span>
              </div>

              <div className="spec-row" style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '0.375rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <span className="spec-key" style={{ color: '#f59e0b', fontWeight: 600 }}>Interval Time</span>
                <span className="spec-val" style={{ color: '#f59e0b', fontWeight: 700 }}>{selectedVehicle.oilIntervalMonths} Months</span>
              </div>

              <div className="spec-row">
                <span className="spec-key">Oil Changes Logged</span>
                <span className="spec-val mono">{vehicleRecords.length} records</span>
              </div>
            </div>
          </div>

          {/* Toggle Button to See Entire Oil Change History */}
          <button
            className="toggle-history-btn"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History size={18} />
            <span>
              {showHistory
                ? 'Hide Service History'
                : `View Full History (${vehicleRecords.length} Logged)`}
            </span>
            {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable History Section */}
      {showHistory && (
        <div style={{ animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <HistoryTimeline
            records={vehicleRecords}
            onLogOilChange={onLogOilChange}
            onEditRecord={onEditRecord}
            onDeleteRecord={onDeleteRecord}
          />
        </div>
      )}

      {/* Custom Service Interval Modal */}
      <IntervalEditModal
        isOpen={isIntervalModalOpen}
        vehicle={selectedVehicle}
        onClose={() => setIsIntervalModalOpen(false)}
        onSave={(updatedVehicle) => {
          onSaveVehicle(updatedVehicle);
          setIsIntervalModalOpen(false);
        }}
      />

      {/* Vehicle Photo Modal */}
      <VehiclePhotoModal
        isOpen={isPhotoModalOpen}
        vehicle={selectedVehicle}
        onClose={() => setIsPhotoModalOpen(false)}
        onSave={(updatedVehicle) => {
          onSaveVehicle(updatedVehicle);
          setIsPhotoModalOpen(false);
        }}
      />
    </div>
  );
};
