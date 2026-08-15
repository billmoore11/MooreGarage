import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import { X, Car, Check, SlidersHorizontal } from 'lucide-react';

interface VehicleFormModalProps {
  isOpen: boolean;
  editingVehicle: Vehicle | null;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  editingVehicle,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState<string>('');
  const [year, setYear] = useState<number>(2023);
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [trim, setTrim] = useState<string>('');
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [vin, setVin] = useState<string>('');
  const [currentMileage, setCurrentMileage] = useState<number>(65000);
  const [oilIntervalMiles, setOilIntervalMiles] = useState<number>(8000);
  const [oilIntervalMonths, setOilIntervalMonths] = useState<number>(6);
  const [preferredOil, setPreferredOil] = useState<string>('5W-30 Full Synthetic');
  const [oilCapacity, setOilCapacity] = useState<string>('5.0 L');
  const [filterPartNumber, setFilterPartNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (editingVehicle) {
      setName(editingVehicle.name);
      setYear(editingVehicle.year);
      setMake(editingVehicle.make);
      setModel(editingVehicle.model);
      setTrim(editingVehicle.trim || '');
      setLicensePlate(editingVehicle.licensePlate || '');
      setVin(editingVehicle.vin || '');
      setCurrentMileage(editingVehicle.currentMileage);
      setOilIntervalMiles(editingVehicle.oilIntervalMiles);
      setOilIntervalMonths(editingVehicle.oilIntervalMonths);
      setPreferredOil(editingVehicle.preferredOil);
      setOilCapacity(editingVehicle.oilCapacity || '');
      setFilterPartNumber(editingVehicle.filterPartNumber || '');
      setNotes(editingVehicle.notes || '');
      setImageUrl(editingVehicle.imageUrl || '');
    } else {
      setName('');
      setYear(new Date().getFullYear());
      setMake('');
      setModel('');
      setTrim('');
      setLicensePlate('');
      setVin('');
      setCurrentMileage(65000);
      setOilIntervalMiles(8000);
      setOilIntervalMonths(6);
      setPreferredOil('5W-30 Full Synthetic');
      setOilCapacity('5.0 L');
      setFilterPartNumber('');
      setNotes('');
      setImageUrl('');
    }
  }, [editingVehicle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicleName = name.trim() || `${year} ${make} ${model}`;
    const vehicle: Vehicle = {
      id: editingVehicle ? editingVehicle.id : `veh-${Date.now()}`,
      name: vehicleName,
      year: Number(year),
      make: make.trim(),
      model: model.trim(),
      trim: trim.trim(),
      licensePlate: licensePlate.trim(),
      vin: vin.trim(),
      currentMileage: Number(currentMileage),
      oilIntervalMiles: Number(oilIntervalMiles),
      oilIntervalMonths: Number(oilIntervalMonths),
      preferredOil: preferredOil.trim(),
      oilCapacity: oilCapacity.trim(),
      filterPartNumber: filterPartNumber.trim(),
      notes: notes.trim(),
      imageUrl: imageUrl.trim(),
      createdAt: editingVehicle ? editingVehicle.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(vehicle);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Car size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="modal-title">
              {editingVehicle ? `Edit ${editingVehicle.name}` : 'Add Vehicle to Fleet'}
            </h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  className="form-input mono"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  placeholder="2023"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Make</label>
                <input
                  type="text"
                  className="form-input"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="e.g. Ford, Toyota"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Model</label>
                <input
                  type="text"
                  className="form-input"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. F-150, RAV4"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Trim / Submodel</label>
                <input
                  type="text"
                  className="form-input"
                  value={trim}
                  onChange={(e) => setTrim(e.target.value)}
                  placeholder="e.g. Lariat 3.5L EcoBoost"
                />
              </div>
            </div>

            {/* Interval Configuration Section */}
            <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <SlidersHorizontal size={14} />
                <span>Custom Oil Change Service Intervals</span>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Interval Distance (km)</label>
                  <select
                    className="form-select mono"
                    value={oilIntervalMiles}
                    onChange={(e) => setOilIntervalMiles(Number(e.target.value))}
                  >
                    <option value={3000}>3,000 km (Severe Duty / Frequent Short Trips)</option>
                    <option value={5000}>5,000 km (Short Interval)</option>
                    <option value={8000}>8,000 km (Standard Synthetic Blend)</option>
                    <option value={10000}>10,000 km (Full Synthetic)</option>
                    <option value={12000}>12,000 km (Extended Synthetic)</option>
                    <option value={15000}>15,000 km (Euro Long Life)</option>
                    <option value={20000}>20,000 km (Euro Max Interval)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Interval Months</label>
                  <select
                    className="form-select"
                    value={oilIntervalMonths}
                    onChange={(e) => setOilIntervalMonths(Number(e.target.value))}
                  >
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={24}>24 Months (2 Years)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Current Odometer Reading (km)</label>
                <input
                  type="number"
                  className="form-input mono"
                  value={currentMileage}
                  onChange={(e) => setCurrentMileage(Number(e.target.value))}
                  placeholder="e.g. 75000"
                  required
                  min={0}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Oil Specification</label>
                <input
                  type="text"
                  className="form-input"
                  value={preferredOil}
                  onChange={(e) => setPreferredOil(e.target.value)}
                  placeholder="e.g. Mobil 1 5W-30 Synthetic"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Oil Capacity</label>
                <input
                  type="text"
                  className="form-input"
                  value={oilCapacity}
                  onChange={(e) => setOilCapacity(e.target.value)}
                  placeholder="e.g. 5.5 Liters"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Filter Part Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={filterPartNumber}
                  onChange={(e) => setFilterPartNumber(e.target.value)}
                  placeholder="e.g. Motorcraft FL-500S"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Photo URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Vehicle Notes & Specifications</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Torque specs, drain plug crush washer size, special instructions..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>{editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
