import React, { useState, useRef, useEffect } from 'react';
import { Vehicle } from '../types';
import { Car, ChevronDown, Check, Camera } from 'lucide-react';
import { formatMileage } from '../utils/calculations';

interface VehicleSelectDropdownProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
}

export const VehicleSelectDropdown: React.FC<VehicleSelectDropdownProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!selectedVehicle) return null;

  return (
    <div className="custom-vehicle-select" ref={dropdownRef} style={{ position: 'relative' }}>
      <style>{`
        .custom-vehicle-select {
          position: relative;
          display: inline-block;
        }
        .select-trigger-btn {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.4rem 0.875rem 0.4rem 0.5rem;
          background: var(--bg-card);
          border: 1px solid var(--accent-primary);
          border-radius: var(--radius-md);
          color: var(--text-main);
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .select-trigger-btn:hover {
          background: rgba(59, 130, 246, 0.1);
        }
        .trigger-thumb {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dropdown-menu-list {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 280px;
          max-height: 360px;
          overflow-y: auto;
          background: #121826;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          z-index: 999;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          animation: slideDown 0.15s ease-out;
        }
        .dropdown-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
          background: transparent;
        }
        .dropdown-item-row:hover {
          background: rgba(59, 130, 246, 0.15);
        }
        .dropdown-item-row.active {
          background: rgba(59, 130, 246, 0.25);
          border: 1px solid rgba(59, 130, 246, 0.4);
        }
        .item-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .item-thumb {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-name {
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--text-main);
          line-height: 1.2;
        }
        .item-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.1rem;
        }
      `}</style>

      {/* Main Trigger Button */}
      <button
        type="button"
        className="select-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="trigger-thumb">
          {selectedVehicle.imageUrl ? (
            <img src={selectedVehicle.imageUrl} alt={selectedVehicle.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Car size={16} style={{ color: 'var(--accent-primary)' }} />
          )}
        </div>

        <span>{selectedVehicle.name}</span>

        <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          ({formatMileage(selectedVehicle.currentMileage)})
        </span>

        <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: '0.25rem' }} />
      </button>

      {/* Dropdown Options List */}
      {isOpen && (
        <div className="dropdown-menu-list">
          <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Vehicle ({vehicles.length})
          </div>

          {vehicles.map((v) => {
            const isSelected = v.id === selectedVehicleId;
            return (
              <div
                key={v.id}
                className={`dropdown-item-row ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  onSelectVehicle(v.id);
                  setIsOpen(false);
                }}
              >
                <div className="item-info">
                  <div className="item-thumb">
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Car size={18} style={{ color: 'var(--accent-primary)' }} />
                    )}
                  </div>
                  <div>
                    <div className="item-name">{v.name}</div>
                    <div className="item-sub mono">{formatMileage(v.currentMileage)}</div>
                  </div>
                </div>

                {isSelected && <Check size={16} style={{ color: '#60a5fa' }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
