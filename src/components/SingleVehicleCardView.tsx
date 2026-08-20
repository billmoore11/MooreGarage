import React, { useState } from 'react';
import { Vehicle, OilChangeRecord } from '../types';
import { calculateServiceStatus, formatMileage } from '../utils/calculations';
import { Car, Wrench, Plus, RefreshCw, Calendar, Droplet, ShieldCheck, Share2, Layers } from 'lucide-react';
import { MileageGauge } from './MileageGauge';
import { HistoryTimeline } from './HistoryTimeline';
import { IntervalEditModal } from './IntervalEditModal';

interface SingleVehicleCardViewProps {
  vehicle: Vehicle;
  records: OilChangeRecord[];
  isFirebase: boolean;
  onLogOilChange: () => void;
  onSaveVehicle: (vehicle: Vehicle) => Promise<boolean>;
  onEditRecord: (record: OilChangeRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSwitchToFullFleet?: () => void;
}

export const SingleVehicleCardView: React.FC<SingleVehicleCardViewProps> = ({
  vehicle,
  records,
  isFirebase,
  onLogOilChange,
  onSaveVehicle,
  onEditRecord,
  onDeleteRecord,
  onSwitchToFullFleet,
}) => {
  if (!vehicle) {
    return (
      <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', maxWidth: '480px', margin: '2rem auto' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Vehicle Card Unavailable</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          The requested vehicle card could not be loaded or is not registered in your fleet.
        </p>
        {onSwitchToFullFleet && (
          <button className="btn btn-primary" onClick={onSwitchToFullFleet}>
            View Main Fleet Dashboard
          </button>
        )}
      </div>
    );
  }

  const statusInfo = calculateServiceStatus(vehicle, records || []);
  const vehicleRecords = records
    .filter((r) => r.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [isIntervalModalOpen, setIsIntervalModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('car', vehicle.id);
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
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'good':
        return 'badge-good';
      case 'due_soon':
        return 'badge-due_soon';
      case 'overdue':
        return 'badge-overdue';
      default:
        return 'badge-good';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'good':
        return 'Service Good';
      case 'due_soon':
        return 'Service Due Soon';
      case 'overdue':
        return 'Oil Change Overdue!';
      default:
        return 'Good';
    }
  };

  return (
    <div className="single-card-view-wrapper" style={{ maxWidth: '540px', margin: '0 auto', padding: '0.5rem 0' }}>
      {/* Top Header Bar for iPhone */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Wrench size={16} />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>MooreGarage</h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{isFirebase ? '🟢 Live Sync' : 'Local Mode'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleShareLink} title="Copy iPhone Direct Link">
            <Share2 size={14} />
            <span style={{ fontSize: '0.75rem' }}>{copiedLink ? 'Copied Link!' : 'Share Link'}</span>
          </button>
          {onSwitchToFullFleet && (
            <button className="btn btn-secondary btn-sm" onClick={onSwitchToFullFleet} title="Show Full Fleet">
              <Layers size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Primary Vehicle Hero Card */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', height: '180px', width: '100%', background: 'var(--bg-input)', overflow: 'hidden' }}>
          {vehicle.imageUrl ? (
            <img src={vehicle.imageUrl} alt={vehicle.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
              <Car size={56} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
              <span style={{ fontSize: '0.8125rem' }}>No Photo Set</span>
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(18,24,38,0.95) 0%, rgba(18,24,38,0.2) 60%, transparent 100%)' }} />
          
          <div style={{ position: 'absolute', top: '0.875rem', right: '0.875rem' }}>
            <span className={`badge ${getStatusBadgeClass(statusInfo.status)}`}>
              <ShieldCheck size={12} />
              {getStatusLabel(statusInfo.status)}
            </span>
          </div>

          <div style={{ position: 'absolute', bottom: '0.875rem', left: '1rem', right: '1rem' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {vehicle.name}
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim && `• ${vehicle.trim}`}
            </p>
          </div>
        </div>

        {/* Action Button: Log Oil Change */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <button className="btn btn-primary" onClick={onLogOilChange} style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 700 }}>
            <Plus size={18} /> Log Oil Change / Service
          </button>
        </div>

        {/* Gauge & Key Stats */}
        <div style={{ padding: '1.25rem' }}>
          <MileageGauge
            currentMileage={vehicle.currentMileage}
            lastMileage={statusInfo.lastMileage}
            nextMileage={statusInfo.nextMileage}
            oilIntervalMiles={vehicle.oilIntervalMiles}
            status={statusInfo.status}
            vehicleId={vehicle.id}
            vehicleName={vehicle.name}
            onOpenIntervalModal={() => setIsIntervalModalOpen(true)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
            <div style={{ background: 'var(--bg-input)', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                <Droplet size={14} style={{ color: 'var(--accent-primary)' }} /> PREFERRED OIL
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {vehicle.preferredOil || '5W-30 Synthetic'}
              </div>
              {vehicle.oilCapacity && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                  Cap: {vehicle.oilCapacity}
                </div>
              )}
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                <RefreshCw size={14} style={{ color: '#f59e0b' }} /> FILTER PART
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {vehicle.filterPartNumber || 'Standard Filter'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent History Timeline */}
      <HistoryTimeline
        records={vehicleRecords}
        onEditRecord={onEditRecord}
        onDeleteRecord={onDeleteRecord}
      />

      {/* Interval Modal */}
      <IntervalEditModal
        isOpen={isIntervalModalOpen}
        vehicle={vehicle}
        onClose={() => setIsIntervalModalOpen(false)}
        onSave={onSaveVehicle}
      />
    </div>
  );
};
