import React, { useState, useEffect, useCallback } from 'react';
import { Vehicle, OilChangeRecord } from './types';
import {
  fetchVehicles,
  fetchOilChanges,
  upsertVehicle,
  deleteVehicle as removeVehicleApi,
  upsertOilChange,
  deleteOilChange as removeOilChangeApi,
  seedSampleDataToFirebase,
} from './firebase';
import { Header } from './components/Header';
import { VehicleSelector } from './components/VehicleSelector';
import { Dashboard } from './components/Dashboard';
import { SingleVehicleCardView } from './components/SingleVehicleCardView';
import { OilChangeFormModal } from './components/OilChangeFormModal';
import { VehicleFormModal } from './components/VehicleFormModal';
import { FirebaseSettingsModal } from './components/FirebaseSettingsModal';
import { Database, Plus, Upload } from 'lucide-react';

export const App: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [records, setRecords] = useState<OilChangeRecord[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [isFirebase, setIsFirebase] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCardOnlyMode, setIsCardOnlyMode] = useState<boolean>(false);

  // Modal States
  const [isOilModalOpen, setIsOilModalOpen] = useState(false);
  const [editingOilRecord, setEditingOilRecord] = useState<OilChangeRecord | null>(null);

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [fbError, setFbError] = useState<string | undefined>(undefined);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { vehicles: vList, isFirebase: fb1, error: err1 } = await fetchVehicles();
      const { records: rList, error: err2 } = await fetchOilChanges();

      setVehicles(vList);
      setRecords(rList);
      setIsFirebase(fb1);
      setFbError(err1 || err2);

      // Check URL parameters for direct vehicle deep links or card-only mode
      const params = new URLSearchParams(window.location.search);
      const targetCar = (params.get('car') || params.get('v') || params.get('vehicle') || '').toLowerCase().trim();
      const cardOnly = params.get('cardOnly') === 'true' || params.get('mode') === 'card';

      if (cardOnly) {
        setIsCardOnlyMode(true);
      }

      if (vList.length > 0) {
        if (targetCar) {
          const match = vList.find(
            (v) => v.id.toLowerCase() === targetCar || v.name.toLowerCase().includes(targetCar)
          );
          if (match) {
            setSelectedVehicleId(match.id);
            return;
          }
        }
        setSelectedVehicleId((prev) => (vList.some((v) => v.id === prev) ? prev : vList[0].id));
      }
    } catch (e: any) {
      console.error('Error loading data in App', e);
      setFbError(`Data loading error: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || null;

  // Handlers for Oil Changes
  const handleSaveOilChange = async (record: OilChangeRecord) => {
    await upsertOilChange(record);
    await loadData();
  };

  const handleDeleteOilChange = async (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this oil change record?')) {
      await removeOilChangeApi(recordId);
      await loadData();
    }
  };

  // Handlers for Vehicles
  const handleSaveVehicle = async (vehicle: Vehicle) => {
    await upsertVehicle(vehicle);
    await loadData();
    setSelectedVehicleId(vehicle.id);
    return true;
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    const vToDelete = vehicles.find((v) => v.id === vehicleId);
    if (
      window.confirm(
        `Are you sure you want to delete "${vToDelete?.name || 'this vehicle'}" and all its oil change records?`
      )
    ) {
      await removeVehicleApi(vehicleId);
      await loadData();
    }
  };

  return (
    <div>
      {!isCardOnlyMode && (
        <Header
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={setSelectedVehicleId}
          isFirebase={isFirebase}
          onOpenAddVehicle={() => {
            setEditingVehicle(null);
            setIsVehicleModalOpen(true);
          }}
          onOpenFirebaseSettings={() => setIsFirebaseModalOpen(true)}
        />
      )}

      <main className="app-layout">
        {fbError && (
          <div
            className="card"
            style={{
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              background: 'rgba(239, 68, 68, 0.12)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <strong style={{ color: '#ef4444' }}>Firebase Access Warning:</strong> {fbError}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Please verify your Firestore Security Rules allow read access to the <code>vehicles</code> and <code>oil_changes</code> collections.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button className="btn btn-primary" style={{ fontSize: '0.75rem' }} onClick={loadData}>
                Retry Connection
              </button>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => setIsFirebaseModalOpen(true)}>
                Check Settings
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Loading Fleet Database...</div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto' }}>
            <Database size={48} style={{ color: isFirebase ? '#10b981' : 'var(--accent-primary)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              {isFirebase ? 'Connected to Firebase Live 🟢' : 'No Vehicles in Fleet'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
              {isFirebase
                ? 'Your Firebase Firestore database is connected, but currently has no vehicles stored. Add your first vehicle or upload the sample fleet to seed your database.'
                : 'Start tracking oil changes for your vehicles by adding your first vehicle.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingVehicle(null);
                  setIsVehicleModalOpen(true);
                }}
              >
                <Plus size={16} /> Add First Vehicle
              </button>
              {isFirebase && (
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    await seedSampleDataToFirebase();
                    await loadData();
                  }}
                >
                  <Upload size={16} /> Upload Sample Fleet to Firebase
                </button>
              )}
            </div>
          </div>
        ) : isCardOnlyMode && selectedVehicle ? (
          /* Standalone Dedicated iPhone Card View */
          <SingleVehicleCardView
            vehicle={selectedVehicle}
            records={records}
            isFirebase={isFirebase}
            onLogOilChange={() => {
              setEditingOilRecord(null);
              setIsOilModalOpen(true);
            }}
            onSaveVehicle={handleSaveVehicle}
            onEditRecord={(record) => {
              setEditingOilRecord(record);
              setIsOilModalOpen(true);
            }}
            onDeleteRecord={handleDeleteOilChange}
            onSwitchToFullFleet={() => setIsCardOnlyMode(false)}
          />
        ) : (
          <>
            {/* Full Fleet View */}
            <VehicleSelector
              vehicles={vehicles}
              records={records}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={setSelectedVehicleId}
              onOpenAddVehicle={() => {
                setEditingVehicle(null);
                setIsVehicleModalOpen(true);
              }}
            />

            {/* Selected Vehicle Dashboard */}
            <Dashboard
              selectedVehicle={selectedVehicle}
              records={records}
              onLogOilChange={() => {
                setEditingOilRecord(null);
                setIsOilModalOpen(true);
              }}
              onEditVehicle={(vehicle) => {
                setEditingVehicle(vehicle);
                setIsVehicleModalOpen(true);
              }}
              onSaveVehicle={handleSaveVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onEditRecord={(record) => {
                setEditingOilRecord(record);
                setIsOilModalOpen(true);
              }}
              onDeleteRecord={handleDeleteOilChange}
            />
          </>
        )}
      </main>

      {/* Log / Edit Oil Change Modal */}
      {selectedVehicle && (
        <OilChangeFormModal
          isOpen={isOilModalOpen}
          vehicle={selectedVehicle}
          editingRecord={editingOilRecord}
          onClose={() => setIsOilModalOpen(false)}
          onSave={handleSaveOilChange}
        />
      )}

      {/* Add / Edit Vehicle Modal */}
      <VehicleFormModal
        isOpen={isVehicleModalOpen}
        editingVehicle={editingVehicle}
        onClose={() => setIsVehicleModalOpen(false)}
        onSave={handleSaveVehicle}
      />

      {/* Firebase Setup Modal */}
      <FirebaseSettingsModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onConfigSaved={loadData}
      />
    </div>
  );
};
