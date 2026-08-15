import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import { X, SlidersHorizontal, Check } from 'lucide-react';

interface IntervalEditModalProps {
  isOpen: boolean;
  vehicle: Vehicle;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
}

export const IntervalEditModal: React.FC<IntervalEditModalProps> = ({
  isOpen,
  vehicle,
  onClose,
  onSave,
}) => {
  const [intervalKm, setIntervalKm] = useState<number>(vehicle.oilIntervalMiles || 8000);
  const [intervalMonths, setIntervalMonths] = useState<number>(vehicle.oilIntervalMonths || 6);
  const [isCustomKm, setIsCustomKm] = useState<boolean>(false);

  useEffect(() => {
    if (vehicle) {
      setIntervalKm(vehicle.oilIntervalMiles || 8000);
      setIntervalMonths(vehicle.oilIntervalMonths || 6);
      const standardPresets = [3000, 5000, 8000, 10000, 12000, 15000, 20000];
      setIsCustomKm(!standardPresets.includes(vehicle.oilIntervalMiles));
    }
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedVehicle: Vehicle = {
      ...vehicle,
      oilIntervalMiles: Number(intervalKm),
      oilIntervalMonths: Number(intervalMonths),
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedVehicle);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="modal-title">Edit Service Interval for {vehicle.name}</h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Set custom oil change service intervals for this vehicle. Next scheduled service mileage will update automatically.
            </p>

            {/* Custom Distance Interval in Kilometers */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Service Distance Interval (km)</label>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setIsCustomKm(!isCustomKm)}
                >
                  {isCustomKm ? 'Choose Preset' : 'Enter Custom Number'}
                </button>
              </div>

              {!isCustomKm ? (
                <select
                  className="form-select mono"
                  value={intervalKm}
                  onChange={(e) => setIntervalKm(Number(e.target.value))}
                >
                  <option value={3000}>3,000 km (Severe Duty / Conventional)</option>
                  <option value={5000}>5,000 km (Short Interval)</option>
                  <option value={8000}>8,000 km (Standard Synthetic Blend)</option>
                  <option value={10000}>10,000 km (Full Synthetic)</option>
                  <option value={12000}>12,000 km (Extended Synthetic)</option>
                  <option value={15000}>15,000 km (Euro Long Life)</option>
                  <option value={20000}>20,000 km (Euro Max Interval)</option>
                </select>
              ) : (
                <input
                  type="number"
                  className="form-input mono"
                  value={intervalKm}
                  onChange={(e) => setIntervalKm(Number(e.target.value))}
                  placeholder="e.g. 7500"
                  required
                  min={500}
                  step={100}
                />
              )}
            </div>

            {/* Time Interval in Months */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Service Time Limit (Months)</label>
              <select
                className="form-select"
                value={intervalMonths}
                onChange={(e) => setIntervalMonths(Number(e.target.value))}
              >
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={12}>12 Months (1 Year)</option>
                <option value={18}>18 Months</option>
                <option value={24}>24 Months (2 Years)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>Save Custom Interval</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
