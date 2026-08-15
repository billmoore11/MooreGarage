import React from 'react';
import { Vehicle, OilChangeRecord } from '../types';
import { calculateServiceStatus, formatMileage } from '../utils/calculations';
import { Car, ChevronRight, SlidersHorizontal } from 'lucide-react';

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  records: OilChangeRecord[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  onOpenAddVehicle: () => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  vehicles,
  records,
  selectedVehicleId,
  onSelectVehicle,
  onOpenAddVehicle,
}) => {
  return (
    <div className="vehicle-selector-container">
      <style>{`
        .vehicle-selector-container {
          margin-bottom: 2rem;
        }
        .selector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .selector-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .vehicle-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        .vehicle-card-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.125rem;
          text-align: left;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 0.875rem;
        }
        .vehicle-card-btn:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-highlight);
          transform: translateY(-2px);
        }
        .vehicle-card-btn.active {
          background: linear-gradient(145deg, #182235 0%, #151d2d 100%);
          border-color: var(--accent-primary);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
        }
        .vcard-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .vcard-thumb {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          object-fit: cover;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
          flex-shrink: 0;
        }
        .vcard-name {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.25;
        }
        .vcard-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.125rem;
        }
        .status-pill-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }
        .status-dot-good {
          background: var(--status-good);
          box-shadow: 0 0 8px var(--status-good);
        }
        .status-dot-due_soon {
          background: var(--status-due);
          box-shadow: 0 0 8px var(--status-due);
        }
        .status-dot-overdue {
          background: var(--status-overdue);
          box-shadow: 0 0 8px var(--status-overdue);
        }
        .vcard-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.75rem;
        }
      `}</style>

      <div className="selector-header">
        <div className="selector-title">
          <Car size={18} style={{ color: 'var(--accent-primary)' }} />
          <span>Select Fleet Vehicle</span>
        </div>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {vehicles.length} Registered
        </span>
      </div>

      <div className="vehicle-grid">
        {vehicles.map((vehicle) => {
          const isSelected = vehicle.id === selectedVehicleId;
          const statusInfo = calculateServiceStatus(vehicle, records);

          return (
            <button
              key={vehicle.id}
              className={`vehicle-card-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectVehicle(vehicle.id)}
            >
              <div className="vcard-top">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {vehicle.imageUrl ? (
                    <img src={vehicle.imageUrl} alt={vehicle.name} className="vcard-thumb" />
                  ) : (
                    <div className="vcard-thumb">
                      <Car size={22} />
                    </div>
                  )}
                  <div>
                    <div className="vcard-name">{vehicle.name}</div>
                    <div className="vcard-sub">{vehicle.trim || `${vehicle.make} ${vehicle.model}`}</div>
                  </div>
                </div>

                <div className={`status-pill-indicator status-dot-${statusInfo.status}`} title={`Status: ${statusInfo.status}`} />
              </div>

              <div className="vcard-footer">
                <div>
                  <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.6875rem' }}>CURRENT</span>
                  <span className="mono" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatMileage(vehicle.currentMileage)}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.6875rem' }}>NEXT SERVICE</span>
                  <span className="mono" style={{ fontWeight: 700, color: statusInfo.status === 'overdue' ? '#ef4444' : 'var(--accent-primary)' }}>
                    {formatMileage(statusInfo.nextMileage)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
