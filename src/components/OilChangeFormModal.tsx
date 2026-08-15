import React, { useState, useEffect } from 'react';
import { OilChangeRecord, Vehicle } from '../types';
import { X, Calendar, Droplet, Check } from 'lucide-react';

interface OilChangeFormModalProps {
  isOpen: boolean;
  vehicle: Vehicle;
  editingRecord: OilChangeRecord | null;
  onClose: () => void;
  onSave: (record: OilChangeRecord) => void;
}

export const OilChangeFormModal: React.FC<OilChangeFormModalProps> = ({
  isOpen,
  vehicle,
  editingRecord,
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mileage, setMileage] = useState<number>(vehicle.currentMileage);
  const [oilBrandGrade, setOilBrandGrade] = useState<string>(vehicle.preferredOil || '');
  const [filterBrandPart, setFilterBrandPart] = useState<string>(vehicle.filterPartNumber || '');
  const [cost, setCost] = useState<number>(45.00);
  const [performedBy, setPerformedBy] = useState<'self' | 'shop' | 'dealer'>('self');
  const [locationName, setLocationName] = useState<string>('Home Garage');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingRecord) {
      setDate(editingRecord.date);
      setMileage(editingRecord.mileage);
      setOilBrandGrade(editingRecord.oilBrandGrade);
      setFilterBrandPart(editingRecord.filterBrandPart);
      setCost(editingRecord.cost);
      setPerformedBy(editingRecord.performedBy);
      setLocationName(editingRecord.locationName || '');
      setNotes(editingRecord.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setMileage(vehicle.currentMileage);
      setOilBrandGrade(vehicle.preferredOil || '');
      setFilterBrandPart(vehicle.filterPartNumber || '');
      setCost(45.00);
      setPerformedBy('self');
      setLocationName('Home Garage');
      setNotes('');
    }
  }, [editingRecord, vehicle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: OilChangeRecord = {
      id: editingRecord ? editingRecord.id : `log-${Date.now()}`,
      vehicleId: vehicle.id,
      date,
      mileage: Number(mileage),
      oilBrandGrade,
      filterBrandPart,
      cost: Number(cost) || 0,
      performedBy,
      locationName,
      notes,
      createdAt: editingRecord ? editingRecord.createdAt : new Date().toISOString(),
    };
    onSave(record);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplet size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="modal-title">
              {editingRecord ? 'Edit Oil Change Record' : `Log Oil Change for ${vehicle.name}`}
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
                <label className="form-label">
                  <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Service Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Odometer Reading at Change (km)</label>
                <input
                  type="number"
                  className="form-input mono"
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value))}
                  placeholder="e.g. 75000"
                  required
                  min={0}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Oil Grade & Brand</label>
                <input
                  type="text"
                  className="form-input"
                  value={oilBrandGrade}
                  onChange={(e) => setOilBrandGrade(e.target.value)}
                  placeholder="e.g. Mobil 1 5W-30 Full Synthetic"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Oil Filter Part # / Brand</label>
                <input
                  type="text"
                  className="form-input"
                  value={filterBrandPart}
                  onChange={(e) => setFilterBrandPart(e.target.value)}
                  placeholder="e.g. Motorcraft FL-500S"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Performed By</label>
                <select
                  className="form-select"
                  value={performedBy}
                  onChange={(e) => setPerformedBy(e.target.value as 'self' | 'shop' | 'dealer')}
                >
                  <option value="self">DIY Self Service</option>
                  <option value="shop">Independent Auto Shop</option>
                  <option value="dealer">Car Dealership</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Total Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input mono"
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Facility / Location Name</label>
              <input
                type="text"
                className="form-input"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Home Garage or Jiffy Lube #402"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Service Notes / Observations</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Replaced drain plug washer, inspected air filter..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>{editingRecord ? 'Update Record' : 'Save Oil Change'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
