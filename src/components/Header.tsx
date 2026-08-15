import React from 'react';
import { Vehicle } from '../types';
import { VehicleSelectDropdown } from './VehicleSelectDropdown';
import { Wrench, Plus, Database } from 'lucide-react';

interface HeaderProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  isFirebase: boolean;
  onOpenAddVehicle: () => void;
  onOpenFirebaseSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  isFirebase,
  onOpenAddVehicle,
  onOpenFirebaseSettings,
}) => {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo & Title */}
        <div className="header-top-row">
          <a href="#" className="brand-logo">
            <div className="brand-icon">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="brand-title">MooreGarage</h1>
              <p className="brand-subtitle">Automotive Oil & Fleet Tracker</p>
            </div>
          </a>

          <div className="header-top-actions">
            {/* Firebase Connection Status Button */}
            <button
              className="firebase-indicator"
              onClick={onOpenFirebaseSettings}
              title={isFirebase ? 'Connected to Firebase Firestore' : 'Running on Local Storage (Click to setup Firebase)'}
            >
              <span className={`dot ${isFirebase ? 'dot-active' : 'dot-local'}`} />
              <Database size={15} style={{ color: isFirebase ? '#10b981' : '#f59e0b' }} />
              <span className="firebase-badge-text">{isFirebase ? 'Firebase Live' : 'Firebase Setup'}</span>
            </button>

            {/* Add Vehicle Button */}
            <button className="btn btn-primary btn-sm" onClick={onOpenAddVehicle} title="Add New Vehicle">
              <Plus size={16} />
              <span className="hide-mobile">Add Vehicle</span>
            </button>
          </div>
        </div>

        {/* Visual Vehicle Selector Dropdown Row */}
        {vehicles.length > 0 && (
          <div className="header-dropdown-row">
            <VehicleSelectDropdown
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={onSelectVehicle}
            />
          </div>
        )}
      </div>
    </header>
  );
};
